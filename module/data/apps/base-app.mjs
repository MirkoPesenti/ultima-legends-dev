import { SYSTEM, SYSTEM_NAME } from "../../helpers/config.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class UltimaLegendsApp extends HandlebarsApplicationMixin( ApplicationV2 ) {

    // Define default options
    static DEFAULT_OPTIONS = {
        classes: [ SYSTEM, 'sheet', 'apps' ],
        position: { width: 700, height: 600 },
		tag: 'form',
        window: {
            contentClasses: ["standard-form"],
            title: `${SYSTEM_NAME}`,
            icon: 'fa fa-dice-d20',
        },
        actions: {
            confirm: this.#handleConfirm,
            cancel: this.#handleCancel,
        },
    };

    // Define template path
    static PARTS = {
        main: {
            id: 'main',
            template: `systems/${SYSTEM}/templates/app/app-main.hbs`,
        },
    };

    // Prepare context data for template rendering
	async _prepareContext( options ) {
		const context = await super._prepareContext( options );
        
        return context;
    }

    static async #handleConfirm( event, target ) {
        
        event.preventDefault();
        console.log('Confirm button clicked!');
        await this.close();

    }

    static async #handleCancel( event, target ) {
        
        event.preventDefault();
        console.log('Cancel button clicked!');
        await this.close();

    }

}