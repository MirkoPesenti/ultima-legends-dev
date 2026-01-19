import { ULTIMA } from "../../helpers/config.mjs";
import UltimaLegendsDataModel from "../base-model.mjs";

const { DialogV2 } = foundry.applications.api;

export default class UltimaLegendsItemBase extends UltimaLegendsDataModel {

    // Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;

        const schema = {
            ultimaID: new fields.StringField(),
            source: new fields.StringField({ initial: 'base', choices: Object.keys(ULTIMA.sourceBooks) }),
			description: new fields.StringField({ initial: '', nullable: true, blank: true }),
        };

        return schema;
    }

}