import { LightningElement, api } from 'lwc';

export default class GenericHeader extends LightningElement {
    @api headerTitle = 'Default Header Title';
    @api isHeading1 = false;
    @api isHeading3 = false;
    @api showIcon = false;
    @api iconName = 'utility:opportunity'; 
}
