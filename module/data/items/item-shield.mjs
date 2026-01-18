import UltimaLegendsItemEquippable from "./item-equippable.mjs";

export default class UltimaLegendsShield extends UltimaLegendsItemEquippable {

    // Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();
        
        schema.bonus = new fields.SchemaField({
            def: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
            mdef: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
        });
        
        return schema;
    }

}