import { SYSTEM, ULTIMA } from "../../../helpers/config.mjs";
import UltimaLegendsDamageDataModel from "./base-damage.mjs";

export default class UltimaLegendsEffectDataModel extends foundry.abstract.DataModel {

    // Define the data schema
    static defineSchema() {
        const fields = foundry.data.fields;
        
        const schema = {
            name: new fields.StringField({ initial: '', nullable: false }),
            type: new fields.StringField({ initial: 'test', nullable: false, choices: Object.keys(ULTIMA.effectTypes) }),
            heal: new fields.SchemaField({
                hp: new fields.StringField({ initial: null, nullable: true }),
                mp: new fields.StringField({ initial: null, nullable: true }),
                ip: new fields.StringField({ initial: null, nullable: true }),
                status: new fields.StringField({ initial: null, blank: true, nullable: true, choices: Object.keys(ULTIMA.statuses) }),
                resting: new fields.BooleanField({ initial: false, nullable: false }),
            }),
            damage: new fields.EmbeddedDataField(UltimaLegendsDamageDataModel, {}),
            cost: new fields.SchemaField({
                formula: new fields.StringField({ initial: null, nullable: true }),
                type: new fields.StringField({ initial: null, blank: true, nullable: true, choices: Object.keys(ULTIMA.effectCostTypes) }),
            }),
            usage: new fields.SchemaField({
                current: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
                max: new fields.NumberField({ initial: null, integer: true, nullable: true }),
            }),
            target: new fields.SchemaField({
                count: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
            }),
        }
            
        return schema;
    }

    // Prepare Data
	prepareData() {
        // Ensure usage does not exceed max usage
        if ( this.usage.max !== null && this.usage.current > this.usage.max )
            this.usage.current = this.usage.max;
    }

    // Method to apply the effect to an actor
    async renderEffectMessage( actor = null ) {

        if ( !actor ) {
            ui.notifications.error('Nessun attore specificato per l\'applicazione dell\'effetto.');
            return;
        }

        console.log(this);
        const data = {
            type: this.type,
            target: this.target,
            item: this.parent?.parent,
            [ this.type ]: this[ this.type ],
        };

        // Determine cost based on whether the effect is from a consumable item or not
        if ( this.parent && this.parent.parent && this.parent.parent.type === 'consumable' ) {
            data.cost = {
                formula: this.parent.cost,
                type: 'ip',
            };
            data.consumable = true;
        } else {
            data.cost = this.cost;
            data.usage = this.usage;

            // Update usage if it's a limited use effect
            if ( data.cost.type === 'usage' ) {
                const newUsage = Math.max( this.usage.current - 1, 0 );
                await this.update({ 'usage.current': newUsage });
            }
        }

        if ( data.cost.type !== 'usage' ) {
            const costResource = actor.system?.resources[ data.cost.type ];
            if ( costResource && costResource.current >= Number(data.cost.formula) ) {
                const newValue = Math.max( costResource.current - Number(data.cost.formula), 0 );
                const updateKey = `system.resources.${data.cost.type}.current`;
                await actor.update({ [updateKey]: newValue });
            } else {
                ui.notifications.error('Non hai abbastanza risorse per applicare questo effetto.');
                return;
            }
        }

        // Render the chat message using a Handlebars template
        const content = await foundry.applications.handlebars.renderTemplate(`systems/${SYSTEM}/templates/chat/chat-effect.hbs`, { data });
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            flavor: this.name,
            content: content,
            flags: {
                [SYSTEM]: data,
            }
        });

    }

}