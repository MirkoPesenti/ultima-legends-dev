import { SYSTEM } from "../helpers/config.mjs";
import { UltimaLegendsRollSheet } from "../sheets/apps/roll-sheet.mjs";

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
        
        const html = await super.renderHTML({
            actor: actorData,
            author: this.author,
        });

        this.editChatElements(html);
        this.addChatListeners( html );

        return html;
    }

    // Prepare Data
	prepareData() {
        console.log(this);
		super.prepareData();
	}

    editChatElements( html ) {

        const data = foundry.utils.deepClone( this.flags[ SYSTEM ] );
        const actor = game.actors.get(this.speaker.actor);
        if ( !data || !actor ) return;
        
        // Hide buttons if user is not the author or an owner
        if ( !actor.testUserPermission( game.user, 3 ) ) {
            html.querySelectorAll('.owner-only').forEach( el => el.remove() );
        }

        // Disable interaction buttons if user is not the author or an owner
        if ( !actor.testUserPermission( game.user, 3 ) ) {
            html.querySelectorAll('.owner-interaction').forEach( el => el.setAttribute('disabled', true) );
        }

        // Disable buttons if effect already applied or refunded
        if ( data?.ui?.effectApplied ) {
            html.querySelector('[data-action="applyEffect"]')?.setAttribute('disabled', true);
            html.querySelector('[data-action="applyEffect"]').textContent = 'Effetto applicato';
            html.querySelector('[data-action="refundCost"]')?.remove();
        }

        // Disable refund button if cost already refunded
        if ( data?.ui?.effectRefunded ) {
            html.querySelector('[data-action="refundCost"]')?.setAttribute('disabled', true);
            html.querySelector('[data-action="refundCost"]').textContent = 'Costo rimborsato';
            html.querySelector('[data-action="applyEffect"]')?.remove();
        }

    }

    // Add listeners for chat message interactions
    addChatListeners( html ) {

        html.querySelectorAll('[data-action="applyEffect"]').forEach( async el => 
            el.addEventListener('click', await this.onApplyEffect.bind(this))
        );

        html.querySelectorAll('[data-action="refundCost"]').forEach( async el => 
            el.addEventListener('click', await this.onRefundCost.bind(this))
        );

        html.querySelectorAll('[data-action="rollCheck"]').forEach( async el => 
            el.addEventListener('click', await this.onRollCheck.bind(this))
        );

    }

    //#region Listeners

    // Handler for applying the effect
    async onApplyEffect( event ) {

        // TODO: Targeting
        event.preventDefault();
        const data = foundry.utils.deepClone( this.flags[ SYSTEM ] );
        const actor = game.actors.get(this.speaker.actor);
        const item = game.items.get( data.item._id );
        if ( !data || !actor || !item ) {
            ui.notifications.error('Missing data for this message.');
            return;
        }

        // Prepare roll data for calculations
        const rollData = {
            actor: actor.getRollData(),
            item: item.getRollData(),
        };
        console.log('Apply Effect clicked', data, rollData );

        if ( data.type === 'heal' ) {
            const currentRes = actor.system.resources;

            // Heal HP
            if ( data.heal.hp !== "" ) {
                const rollHP = new Roll(data.heal.hp, rollData);
                await rollHP.evaluate();

                const newHP = Math.min(currentRes.hp.current + Number(rollHP.total), currentRes.hp.max);
                await actor.update({ 'system.resources.hp.current': newHP });
                ui.notifications.info(`Recuperati ${rollHP.total} PV per ${actor.name}.`);
            }

            // Heal MP
            if ( data.heal.mp !== "" ) {
                const rollMP = new Roll(data.heal.mp, rollData);
                await rollMP.evaluate();

                const newMP = Math.min(currentRes.mp.current + Number(rollMP.total), currentRes.mp.max);
                await actor.update({ 'system.resources.mp.current': newMP });
                ui.notifications.info(`Recuperati ${rollMP.total} PM per ${actor.name}.`);
            }

            // Heal IP
            if ( data.heal.ip !== "" ) {
                const rollIP = new Roll(data.heal.ip, rollData);
                await rollIP.evaluate();

                const newIP = Math.min(currentRes.ip.current + Number(rollIP.total), currentRes.ip.max);
                await actor.update({ 'system.resources.ip.current': newIP });
                ui.notifications.info(`Recuperati ${rollIP.total} PI per ${actor.name}.`);
            }

            // Remove status
            if ( data.status && actor.statuses.has( data.status ) ) {
                await actor.toggleStatusEffect( data.status );
                ui.notifications.info(`Rimosso lo status ${game.i18n.localize(`ULTIMA.status.${data.status}`)} da ${actor.name}.`);
            }

            // Full Rest
            if ( data.heal.resting === true ) {
                await actor.fullRest();
                ui.notifications.info(`${actor.name} si è riposato completamente.`);
            }

        } else if ( data.type === 'offensive' ) {

            if ( data.damage.formula !== "" ) {
                const rollDamage = new Roll(data.damage.formula, rollData);
                await rollDamage.evaluate();
                
                // Apply damage to the actor
                await actor.applyDamage( rollDamage.total, data.damage.type );
            }

            // Apply status
            if ( data.status && !actor.statuses.has( data.status ) ) {
                await actor.toggleStatusEffect( data.status );
                ui.notifications.info(`Applicato lo status ${game.i18n.localize(`ULTIMA.status.${data.status}`)} a ${actor.name}.`);
            }

        }

        data.ui ??= {};
        data.ui.effectApplied = true;

        await this.update({ [`flags.${SYSTEM}`]: data });

    }

    // Handler for refunding the cost
    async onRefundCost( event ) {

        event.preventDefault();
        const data = foundry.utils.deepClone( this.flags[ SYSTEM ] );
        const actor = game.actors.get(this.speaker.actor);

        if ( !data || !actor ) {
            ui.notifications.error('No effect data or actor found for this message.');
            return;
        }

        if ( data?.cost?.type === 'usage' ) {
        } else {
            const costResource = actor.system?.resources[ data.cost.type ];
            if ( costResource ) {
                const newValue = costResource.current + Number(data.cost.formula);
                const updateKey = `system.resources.${data.cost.type}.current`;
                await actor.update({ [updateKey]: newValue });
                ui.notifications.info(`Rimborsati ${data.cost.formula} ${data.cost.type.toUpperCase()} a ${actor.name}.`);
            } else {
                ui.notifications.error('Cost resource not found for refund.');
            }
        }

        data.ui ??= {};
        data.ui.effectRefunded = true;

        await this.update({ [`flags.${SYSTEM}`]: data });

    }

    async onRollCheck( event ) {

        event.preventDefault();
        const data = foundry.utils.deepClone( this.flags[ SYSTEM ] );
        // TODO: Actor in base a chi clicca, non per forza speaker
        const actor = game.actors.get(this.speaker.actor);
        const item = game.items.get( data.item._id );
        if ( !data || !actor || !item ) {
            ui.notifications.error('Missing data for this message.');
            return;
        }

        // Construct formula based on primary and secondary attributes, plus any bonus
        let formula = `1d@actor.attributes.${data.check.primary}.base + 1d@actor.attributes.${data.check.secondary}.base`;
        if ( data.check.bonus !== "" ) {
            formula += ` + ${data.check.bonus}`;
        }

        // Open roll sheet with prepared data
        const rollApp = new UltimaLegendsRollSheet({
            item: item,
            actor: actor,
            formula: formula,
        });
        await rollApp.render( true );

        // const checkRoll = new Roll(formula, rollData);
        // await checkRoll.evaluate();
        // checkRoll.toMessage({
        //     speaker: ChatMessage.getSpeaker({ actor: actor }),
        //     flavor: 'Test',
        // });

    }

    //#region 

}