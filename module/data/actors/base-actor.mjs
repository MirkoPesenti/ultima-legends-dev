import { ULTIMA } from "../../helpers/config.mjs";
import UltimaLegendsDataModel from "../base-model.mjs";

export default class UltimaLegendsActorBase extends UltimaLegendsDataModel {

	// Define the data schema
	static defineSchema() {
		const fields = foundry.data.fields;

		const integerEmpty = { initial: 0, integer: true, nullable: false };
		const paramFixed = { initial: null, integer: true, nullable: true };
		const equipEmpty = { initial: null, nullable: true, blank: true };
		const affinityEmpty = { initial: null, blank: true, nullable: true, choices: Object.keys(ULTIMA.affinities) };

		const schema = {
			description: new fields.StringField({ initial: '', nullable: true, blank: true }),
			level: new fields.SchemaField({}),
			attributes: new fields.SchemaField({
				dex: new fields.EmbeddedDataField( AttributeData ),
				ins: new fields.EmbeddedDataField( AttributeData ),
				mig: new fields.EmbeddedDataField( AttributeData ),
				wlp: new fields.EmbeddedDataField( AttributeData ),
			}),
			resources: new fields.SchemaField({
				hp: new fields.SchemaField({
					current: new fields.NumberField({ initial: 1, min: 0, integer: true, nullable: false }),
					bonus: new fields.NumberField( integerEmpty ),
				}),
				mp: new fields.SchemaField({
					current: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
					bonus: new fields.NumberField( integerEmpty ),
				}),
			}),
			params: new fields.SchemaField({
				def: new fields.SchemaField({
					fixed: new fields.NumberField( paramFixed ),
					bonus: new fields.NumberField( integerEmpty ),
				}),
				mdef: new fields.SchemaField({
					fixed: new fields.NumberField( paramFixed ),
					bonus: new fields.NumberField( integerEmpty ),
				}),
				init: new fields.SchemaField({
					fixed: new fields.NumberField( paramFixed ),
					bonus: new fields.NumberField( integerEmpty ),
				}),
			}),
			equip: new fields.SchemaField({
				armor: new fields.StringField( equipEmpty ),
				mainHand: new fields.StringField( equipEmpty ),
				offHand: new fields.StringField( equipEmpty ),
				accessory: new fields.StringField( equipEmpty ),
			}),
			affinity: new fields.SchemaField({
				physical: new fields.StringField( affinityEmpty ),
				air: new fields.StringField( affinityEmpty ),
				bolt: new fields.StringField( affinityEmpty ),
				fire: new fields.StringField( affinityEmpty ),
				ice: new fields.StringField( affinityEmpty ),
				light: new fields.StringField( affinityEmpty ),
				dark: new fields.StringField( affinityEmpty ),
				earth: new fields.StringField( affinityEmpty ),
				poison: new fields.StringField( affinityEmpty ),
			}),
			immunity: new fields.SchemaField({
				poisoned: new fields.BooleanField({ initial: false }),
				dazed: new fields.BooleanField({ initial: false }),
				weak: new fields.BooleanField({ initial: false }),
				enraged: new fields.BooleanField({ initial: false }),
				slow: new fields.BooleanField({ initial: false }),
				shaken: new fields.BooleanField({ initial: false }),
			}),
		};

		return schema;
	}

	prepareBaseData() {

		// Assign attribute associations for resources
		this.resources.hp.attribute = 'mig';
		this.resources.mp.attribute = 'wlp';

		this.#prepareDefences();
		this.#prepareInitiative();

	}

	prepareEmbeddedData() {

		// Define dynamic crisis value for HP
		Object.defineProperty( this.resources.hp, 'crisis', {
			configurable: true,
			enumerable: true,
			get() {
				return Math.floor( (this.max ?? this.current) / 2 );
			},
			set( newVal ) {
				delete this.crisis;
				this.crisis = newVal;
			}
		});

	}

	// Prepare dynamic defence and magic defence totals
	#prepareDefences() {

		const attributes = this.attributes;
		const params = this.params;
		let equipDefBonus = 0;
		let equipMDefBonus = 0;

		// TODO: Calculate equipment bonuses here

		// Define dynamic total values for defences
		Object.defineProperty( this.params.def, 'total', {
			configurable: true,
			enumerable: true,
			get: () => attributes.dex.current + params.def.bonus + equipDefBonus,
			set( newVal ) {
				delete this.params.def.total;
				this.params.def.total = newVal;
			}
		});

		// Define dynamic total values for magic defences
		Object.defineProperty( this.params.mdef, 'total', {
			configurable: true,
			enumerable: true,
			get: () => attributes.ins.current + params.mdef.bonus + equipMDefBonus,
			set( newVal ) {
				delete this.params.mdef.total;
				this.params.mdef.total = newVal;
			}
		});

	}

	// Prepare dynamic initiative total
	#prepareInitiative() {

		const type = this.parent.type;
		const params = this.params;
		let initBonus = 0;

		// TODO: Calculate equipment bonuses here

		// Define dynamic total values for initiative
		Object.defineProperty( this.params.init, 'total', {
			configurable: true,
			enumerable: true,
			get: () => {
				let init = 0;

				if ( type === 'npc' ) {
					// TODO: NPC initiative calculation
				}

				return init + params.init.bonus + initBonus;
			},
			set( newVal ) {
				delete this.params.init.total;
				this.params.init.total = newVal;
			}
		});

	}

}

/**
 * Data model for a single attribute with dynamic current value
 */
class AttributeData extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			base: new fields.NumberField({
				initial: 8,
				min: 6,
				max: 12,
				integer: true,
				nullable: false,
				validate: isEven,
			})
		};
	}

	// Define dynamic current value
	constructor( data, options ) {
		super( data, options );
		let current = this.base;

		Object.defineProperty( this, 'current', {
			configurable: false,
			enumerable: true,
			get: () => Math.clamp( 2 * Math.floor( current / 2 ), 6, 12 ),
			set: ( newVal ) => {
				if ( Number.isNumeric(newVal) ) {
					current = Number(newVal);
				}
			}
		});
	}
}

// Validator to ensure a number is even
function isEven( value ) {
	return value % 2 === 0;
}