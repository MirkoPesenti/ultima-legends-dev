import { ULTIMA } from "../../helpers/config.mjs";
import UltimaLegendsActorBase from "./base-actor.mjs";

export default class UltimaLegendsCharacter extends UltimaLegendsActorBase {

	// Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();
		const stringEmpty = { initial: '', nullable: false };

		schema.level.fields.exp = new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false });

		schema.resources.fields.ip = new fields.SchemaField({
			current: new fields.NumberField({ initial: 6, min: 0, integer: true, nullable: false }),
			bonus: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
		});
		schema.resources.fields.fp = new fields.NumberField({ initial: 3, min: 0, integer: true, nullable: false });
		schema.resources.fields.zenit = new fields.NumberField({ initial: 500, min: 0, integer: true, nullable: false });

		schema.bonds = new fields.ArrayField(
			new fields.SchemaField({
				name: new fields.StringField( stringEmpty ),
				bond1: new fields.StringField({ initial: null, blank: true, nullable: true, choices: Object.keys(ULTIMA.bondTypes1) }),
				bond2: new fields.StringField({ initial: null, blank: true, nullable: true, choices: Object.keys(ULTIMA.bondTypes2) }),
				bond3: new fields.StringField({ initial: null, blank: true, nullable: true, choices: Object.keys(ULTIMA.bondTypes3) }),
			}),
			{ initial: [] }
		);
		
		schema.features = new fields.SchemaField({
			pronouns: new fields.StringField( stringEmpty ),
			identity: new fields.StringField( stringEmpty ),
			theme: new fields.StringField( stringEmpty ),
			origin: new fields.StringField( stringEmpty ),
		});

		return schema;
	}

	// Prepare Derived Data
	prepareDerivedData() {
		super.prepareDerivedData();
		
		this.#prepareLevel();
		this.#prepareResources();
		this.#prepareMartial();
		this.#prepareBondsStrength();
	}

	// Prepare Level
	#prepareLevel() {

		// Get all class items
		const classes = this.parent.items.filter( c => c.type === 'class' ) ?? [];

		// Calculate total level from classes
		Object.defineProperty( this.level, 'current', {
			configurable: true,
			enumerable: true,
			get() {
				const total = classes.reduce( ( sum, cls ) => sum + ( cls.system.level.current ?? 0 ), 0 );
				return total;
			},
			set( newVal ) {
				delete this.level.current;
				this.level.current = newVal;
			}
		});

	}

	// Prepare Resources Max Values
	#prepareResources() {
		
		const level = this.level.current;
		const resources = this.resources;
		const attributes = this.attributes;

		// Calculate classes benefits
		const classes = this.parent.items.filter( c => c.type === 'class' ) ?? [];
		const benefits = classes.reduce(
			( sum, cls ) => {
				if ( cls.system.grants.resources.hp ) sum.hp += 5;
				if ( cls.system.grants.resources.mp ) sum.mp += 5;
				if ( cls.system.grants.resources.ip ) sum.ip += 2;
				return sum;
			}, { hp: 0, mp: 0, ip: 0 }
		);

		// Prepare HP max
		Object.defineProperty( this.resources.hp, 'max', {
			configurable: true,
			enumerable: true,
			get() {
				const attr = Object.keys(ULTIMA.attributes).includes( resources.hp.attribute ) ? attributes[resources.hp.attribute].current : attributes.mig.current;
				return level + ( attr * 5 ) + resources.hp.bonus + benefits.hp;
			},
			set( newVal ) {
				delete this.resources.hp.max;
				this.resources.hp.max = newVal;
			}
		});
		// Ensure current HP does not exceed max
		if ( resources.hp.current > resources.hp.max ) resources.hp.current = resources.hp.max;

		// Prepare MP max
		Object.defineProperty( this.resources.mp, 'max', {
			configurable: true,
			enumerable: true,
			get() {
				const attr = Object.keys(ULTIMA.attributes).includes( resources.mp.attribute ) ? attributes[resources.mp.attribute].current : attributes.wlp.current;
				return level + ( attr * 5 ) + resources.mp.bonus + benefits.mp;
			},
			set( newVal ) {
				delete this.resources.mp.max;
				this.resources.mp.max = newVal;
			}
		});
		// Ensure current MP does not exceed max
		if ( resources.mp.current > resources.mp.max ) resources.mp.current = resources.mp.max;

		// Prepare IP max
		Object.defineProperty( this.resources.ip, 'max', {
			configurable: true,
			enumerable: true,
			get() {
				return 6 + resources.ip.bonus + benefits.ip;
			},
			set( newVal ) {
				delete this.resources.ip.max;
				this.resources.ip.max = newVal;
			}
		});
		// Ensure current IP does not exceed max
		if ( resources.ip.current > resources.ip.max ) resources.ip.current = resources.ip.max;

	}

	// Prepare Martial Proficiencies
	#prepareMartial() {

		const martial = this.martial;
		const classes = this.parent.items.filter( c => c.type === 'class' ) ?? [];

		classes.forEach( cls => {
			if ( cls.system.grants.martial.melee ) martial.melee = true;
			if ( cls.system.grants.martial.ranged ) martial.ranged = true;
			if ( cls.system.grants.martial.armor ) martial.armor = true;
			if ( cls.system.grants.martial.shield ) martial.shield = true;
		});

	}

	// Prepare Bonds Strength
	#prepareBondsStrength() {
		
		let strenght = 0;
		for ( const bond of this.bonds ) {
			if ( bond.bond1 ) strenght++;
			if ( bond.bond2 ) strenght++;
			if ( bond.bond3 ) strenght++;

			bond.str = strenght;
			strenght = 0;
		}

	}

}