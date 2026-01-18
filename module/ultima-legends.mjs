// Classes
import { UltimaLegendsActor } from './documents/actor.mjs';
import { UltimaLegendsItem } from './documents/item.mjs';

// Sheets
import { UltimaLegendsActorSheet } from './sheets/actor-sheet.mjs';
import { UltimaLegendsItemSheet } from './sheets/item-sheet.mjs';

// Import DataModels
import * as models from './data/module.mjs';

// Helpers
import { ULTIMA, SYSTEM, SYSTEM_NAME } from './helpers/config.mjs';
import { slugify } from './utils/utilities.mjs';
import { setupConfiguration } from './helpers/configuration.mjs';
import { preloadPartialTemplates } from './helpers/templates.mjs';

//#region Init
Hooks.once('init', async () => {

	// System initialization
	console.log(`${SYSTEM_NAME} | Initializing game system`);
	CONFIG.ULTIMA = ULTIMA;

	// Expose classes and utils
	game.ultimaLegends = {
		UltimaLegendsActor,
		UltimaLegendsItem,
		util: {
			slugify,
		}
	}

	// Define custom actor classes
	CONFIG.Actor.documentClass = UltimaLegendsActor;
	CONFIG.Actor.dataModels = {
		character: models.UltimaLegendsCharacter,
		npc: models.UltimaLegendsNPC,
	};
	
	// Define custom item classes
	CONFIG.Item.documentClass = UltimaLegendsItem;
	CONFIG.Item.dataModels = {
		// accessory
		// armor
		basic: models.UltimaLegendsItemBase,
		// class
		// classFeature
		// consumable
		// heroic
		// project
		// ritual
		// rule
		// shield
		// skill
		// spell
		// weapon
	};

	// Active Effects are never copied to the Actor,
	// but will still apply to the Actor from within the Item
	// if the transfer property on the Active Effect is true.
	CONFIG.ActiveEffect.legacyTransferral = false;

	// Register Actor sheet application classes
	foundry.documents.collections.Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet);
	foundry.documents.collections.Actors.registerSheet(SYSTEM, UltimaLegendsActorSheet, {
		makeDefault: true,
	});

	// Register Item sheet application classes
	foundry.documents.collections.Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet);
	foundry.documents.collections.Items.registerSheet(SYSTEM, UltimaLegendsItemSheet, {
		makeDefault: true,
		label: 'lorem ipsum',
	});

	// Setup configuration settings
	setupConfiguration();

	// Preload Handlebars partials
	return preloadPartialTemplates();

});
//#endregion

//#region Render Game Pause
Hooks.on('renderGamePause', (application, element, context, options) => {

	console.log(`${SYSTEM_NAME} | Rendering game pause screen`);

	// Add system class and change image
	element.classList.add( SYSTEM );
	const image = element.querySelector('img');
	image.src = 'systems/ultima-legends/assets/icons/icon-fabula.svg';

});
//#endregion
