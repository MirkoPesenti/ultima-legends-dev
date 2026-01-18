import { SYSTEM } from "./config.mjs";

export const preloadPartialTemplates = async function () {
	const load = foundry?.applications?.handlebars?.loadTemplates ?? globalThis.loadTemplates;

	return load([

		// Actor Partials
		`systems/${SYSTEM}/templates/actor/character-main.hbs`,
		`systems/${SYSTEM}/templates/actor/character-identity.hbs`,
		`systems/${SYSTEM}/templates/actor/character-items.hbs`,
		`systems/${SYSTEM}/templates/actor/character-status.hbs`,

	]);
}