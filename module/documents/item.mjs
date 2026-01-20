import { UltimaLegendsActor } from "./actor.mjs";

export class UltimaLegendsItem extends Item {

	// Default options for the Item sheet
	overrides = this.overrides ?? {};

	// Prepare Item Data
	prepareData() {
		super.prepareData();
	}

	// Handle pre-update logic
	async _preUpdate(changed, options, user) {
		await super._preUpdate(changed, options, user);

		// If spell is not offensive, reset damage and opportunity
		if (this.type === 'spell' && changed.system?.offensive === false) {
			changed.system.damage = changed.system.damage || {};
			changed.system.damage.value = 0;
			changed.system.damage.type = 'physical';
			changed.system.opportunity = null;
		}
	}

	// Create a new UltimaLegendsItem with default image based on type
	static async create( data, options={} ) {

		data.prototypeToken = data.prototypeToken || {};
		let image = null;

		switch( data.type ) {
			case 'accessory':
				image = "systems/ultima-legends/assets/icons/default-accessory.svg";
				break;
			case 'alchemy':
				image = "systems/ultima-legends/assets/icons/default-alchemy.svg";
				break;
			case 'arcanum':
				image = "systems/ultima-legends/assets/icons/default-arcanum.svg";
				break;
			case 'armor':
				image = "systems/ultima-legends/assets/icons/default-armor.svg";
				break;
			case 'artifact':
				image = "systems/ultima-legends/assets/icons/default-artifact.svg";
				break;
			case 'attack':
				image = "systems/ultima-legends/assets/icons/default-attack.svg";
				break;
			case 'basic':
				image = "systems/ultima-legends/assets/icons/default-basic.svg";
				break;
			case 'class':
				image = "systems/ultima-legends/assets/icons/default-class.svg";
				break;
			case 'classFeature':
				image = "systems/ultima-legends/assets/icons/default-classFeature.svg";
				break;
			case 'consumable':
				image = "systems/ultima-legends/assets/icons/default-consumable.svg";
				break;
			case 'heroic':
				image = "systems/ultima-legends/assets/icons/default-heroic.svg";
				break;
			case 'project':
				image = "systems/ultima-legends/assets/icons/default-project.svg";
				break;
			case 'ritual':
				image = "systems/ultima-legends/assets/icons/default-ritual.svg";
				break;
			case 'rule':
				image = "systems/ultima-legends/assets/icons/default-rule.svg";
				break;
			case 'shield':
				image = "systems/ultima-legends/assets/icons/default-shield.svg";
				break;
			case 'skill':
				image = "systems/ultima-legends/assets/icons/default-skill.svg";
				break;
			case 'spell':
				image = "systems/ultima-legends/assets/icons/default-spell.svg";
				break;
			case 'weapon':
				image = "systems/ultima-legends/assets/icons/default-weapon.svg";
				break;
		}

		if ( image !== null ) {
			data.img = image;
		}

		const item = await super.create( data, options );
		return item;

	}
	
	// Prepare object data
	getRollData() {

		const rollData = { ...this.system };
		if ( !this.actor ) return rollData;

		rollData.actor = this.actor.getRollData();
		return rollData;

	}

	// Serialize to plain object
	toPlainObject() {

		const result = { ...this };
		result.system = this.system.toPlainObject();
		result.effects = this.effects?.size > 0 ? this.effects.contents : [];
		return result;

	}

	// Generate a new Ultima ID based on the item name
	async regenerateUltimaID() {

		const id = game.ultimaLegends.util.slugify( this.name );
		 if ( id ) {
			await this.update({ 'system.ultimaID': id });
			ui.notifications.success("Ultima ID rigenerata con successo.");
		} else {
			ui.notifications.error(`${SYSTEM_NAME} | Could not generate Ultima ID for item with name '${this.name}'`);
		}
		return id;

	}

	// Check if class can level up based on granted skills
	async checkLevelUp( newLevel = null, itemExists = true ) {

		if ( this.type !== 'class' ) return;
		
		// Get level data and granted skills
		const levelData = this.system.level;
		const skills = this.system.grants.skills.map( skillUltimaID => {
			let items = [];
			if ( this.parent instanceof UltimaLegendsActor ) {
				items = this.parent.items;
			} else {
				items = game.items;
			}
			return items.filter( i => i.type === 'skill' && i.system.ultimaID === skillUltimaID )[0];
		});

		// Update to specified new level or increment by 1
		if ( typeof newLevel !== 'number' ) {
			newLevel = levelData.current + 1;
		}

		// Calculate total skill levels
		let skillsLeveled = 0;
		for ( const skill of skills ) {
			skillsLeveled += skill?.system?.level?.current ?? 0;
		}

		// If all skills are leveled, clear needLevelUp flag
		let updates = {};
		if ( skillsLeveled < newLevel ) {
			updates = { 'system.level.needLevelUp': true };
		} else if ( skillsLeveled == newLevel ) {
			updates = { 'system.level.needLevelUp': false };
		} else {
			ui.notifications.error('Errore nel controllo del livello della classe: i livelli delle abilità superano il nuovo livello della classe.');
		}

		// Apply updates
		if ( itemExists )
			this.update( updates );
		else
			this.updateSource( updates );

	}

}

