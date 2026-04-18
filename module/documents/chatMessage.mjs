import { SYSTEM } from "../helpers/config.mjs";

export default class UltimaLegendsChatMessage extends ChatMessage {

    async renderHTML() {
        const actor = game.actors.get(this.speaker.actor);
        let actorData = {};
        if ( actor && this.isContentVisible )
            actorData = actor;
        else
            actorData = {
                img: this.author.avatar ? this.author.avatar : 'icons/svg/mystery-man.svg',
                name: ''
            };
        
        const html = await super.renderHTML({ actor: actorData, author: this.author });

        this.addChatListeners( html );

        return html;
    }

    // Prepare Data
	prepareData() {
		super.prepareData();
	}

    // Add listeners for chat message interactions
    addChatListeners( html ) {

        html.querySelectorAll('[data-action="applyEffect"]').forEach( async el => 
            el.addEventListener('click', await this.onApplyEffect.bind(this))
        );

        html.querySelectorAll('[data-action="refundCost"]').forEach( async el => 
            el.addEventListener('click', await this.onRefundCost.bind(this))
        );

    }

    // Handler for applying the effect
    async onApplyEffect( event ) {

        // TODO: Targeting
        event.preventDefault();
        const data = this.flags[ SYSTEM ];
        const actor = game.actors.get(this.speaker.actor);
        if ( !data || !actor ) {
            ui.notifications.error('No effect data or actor found for this message.');
            return;
        }
        console.log('Apply Effect clicked', data, actor);

        if ( data.type === 'heal' ) {
            const currentRes = actor.system.resources;

            // Heal HP
            if ( data.heal.hp && Number(data.heal.hp) > 0 ) {
                const newHP = Math.min(currentRes.hp.current + Number(data.heal.hp), currentRes.hp.max);
                await actor.update({ 'system.resources.hp.current': newHP });
                ui.notifications.info(`Recuperati ${data.heal.hp} PV per ${actor.name}.`);
            }

            // Heal MP
            if ( data.heal.mp && Number(data.heal.mp) > 0 ) {
                const newMP = Math.min(currentRes.mp.current + Number(data.heal.mp), currentRes.mp.max);
                await actor.update({ 'system.resources.mp.current': newMP });
                ui.notifications.info(`Recuperati ${data.heal.mp} PM per ${actor.name}.`);
            }

            // Heal IP
            if ( data.heal.ip && Number(data.heal.ip) > 0 ) {
                const newIP = Math.min(currentRes.ip.current + Number(data.heal.ip), currentRes.ip.max);
                await actor.update({ 'system.resources.ip.current': newIP });
                ui.notifications.info(`Recuperati ${data.heal.ip} PI per ${actor.name}.`);
            }

            // Remove status
            if ( data.heal.status && actor.statuses.has( data.heal.status ) ) {
                await actor.toggleStatus( data.heal.status );
                ui.notifications.info(`Rimosso lo status ${data.heal.status} da ${actor.name}.`);
            }

            if ( data.heal.resting === true ) {
                await actor.fullRest();
                ui.notifications.info(`${actor.name} si è riposato completamente.`);
            }

        }

    }

    async onRefundCost( event ) {
        event.preventDefault();
        const data = this.flags[ SYSTEM ];
        const actor = game.actors.get(this.speaker.actor);
    }

}