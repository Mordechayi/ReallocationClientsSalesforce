import { LightningElement, api } from 'lwc';

export default class dualListbox extends LightningElement {
    @api name;
    @api label;
    @api value;
    @api options;
    // connectedCallback() {
    //     const items = [];
    //     for (let i = 1; i <= 15; i++) {
    //         items.push({
    //             label: `Option ${i}`,
    //             value: `opt${i}`,
    //         });
    //     }
    //     this.options.push(...items);
    //     this.values.push(...['opt2', 'opt4', 'opt6']);
    //  }
    handleChange(event) {
        const selectedValue = event.detail.value;
        const selectedValueEvent = new CustomEvent('selected', { detail: { selectedValue, name } });
        this.dispatchEvent(selectedValueEvent);
    }
}
