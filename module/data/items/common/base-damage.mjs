import { ULTIMA } from "../../../helpers/config.mjs";

export default class UltimaLegendsDamageDataModel extends foundry.abstract.DataModel {

    // Define the data schema
    static defineSchema() {
        const fields = foundry.data.fields;
        
        const schema = {
            value: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
            type: new fields.StringField({ initial: 'physical', nullable: false, choices: Object.keys(ULTIMA.damageTypes) }),
        }
        
        return schema;
    }

}