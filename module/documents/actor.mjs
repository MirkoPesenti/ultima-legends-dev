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
	applyActiveEffects() {
		if ( this.system.prepareEmbeddedData instanceof Function ) {
			this.system.prepareEmbeddedData();
		}

		return super.applyActiveEffects();
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
				if ( equippedItem.system?.twoHanded === true ) {
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

	}

}