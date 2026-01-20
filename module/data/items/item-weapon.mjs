import { ULTIMA } from "../../helpers/config.mjs";
import UltimaLegendsDamageDataModel from "./common/base-damage.mjs";
import UltimaLegendsItemEquippable from "./item-equippable.mjs";

export default class UltimaLegendsWeapon extends UltimaLegendsItemEquippable {

    // Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();
        
        schema.category = new fields.StringField({ initial: 'brawling', nullable: false, choices: Object.keys(ULTIMA.weaponCategories) });
        schema.twoHanded = new fields.BooleanField({ initial: false });
        schema.range = new fields.StringField({ initial: 'melee', nullable: false, choices: Object.keys(ULTIMA.attackRanges) });
        schema.accuracy = new fields.SchemaField({
            primary: new fields.StringField({ initial: 'dex', nullable: false, choices: Object.keys(ULTIMA.attributes) }),
            secondary: new fields.StringField({ initial: 'mig', nullable: false, choices: Object.keys(ULTIMA.attributes) }),
            bonus: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
        });
        schema.damage = new fields.EmbeddedDataField(UltimaLegendsDamageDataModel, {});
        
        return schema;
    }

}