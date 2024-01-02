import { LightningElement, api } from 'lwc';

export default class CustomTypeMessage extends LightningElement {
    @api rowld;
    @api messageWelcome;
}