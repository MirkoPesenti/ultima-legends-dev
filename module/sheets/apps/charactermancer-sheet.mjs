import { SYSTEM, SYSTEM_NAME, ULTIMA } from "../../helpers/config.mjs";
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
            handler: this.#onSubmit,
            closeOnSubmit: true,
        },
        actions: {
            cancel: this.#handleCancel,
            prev: this.#handlePrev,
            next: this.#handleNext,
            finish: this.#handleFinish,
            rollInitialSavings: this.#handleRollInitialSavings,
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
        this.#total = options.steps ?? 6;
    }

    // Prepare context data for template rendering
	async _prepareContext( options ) {
		const context = await super._prepareContext( options );

        const isFirst = this.#step === 1;
        const isLast = this.#step === this.#total;

        context.ULTIMA = ULTIMA;

        // Add wizard navigation data
        context.wizard = {
            currentStep: this.#step,
            total: this.#total,
            percentage: Math.round( ( this.#step - 1 ) / ( this.#total - 1 ) * 100 ),
            steps: Array( this.#total + 1 ).fill(0).map( (v, i) => ({
                index: i,
                active: i === this.#step,
            })),
        };

        // Add actor and form data to context
        context.actor = this.#actor;
        context.formData = this.#data;

        // Default name from actor if not set
        if ( this.#actor ) {
            context.formData.name = context.formData.name ?? this.#actor?.name;

            context.formData.system = context.formData.system ?? {};
            context.formData.system.attributes = context.formData.system.attributes ?? {};
            
            // Initialize attributes if not set
            const actorAttributes = this.#actor.system?.attributes ?? {};
            context.formData.system.attributes.dex = context.formData.system.attributes.dex ?? { base: actorAttributes.dex.base ?? 8 };
            context.formData.system.attributes.ins = context.formData.system.attributes.ins ?? { base: actorAttributes.ins.base ?? 8 };
            context.formData.system.attributes.mig = context.formData.system.attributes.mig ?? { base: actorAttributes.mig.base ?? 8 };
            context.formData.system.attributes.wlp = context.formData.system.attributes.wlp ?? { base: actorAttributes.wlp.base ?? 8 };

            // Initialize resources if not set
            context.formData.system.resources = context.formData.system.resources ?? {};
            context.formData.system.resources.zenit = context.formData.system.resources.zenit ?? (this.#actor?.system?.resources?.zenit ?? 500);

            // Add actor items
            context.actorItems = {
                classes: this.#actor ? this.#actor.items.filter( i => i.type === 'class' ) : [],
                skills: this.#actor ? this.#actor.items.filter( i => i.type === 'skill' ) : [],
            };
        }

        // Add game data from compendiums
        const gameClassesDocs = await game.packs.get(`${SYSTEM}.classes`)?.getDocuments() || [];
        context.gameClasses = gameClassesDocs.reduce( (acc, cls) => {
            acc[cls.system.ultimaID] = cls;
            return acc;
        }, {} );

        const gameSkillsDocs = await game.packs.get(`${SYSTEM}.skills`)?.getDocuments() || [];
        context.gameSkills = gameSkillsDocs.reduce( (acc, skill) => {
            const origin = skill.system.origin;
            if ( !acc[origin] ) acc[origin] = [];
            acc[origin].push( skill );
            return acc;
        }, {} );

        const gameItemsDocs = await game.packs.get(`${SYSTEM}.equipment`)?.getDocuments() || [];
        context.gameItems = gameItemsDocs.reduce( (acc, cls) => {
            acc[cls.system.ultimaID] = cls;
            return acc;
        }, {} );

        // Calculate class data
        const classLevels = Object.keys( context.gameClasses ).reduce( (acc, ultimaID) => {
            if ( foundry.utils.hasProperty( context.formData?.classes ?? {}, ultimaID ) ) {
                acc[ultimaID] = parseInt( context.formData?.classes[ultimaID] ?? 0 ) || 0;
            } else {
                acc[ultimaID] = 0;
            }
            return acc;
        }, {} );

        const totalClassLevels = Object.values( classLevels ).reduce( (sum, lvl) => sum + parseInt(lvl || 0), 0 );
        const totalClassSelected = Object.values( classLevels ).filter( lvl => parseInt(lvl || 0) > 0 ).length;

        const classMaxLevels = Object.keys( context.gameClasses ).reduce( (acc, ultimaID) => {
            const currentLevel = classLevels[ultimaID] || 0;
            const remainingLevels = 5 - totalClassLevels;
            acc[ultimaID] = currentLevel + remainingLevels;
            return acc;
        }, {} );

        // Add class calculation
        context.classes = {
            levels: classLevels,
            maxLevels: classMaxLevels,
            total: totalClassLevels,
            selected: totalClassSelected,
            isValid: totalClassLevels === 5 && totalClassSelected >= 2 && totalClassSelected <= 3,
        };

        // Calculate skill data
        const skillLevels = {};
        const skillMaxLevels = {};
        const skillTotalByClass = {};
        let allSkillsValid = true;

        // Iterate through selected classes
        Object.entries( classLevels ).forEach( ([classID, classLevel]) => {
            if ( classLevel > 0 ) {
                const classSkills = context.gameSkills[classID] || [];
                let totalSkillLevelsForClass = 0;

                // First pass: collect current skill levels
                classSkills.forEach( skill => {
                    const skillID = skill.system.ultimaID;
                    
                    // Get current skill level from form data
                    if ( foundry.utils.hasProperty( context.formData?.skills ?? {}, skillID ) ) {
                        skillLevels[skillID] = parseInt( context.formData?.skills[skillID] ?? 0 ) || 0;
                    } else {
                        skillLevels[skillID] = 0;
                    }

                    // Accumulate total for this class
                    totalSkillLevelsForClass += skillLevels[skillID];
                });

                skillTotalByClass[classID] = totalSkillLevelsForClass;

                // Second pass: calculate max levels based on remaining points
                const remainingLevels = classLevel - totalSkillLevelsForClass;
                classSkills.forEach( skill => {
                    const skillID = skill.system.ultimaID;
                    const currentLevel = skillLevels[skillID] || 0;
                    const skillMaxLevel = skill.system.level?.max ?? 999;
                    // Max is the minimum between current + remaining and the skill's max level
                    skillMaxLevels[skillID] = Math.min(currentLevel + remainingLevels, skillMaxLevel);
                });

                // Validate: total skill levels for this class must equal class level
                if ( totalSkillLevelsForClass !== classLevel ) {
                    allSkillsValid = false;
                }
            }
        });

        // Add skill calculation
        context.skills = {
            levels: skillLevels,
            maxLevels: skillMaxLevels,
            totalByClass: skillTotalByClass,
            isValid: allSkillsValid,
        };

        const attributeValues = [
            parseInt(context.formData?.system?.attributes?.dex?.base ?? 8),
            parseInt(context.formData?.system?.attributes?.ins?.base ?? 8),
            parseInt(context.formData?.system?.attributes?.mig?.base ?? 8),
            parseInt(context.formData?.system?.attributes?.wlp?.base ?? 8),
        ].sort((a, b) => b - a);

        // Valid combinations
        const validCombinations = [
            [8, 8, 8, 8],   // Tuttofare
            [10, 8, 8, 6],  // Nella Media
            [10, 10, 6, 6], // Specializzato
        ];

        const attributesValid = validCombinations.some(combo => 
            combo.every((val, idx) => val === attributeValues[idx])
        );

        // Add attributes calculation
        context.attributes = {
            isValid: attributesValid,
        };

        // Prepare shop data
        const equipmentPack = await game.packs.get(`${SYSTEM}.equipment`)?.getDocuments() || [];
        context.shop = {
            items: {
                weapons: equipmentPack.filter( item => item.type === 'weapon' && item.system.cost > 0 ).reduce( (acc, item) => {
                    const category = item.system.category;
                    if ( !acc[category] ) acc[category] = [];
                    acc[category].push( item );
                    return acc;
                }, {}),
                armors: equipmentPack.filter( item => item.type === 'armor' && item.system.cost > 0 ),
                shields: equipmentPack.filter( item => item.type === 'shield' && item.system.cost > 0 ),
            },
            budget: 500,
            showRares: context.formData?.shop?.showRares ?? false,
            showMartials: context.formData?.shop?.showMartials ?? false,
            selected: context.formData?.shop?.selected ?? {},
        };

        // Calculate shop budget and validity
        const totalCost = Object.entries( context.shop.selected ).reduce( (sum, [itemID, cost]) => sum + parseInt(cost || 0), 0 );
        context.shop.budget = context.shop.budget - totalCost;
        context.shop.isValid = context.shop.budget >= 0;

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
                    disabled:   (context.wizard.currentStep === 2 && !context.classes.isValid) || 
                                (context.wizard.currentStep === 3 && !context.skills.isValid) || 
                                (context.wizard.currentStep === 4 && !context.attributes.isValid) ||
                                (context.wizard.currentStep === 5 && !context.shop.isValid),
                    // label: 'Successivo',
                }
            ]),
        ];

        console.log('Prepared context:', context);
        
        return context;
    }

    // Attach event listeners to form inputs
    _attachPartListeners(partId, htmlElement, options) {
        super._attachPartListeners(partId, htmlElement, options);

        htmlElement.querySelectorAll('input, select, textarea').forEach(element => {
            element.addEventListener('change', this.#handleInputChange.bind(this));
        });
    }

    // Handle input change events
    async #handleInputChange(event) {
        
        event.preventDefault();
        this.#collectFormData();
        await this.render({ parts: ['main', 'footer'] });

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

        const classesIds = this.#data.classes || {};
        const skillsIds = this.#data.skills || {};
        const itemsIds = this.#data.shop?.selected || {};

        // Clean up data
        delete this.#data.classes;
        delete this.#data.skills;
        delete this.#data.shop;
        
        if ( this.#actor ) {

            const progressSteps = 1 + Object.keys( classesIds ).length + Object.keys( skillsIds ).length + Object.keys( itemsIds ).length;

            // Show notification
            const notification = ui.notifications.info("Aggiornamento personaggio in corso...", {
                pct: 0,
                progress: true,
            });

            // Update Actor data
            await this.#actor.update( this.#data );

            await notification.update({
                message: "Inizio aggiornamento classi e abilità...",
                pct: 1 / progressSteps,
            });

            // Update Classes
            for ( const [classID, level] of Object.entries( classesIds ) ) {
                if ( level <= 0 ) continue;

                const actorClass = this.#actor.items.find( i => i.type === 'class' && i.system.ultimaID === classID );
                if ( actorClass ) {
                    if ( actorClass?.system?.level?.current === parseInt(level) ) continue;
                    
                    // Update existing class
                    await actorClass.update({ 'system.level.current': parseInt(level) });
                } else {
                    // Create class if not found
                    const pack = await game.packs.get(`${SYSTEM}.classes`).getDocuments();
                    const itemClass = pack.find( i => i.system.ultimaID === classID );
                    if ( itemClass ) {
                        await this.#actor.createEmbeddedDocuments( 'Item', [ foundry.utils.mergeObject( itemClass.toObject(), { 'system.level.current': parseInt(level) } ) ] );
                    }
                }

                await notification.update({
                    message: `Aggiornamento classi... (${classID})`,
                    pct: (1 + Object.keys( classesIds ).indexOf(classID) + 1) / progressSteps,
                });
            }

            // Update Skills
            for ( const [skillID, level] of Object.entries( skillsIds ) ) {
                if ( level <= 0 ) continue;
                
                const actorSkill = this.#actor.items.find( i => i.type === 'skill' && i.system.ultimaID === skillID );
                if ( actorSkill ) {
                    if ( actorSkill?.system?.level?.current === parseInt(level) ) continue;
                    
                    // Update existing skill
                    await actorSkill.update({ 'system.level.current': parseInt(level) });
                } else {
                    // Create skill if not found
                    const pack = await game.packs.get(`${SYSTEM}.skills`).getDocuments();
                    const itemSkill = pack.find( i => i.system.ultimaID === skillID );
                    if ( itemSkill ) {
                        await this.#actor.createEmbeddedDocuments( 'Item', [ foundry.utils.mergeObject( itemSkill.toObject(), { 'system.level.current': parseInt(level) } ) ] );
                    }
                }

                await notification.update({
                    message: `Aggiornamento abilità... (${skillID})`,
                    pct: (1 + Object.keys( classesIds ).length + Object.keys( skillsIds ).indexOf(skillID) +  + 1) / progressSteps,
                });
            }

            // Add Items from shop
            for ( const [itemID, cost] of Object.entries( itemsIds ) ) {
                if ( cost === null || cost <= 0 ) continue;

                // Create item
                const pack = await game.packs.get(`${SYSTEM}.equipment`).getDocuments();
                const itemData = pack.find( i => i.system.ultimaID === itemID );
                if ( itemData ) {
                    await this.#actor.createEmbeddedDocuments( 'Item', [ itemData.toObject() ] );
                }

                await notification.update({
                    message: `Aggiunta oggetti... (${itemID})`,
                    pct: (1 + Object.keys( classesIds ).length + Object.keys( skillsIds ).length + Object.keys( itemsIds ).indexOf(itemID) + 1) / progressSteps,
                });
            }

            await notification.update({
                message: "Aggiornamento completato!",
                pct: 1,
            });
        }
        
        await this.close();

    }

    // Handle Cancel action
    static async #handleCancel( event, target ) {
        
        event.preventDefault();
        await this.close();

    }

    /**
    * Handle Roll Initial Savings action
    * @this {UltimaLegendsCharactermancerSheet}
    */
    static async #handleRollInitialSavings( event, target ) {

        event.preventDefault();

        // Roll 2d6 * 10
        const roll = new Roll("2d6 * 10");
        await roll.evaluate();
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: this.#actor }),
            rolls: [roll],
            flavor: `Risparmi iniziali di ${this.#data.name}`
        });
        const total = roll.total;

        // Update form data
        this.#data.system = this.#data.system || {};
        this.#data.system.resources = this.#data.system.resources || {};
        this.#data.system.resources.zenit = (this.#data.system.resources.zenit || 0) + total;
        await this.render({ parts: ['main', 'footer'] });

    }

    // Handle form submission
    static async #onSubmit( event, form, formData ) {

        event.preventDefault();
        await this.close();
        
    }

}