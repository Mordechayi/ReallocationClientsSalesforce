import { LightningElement, api, wire, track } from 'lwc';
import getRecords from '@salesforce/apex/CheckboxController.getRecords';

export default class GenericCheckboxComponent extends LightningElement {
    @api objectApiName;
    @api cardTitle;
    @api checkboxLabel;
    @track options = [];
    @track selectedValues = [];

    @wire(getRecords, { objectApiName: '$objectApiName' })
    wiredRecords({ data, error }) {
        if (data) {
            this.options = data.map(record => ({
                label: record.Name,
                value: record.Id
            }));
        } else if (error) {
            console.error(error);
        }
    }

    handleSelection(event) {
        this.selectedValues = event.detail.value;
    }
}
