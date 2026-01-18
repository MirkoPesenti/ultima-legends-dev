import UltimaLegendsItemBase from "./base-item.mjs";

export default class UltimaLegendsBasic extends UltimaLegendsItemBase {

    // Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();
        
        return schema;
    }

}