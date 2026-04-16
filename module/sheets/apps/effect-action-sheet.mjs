import { SYSTEM, SYSTEM_NAME, ULTIMA } from "../../helpers/config.mjs";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class UltimaLegendsEffectActionSheet extends HandlebarsApplicationMixin( ApplicationV2 ) {
    #data = {};
    #actor = null;
    #item = null;

    // Define default options
    static DEFAULT_OPTIONS = {
        classes: [ SYSTEM, 'sheet', 'apps' ],
        position: { width: 500 },
		tag: 'form',
        window: {
            contentClasses: ["standard-form"],
            title: `${SYSTEM_NAME} | Utilizza Effetto`,
            icon: 'fa fa-toolbox',
        },
        form: {
            handler: this.#onSubmit,
            closeOnSubmit: true,
        },
        actions: {
            cancel: this.#handleCancel,
            confirm: this.#handleConfirm,
        },
    };

    // Define template path
    static PARTS = {
        main: {
            id: 'main',
            template: `systems/${SYSTEM}/templates/app/effect-action-main.hbs`,
			scrollable: [''],
        },
        footer: {
            id: 'footer',
            template: 'templates/generic/form-footer.hbs',
        },
    };

    // Define constructor
    constructor( options = {} ) {
        super( options );
        
        this.#actor = options.actor ?? null;
        this.#item = options.item ?? null;
    }

    // Prepare context data for template rendering
	async _prepareContext( options ) {
		const context = await super._prepareContext( options );

        // Add item and form data to context
        context.ULTIMA = ULTIMA;
        context.actor = this.#actor;
        context.item = this.#item;
        context.formData = this.#data;
        context.effects = this.#item ? this.#item.system?.effects : [];

        if ( context.effects.length > 0 ) {
            context.formData.selectedEffect = Number(context.formData.selectedEffect) || 0;
        }

        // Add buttons to context
        context.buttons = [
            {
                type: 'button',
                action: 'cancel',
                icon: 'fa fa-xmark',
                label: 'Cancella',
            },
            {
                type: 'button',
                action: 'confirm',
                icon: 'fa fa-check',
                label: 'Conferma',
            },
        ];

        console.log('Effect action context:', context);
        
        return context;
    }

    // Attach event listeners to form inputs
    _attachPartListeners(partId, htmlElement, options) {
        super._attachPartListeners(partId, htmlElement, options);

        htmlElement.querySelectorAll('input, select').forEach(element => {
            element.addEventListener('change', this.#handleInputChange.bind(this));
        });
    }

    // Handle input change events
    async #handleInputChange(event) {
        
        event.preventDefault();
        this.#collectFormData();
        // await this.render({ parts: ['main', 'footer'] });

    }

    // Collect form data
    #collectFormData() {

        if ( !this.form ) return;
        const current = new foundry.applications.ux.FormDataExtended( this.form ).object;
        this.#data = foundry.utils.mergeObject( this.#data, current, { inplace: false } );

    }

    // Handle form submission
    static async #onSubmit( event, form, formData ) {

        event.preventDefault();
        await this.close();
        
    }

    // Handle Cancel action
    static async #handleCancel( event, target ) {
        
        event.preventDefault();
        await this.close();

    }

    /**
    * Handle Confirm action
    * @this {UltimaLegendsEffectActionSheet}
    */
    static async #handleConfirm( event, target ) {
        
        event.preventDefault();
        this.#collectFormData();
        console.log('Final data collected:', this.#data);

        const selectedEffect = this.#item.system.effects[this.#data.selectedEffect];
        if ( !selectedEffect ) {
            ui.notifications.error('Nessun effetto selezionato.');
            return;
        }

        selectedEffect.applyEffect( this.#actor );
        await this.close();

    }

}