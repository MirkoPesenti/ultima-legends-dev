import { SYSTEM, SYSTEM_NAME, ULTIMA } from "../../helpers/config.mjs";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class UltimaLegendsRollSheet extends HandlebarsApplicationMixin( ApplicationV2 ) {
    #data = {};
    #item = null;
    #actor = null;
    #formula = "";

    // Define default options
    static DEFAULT_OPTIONS = {
        classes: [ SYSTEM, 'sheet', 'apps' ],
        position: { width: 400 },
		tag: 'form',
        window: {
            contentClasses: ["standard-form"],
            title: `${SYSTEM_NAME} | Test`,
            icon: 'fa fa-dice',
        },
        form: {
            submitOnChange: true,
        },
        actions: {
            roll: this.#handleRoll,
        },
    };

    // Define template path
    static PARTS = {
        main: {
            id: 'main',
            template: `systems/${SYSTEM}/templates/app/dice-main.hbs`,
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
        
        this.#item = options.item ?? null;
        this.#actor = options.actor ?? null;
        this.#formula = options.formula ?? "";
    }

    // Prepare context data for template rendering
	async _prepareContext( options ) {
		const context = await super._prepareContext( options );

        // Add item and form data to context
        context.ULTIMA = ULTIMA;
        context.item = this.#item;
        context.actor = this.#actor;
        context.formula = this.#formula;
        context.formData = this.#data;

        // Prepare roll data for calculations
        context.rollData = {};
        if ( context.actor ) context.rollData.actor = context.actor.getRollData();
        if ( context.item ) context.rollData.item = context.item.getRollData();
        context.roll = new Roll( context.formula, context.rollData );

        // Add buttons to context
        context.buttons = [
            {
                type: 'button',
                action: 'roll',
                icon: 'fa fa-dice',
                label: 'Tira',
            },
        ];

        console.log('Prepared context:', context);
        
        return context;
    }

    // Attach event listeners to form inputs
    _attachPartListeners(partId, htmlElement, options) {
        super._attachPartListeners(partId, htmlElement, options);

        htmlElement.querySelectorAll('input, select').forEach(element => {
            element.addEventListener('change', this.#collectFormData.bind(this));
        });
    }

    // Handle input change events
    // async #handleInputChange(event) {
        
    //     // event.preventDefault();
    //     this.#collectFormData();
    //     await this.render({ parts: ['main', 'footer'] });

    // }

    // Collect form data
    #collectFormData() {

        if ( !this.form ) return;
        const current = new foundry.applications.ux.FormDataExtended( this.form ).object;
        this.#data = foundry.utils.mergeObject( this.#data, current, { inplace: false } );

    }

    //#region Handle actions

    /**
    * Handle Roll action
    * @this {UltimaLegendsRollSheet}
    */
    static async #handleRoll( event, target ) {
        
        event.preventDefault();
        this.#collectFormData();
        console.log('Final data collected:', this.#data);

        let finalFormula = this.#formula;
        if ( this.#data.bonus !== "" ) {
            finalFormula += ` + ${this.#data.bonus}`;
        }

        const finalRollData = {};
        if ( this.#actor ) finalRollData.actor = this.#actor.getRollData();
        if ( this.#item ) finalRollData.item = this.#item.getRollData();

        const finalRoll = new Roll( finalFormula, finalRollData );
        await finalRoll.evaluate();
        console.log('Final roll evaluated:', finalRollData);
        finalRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.#actor }),
            flavor: 'Test',
        });

    }

    //#endregion

}