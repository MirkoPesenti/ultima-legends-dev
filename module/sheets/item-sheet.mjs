import { SYSTEM, SYSTEM_NAME, ULTIMA } from "../helpers/config.mjs";
import { enrichHTML } from "../utils/utilities.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { DragDrop, TextEditor } = foundry.applications.ux;
const { DialogV2 } = foundry.applications.api;

export class UltimaLegendsItemSheet extends HandlebarsApplicationMixin( ItemSheetV2 ) {
    
    // Private field for drag and drop handlers
    #dragDrop;
    #dragDropBoundElement;

    // Define default options
    static DEFAULT_OPTIONS = {
        classes: [ SYSTEM, 'sheet', 'item' ],
        position: { width: 600 },
        tag: 'form',
        form: { submitOnChange: true },
        window: {
            contentClasses: ["standard-form"]
        },
        dragDrop: [{
            dragSelector: null,
            dropSelector: '.dropzone',
        }],
        actions: {
            regenerateUltimaID: this.#handleRegenerateUltimaID,
            removeGrantedSkill: this.#handleRemoveGrantedSkill,
            openItemByUltimaID: this.#handleOpenItemByUltimaID,
        },
    };

    // Define template path
	static PARTS = {
		header: {
			id: 'header',
			template: `systems/${SYSTEM}/templates/item/item-header.hbs`,
		},
        tabs: {
            id: 'tabs',
            template: 'templates/generic/tab-navigation.hbs'
        },
		item: {
			id: 'item',
			template: `systems/${SYSTEM}/templates/item/item-main.hbs`,
			scrollable: [''],
		},
		options: {
			id: 'options',
			template: `systems/${SYSTEM}/templates/item/item-options.hbs`,
			scrollable: [''],
		},
	};

    // Define tabs
	static TABS = {
        sheet: {
            tabs:
                [
                    { id: 'item', group: 'sheet', label: 'Generale' },
                    { id: 'options', group: 'sheet', label: 'Opzioni' },
                ],
            initial: 'item'
        }
    }

    // Define constructor
	constructor ( options = {} ) {
		super( options );

        this.#dragDrop = this.#createDragDropHandlers();
	}

    /** @inheritDoc */
    // TODO: implement dynamic template loading based on item type
    // _configureRenderParts(options) {
    //     const parts = super._configureRenderParts(options)

    //     let templatePath = `systems/arkham-horror-rpg-fvtt/templates/item/item-${this.document.type}-sheet.hbs`;
    //     // Add the main item type part
    //     if (this.document.type) {
    //         parts.form = {
    //             id: 'form',
    //             template: templatePath
    //         }
    //     }
    //     return parts;
    // }

    // Prepare context data for template rendering
    async _prepareContext( options ) {
        const context = await super._prepareContext( options );
        const item = this.document.toPlainObject();

        context.ULTIMA = ULTIMA;
        context.system = item.system;
        context.flags = item.flags;
        context.item = this.document;
        
        // Enrich description HTML
        context.enrichedHTML = {
            description: await enrichHTML( this.document.system.description, this.document ),
        };

        console.log(`${SYSTEM_NAME} | Item Sheet Context:`, context);

        return context;
    }

    /** @inheritDoc */
    _onRender(context, options) {
        
        super._onRender(context, options);

        // Handle item type CSS class
        const typeClass = `item-${this.document.type}`;
        this.element.classList.toggle( typeClass, true );

        // Handle source book CSS classes
        for ( const source of Object.keys( ULTIMA.sourceBooks ) ) {
            const cssClass = `source-${source}`;
            this.element.classList.toggle( cssClass, false );
        }

        // Apply the current source book class
        if ( this.document.system.source ) {
            const sourceClass = `source-${this.document.system.source}`;
            this.element.classList.toggle( sourceClass, true );
        }

        // Always unbind and rebind drag and drop handlers on render
        for ( const dd of (this.#dragDrop ?? []) ) {
            dd.bind( this.element );
        }
        this.#dragDropBoundElement = this.element;

    }

    // Create drag and drop handlers
    #createDragDropHandlers() {
        return this.options.dragDrop.map((d) => {
            d.permissions = {
                dragstart: this._canDragStart.bind(this),
                drop: this._canDragDrop.bind(this),
            };
            d.callbacks = {
                dragstart: this._onDragStart.bind(this),
                dragover: this._onDragOver.bind(this),
                drop: this._onDrop.bind(this),
            };
            return new DragDrop(d);
        });
    }

    // Determine if dragging can start
    _canDragStart( selector ) {
        return this.isEditable;
    }

    // Determine if dropping is allowed
    _canDragDrop( selector ) {
        return this.isEditable;
    }

    // Handle drag start event
    _onDragStart( event ) {}

    // Handle drag over event
    _onDragOver( event ) {}

    // Handle drop event
    async _onDrop( event ) {
        
        const data = TextEditor.getDragEventData( event );

        if ( data?.uuid ) {
            // Only handle drops for class items
            if ( this.document.type === 'class' ) {

                const item = await fromUuid( data.uuid );
                if ( item?.type === 'skill' ) {

                    // Prevent default behavior immediately
                    event.preventDefault();
                    event.stopPropagation();

                    const skills = this.document.system.grants.skills ?? [];
                    // Check for duplicate skill
                    if ( skills.includes( item.system.ultimaID ) ) {
                        ui.notifications.warn( `La skill "${item.name}" è già concessa da questa classe.` );
                    } else {
                        skills.push( item.system.ultimaID );
                        await this.document.update({ 'system.grants.skills': skills });
                    }

                    await item.update({ 'system.origin': this.document.system.ultimaID });

                    return false;

                } else {
                    event.preventDefault();
                    event.stopPropagation();
                    ui.notifications.warn( `Puoi aggiungere solo oggetti di tipo "Abilità" a questa classe.` );
                    return false;
                }

            }
        }

        return super._onDrop?.( event );

    }

    // Handle Ultima ID regeneration
    static async #handleRegenerateUltimaID( event, target ) {

        // Confirm action
        const confirmed = await DialogV2.confirm({
            window: {
                title: 'Conferma Rigenerazione Ultima ID'
            },
            content: 'Sei sicuro di voler rigenerare l\'Ultima ID per questo oggetto? Questo potrebbe influire su riferimenti esterni che utilizzano questa ID.',
        });

        if ( !confirmed ) return;

        // Prevent default behavior
        event.preventDefault();
        await this.document.regenerateUltimaID();

    }

    // Handle removal of granted skill
    static async #handleRemoveGrantedSkill( event, target ) {

		event.preventDefault();
		const index = parseInt( target.dataset.index );
		const skills = this.document.system.grants.skills ?? [];
		
		if ( index >= 0 && index < skills.length ) {
			const removed = skills.splice( index, 1 );
			await this.document.update({ 'system.grants.skills': skills });
            
            // Also clear the origin field on the removed skill item
            const removedSkill = game.items.find( i => i.system.ultimaID === removed[0] );
            if ( removedSkill ) {
                await removedSkill.update({ 'system.origin': null });
            }

            // Check for level up after skill removal
            this.document.checkLevelUp( this.document.system.level.current );
		}

	}

    // Handle opening item by Ultima ID
    static #handleOpenItemByUltimaID( event, target ) {

        event.preventDefault();
        const ultimaID = target.dataset.id;
        const item = game.items.find( i => i.system.ultimaID === ultimaID );
        if ( item ) {
            item.sheet.render(true);
        } else {
            ui.notifications.warn( `Nessun oggetto trovato con Ultima ID: ${ultimaID}` );
        }

    }

}
