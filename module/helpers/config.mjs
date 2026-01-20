
// Configuration constants for the Ultima Legends system
export const SYSTEM = 'ultima-legends';
export const SYSTEM_NAME = 'Ultima Legends';
export const ULTIMA = {};

ULTIMA.sourceBooks = {
	base: 'ULTIMA.sourcebook.base',
	atlasHighFantasy: 'ULTIMA.sourcebook.atlasHighFantasy',
	atlasTechnoFantasy: 'ULTIMA.sourcebook.atlasTechnoFantasy',
	atlasNaturalFantasy: 'ULTIMA.sourcebook.atlasNaturalFantasy',
	bestiaryI: 'ULTIMA.sourcebook.bestiaryI',
	bonusAce: 'ULTIMA.sourcebook.bonusAce',
	bonusHalloween: 'ULTIMA.sourcebook.bonusHalloween',
	bonusArcaneWhispers: 'ULTIMA.sourcebook.bonusArcaneWhispers',
}

ULTIMA.attributes = {
    dex: 'ULTIMA.attributes.dex.long',
    ins: 'ULTIMA.attributes.ins.long',
    mig: 'ULTIMA.attributes.mig.long',
    wlp: 'ULTIMA.attributes.wlp.long',
};
ULTIMA.attributesAbbr = {
    dex: 'ULTIMA.attributes.dex.short',
    ins: 'ULTIMA.attributes.ins.short',
    mig: 'ULTIMA.attributes.mig.short',
    wlp: 'ULTIMA.attributes.wlp.short',
};
ULTIMA.attributesDice = {
	6: 'ULTIMA.D6',
	8: 'ULTIMA.D8',
	10: 'ULTIMA.D10',
	12: 'ULTIMA.D12',
};

ULTIMA.affinities = {
    vulnerable: 'ULTIMA.affinities.vulnerable',
    resistant: 'ULTIMA.affinities.resistant',
    immune: 'ULTIMA.affinities.immune',
    absorbe: 'ULTIMA.affinities.absorbe',
};

ULTIMA.bondTypes1 = {
    admiration: 'ULTIMA.bonds.admiration',
	inferiority: 'ULTIMA.bonds.inferiority',
};
ULTIMA.bondTypes2 = {
	loyalty: 'ULTIMA.bonds.loyalty',
	mistrust: 'ULTIMA.bonds.mistrust',
};
ULTIMA.bondTypes3 = {
	affection: 'ULTIMA.bonds.affection',
	hatred: 'ULTIMA.bonds.hatred',
};

ULTIMA.npcSpecies = {
	beast: 'ULTIMA.npcSpecies.beast',
	construct: 'ULTIMA.npcSpecies.construct',
	demon: 'ULTIMA.npcSpecies.demon',
	elemental: 'ULTIMA.npcSpecies.elemental',
	monster: 'ULTIMA.npcSpecies.monster',
	plant: 'ULTIMA.npcSpecies.plant',
	undead: 'ULTIMA.npcSpecies.undead',
	humanoid: 'ULTIMA.npcSpecies.humanoid',
};

ULTIMA.npcRanks = {
	soldier: 'ULTIMA.npcRanks.soldier',
	elite: 'ULTIMA.npcRanks.elite',
	champion: 'ULTIMA.npcRanks.champion',
};

ULTIMA.itemRarities = {
	base: 'ULTIMA.rarities.base',
	rare: 'ULTIMA.rarities.rare',
};

ULTIMA.attackRanges = {
	melee: 'ULTIMA.attackRanges.melee',
	ranged: 'ULTIMA.attackRanges.ranged',
};

ULTIMA.weaponCategories = {
	arcane: 'ULTIMA.weapons.arcane',
	bow: 'ULTIMA.weapons.bow',
	flail: 'ULTIMA.weapons.flail',
	firearm: 'ULTIMA.weapons.firearm',
	spear: 'ULTIMA.weapons.spear',
	thrown: 'ULTIMA.weapons.thrown',
	heavy: 'ULTIMA.weapons.heavy',
	dagger: 'ULTIMA.weapons.dagger',
	brawling: 'ULTIMA.weapons.brawling',
	sword: 'ULTIMA.weapons.sword',
};

ULTIMA.spellDisciplines = {
	arcanism: 'ULTIMA.disciplines.arcanism',
	chimerism: 'ULTIMA.disciplines.chimerism',
	elementalism: 'ULTIMA.disciplines.elementalism',
	entropism: 'ULTIMA.disciplines.entropism',
	ritualism: 'ULTIMA.disciplines.ritualism',
	spiritism: 'ULTIMA.disciplines.spiritism',
};

ULTIMA.spellDurations = {
	instantaneous: 'ULTIMA.spellDurations.instantaneous',
	scene: 'ULTIMA.spellDurations.scene',
};

ULTIMA.damageTypes = {
	physical: 'ULTIMA.damageTypes.physical',
	air: 'ULTIMA.damageTypes.air',
	bolt: 'ULTIMA.damageTypes.bolt',
	fire: 'ULTIMA.damageTypes.fire',
	ice: 'ULTIMA.damageTypes.ice',
	light: 'ULTIMA.damageTypes.light',
	dark: 'ULTIMA.damageTypes.dark',
	earth: 'ULTIMA.damageTypes.earth',
	poison: 'ULTIMA.damageTypes.poison',
};