import { SYSTEM, SYSTEM_NAME, ULTIMA } from "../helpers/config.mjs";
import { enrichHTML } from "../utils/utilities.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class UltimaLegendsItemSheet extends HandlebarsApplicationMixin( ItemSheetV2 ) {

    // Define default options
    static DEFAULT_OPTIONS = {
        classes: [ SYSTEM, 'sheet', 'item' ],
        position: { width: 600 },
        tag: 'form',
        form: { submitOnChange: true },
        window: {
            contentClasses: ["standard-form"]
        },
        actions: {
            regenerateUltimaID: this.#handleRegenerateUltimaID,
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
        const actor = this.document.toPlainObject();

        context.ULTIMA = ULTIMA;
        context.system = actor.system;
        context.flags = actor.flags;
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

    }

    // Handle Ultima ID regeneration
    static async #handleRegenerateUltimaID( event, target ) {

        // Confirm action
        const confirmed = await foundry.applications.api.DialogV2.confirm({
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

}
