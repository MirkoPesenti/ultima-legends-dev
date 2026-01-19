import UltimaLegendsItemBase from "./base-item.mjs";

export default class UltimaLegendsClass extends UltimaLegendsItemBase {

    // Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();

        schema.level = new fields.NumberField({ initial: 1, max: 10, integer: true, nullable: false });
        schema.grants = new fields.SchemaField({
            resources: new fields.SchemaField({
                hp: new fields.BooleanField({ initial: false }),
                mp: new fields.BooleanField({ initial: false }),
                ip: new fields.BooleanField({ initial: false }),
            }),
            martial: new fields.SchemaField({
                melee: new fields.BooleanField({ initial: false }),
				ranged: new fields.BooleanField({ initial: false }),
				armor: new fields.BooleanField({ initial: false }),
				shield: new fields.BooleanField({ initial: false }),
            }),
            skills: new fields.ArrayField(
                new fields.StringField({ initial: '', blank: true, nullable: true }),
                { initial: [] }
            ),
        });
        
        return schema;
    }

}