import { SYSTEM_NAME, ULTIMA } from "../../helpers/config.mjs";
import UltimaLegendsDataModel from "../base-model.mjs";

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


Hooks.on('preCreateItem', ( item, options, userId ) => {

    // Generate an Ultima ID if it does not exist
    if ( !item.system.ultimaID && item.name ) {
        const id = game.ultimaLegends.util.slugify( item.name );
        if ( id ) {
            item.updateSource({ 'system.ultimaID': id });
        } else {
            ui.notifications.error(`${SYSTEM_NAME} | Could not generate Ultima ID for item with name '${item.name}'`);
        }
    }

});