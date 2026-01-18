import UltimaLegendsItemEquippable from "./item-equippable.mjs";

export default class UltimaLegendsAccessory extends UltimaLegendsItemEquippable {

    // Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();

        // Remove martial field from equippable schema
        delete schema.martial;
        
        return schema;
    }

}