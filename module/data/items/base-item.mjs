import { ULTIMA } from "../../helpers/config.mjs";
import UltimaLegendsDataModel from "../base-model.mjs";
import UltimaLegendsEffectDataModel from "./common/base-effects.mjs";

export default class UltimaLegendsItemBase extends UltimaLegendsDataModel {

    // Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;

        const schema = {
            ultimaID: new fields.StringField(),
            source: new fields.StringField({ initial: 'base', choices: Object.keys(ULTIMA.sourceBooks) }),
			description: new fields.StringField({ initial: '', nullable: true, blank: true }),
            effects: new fields.ArrayField(
                new fields.EmbeddedDataField(UltimaLegendsEffectDataModel, {}),
                { initial: [] }
            ),
        };

        return schema;
    }

    // Prepare Data
    prepareBaseData() {

        // Prepare effects data
        if ( Object.prototype.hasOwnProperty.call( this, 'effects' ) ) {
            for ( const effect of this.effects ) {
                effect.prepareData();
            }
        }

    }

}