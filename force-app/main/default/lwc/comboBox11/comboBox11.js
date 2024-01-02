import { LightningElement, api } from 'lwc';

export default class Combobox11 extends LightningElement {
    @api name;
    @api label;
    @api value;
    @api options;

    handleChange(event) {
        const selectedValue = event.detail.value;
        const selectedValueEvent = new CustomEvent('selected', { detail: { selectedValue, name } });
        this.dispatchEvent(selectedValueEvent);
    }
}