import { ULTIMA } from "../../helpers/config.mjs";
import UltimaLegendsItemBase from "./base-item.mjs";
import UltimaLegendsDamageDataModel from "./common/base-damage.mjs";

export default class UltimaLegendsSpell extends UltimaLegendsItemBase {

    // Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();

        schema.discipline = new fields.StringField({ initial: 'arcanism', nullable: false, choices: Object.keys(ULTIMA.spellDisciplines) });
        
        schema.offensive = new fields.BooleanField({ initial: false });
        schema.opportunity = new fields.StringField({ initial: null, nullable: true, blank: true });
        schema.damage = new fields.EmbeddedDataField(UltimaLegendsDamageDataModel, {});

        schema.cost = new fields.NumberField({ initial: 0, min: 0, integer: true })
        schema.target = new fields.SchemaField({
            type: new fields.StringField({ initial: '', nullable: true, blank: true }),
            multi: new fields.BooleanField({ initial: false }),
        });
        schema.duration = new fields.StringField({ initial: 'instantaneous', nullable: false, choices: Object.keys(ULTIMA.spellDurations) });
        
        return schema;
    }

}