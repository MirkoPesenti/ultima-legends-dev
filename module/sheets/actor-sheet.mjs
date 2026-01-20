import { UltimaLegendsApp } from "../data/apps/base-app.mjs";
import { UltimaLegendsItem } from "../documents/item.mjs";
import { SYSTEM, SYSTEM_NAME, ULTIMA } from "../helpers/config.mjs";
import { enrichHTML } from "../utils/utilities.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { DialogV2 } = foundry.applications.api;

export class UltimaLegendsActorSheet extends HandlebarsApplicationMixin( ActorSheetV2 ) {

	// Define default options
	static DEFAULT_OPTIONS = {
		classes: [ SYSTEM, 'sheet', 'actor' ],
		position: { width: 800 },
		tag: 'form',
		form: { submitOnChange: true },
		actor: { type: 'character' },
		window: {
			contentClasses: ["standard-form"],
			// icon: 'fa fa-user',
			controls: [
				{
					icon: "fa fa-dice-d20",
					label: "Charactermancer",
					action: "charactermancer",
				}
			],
		},
		actions: {
			addBond: this.#handleAddBond,
			removeBond: this.#handleRemoveBond,
			equipItem: this.#handleEquipItem,
			levelUpClass: this.#handleLevelUpClass,
			levelUpSkill: this.#handleLevelUpSkill,
			createItem: this.#handleCreateItem,
			charactermancer: this.#handleCharactermancer,
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
		classes: {
			id: 'classes',
			template: `systems/${SYSTEM}/templates/actor/character-classes.hbs`,
			scrollable: [''],
		},
		equip: {
			id: 'equip',
			template: `systems/${SYSTEM}/templates/actor/character-equip.hbs`,
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
                    { id: 'classes', group: 'sheet', label: 'Classi' },
                    { id: 'equip', group: 'sheet', label: 'Equipaggiamento' },
                    { id: 'items', group: 'sheet', label: 'Zaino' },
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

		const accessories = [];
		const armors = [];
		const basics = [];
		const classes = [];
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
				case 'class': 
					i.checkLevelUp( i.system.level.current );
					classes.push( i ); 
					break;
				// case 'consumable': consumables.push( i ); break;
				// case 'heroic': heroics.push( i ); break;
				// case 'project': projects.push( i ); break;
				// case 'ritual': rituals.push( i ); break;
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
			// consumables,
			// heroics,
			// projects,
			// rituals,
			// rules,
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

	// Handle equipping an item
	static async #handleEquipItem( event, target ) {

		event.preventDefault();
		const uuid = target.dataset.uuid;
		const item = await fromUuid( uuid );
		if ( !item ) return;

		await this.document.updateEquippedItem( item );

	}

	// Handle leveling up a Class
	static async #handleLevelUpClass( event, target ) {

		event.preventDefault();

		// Check for experience points
		let newExp = this.document.system.level.exp;
		if ( newExp < 10 ) {
			const confirmed = await DialogV2.confirm({
				window: {
					title: 'Conferma aumento di livello'
				},
				content: 'Non hai abbastanza punti esperienza per salire di livello. Sei sicuro di voler procedere lo stesso?',
			});
	
			if ( !confirmed ) return;
		} else {
			newExp -= 10;
		}

		const classId = target.dataset.id;
		const classItem = this.document.items.find( i => i.type === 'class' && i.system.ultimaID === classId );
		if ( !classItem ) return;

		// Calculate new level
		const newLevel = Math.min( classItem.system.level.current + 1, classItem.system.level.max );

		// Check for level up prerequisites
		classItem.checkLevelUp( newLevel );

		// Update class level
		await classItem.update({ 'system.level.current': newLevel });

		// Deduct experience points
		await this.document.update({ 'system.level.exp': newExp });

		// Handle special level milestones
		if ( this.document.system.level.current % 20 === 0 ) {

			const attributes = this.document.system.attributes;
			const buttons = []
			for ( const key in attributes ) {
				if ( attributes[key].base == 12 ) continue;
				buttons.push({
					action: key,
					label: `${key.toUpperCase()}: ${attributes[key].base} -> ${attributes[key].base + 2}`,
				});
			}

			const choice = await DialogV2.wait({
				window: { title: 'Seleziona un attributo da aumentare' },
				content: `<p>Hai raggiunto il livello ${this.document.system.level.base}! Scegli un attributo da aumentare.</p>`,
				buttons: buttons,
				rejectClose: false,
			});
			
			const chosenAttribute = String( choice ?? '' );
			if ( !chosenAttribute ) return;

			// Increase chosen attribute by 2
			const currentValue = this.document.system.attributes[chosenAttribute].base;
			const newValue = Math.min( currentValue + 2, 12 );
			await this.document.update({ [`system.attributes.${chosenAttribute}.base`]: newValue });

		}

	}

	// Handle leveling up a Skill
	static async #handleLevelUpSkill( event, target ) {

		event.preventDefault();
		const skillId = target.dataset.id;
		const skillItem = this.document.items.find( i => i.type === 'skill' && i.system.origin && i.system.ultimaID === skillId );
		if ( !skillItem ) return;

		// Calculate new level
		const newLevel = Math.min( skillItem.system.level.current + 1, skillItem.system.level.max );

		// Update class level
		await skillItem.update({ 'system.level.current': newLevel });

		// Check if origin class can level up
		const originClass = this.document.items.find( i => i.type === 'class' && i.system.ultimaID === skillItem.system.origin );
		if ( originClass ) {
			originClass.checkLevelUp( originClass.system.level.current );
		}

	}

	// Handle creating a new item
	static async #handleCreateItem( event, target ) {

		event.preventDefault();
		const itemType = target.dataset.type ?? 'basic';
		const data = foundry.utils.duplicate( target.dataset );

		// Prepare item data
		const itemData = {
			name: `Nuovo oggetto ${game.i18n.localize('TYPES.Item.' + itemType)}`,
			type: itemType,
			system: data,
		};

		// Clean up system data
		delete itemData.system.type;

		// Create the item
		const newItem = await UltimaLegendsItem.create( itemData, { parent: this.document } );
		await newItem.sheet.render(true);

	}

	// Handle custom action
	static async #handleCharactermancer( event, target ) {
		
		event.preventDefault();
		const charactermancerApp = new UltimaLegendsApp();
		await charactermancerApp.render( true );

	}

}