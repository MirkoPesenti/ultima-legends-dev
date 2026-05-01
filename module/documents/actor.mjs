import { SYSTEM, ULTIMA } from "../helpers/config.mjs";

export class UltimaLegendsActor extends Actor {

	// Default options for the Actor sheet
	overrides = this.overrides ?? {};

	// Prepare Actor Data
	prepareData() {
		super.prepareData();
	}

	// Prepare Derived Actor Data
	prepareDerivedData() {
		super.prepareDerivedData();

		const actorData = this;
		const systemData = actorData.system;
		const flags = actorData.flags.ultimaLegends || {};
	}

	async _onCreate( data, options, userId ) {
		await super._onCreate( data, options, userId );

		// Give unarmed strike to characters
		if ( this.type === 'character' ) {
			const pack = await game.packs.get(`${SYSTEM}.equipment`)?.getDocuments() ?? [];
			if ( pack.length > 0 ) {
				const unarmedStrike = pack.find( i => foundry.utils.getProperty( i, "system.ultimaID" ) === ULTIMA.ItemsIDs.unarmedStrike );
				
				// Check if the actor already has the unarmed strike
				if ( unarmedStrike ) {
					const existingItem = this.items.find( i => foundry.utils.getProperty( i, "system.ultimaID" ) === ULTIMA.ItemsIDs.unarmedStrike );
					if ( !existingItem ) {
						const createdItems = await this.createEmbeddedDocuments( "Item", [ foundry.utils.mergeObject( unarmedStrike.toObject(), { "system.equipped": true } ) ] );
						
						// Equip the unarmed strike in mainHand
						if ( createdItems && createdItems.length > 0 ) {
							await this.update({ "system.equip.mainHand": createdItems[0].uuid });
						}
					}
				}
			}
		}
	}

	async _onUpdate ( changed, options, userId ) {
		const { hp } = this.system.resources;

		if ( hp && userId === game.userId ) {
			// Check if Crisis should be applied
			await this.applyCrisis();

			// Check if Defeated should be applied
			await this.applyDefeated();
		}

		super._onUpdate( changed, options, userId );
	}

	// Get all applicable effects, filtering out those that should not be transferred
	*allApplicableEffects() {
		for ( const effect of super.allApplicableEffects() ) {
			const item = effect.parent;

			if ( item instanceof UltimaLegendsActor ) {

				if ( item.system?.transferEffects instanceof Function ? item.system.transferEffects() : true ) {
					yield effect;
				}

			} else {
				yield effect;
			}
		}
	}

	// Apply Active Effects
	applyActiveEffects( phase ) {
		if ( this.system.prepareEmbeddedData instanceof Function ) {
			this.system.prepareEmbeddedData();
		}

		return super.applyActiveEffects( phase );
	}

	// Get Roll Data
	getRollData() {
		return { ...super.getRollData(), ...this.system.getRollData?.() ?? null };
	}

	toPlainObject() {
		const result = {...this};

		// Serialize system data
		result.system = this.system.toPlainObject();

		// Add items
		result.items = this.items?.size > 0 ? this.items.contents : [];

		// Add effects
		result.effects = this.effects?.size > 0 ? this.effects.contents : [];

		return result;
	}

