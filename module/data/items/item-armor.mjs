import { ULTIMA } from "../../helpers/config.mjs";
import UltimaLegendsShield from "./item-shield.mjs";

export default class UltimaLegendsArmor extends UltimaLegendsShield {

    // Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();
        
        schema.bonus.fields.init = new fields.NumberField({ initial: 0, integer: true, nullable: false });
        schema.bonus.fields.fixed = new fields.SchemaField({
            def: new fields.BooleanField({ initial: false }),
            mdef: new fields.BooleanField({ initial: false }),
        });
        schema.bonus.fields.attributes = new fields.SchemaField({
            def: new fields.StringField({ initial: 'dex', nullable: false, choices: Object.keys(ULTIMA.attributes) }),
            mdef: new fields.StringField({ initial: 'ins', nullable: false, choices: Object.keys(ULTIMA.attributes) }),
        });
        
        return schema;
    }

}