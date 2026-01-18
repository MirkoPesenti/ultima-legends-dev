import { SYSTEM } from "../helpers/config.mjs";
import { UltimaLegendsItemSheet } from "./item-sheet.mjs";

export class UltimaLegendsEquippableSheet extends UltimaLegendsItemSheet {

    // Define template path
    static PARTS = {
        header: {
            id: 'header',
            template: `systems/${SYSTEM}/templates/item/item-header.hbs`,
        },
        tabs: {
            id: 'tabs',
            template: 'templates/generic/tab-navigation.hbs'
        },
        item: {
            id: 'item',
            template: `systems/${SYSTEM}/templates/item/item-equip-main.hbs`,
            scrollable: [''],
        },
        options: {
            id: 'options',
            template: `systems/${SYSTEM}/templates/item/item-equip-options.hbs`,
            scrollable: [''],
        },
    };

}