//#region Hooks

Hooks.on('preCreateItem', ( item, options, userId ) => {

    // Generate an Ultima ID if it does not exist
    if ( !item.system.ultimaID && item.name ) {
        const id = game.ultimaLegends.util.slugify( item.name );
        if ( id ) {
            item.updateSource({ 'system.ultimaID': id });
        } else {
            ui.notifications.error(`${SYSTEM_NAME} | Could not generate Ultima ID for item with name '${item.name}'`);
        }
    }

	const checkClass = onPreCreateClass( item );
	if ( !checkClass ) return false;

	const checkConsumable = onPreCreateConsumable( item );
	if ( !checkConsumable ) return false;

});

//#endregion

//#region Functions

// Handle pre-creation of Class items
function onPreCreateClass( item ) {

	// Validate item type and parent
	if ( item.type !== 'class' ) return true;
	if ( item.parent == null ) return true;
	if ( item.parent.type !== 'character' ) return true;

	// Check for maximum number of non-mastered classes
	const actorClasses = item.parent.items.filter( i => i.type === 'class' && i.system.level.current < i.system.level.max );
	if ( actorClasses && actorClasses.length >= 3 ) {
		ui.notifications.warn(`Non puoi aggiungere più di 3 classi non padroneggiate all'attore '${item.parent.name}'`);
		return false;
	}
	
	// Check if actor already has this class
	const existingClass = item.parent.items.find( i => i.type === 'class' && i.system.ultimaID === item.system.ultimaID );
	if ( existingClass ) {
		ui.notifications.warn(`L'attore '${item.parent.name}' possiede già la classe '${item.name}'`);
		return false;
	}

	// Check for multiple resource benefits
	const benefits = item.system.grants.resources;
	const hasBenefits = Object.keys(benefits).filter(k => benefits[k]);
	if ( hasBenefits.length > 1 ) {

		// Reset all resource benefits
		item.updateSource({ 
			'system.grants.resources.hp': false, 
			'system.grants.resources.mp': false, 
			'system.grants.resources.ip': false, 
		});

		// Prompt user to choose one benefit
		new DialogV2({
			window: { title: 'Scegli il beneficio della classe' },
			content: `<p>La classe <strong>${item.name}</strong> offre più benefici. Scegli quale desideri applicare:</p>`,
			buttons: hasBenefits.map(resource => ({
				action: resource,
				label: resource.toUpperCase(),
				callback: async () => {
					const updates = {};
					updates[`system.grants.resources.${resource}`] = true;
					await item.update(updates);
				},
			})),
			default: hasBenefits[0]
		}).render(true);

	}

	// Automatically add granted skills to the actor
	const skills = item.system.grants.skills.map( skillId => {
		return game.items.filter( i => i.type === 'skill' && i.system.ultimaID === skillId )[0];
	});
	skills.forEach( async skillItem => {
		const existingSkill = item.parent.items.find( i => i.type === 'skill' && i.system.ultimaID === skillItem.system.ultimaID );
		if ( existingSkill ) return;

		await item.parent.createEmbeddedDocuments( 'Item', [ skillItem.toObject() ] );
	});

	// Check for level up
	item.checkLevelUp( item.system.level.current, false );

	return true;

}

// Handle pre-creation of Consumable items
function onPreCreateConsumable( item ) {

	// Validate item type and parent
	if ( item.type !== 'consumable' ) return true;
	if ( item.parent == null ) return true;

	if ( item.system.cost > 0 ) {

		const actorIP = item.parent.system.resources.ip.current;
		if ( actorIP < item.system.cost ) {
			ui.notifications.warn(`L'attore '${item.parent.name}' non ha PI sufficienti per usare il consumabile '${item.name}'`);
		} else {

			const newIP = Math.max( actorIP - item.system.cost, 0 );
			item.parent.update({ 'system.resources.ip.current': newIP } );
			ui.notifications.info(`L'attore '${item.parent.name}' ha speso ${item.system.cost} PI per usare il consumabile '${item.name}'`);

		}
	}

	return false;

}

//#endregion