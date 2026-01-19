import { SYSTEM } from "../helpers/config.mjs";
import { UltimaLegendsItemSheet } from "./item-sheet.mjs";

export class UltimaLegendsClassSheet extends UltimaLegendsItemSheet {

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
            template: `systems/${SYSTEM}/templates/item/item-class-main.hbs`,
            scrollable: [''],
        },
        options: {
            id: 'options',
            template: `systems/${SYSTEM}/templates/item/item-class-options.hbs`,
            scrollable: [''],
        },
    };

}