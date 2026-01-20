import UltimaLegendsItemBase from "./base-item.mjs";

export default class UltimaLegendsConsumable extends UltimaLegendsItemBase {

    // Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();

        schema.cost = new fields.NumberField({ initial: 1, min: 0, integer: true, nullable: false });
        
        return schema;
    }

}