	// Handle equipping an item
	async updateEquippedItem( item ) {
		const result = {...this};

		// Serialize system data
		result.system = this.system.toPlainObject();
		
		const equip = result.system.equip;
		const itemType = item.type;
		const itemUuid = item.uuid;
		let slot = null;
		let isTwoHanded = ( itemType === 'weapon' && item.system?.twoHanded === true ) ? true : false;

		// Determine slot based on item type
		switch ( itemType ) {
			case 'armor':
				slot = 'armor';
				break;
			case 'weapon':
				slot = 'mainHand';
				break;
			case 'shield':
				slot = 'offHand';
				break;
			case 'accessory':
				slot = 'accessory';
				break;
			default:
				ui.notifications.error('Errore: questo oggetto non può essere equipaggiato.');
				return;
		}
		
		// If no valid slot, exit
		if ( slot === null ) return;

		let slot2 = ( slot === 'mainHand' ) ? 'offHand' : 'mainHand';
		const equippedItem = await fromUuid( equip[slot] );

		// If equipping a two-handed weapon, unequip off-hand item
		if ( isTwoHanded ) {
			const equippedItem2 = await fromUuid( equip[slot2] );
			if ( equippedItem2 && equippedItem2?.uuid !== itemUuid ) {
				ui.notifications.info(`Disequipaggiato ${equippedItem2.name} per equipaggiare un'arma a due mani.`);
				await equippedItem2.update({ 'system.equipped': false });
				await this.update({ [`system.equip.${slot2}`]: null });
			}
		}

		if ( equippedItem ) {

			await equippedItem.update({ 'system.equipped': false });

			// Check if the item is already equipped
			if ( equippedItem.uuid === itemUuid ) {

				await this.update({ [`system.equip.${slot}`]: null });
				if ( equippedItem.system?.twoHanded === true ) {
					await this.update({ [`system.equip.${slot2}`]: null });
				}

			} else {

				await this.update({ [`system.equip.${slot}`]: itemUuid });
				if ( equippedItem.system?.twoHanded === true || isTwoHanded ) {
					let slot2Id = isTwoHanded ? itemUuid : null;
					await this.update({ [`system.equip.${slot2}`]: slot2Id });
				}
				await item.update({ 'system.equipped': true });

			}

		} else {

			// Equip new item
			await this.update({ [`system.equip.${slot}`]: itemUuid });
			if ( isTwoHanded ) {
				await this.update({ [`system.equip.${slot2}`]: itemUuid });
			}
			await item.update({ 'system.equipped': true });

		}

		// Auto-equip unarmed strike if no weapon is equipped
		if ( this.system.equip.mainHand == null ) {
			const unarmedStrike = this.items.find( i => foundry.utils.getProperty( i, "system.ultimaID" ) === ULTIMA.ItemsIDs.unarmedStrike );
			if ( unarmedStrike ) {
				await this.update({ "system.equip.mainHand": unarmedStrike.uuid });
				await unarmedStrike.update({ 'system.equipped': true });
			}
		}

	}

	// Full rest: heal HP and MP to max and remove all status effects
	async fullRest() {
		const { hp, mp } = this.system.resources;

		// Heal HP and MP to max
		await this.update({
			'system.resources.hp.current': hp.max,
			'system.resources.mp.current': mp.max,
		});

		// Remove all status effects
		if ( this.statuses.has( 'slow' ) === true ) this.toggleStatusEffect( 'slow' );
		if ( this.statuses.has( 'dazed' ) === true ) this.toggleStatusEffect( 'dazed' );
		if ( this.statuses.has( 'weak' ) === true ) this.toggleStatusEffect( 'weak' );
		if ( this.statuses.has( 'shaken' ) === true ) this.toggleStatusEffect( 'shaken' );
		if ( this.statuses.has( 'enraged' ) === true ) this.toggleStatusEffect( 'enraged' );
		if ( this.statuses.has( 'poisoned' ) === true ) this.toggleStatusEffect( 'poisoned' );
	}

	// Apply Crisis status if HP is in crisis
	async applyCrisis() {
		const { hp } = this.system.resources;
		if ( !hp ) return;

		if ( hp.isCrisis !== this.statuses.has('crisis') ) {
			await this.toggleStatusEffect('crisis');
		}
	}

	// Apply Defeated status if HP is 0
	async applyDefeated() {
		const { hp } = this.system.resources;
		if ( !hp ) return;

		const isDefeated = hp.current === 0;
		const hasDefeated = this.statuses.has('defeated');

		if ( isDefeated !== hasDefeated ) {
			await this.toggleStatusEffect('defeated');
		}
	}

	// Apply damage to the actor, taking into account affinities
	async applyDamage( damage, type = 'physical' ) {
		const { hp } = this.system.resources;
		const { affinity } = this.system;
		if ( !hp || !affinity.hasOwnProperty(type) ) return;

		// Calculate damage multiplier based on affinity
		let multiplier = 1;
		if ( affinity[type] === 'vulnerable' ) multiplier = 2;
		else if ( affinity[type] === 'resistant' ) multiplier = 0.5;
		else if ( affinity[type] === 'immune' ) multiplier = 0;
		else if ( affinity[type] === 'absorbe' ) multiplier = -1;

		// Apply damage and update HP
		const newHP = Math.max( hp.current - Math.floor( damage * multiplier ), 0 );
		await this.update({ 'system.resources.hp.current': newHP });
	}

}

//#region Hooks

// Check if actor is immune to status
Hooks.on('preCreateActiveEffect', (effect, options, userId) => {
	const actor = effect.parent;
	if ( !actor || !actor.system || !actor.system.immunity ) return;

	const statusID = CONFIG.statusEffects.find( (e) => effect.statuses.has( e.id ) )?.id;
	if ( statusID ) {

		const immunity = actor.system.immunity[statusID];
		if ( immunity ) {
			ui.notifications.info(`${actor.name} è immune allo status ${game.i18n.localize(`ULTIMa.status.${statusID}`)}`);
			return false;		
		}
	}

	return true;
});

//#endregion