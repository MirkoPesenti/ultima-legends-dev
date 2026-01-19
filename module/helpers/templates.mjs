import { SYSTEM } from "./config.mjs";

export const preloadPartialTemplates = async function () {
	const load = foundry?.applications?.handlebars?.loadTemplates ?? globalThis.loadTemplates;

	return load([

		// Actor
		`systems/${SYSTEM}/templates/actor/character-header.hbs`,
		`systems/${SYSTEM}/templates/actor/character-main.hbs`,
		`systems/${SYSTEM}/templates/actor/character-classes.hbs`,
		`systems/${SYSTEM}/templates/actor/character-items.hbs`,
		`systems/${SYSTEM}/templates/actor/character-status.hbs`,
		`systems/${SYSTEM}/templates/actor/character-identity.hbs`,
		
		// Actor Parts
		`systems/${SYSTEM}/templates/actor/parts/equip-armor.hbs`,
		`systems/${SYSTEM}/templates/actor/parts/equip-weapon.hbs`,
		`systems/${SYSTEM}/templates/actor/parts/equip-shield.hbs`,
		`systems/${SYSTEM}/templates/actor/parts/equip-accessory.hbs`,

		// Item
		`systems/${SYSTEM}/templates/item/item-header.hbs`,
		`systems/${SYSTEM}/templates/item/item-main.hbs`,
		`systems/${SYSTEM}/templates/item/item-options.hbs`,
		`systems/${SYSTEM}/templates/item/item-equip-main.hbs`,
		`systems/${SYSTEM}/templates/item/item-equip-options.hbs`,

		// Item Parts
		`systems/${SYSTEM}/templates/item/parts/class-skill.hbs`,

	]);
}