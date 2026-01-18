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

		// TODO: Check two-handed conflicts with shields

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

		const equippedItem = await fromUuid( equip[slot] );

		if ( equippedItem && equippedItem.uuid === itemUuid ) {
			
			// Unequip if already equipped
			await this.update({ [`system.equip.${slot}`]: null });
			if ( isTwoHanded ) {
				await this.update({ 'system.equip.offHand': null });
			}
			await equippedItem.update({ 'system.equipped': false });
			
		} else {

			// Unequip previous item if exists
			if ( equippedItem ) {
				await equippedItem.update({ 'system.equipped': false });
			}
			// Equip new item
			await this.update({ [`system.equip.${slot}`]: itemUuid });
			if ( isTwoHanded ) {
				await this.update({ 'system.equip.offHand': itemUuid });
			}
			await item.update({ 'system.equipped': true });

		}

	}

}