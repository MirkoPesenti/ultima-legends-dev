import { SYSTEM, SYSTEM_NAME, ULTIMA } from "../../helpers/config.mjs";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class UltimaLegendsEffectSheet extends HandlebarsApplicationMixin( ApplicationV2 ) {
    #data = {};
    #item = null;
    #effectIndex = null;

    // Define default options
    static DEFAULT_OPTIONS = {
        classes: [ SYSTEM, 'sheet', 'apps' ],
        position: { width: 500 },
		tag: 'form',
        window: {
            contentClasses: ["standard-form"],
            title: `${SYSTEM_NAME} | Effetti`,
            icon: 'fa fa-wand-magic-sparkles',
        },
        form: {
            submitOnChange: true,
        },
        actions: {},
    };

    // Define template path
    static PARTS = {
        header: {
            id: 'header',
            template: `systems/${SYSTEM}/templates/app/effect-header.hbs`,
        },
        tabs: {
            id: 'tabs',
            template: 'templates/generic/tab-navigation.hbs'
        },
        main: {
            id: 'main',
            template: `systems/${SYSTEM}/templates/app/effect-main.hbs`,
			scrollable: [''],
        },
        options: {
            id: 'options',
            template: `systems/${SYSTEM}/templates/app/effect-options.hbs`,
			scrollable: [''],
        },
    };

    // Define tabs
	static TABS = {
        sheet: {
            tabs:
                [
                    { id: 'main', group: 'sheet', label: 'Generale' },
                    { id: 'options', group: 'sheet', label: 'Opzioni' },
                ],
            initial: 'main'
        }
    }

    // Define constructor
    constructor( options = {} ) {
        super( options );
        
        this.#item = options.item ?? null;
        this.#effectIndex = options.effectIndex ?? null;
    }

    // Prepare context data for template rendering
	async _prepareContext( options ) {
		const context = await super._prepareContext( options );

        // Add item and form data to context
        context.ULTIMA = ULTIMA;
        context.item = this.#item;
        context.formData = this.#data;
        context.effectIndex = this.#effectIndex;
        context.effect = context.item?.system?.effects?.[ context.effectIndex ] ?? null;
        context.formData.type = context.effect?.type;

        // Reset heal fields if resting is true
        if ( context.effect?.heal?.resting === true ) {
            context.effect.heal.hp = null;
            context.effect.heal.mp = null;
            context.effect.heal.ip = null;
            context.effect.heal.status = null;
        }

        console.log('Prepared context:', context);
        
        return context;
    }

    // Attach event listeners to form inputs
    _attachPartListeners(partId, htmlElement, options) {
        super._attachPartListeners(partId, htmlElement, options);

        htmlElement.querySelectorAll('input, select, textarea, prose-mirror').forEach(element => {
            element.addEventListener('change', this.#handleInputChange.bind(this));
        });
    }

    // Handle input change events
    async #handleInputChange(event) {
        
        event.preventDefault();
        this.#collectFormData();
        const effects = this.#item.system.effects ?? [];

        if ( effects.length > 0 ) {
            effects[ this.#effectIndex ] = this.#data;
            await this.#item.update({ 'system.effects': effects });
        }
        await this.render({ parts: ['header', 'tabs', 'main', 'options'] });

    }

    // Collect form data
    #collectFormData() {

        if ( !this.form ) return;
        const current = new foundry.applications.ux.FormDataExtended( this.form ).object;
        this.#data = foundry.utils.mergeObject( this.#data, current, { inplace: false } );

    }

}