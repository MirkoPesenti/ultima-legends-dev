import { ULTIMA } from "../../helpers/config.mjs";
import UltimaLegendsActorBase from "./base-actor.mjs";

export default class UltimaLegendsNPC extends UltimaLegendsActorBase {

	// Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();

		schema.level.fields.current = new fields.NumberField({ initial: 5, min: 5, max: 60, integer: true, nullable: false });
		schema.level.fields.villain = new fields.NumberField({ initial: 1, min: 1, max: 3, integer: true, nullable: false });

		schema.resources.fields.up = new fields.SchemaField({
			current: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
		});

		schema.rank = new fields.StringField({ initial: 'soldier', nullable: false, choices: Object.keys(ULTIMA.npcRanks) });
		// schema.rank = new fields.SchemaField({
		// 	type: new fields.StringField({ initial: 'soldier', nullable: false, choices: Object.keys(ULTIMA.npcRanks) }),
		// });

		schema.species = new fields.StringField({ initial: 'humanoid', nullable: false, choices: Object.keys(ULTIMA.npcSpecies) });

		schema.traits = new fields.StringField({ initial: '', nullable: false });

		return schema;
	}

	// Prepare Derived Data
	prepareDerivedData() {
		super.prepareDerivedData();
	}

}