import { SYSTEM, SYSTEM_NAME } from "../../helpers/config.mjs";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class UltimaLegendsCharactermancerSheet extends HandlebarsApplicationMixin( ApplicationV2 ) {
    #step = 1;
    #total = 1;
    #data = {};
    #actor = null;

    // Define default options
    static DEFAULT_OPTIONS = {
        classes: [ SYSTEM, 'sheet', 'apps' ],
        position: { width: 700 },
		tag: 'form',
        window: {
            contentClasses: ["standard-form"],
            title: `${SYSTEM_NAME} | Charactermancer`,
            icon: 'fa fa-dice-d20',
        },
        form: {
            handler: UltimaLegendsCharactermancerSheet.#onSubmit,
            closeOnSubmit: true,
        },
        actions: {
            cancel: UltimaLegendsCharactermancerSheet.#handleCancel,
            prev: UltimaLegendsCharactermancerSheet.#handlePrev,
            next: UltimaLegendsCharactermancerSheet.#handleNext,
            finish: UltimaLegendsCharactermancerSheet.#handleFinish,
        },
    };

    // Define template path
    static PARTS = {
        header: {
            id: 'header',
            template: `systems/${SYSTEM}/templates/app/charactermancer-header.hbs`,
        },
        main: {
            id: 'main',
            template: `systems/${SYSTEM}/templates/app/charactermancer-main.hbs`,
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
        this.#total = options.steps ?? 3;
    }

    // Prepare context data for template rendering
	async _prepareContext( options ) {
		const context = await super._prepareContext( options );

        const isFirst = this.#step === 1;
        const isLast = this.#step === this.#total;

        context.wizard = {
            currentStep: this.#step,
            total: this.#total,
            percentage: Math.round( ( this.#step - 1 ) / ( this.#total - 1 ) * 100 ),
            steps: Array( this.#total + 1 ).fill(0).map( (v, i) => ({
                index: i,
                active: i === this.#step,
            })),
        };

        context.actor = this.#actor;
        context.formData = this.#data;

        context.actorClasses = this.#actor ? this.#actor.items.filter( i => i.type === 'class' ) : [];
        context.actorSkills = this.#actor ? this.#actor.items.filter( i => i.type === 'skill' ) : [];

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
                action: 'prev',
                icon: 'fa fa-arrow-left',
                // label: 'Precedente',
                disabled: isFirst,
            },
            ...(isLast ? [
                {
                    type: 'button',
                    action: 'finish',
                    icon: 'fa fa-check',
                    label: 'Conferma',
                }
            ] : [
                {
                    type: 'button',
                    action: 'next',
                    icon: 'fa fa-arrow-right',
                    // label: 'Successivo',
                }
            ]),
        ];

        console.log('Prepared context:', context);
        
        return context;
    }

    // Collect form data
    #collectFormData() {

        if ( !this.form ) return;
        const current = new foundry.applications.ux.FormDataExtended( this.form ).object;
        this.#data = foundry.utils.mergeObject( this.#data, current, { inplace: false } );

    }

    /**
    * Handle Prev action
    * @this {UltimaLegendsCharactermancerSheet}
    */
    static async #handlePrev( event, target ) {
        
        event.preventDefault();
        this.#collectFormData();
        this.#step = Math.max( 0, this.#step - 1 );
        await this.render({ force: true });

    }

    /**
    * Handle Next action
    * @this {UltimaLegendsCharactermancerSheet}
    */
    static async #handleNext( event, target ) {
        
        event.preventDefault();
        this.#collectFormData();
        this.#step = Math.min( this.#total, this.#step + 1 );
        await this.render({ force: true });

    }

    /**
    * Handle Finish action
    * @this {UltimaLegendsCharactermancerSheet}
    */
    static async #handleFinish( event, target ) {
        
        event.preventDefault();
        this.#collectFormData();
        console.log('Final data collected:', this.#data);
        
        // TODO: Update the actor with the collected data
        // if ( this.#actor ) {
        //     await this.#actor.update( this.#data );
        //     ui.notifications.info( `${this.#actor.name} è stato aggiornato.` );
        // }
        
        await this.close();

    }

    // Handle Cancel action
    static async #handleCancel( event, target ) {
        
        event.preventDefault();
        await this.close();

    }

    // Handle form submission
    static async #onSubmit( event, form, formData ) {

        event.preventDefault();
        await this.close();
        
    }

}