// multiSelectComboBox.js
import { LightningElement, track, wire } from 'lwc';
import fetchDataFromSalesforce from '@salesforce/apex/comboboxDemo.getAccounts';


export default class MultiSelectComboBox extends LightningElement {
    @track searchTerm = '';
    @track options = [];
    @track selectedItems = [];
    @track selectAllLabel = 'Select All';

    @wire(fetchDataFromSalesforce)
    wiredData({ error, data }) {
        if (data) {
            this.options = data.map(item => ({ label: item.Name, value: item.Id }));
            this.filterOptions();
        } else if (error) {
            console.error(error);
        }
    }

    get filteredOptions() {
        return this.options.filter(
            option => option.label.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
    }

    handleSelectionChange(event) {
        this.selectedItems = event.detail.value;
        this.updateSelectAllLabel();
    }

    handleSelectAll() {
        if (this.selectAllLabel === 'Select All') {
            this.selectedItems = this.options.map(option => option.value);
        } else {
            this.selectedItems = [];
        }
        this.updateSelectAllLabel();
    }

    updateSelectAllLabel() {
        this.selectAllLabel = this.selectedItems.length === this.options.length ? 'Unselect All' : 'Select All';
    }
}
