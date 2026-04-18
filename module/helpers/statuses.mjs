export const statusEffects = [
	{
		id: 'slow',
		name: 'ULTIMA.status.slow',
		img: 'systems/fabula/assets/icons/status/icon-slow.svg',
		changes: [
			{
				key: 'system.attributes.dex.current',
				mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
				value: -2,
			}
		]
	},
	{
		id: 'dazed',
		name: 'ULTIMA.status.dazed',
		img: 'systems/fabula/assets/icons/status/icon-dazed.svg',
		changes: [
			{
				key: 'system.attributes.ins.current',
				mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
				value: -2,
			}
		]
	},
	{
		id: 'weak',
		name: 'ULTIMA.status.weak',
		img: 'systems/fabula/assets/icons/status/icon-weak.svg',
		changes: [
			{
				key: 'system.attributes.mig.current',
				mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
				value: -2,
			}
		]
	},
	{
		id: 'shaken',
		name: 'ULTIMA.status.shaken',
		img: 'systems/fabula/assets/icons/status/icon-shaken.svg',
		changes: [
			{
				key: 'system.attributes.wlp.current',
				mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
				value: -2,
			}
		]
	},
	{
		id: 'enraged',
		name: 'ULTIMA.status.enraged',
		img: 'systems/fabula/assets/icons/status/icon-enraged.svg',
		changes: [
			{
				key: 'system.attributes.dex.current',
				mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
				value: -2,
			},
			{
				key: 'system.attributes.ins.current',
				mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
				value: -2,
			}
		]
	},
	{
		id: 'poisoned',
		name: 'ULTIMA.status.poisoned',
		img: 'systems/fabula/assets/icons/status/icon-poisoned.svg',
		changes: [
			{
				key: 'system.attributes.wlp.current',
				mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
				value: -2,
			},
			{
				key: 'system.attributes.mig.current',
				mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
				value: -2,
			}
		]
	},
	{
		id: 'crisis',
		name: 'ULTIMA.crisis',
		img: 'systems/fabula/assets/icons/status/icon-crisis.svg',
	},
	{
		id: 'defeated',
		name: 'ULTIMA.defeated',
		img: 'systems/fabula/assets/icons/status/icon-defeated.svg',
	},
	// {
	// 	id: 'dex-down',
	// 	name: 'ULTIMA.DEXdown',
	// 	img: 'systems/fabula/assets/icons/status/icon-dex-down.svg',
	// 	changes: [
	// 		{
	// 			key: 'system.attributes.dex.current',
	// 			mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
	// 			value: -2,
	// 		}
	// 	]
	// },
	// {
	// 	id: 'dex-up',
	// 	name: 'ULTIMA.DEXup',
	// 	img: 'systems/fabula/assets/icons/status/icon-dex-up.svg',
	// 	changes: [
	// 		{
	// 			key: 'system.attributes.dex.current',
	// 			mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
	// 			value: '2',
	// 		}
	// 	]
	// },
	// {
	// 	id: 'ins-down',
	// 	name: 'ULTIMA.INSdown',
	// 	img: 'systems/fabula/assets/icons/status/icon-ins-down.svg',
	// 	changes: [
	// 		{
	// 			key: 'system.attributes.ins.current',
	// 			mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
	// 			value: -2,
	// 		}
	// 	]
	// },
	// {
	// 	id: 'ins-up',
	// 	name: 'ULTIMA.INSup',
	// 	img: 'systems/fabula/assets/icons/status/icon-ins-up.svg',
	// 	changes: [
	// 		{
	// 			key: 'system.attributes.ins.current',
	// 			mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
	// 			value: '2',
	// 		}
	// 	]
	// },
	// {
	// 	id: 'mig-down',
	// 	name: 'ULTIMA.MIGdown',
	// 	img: 'systems/fabula/assets/icons/status/icon-mig-down.svg',
	// 	changes: [
	// 		{
	// 			key: 'system.attributes.mig.current',
	// 			mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
	// 			value: -2,
	// 		}
	// 	]
	// },
	// {
	// 	id: 'mig-up',
	// 	name: 'ULTIMA.MIGup',
	// 	img: 'systems/fabula/assets/icons/status/icon-mig-up.svg',
	// 	changes: [
	// 		{
	// 			key: 'system.attributes.mig.current',
	// 			mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
	// 			value: '2',
	// 		}
	// 	]
	// },
	// {
	// 	id: 'wlp-down',
	// 	name: 'ULTIMA.WLPdown',
	// 	img: 'systems/fabula/assets/icons/status/icon-wlp-down.svg',
	// 	changes: [
	// 		{
	// 			key: 'system.attributes.wlp.current',
	// 			mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
	// 			value: -2,
	// 		}
	// 	]
	// },
	// {
	// 	id: 'wlp-up',
	// 	name: 'ULTIMA.WLPup',
	// 	img: 'systems/fabula/assets/icons/status/icon-wlp-up.svg',
	// 	changes: [
	// 		{
	// 			key: 'system.attributes.wlp.current',
	// 			mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
	// 			value: '2',
	// 		}
	// 	]
	// },
];