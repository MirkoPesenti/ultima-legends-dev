import { ULTIMA } from "../../helpers/config.mjs";
import UltimaLegendsItemBase from "./base-item.mjs";

export default class UltimaLegendsItemEquippable extends UltimaLegendsItemBase {

    // Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();

        schema.rarity = new fields.StringField({ initial: 'base', choices: Object.keys(ULTIMA.itemRarities) });
        schema.martial = new fields.BooleanField({ initial: false });
        schema.equipped = new fields.BooleanField({ initial: false });
        schema.cost = new fields.NumberField({ initial: 0, min: 0, integer: true });
        
        return schema;
    }

}