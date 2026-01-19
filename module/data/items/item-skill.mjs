import { ULTIMA } from "../../helpers/config.mjs";
import UltimaLegendsItemBase from "./base-item.mjs";

export default class UltimaLegendsSkill extends UltimaLegendsItemBase {

    // Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();

        schema.origin = new fields.StringField({ initial: null, blank: true, nullable: true });
        schema.level = new fields.SchemaField({
            current: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
            max: new fields.NumberField({ initial: 1, min: 1, integer: true, nullable: false }),
        });
        
        return schema;
    }

    // Prepare Derived Data
	prepareDerivedData() {
		super.prepareDerivedData();

        // Ensure level does not exceed max level
		if ( this.level.current > this.level.max ) 
            this.level.current = this.level.max;
    }

}