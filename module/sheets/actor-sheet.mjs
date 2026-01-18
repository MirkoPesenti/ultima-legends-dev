import { SYSTEM, SYSTEM_NAME, ULTIMA } from "../helpers/config.mjs";
import { enrichHTML } from "../utils/utilities.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class UltimaLegendsActorSheet extends HandlebarsApplicationMixin( ActorSheetV2 ) {

	// Define default options
	static DEFAULT_OPTIONS = {
		classes: [ SYSTEM, 'sheet', 'actor' ],
		position: { width: 800 },
		tag: 'form',
		form: { submitOnChange: true },
		actor: { type: 'character' },
		window: {
			contentClasses: ["standard-form"]
		},
		actions: {
			addBond: this.#handleAddBond,
			removeBond: this.#handleRemoveBond,
			equipItem: this.#handleEquipItem,
		},
	};

	// Define template path
	static PARTS = {
		header: {
			id: 'header',
			template: `systems/${SYSTEM}/templates/actor/character-header.hbs`,
		},
        tabs: {
            id: 'tabs',
            template: 'templates/generic/tab-navigation.hbs'
        },
		character: {
			id: 'character',
			template: `systems/${SYSTEM}/templates/actor/character-main.hbs`,
			scrollable: [''],
		},
		items: {
			id: 'items',
			template: `systems/${SYSTEM}/templates/actor/character-items.hbs`,
			scrollable: [''],
		},
		status: {
			id: 'status',
			template: `systems/${SYSTEM}/templates/actor/character-status.hbs`,
			scrollable: [''],
		},
		identity: {
			id: 'identity',
			template: `systems/${SYSTEM}/templates/actor/character-identity.hbs`,
			scrollable: [''],
		},
	};

	// Define tabs
	static TABS = {
        sheet: {
            tabs:
                [
                    { id: 'character', group: 'sheet', label: 'Generale' },
                    { id: 'items', group: 'sheet', label: 'Equipaggiamento' },
                    { id: 'status', group: 'sheet', label: 'Status' },
                    { id: 'identity', group: 'sheet', label: 'Personaggio' },
                ],
            initial: 'character'
        }
    }

	// Define constructor
	constructor ( options = {} ) {
		super( options );
	}

	// Prepare context data for template rendering
	async _prepareContext( options ) {
		const context = await super._prepareContext( options );
		const actor = this.document.toPlainObject();

		context.ULTIMA = ULTIMA;
		context.system = actor.system;
		context.flags = actor.flags;
		context.actor = this.document;
		
		// Enrich description HTML
		context.enrichedHTML = {
			description: await enrichHTML( this.document.system.description, this.document ),
		};

		let items = this._prepareItems();
		foundry.utils.mergeObject( context, items );

		console.log(`${SYSTEM_NAME} | Actor Sheet Context:`, context);

		return context;
	}

	// Prepare items
	_prepareItems() {

		// TODO: Equip items

		const accessories = [];
		const armors = [];
		const basics = [];
		const classes = [];
		const classFeatures = [];
		const consumables = [];
		const heroics = [];
		const projects = [];
		const rituals = [];
		const rules = [];
		const shields = [];
		const skills = [];
		const spells = [];
		const weapons = [];

		let items = this.document.items ?? [];
		// Categorize items
		for ( let i of items ) {
			if ( !i.type ) continue;
			switch ( i.type ) {
				case 'accessory': accessories.push( i ); break;
				case 'armor': armors.push( i ); break;
				case 'basic': basics.push( i ); break;
				case 'class': classes.push( i ); break;
				case 'classFeature': classFeatures.push( i ); break;
				case 'consumable': consumables.push( i ); break;
				case 'heroic': heroics.push( i ); break;
				case 'project': projects.push( i ); break;
				case 'ritual': rituals.push( i ); break;
				// case 'rule': rules.push( i ); break;
				case 'shield': shields.push( i ); break;
				case 'skill': skills.push( i ); break;
				case 'spell': spells.push( i ); break;
				case 'weapon': weapons.push( i ); break;
			}
		}

		return {
			accessories,
			armors,
			basics,
			classes,
			classFeatures,
			consumables,
			heroics,
			projects,
			rituals,
			shields,
			skills,
			spells,
			weapons
		};

	}

	/** @inheritDoc */
    _onRender(context, options) {
        
        super._onRender(context, options);

        const typeClass = `actor-${this.document.type}`;
        this.element.classList.toggle( typeClass, true );

    }

	// Handle adding a new bond
	static async #handleAddBond( event, target ) {

		event.preventDefault();
		const bonds = this.document.system.bonds ?? [];
		bonds.push({ name: '', bond1: null, bond2: null, bond3: null });

		await this.document.update({ 'system.bonds': bonds });

	}

	// Handle removing a bond
	static async #handleRemoveBond( event, target ) {

		event.preventDefault();
		const index = parseInt( target.dataset.index );
		const bonds = this.document.system.bonds ?? [];
		
		if ( index >= 0 && index < bonds.length ) {
			bonds.splice( index, 1 );
			await this.document.update({ 'system.bonds': bonds });
		}

	}

	static async #handleEquipItem( event, target ) {

		event.preventDefault();
		const uuid = target.dataset.uuid;
		const item = await fromUuid( uuid );
		if ( !item ) return;

		await this.document.updateEquippedItem( item );

	}

}