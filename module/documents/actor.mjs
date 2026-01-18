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

}