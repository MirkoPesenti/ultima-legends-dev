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

    }

    // Handler for applying the effect
    async onApplyEffect( event ) {

        event.preventDefault();
        const data = this.flags[ SYSTEM ];
        console.log('Apply Effect clicked', data);

    }

}