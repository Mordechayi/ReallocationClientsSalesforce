import { LightningElement, track, api, wire } from 'lwc';
import getCountries from '@salesforce/apex/ReallocationClientApp.getCountries';
import getStores from '@salesforce/apex/ReallocationClientApp.getStores';
import getOwners from '@salesforce/apex/ReallocationClientApp.getOwners';
import getAccounts from '@salesforce/apex/ReallocationClientApp.getAccounts';
import ReallocClients from '@salesforce/apex/ReallocationClientApp.ReallocClients';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class reallocationClientApp extends LightningElement {
    
    // Table-related variables
    @track showTable = false;
    @track resultData = [];
    @track filterResulteData = [];
    @track searchTableString;
    @track valueMainAddress;
    @track filteredOptionsCountry;
    @track valueClientsMain;
    @track valueClientSegment;
    @track displayedData = []; // Data currently displayed in the datatable
    @track isLoading = false;
    @track filteredOptionsStores;
    allSelectedRows = [];
    currentIndex = 0; // Keeps track of the index for the next data chunk
    chunkSize = 50;
    filteredAllOptionsCountry;
    filteredAllOptionsStores;

    
    // Selection and Filtering-related variables
    @track valueStores = [];
    @track valueOwners;
    @track selectedRows = [];
    countryArray;
    ownersArray;
    storesArray;
    selectedCountryToFilter;
    selectedStoresToFilter;
    countrySaArray;
    storesSaArray;
    valueCountrySA;
    valueStoreSA;
    valueOwnerSA;
    showSelectDeselect = false;
    statusRealloc;

    // Combobox and Button State-related variables
    @track isBtn = true;
    @track isBtnSA = true;
    @track isSelectAll = false;
    @track isComboboxStoresDisabled = true;
    @track isComboboxOwnersDisabled = true;
    @track isComboboxCountrySADisabled = true;
    @track isComboboxStoreSADisabled = true;
    @track isSearchOwnerSADisabled = true;
    @track enableInfiniteLoading = true; // Property to control infinite loading

    // Options for Dropdowns
    @track searchString;
    @track optionsCountry = []; 
    @track optionsStores = []; 
    @track optionsCountrySA; 
    @track optionsStoresSA;
    @track optionsOwnersSA;
    @track optionsOwnersSAFiltered;
    @track optionsOwners; 
    copyOptionsCountry = [];
    copyOptionsOwners = [];
    copyOptionsStores = [];

    columns = [
        { label: 'Client Name', fieldName: 'name', type: 'string' ,cellAttributes: { class: 'slds-text-color_success slds-text-title_caps'}},
        { label: 'Client ID', fieldName: 'Id', type: 'Id' },
        { label: 'Current Segment', fieldName: 'segment',cellAttributes: {  iconName: { fieldName: 'iconName' }, iconPosition: 'right'} },
        { label: 'Corrent Main Boutique', fieldName: 'main_boutique' },
        { label: 'Corrent Main SA', fieldName: 'cor_main_sa'  },
        { label: 'ownerId',fieldName: 'ownerId', type: 'Id' ,hidden: true },
        { label: 'MainButiqueCode',fieldName: 'mainBoutique',hidden: true },
        { label: 'countryMainID',fieldName: 'countryId',type: 'Id' ,hidden: true},
        { label: 'countryMainName',fieldName: 'countryName' ,},
        { label: 'New Main SA', fieldName: 'new_main_sa' },

    ];

    
    
    // Getter functions for dropdown options
    get getOptionsCountry() {
        return this.optionsCountry;
    }
    get getOptionsStores() {
        return this.optionsStores;
    }
    get getOptionsOwners() {
        return this.optionsOwners;
    }
    get selected() {
            return this._selected.length ? this._selected : 'none';
    }

    // Lifecycle hook that runs when component is inserted into the DOM
    async connectedCallback() {
        // Retrieve countries and map them for combobox options
        this.optionsCountry = await getCountries();
        this.optionsCountry = this.optionsCountry.map(item => ({label: item.Name, value: item.Id}));
        this.copyOptionsCountry = [...this.optionsCountry];
    }
    // getAllAccounts() {
    //     this.storesArray = this.optionsCountry.filter(item => item.value);
    //     this.ownersArray = this.optionsStores.filter(item => item.value);
    //     handleClickBnt('');
    // }
    // Handler for country combobox change
    handleComboboxCountryChange(event) {
        // Extract and split the value of the selected country
        let valueCountry = event.detail.value;
        if(valueCountry) this.countryArray = valueCountry.split(';');
        
        // Toggle combobox and reset value based on country selection
        if(!valueCountry || valueCountry == '') {
            this.isComboboxStoresDisabled = true; 
            this.valueStores = '';
        }
    }

    // Wired function to retrieve stores based on selected countries
    @wire(getStores, {listCountry: '$countryArray'})
    wiredStores({ error, data }) {
        if (data) {
            // Map stores data for combobox options
            this.optionsStores = data.map(item => ({label: item.Name, value: item.Id}));
            this.copyOptionsStores = [...this.optionsStores];
            
            // Toggle the state of the stores combobox based on data availability
            this.countryArray && this.countryArray.length > 0 ? this.isComboboxStoresDisabled = false : this.isComboboxStoresDisabled = true;
        } else if (error) {
            console.error(error);
        }
    }

    // Handler for stores combobox change
    async handleComboboxStoresChange(event) {
        // Extract and split the value of the selected store
        this.valueStores = event.detail.value;
        this.storesArray = this.valueStores.split(';');
        
        // Toggle combobox state based on store selection
        this.valueStores && this.storesArray && this.storesArray.length > 0 ? this.isComboboxOwnersDisabled = false : this.isComboboxOwnersDisabled = true;
    }
    
    // Wired function to retrieve owners based on selected stores
    @wire(getOwners, {listStores: '$storesArray'})
    wiredOwners({ error, data }) {
        if (data) {
            // Map owners data for combobox options
            this.optionsOwners = data.map(item => ({label: item.FirstName + ' ' + item.LastName + ' (' + item.accountCount + ')', value: item.OwnerId}));
            this.copyOptionsOwners = [...this.optionsOwners];
        } else if (error) {
            console.error(error);
        }
    }

    
    // Handler for change event in the owners combobox
    async handleComboboxOwnersChange(event) {
        // Update the valueOwners with the selected value from the event
        this.valueOwners = event.detail.value;
        
        // Split the valueOwners string into an array of owner IDs
        this.ownersArray = this.valueOwners.split(';');
        
        // Toggle the state of a button based on the presence of selected owners
        this.valueOwners && this.ownersArray && this.ownersArray.length > 0 ? this.isBtn = false : this.isBtn = true; 
    }
    
    // Function to check if infinite loading should be enabled
    checkEnableInfiniteLoading(){
        // Return true if there are more items to load, false otherwise
        return (this.currentIndex < this.filterResulteData.length) ? true : false;
    }

    // Wired function to retrieve accounts based on the list of owner IDs
    @wire(getAccounts, {listOwners: '$ownersArray'})
    wiredAccounts({ error, data }) {
        if (data) {
            // Store the retrieved account data
            console.log("data = ", data);
            this.accountReceived = data;
        } else if (error) {
            // Log any errors encountered
            console.error(error);
        }
    }

    // Handler for click event on a specific button
    async handleClickBnt(event) {
        // Reset resultData and related variables, then repopulate them
        this.resultData = [];
        this.currentIndex = this.checkEnableInfiniteLoading();
        this.enableInfiniteLoading = true;
        this.filterResulteData = [...this.resultData] = this.convertJsonToDataTableRows(this.accountReceived);
        this.displayedData = [];
        
        // Populate displayedData with the initial chunk of data
        this.displayedData = this.filterResulteData.slice(0, this.chunkSize);
        this.currentIndex = this.chunkSize; // Update currentIndex to the next chunk start
        this.showTable = true;
        
        // Set the filters for country and stores, then reset all table filters
        this.selectedCountryToFilter = [...this.countryArray];
        this.selectedStoresToFilter = [...this.storesArray];
        this.filterCountry();
        this.filterStores();
        this.resetAllTableFilters();
        this.optionsCountrySA = [...this.copyOptionsCountry];
    }
    
    // Function to filter countries
    filterCountry(){
        // Filter options for country based on selected countries
        this.filteredOptionsCountry = [...this.filteredAllOptionsCountry] = this.copyOptionsCountry.filter(option => 
            this.selectedCountryToFilter.some(value => value === option.value)
        );
    }

    // Function to filter stores
    filterStores(){
        // Filter options for stores based on selected stores
        this.filteredOptionsStores = [...this.filteredAllOptionsStores] = this.copyOptionsStores.filter(option => 
            this.selectedStoresToFilter.some(value => value === option.value)
            );
        }

        // Function to convert JSON data to a format suitable for displaying in a data table
    convertJsonToDataTableRows(jsonData) {
        // Map JSON data to a structured format for the data table
        return jsonData.map(item => ({
            name: item.Name,
            Id: item.Id,
                    segment: item.Segment__c,
                    main_boutique: item.MainBoutique__r.Name,
                    cor_main_sa: item.Owner.Name,
                    new_main_sa: "",
                    ownerId: item.Owner.Id,
                    mainBoutique: item.MainBoutique__c,
                    countryId: item.MainBoutique__r.ISO_code__r.Id,
                    countryName: item.MainBoutique__r.ISO_code__r.Name,
                    iconName: item.Segment__c === 'Super Elite' ? 'utility:opportunity' :
                            item.Segment__c === 'Inactive' ? 'utility:block_visitor' : undefined,
                }));
    }

    // Handler for change event in the country combobox
    async handleComboboxCountrySAChange(event) {
        // Update the valueCountrySA with the selected value from the event
        this.valueCountrySA = event.detail.value;

        // Split the valueCountrySA string into an array of country IDs
        if(this.valueCountrySA) this.countrySaArray = this.valueCountrySA.split(';');

        // Toggle the state of a combobox based on the presence of selected countries
        this.valueCountrySA && this.countrySaArray && this.countrySaArray.length > 0 ? this.isComboboxStoreSADisabled = false : this.isComboboxStoreSADisabled = true; 
    }
    
    // Wired function to retrieve stores based on the list of country IDs
    @wire(getStores, {listCountry: '$countrySaArray'})
    wiredStoresSA({ error, data }) {
        if (data) {
            // Map the retrieved store data to a specific format for optionsStoresSA
            console.log("data = ", data);
            this.optionsStoresSA = data.map(item => ({label: item.Name, value: item.Id}));
        } else if (error) {
            // Log any errors encountered
            console.error(error);
        }
    }

    
    // Handler for change event in the store combobox
    async handleComboboxStoreSAChange(event){
        // Set the selected store value from the event detail
    this.valueStoreSA = event.detail.value;
    
    // Split the store value into an array if it exists
    if(this.valueStoreSA) this.storesSaArray = this.valueStoreSA.split(';');
    
    // Enable or disable the search owner functionality based on store selection
    if(this.valueStoreSA && this.storesSaArray && this.storesSaArray.length > 0)
        this.isSearchOwnerSADisabled = false;
    else {
        this.isSearchOwnerSADisabled = true;
        this.optionsOwnersSAFiltered = this.optionsOwnersSA  = '';
        this.isBtnSA = true;
    }  
}

// Wired function to get owners based on the selected stores
@wire(getOwners, {listStores: '$storesSaArray'})
wiredOwnersSA({ error, data }) {
    if (data) {
        // Map the received data to a specific format for optionsOwnersSA
        this.optionsOwnersSA = data.map(item => ({
            Name: item.FirstName + ' ' + item.LastName,
            mainBoutique: item.MainBoutique__c,
            accountCount: item.accountCount,
            Id: item.OwnerId,
            value: JSON.stringify({mainBoutique__c: item.MainBoutique__c, ownerId: item.OwnerId})
        }));
        this.optionsOwnersSAFiltered = [...this.optionsOwnersSA];
    } else if (error) {
        console.error(error);
    }
}

// Handler for the click event to reallocate clients
async handleClickNewMainSA(){
    // Perform client reallocation and display the status
    this.statusRealloc = await ReallocClients({
        listOfAccountsSelected: this.selectedRows, 
        newOwnerId: this.selectedOption.ownerId, 
        newOwnerMainBoutique: this.selectedOption.mainBoutique__c
    });
    alert(this.statusRealloc);
    console.log("statusRealloc", this.statusRealloc);
}

// Handler for receiving selected IDs from an event
handleSelectedIds(event) {
    const selectedIds = event.detail.selectedIds;
    console.log('ID composant parent:', selectedIds);
}

// Function to show a toast message
showToast(){
    this.dispatchEvent(
        new ShowToastEvent({
            title: 'Success',
            message: 'Succeeded Reallocation',
            variant: 'success'
        })
    );
}

// Function to handle selection and deselection of rows
getSelected(event) {
    switch (event.detail.config.action) {
        case 'selectAllRows':
            // Logic for selecting all rows
            this.allSelectedRows = event.detail.selectedRows;
            let selectedRowsMap = this.allSelectedRows.map(row => row.Id);
            let selectedRowsBeafore = this.selectedRows;
            this.selectedRows = [...selectedRowsBeafore, ...selectedRowsMap];
            break;
            case 'deselectAllRows':
                // Logic for deselecting all rows
                this.selectedRows = this.selectedRows.filter(rowId => 
                    !this.displayedData.some(dataRow => dataRow.Id === rowId));
                    break;
                    
                    case 'rowSelect':
                        this.selectedRows.push(event.detail.config.value);
                        
                        break;
                        case 'rowDeselect':
            let index = this.selectedRows.indexOf(event.detail.config.value);
            console.log("selectedRows"); 
            if (index !== -1) {
                    this.selectedRows.splice(index, 1);
            }
            break;
            default:
                break;
        }
        this.selectedRows && this.selectedRows.length > 0 ? this.isComboboxCountrySADisabled   = false : this.isComboboxCountrySADisabled = true;
        // Enable or disable combobox and select/deselect functionality based on row selection
        if((this.selectedRows.length > 0 && this.filterResulteData.length > this.displayedData.length)&& (this.selectedRows.length >= this.displayedData.length))// הוספת קייס שהכל מלא
        this.showSelectDeselect = true;
        else if (this.selectedRows.length <= 0 )
        this.showSelectDeselect = false;
}

get selectDeselectText() {
    // Return appropriate text based on whether all clients are selected or not
    return this.selectedRows.length === this.filterResulteData.length 
        ? `Deselect All ${this.filterResulteData.length} Clients` 
        : `Select All ${this.filterResulteData.length} Clients`;
    }
    
    // Function to handle the click event for selecting/deselecting all clients
    handleSelectDeselectClick() {
        if (this.selectedRows.length === this.filterResulteData.length) {
            // Deselect all clients if they are currently all selected
            this.selectedRows = [];
            this.isSelectAll = false;
        } else {
            // Select all clients if they are not all currently selected
            this.selectedRows = this.filterResulteData.map(item => item.Id);
            this.isSelectAll = true;
        }
    }

// Getter for visible columns in the table
get visibleColumns() {
    // Filter and return columns that are not hidden
    return this.columns.filter(column => column.hidden !== true);
}

// Handler for change in radio button selection
handleRadioChange(event) {
    // Set the selected owner value and update button state
        this.valueOwnerSA = event.target.value;
        if(this.valueOwnerSA)this.selectedOption = JSON.parse(this.valueOwnerSA);
        this.valueOwnerSA  ? this.isBtnSA = false : this.isBtnSA = true;
    }
    
    // Handler for changes in the search field
    handleSearchChange(event) {
        // Update the search string and filter the owner options
        this.searchString = event.target.value;
        this.optionsOwnersSAFiltered = this.optionsOwnersSA.filter(option => 
            option.Name.toLowerCase().includes(this.searchString.toLowerCase()));
    }

    // Handler for search table changes
    handleSearchTableChange(event) {
        // Set loading state, update search string, and refresh table data
        this.isLoading = true;
        this.searchTableString = event.target.value.toLowerCase();
        this.updateTableData();
        this.isLoading = false;
    }
    
    
    // Function to load more data upon an event trigger (like scrolling or clicking a button)
    loadMoreData(event) {
        // Start the loading indicator
        event.target.isLoading = true;
        console.log("currentIndex", this.currentIndex);
        
        // Calculate the end index for the next chunk of data to be loaded
        const endIndex = this.currentIndex + this.chunkSize;
        
        // Slice the next chunk of data from the filterResulteData array
        const nextChunk = this.filterResulteData.slice(this.currentIndex, endIndex);
        
        // Append the new chunk of data to the existing displayed data
        this.displayedData = [...this.displayedData, ...nextChunk];
        
        // Update the current index for the next load
        this.currentIndex = endIndex;
        
        // Check if all the data has been loaded to potentially stop infinite loading
        this.enableInfiniteLoading = this.checkEnableInfiniteLoading();
        
        // Stop the loading indicator
        event.target.isLoading = false;
        
        // Update the selected rows (if necessary)
        this.selectedRows = [...this.selectedRows];
    }
    
    // Getter function for main address options
    get optionsMainAddress() {
        // Return filtered options for country
        return this.filteredOptionsCountry;
    }
        
        // Getter function for client segment options
        get optionsClientSegment() {
            // Define and return options for different client segments
            return [{label:'Super Elite', value:'Super Elite'},
            {label:'Elite', value:'Elite'},
            {label:'VVIC', value:'VVIC'},
            {label:'VIC' , value:'VIC'},
            {label:'VGC', value:'VGC'},
            {label:'GC', value:'GC'},
            {label:'Prospect', value:'Prospect'},
            {label:'Inactive' , value:'Inactive' },];
        }
        
        // Getter function for main clients options
        get optionsClientsMain() {
            // Return filtered options for stores
            return this.filteredOptionsStores;
        }
        
        // Handler for resetting country options
        handleResetOptionsCountrys() {
            // Call the reset functions with specific parameters
            this.resetOptionsStores(true, false, true);
            this.resetOptionsCountrys(true, true);
        }
        
        // Function to reset country options
        resetOptionsCountrys(clearValue, updateTable) {
            // Reset the filtered options for country
            this.filteredOptionsCountry = [...this.filteredAllOptionsCountry];
            
            // Clear the main address value if specified
            if (clearValue) this.valueMainAddress = null;
            
            // Update table data if specified
            if (updateTable) this.updateTableData();
        }
        
        // Handler for resetting store options
        handleResetOptionsStores() {
            // Call the reset function with specific parameters
            this.resetOptionsStores(true, true, false);
        }
        
        // Function to reset store options
        resetOptionsStores(clearValue, updateTable, resetListOfStores) {
            // Reset country options
            this.resetOptionsCountrys(false, false);
    
            // Reset the store options list if specified
            if (resetListOfStores) this.filteredOptionsStores = [...this.filteredAllOptionsStores];
            
            // Clear the main client value if specified
            if (clearValue) this.valueClientsMain = null;
            
            // Update table data if specified
            if (updateTable) this.updateTableData();
        }
        
        // Handler for resetting segment options
        handleResetOptionsSegments() {
            // Call the reset function with specific parameters
            this.resetOptionsSegments(true, true);
        }
        
        // Function to reset segment options
        resetOptionsSegments(clearValue, updateTable) {
            // Clear the client segment value if specified
            if (clearValue) this.valueClientSegment = null;
    
            // Update table data if specified
            if (updateTable) this.updateTableData();
        }
    
        // Function to reset search table
        resetSearchTable(clearValue, updateTable) {
            // Clear the search table string if specified
            if (clearValue) this.searchTableString = null;
            
            // Update table data if specified
            if (updateTable) this.updateTableData();
        }
        
        // Function to reset all table filters
        resetAllTableFilters() {
            // Reset various values and options to their default state
            this.selectedRows=[];
            this.valueCountrySA = '';
            this.valueOwnerSA = '';
            this.optionsOwnersSAFiltered = [];
            this.resetOptionsCountrys(true,false);
            this.resetOptionsStores(true,false,true);
            this.resetOptionsSegments(true,false);
            this.resetSearchTable(true,true);
        }
    
        // Function to update the table data based on filters
        updateTableData() {
            // Filter the resultData based on various conditions like main address, client segment, etc.
            this.filterResulteData = [...this.resultData];
            
            this.resetOptionsStores()
            this.filterResulteData = [...this.resultData] ;
            if(this.valueMainAddress != null){
                this.filterResulteData =  this.filterResulteData.filter(res => res.countryId=== this.valueMainAddress);
            }
            if(this.valueClientsMain != null ){
                this.filterResulteData =  this.filterResulteData.filter(res => res.mainBoutique === (this.valueClientsMain));
            }
            if(this.valueClientSegment != null){
            this.filterResulteData =  this.filterResulteData.filter(res => res.segment.toLowerCase() === this.valueClientSegment.toLowerCase());
            }
            if(this.searchTableString != null){
            this.filterResulteData =  this.filterResulteData.filter(res => 
                res.name.toLowerCase().includes(this.searchTableString) | res.Id.toLowerCase().includes(this.searchTableString) );
            }
            
            // Reset the current index and re-enable infinite loading if applicable
            this.currentIndex = this.chunkSize;
            this.enableInfiniteLoading = this.checkEnableInfiniteLoading();
            
            // Reset and update the displayed data with the first chunk of filtered data
            this.displayedData = [];
            this.displayedData = [...this.filterResulteData.slice(0, this.chunkSize)];
            
            // Update the selected rows (if necessary)
            this.selectedRows = [...this.selectedRows];
        }
        
        // Handler for changing the client segment
        handleChangeClientSegment(event) {
            this.resetSearchTable(true,false);
                this.valueClientSegment = event.detail.value;
                this.updateTableData();
            }
            
    
            
            
            // Function to handle changes in the main client selection
            handleChangeClientsMain(event) {
            // Update the main client value based on the event's detail
            this.valueClientsMain = event.detail.value;
            
            // Reset the search table with specific parameters
            this.resetSearchTable(true, false);
            
            // Find the matching country option based on the selected main boutique's country ID
            let matchingOption = this.optionsCountry.find(option => 
                option.value === this.resultData.find(res => res.mainBoutique === this.valueClientsMain).countryId
                );
                
                // Reset country options with specific parameters
                this.resetOptionsCountrys(false, true); // Note: Adding button option to view all in table
                
                // If a matching country option is found, update the main address and filter stores
                if (matchingOption) {
                    this.valueMainAddress = matchingOption.value;
    
                    // Create a set to keep track of seen store IDs
                    let seenStoreIds = new Set();
                    
                    // Filter stores based on country ID and uniqueness of main boutique
                    let rowsStores = this.resultData.filter(store => {
                        if (store.countryId === this.valueMainAddress && !seenStoreIds.has(store.mainBoutique)) {
                            seenStoreIds.add(store.mainBoutique);
                        return true;
                    }
                    return false;
                });
                
                // Update filtered options for stores
                this.filteredOptionsStores = [...this.filteredAllOptionsStores.filter(option => 
                    rowsStores.some(value => value.mainBoutique === option.value))];
            }
            
            // Update filtered options for countries
            this.filteredOptionsCountry = [...this.filteredAllOptionsCountry.filter(option => 
                this.filterResulteData.some(row => row.countryId === option.value))];
        }
    
        // Function to handle changes in the main address selection
        handleChangeMainAddress(event) {
            // Update the main address value based on the event's detail
            this.valueMainAddress = event.detail.value;
    
            // Reset options for stores and update the filtered store options
            if(this.filterResulteData.some(row => row.mainBoutique === this.valueClientsMain)) {
                this.resetOptionsStores(true, false, true);
            }
            this.resetSearchTable(true, true);
            this.filteredOptionsStores = [...this.filteredAllOptionsStores.filter(option => 
                this.filterResulteData.some(row => row.mainBoutique === option.value))];
        }
    
        // Computed property to get the text for selecting/deselecting all clients
        }


// @track searchString;
    // @track optionsCountry = []; 
    // copyOptionsCountry = [];
    // copyOptionsStores = [];
    // copyOptionsOwners = [];
    // @track optionsStores = []; 
    // @track optionsCountrySA; 
    // @track optionsStoresSA;
    // @track optionsOwnersSA;
    // @track optionsOwnersSAFiltered;
    // @track optionsOwners; 
    // @track isComboboxStoresDisabled = true;
    // @track isComboboxOwnersDisabled = true;
    // @track isComboboxCountrySADisabled = true;
    // @track isComboboxStoreSADisabled = true;
    // @track isSearchOwnerSADisabled = true;
    // @track accountReceived;
    // @track showTable = false;
    // @track resultData =[];
    // @track isBtn = true;
    // @track selectedRows=[];
    // @track filterResulteData = [];
    // @track searchTableString;
    // allSelectedRows = [];;
    // copyOptionsStores;
    // selectedCountryToFilter;
    // @track valueStores =[];
    // selectedStoresToFilter;
    // @track valueOwners;
    // ownersArray;
    // storesArray;
    // countrySaArray;
    // storesSaArray;
    // valueCountrySA;
    // valueStoreSA;
    // valueOwnerSA;
    // @track valueClientSegment;
    // @track valueClientsMain;
    // @track valueMainAddress;
    // @track filteredOptionsCountry;
    // showSelectDeselect = false;
    // statusRealloc;
    // @track isLoading = false;
    // displayedData = []; // Data currently displayed in the datatable
    // currentIndex = 0; // Keeps track of the index for the next data chunk
    // chunkSize = 50;
    // @track isBtnSA = true;
    // isSelectAll = false; 
    // @track enableInfiniteLoading = true; // Property to control infinite loading
    // @track countryArray =[];
    // filteredAllOptionsCountry;
    // filteredAllOptionsStores;
    // @track filteredOptionsStores ;
    


        // get selected() {
        //     return this._selected.length ? this._selected : 'none';
        // }
        
        // get getOptionsCountry(){
        //     return this.optionsCountry
        // }
        // get getOptionsStores(){
        //     return this.optionsStores;
        // }
        // get getOptionsOwners(){
        //     return this.optionsOwners;
        // }
        // async connectedCallback() {
        //     this.optionsCountry = await getCountries();
        //     this.optionsCountry=  this.optionsCountry.map(item=>({label:item.Name, value:item.Id}));
        //     this.copyOptionsCountry = [...this.optionsCountry];
        // }
        
        // handleComboboxCountryChange(event) {
        //     // Assuming this.valueCountry is the string "a00Qy000003DfkDIAS;a00Qy000003DfkEIAS" - from the combobox we use
        //     let valueCountry = event.detail.value;
        //     if(valueCountry) this.countryArray = valueCountry.split(';');
        //     // Splitting the string into an array
        //     if(!valueCountry || valueCountry == '') {
        //         this.isComboboxStoresDisabled = true; 
        //         this.valueStores = '';
        //     }
        // }
        // @wire(getStores,{listCountry: '$countryArray'})
        // wiredStores({ error, data }) {
        //     if (data) {
        //         console.log("data = ", data);
        //         this.optionsStores = data.map(item=>({label:item.Name, value:item.Id}));
        //         this.copyOptionsStores = [...this.optionsStores];
        //         // this.isComboboxStoresDisabled = false; 
        //         this.countryArray && this.countryArray.length > 0 ? this.isComboboxStoresDisabled = false : this.isComboboxStoresDisabled = true; } else if (error) {
        //     }
        //     else if (error) {
        //             console.error(error);
        //     }
        // }
        
        // async handleComboboxStoresChange(event) {
        //     // Assuming valueStores is the string "a00Qy000003DfkDIAS;a00Qy000003DfkEIAS" from the combobox we use
        //     this.valueStores = event.detail.value;
        //     // Splitting the string into an array
        //     this.storesArray =  this.valueStores.split(';');
        //     this.valueStores && this.storesArray && this.storesArray.length > 0 ? this.isComboboxOwnersDisabled = false : this.isComboboxOwnersDisabled = true; 
        // }
        // @wire(getOwners,{listStores: '$storesArray'})
        // wiredOwners({ error, data }) {
        //     if (data) {
        //         console.log("data = ", data);
        //         this.optionsOwners = data.map(item=>({label:item.FirstName+' '+item.LastName +' ('+item.accountCount+')', value:item.OwnerId}));
        //         this.copyOptionsOwners = [...this.optionsOwners];
        //         } else if (error) {
        //             console.error(error);
        //         }
        //     }

        // async handleComboboxOwnersChange(event) {
        //     // Assuming this.valueOwners is the string "a00Qy000003DfkDIAS;a00Qy000003DfkEIAS"
        //     this.valueOwners = event.detail.value;
            
        //     // Splitting the string into an array
        //     this.ownersArray = this.valueOwners.split(';');
            
        //     //this.accountReceived = await getAccounts({listOwners: this.ownersArray});
        //     this.valueOwners && this.ownersArray && this.ownersArray.length > 0 ? this.isBtn = false : this.isBtn = true; 
        // }
        // checkEnableInfiniteLoading(){
        //         return (this.currentIndex < this.filterResulteData.length )?  true:  false;
        // }
        // @wire(getAccounts,{listOwners: '$ownersArray'})
        // wiredAccounts({ error, data }) {
        //     if (data) {
        //         console.log("data = ", data);
        //         this.accountReceived = data;
        //             } else if (error) {
        //                 console.error(error);
        //             }
        //         }
        // async handleClickBnt(event) {
        //     this.resultData  =[];
        //     this.currentIndex = this.checkEnableInfiniteLoading();
        //     this.enableInfiniteLoading = true;
        //     // event.target.enableInfiniteLoading = true;
        //     // event.target.isLoading = true;
        //     this.filterResulteData = [...this.resultData] =  this.convertJsonToDataTableRows(this.accountReceived);
        //     this.displayedData = [];
        //     // Assuming resultData is already populated
        //     this.displayedData = this.filterResulteData.slice(0, this.chunkSize);
        //     this.currentIndex = this.chunkSize; // Set currentIndex to the next chunk start
        //     this.showTable = true;
        //     this.selectedCountryToFilter = [...this.countryArray];
        //     this.selectedStoresToFilter = [...this.storesArray];
        //     this.filterCountry();
        //     this.filterStores();
        //     this.resetAllTableFilters();
        //     this.optionsCountrySA = [...this.copyOptionsCountry];
        // }
        // filterCountry(){
        //     this.filteredOptionsCountry = [...this.filteredAllOptionsCountry] = this.copyOptionsCountry.filter(option => 
        //         this.selectedCountryToFilter.some(value => value === option.value)
        //         );
        // }
        // filterStores(){
        //     this.filteredOptionsStores = [...this.filteredAllOptionsStores] = this.copyOptionsStores.filter(option => 
        //         this.selectedStoresToFilter.some(value => value === option.value)
        //         );
        // }
        // convertJsonToDataTableRows(jsonData) {
        //     return jsonData.map(item => ({
        //         name: item.Name,
        //         Id: item.Id,
        //         segment: item.Segment__c,
        //         main_boutique: item.MainBoutique__r.Name,
        //         cor_main_sa: item.Owner.Name,
        //         new_main_sa: "",
        //         ownerId: item.Owner.Id,
        //         mainBoutique: item.MainBoutique__c,
        //         countryId: item.MainBoutique__r.ISO_code__r.Id,
        //         countryName: item.MainBoutique__r.ISO_code__r.Name,
        //         iconName: item.Segment__c === 'Super Elite' ? 'utility:opportunity' :
        //                 item.Segment__c === 'Inactive' ? 'utility:block_visitor' : undefined,
        //     }));
        // }
        // async handleComboboxCountrySAChange(event) {
        //     this.valueCountrySA = event.detail.value;
        //     if(this.valueCountrySA)this.countrySaArray = this.valueCountrySA.split(';');
        //     this.valueCountrySA && this.countrySaArray && this.countrySaArray.length > 0 ? this.isComboboxStoreSADisabled = false : this.isComboboxStoreSADisabled = true; 
        // }   
        // @wire(getStores,{listCountry: '$countrySaArray'})
        // wiredStoresSA({ error, data }) {
        //     if (data) {
        //         console.log("data = ", data);
        //         this.optionsStoresSA = data.map(item=>({label:item.Name, value:item.Id}));
        //     } else if (error) {
        //         console.error(error);
        //     }
        // }
        
    // async handleComboboxStoreSAChange(event){
        //     this.valueStoreSA = event.detail.value;
    //     if(this.valueStoreSA) this.storesSaArray = this.valueStoreSA.split(';');
    //     if(this.valueStoreSA && this.storesSaArray && this.storesSaArray.length > 0)
    //         this.isSearchOwnerSADisabled = false 
    //     else{
    //         this.isSearchOwnerSADisabled = true;
    //         this.optionsOwnersSAFiltered = this.optionsOwnersSA  = '';  
    //     }  
    // }
    // @wire(getOwners,{listStores: '$storesSaArray'})
    // wiredOwnersSA({ error, data }) {
    //     if (data) {
    //         console.log("data = ", data);
    //         this.optionsOwnersSA = data.map(item=>({Name:item.FirstName +' '+item.LastName, mainBoutique:item.MainBoutique__c, accountCount:item.accountCount ,Id:item.OwnerId ,value: JSON.stringify({mainBoutique__c:item.MainBoutique__c ,ownerId:item.OwnerId })}));//הוספת main boutique
    //         console.log("optionsOwnersSA = ",JSON.stringify(this.optionsOwnersSA)); //this.optionsOwnersSA);
    //         this.optionsOwnersSAFiltered = [...this.optionsOwnersSA];
    //     } else if (error) {
    //         console.error(error);
    //     }
    // }
    // async handleClickNewMainSA(){
    //     this.statusRealloc =await ReallocClients({listOfAccountsSelected: this.selectedRows, newOwnerId: this.selectedOption.ownerId ,newOwnerMainBoutique: this.selectedOption.mainBoutique__c});
    //     alert(this.statusRealloc);
    //     console.log("statusRealloc", this.statusRealloc);
    // }
    // handleSelectedIds(event) {
    //     const selectedIds = event.detail.selectedIds;
    //     console.log('ID composant parent:', selectedIds);
    // }
    // showToast(){
    //     this.dispatchEvent(
    //         new ShowToastEvent({
    //             title:'Success',
    //             message:'Successed Realloction',
    //             variant:'success'
    //         })
    //     )
    // }
    // getSelected(event) {
    //     switch (event.detail.config.action) {
        //         case 'selectAllRows':
        //             this.allSelectedRows = event.detail.selectedRows;
        //             let selectedRowsMap = this.allSelectedRows.map(row => row.Id);
        //             let selectedRowsBeafore = this.selectedRows;
        //             this.selectedRows = [...selectedRowsBeafore, ...selectedRowsMap];
        //             break;
        //         case 'deselectAllRows':
        //             this.selectedRows = this.selectedRows.filter(rowId => 
        //                 !this.displayedData.some(dataRow => dataRow.Id === rowId));
        //             break;
        
        //         case 'rowSelect':
        //             this.selectedRows.push(event.detail.config.value);
        
        //             break;
        //         case 'rowDeselect':
        //             let index = this.selectedRows.indexOf(event.detail.config.value);
        //             console.log("selectedRows"); 
        //             if (index !== -1) {
            //                  this.selectedRows.splice(index, 1);
    //             }
    //             break;
    //         default:
    //             break;
    //         }
    //         this.selectedRows && this.selectedRows.length > 0 ? this.isComboboxCountrySADisabled   = false : this.isComboboxCountrySADisabled = true;
    //     if((this.selectedRows.length > 0 && this.filterResulteData.length > this.displayedData.length)&& (this.selectedRows.length >= this.displayedData.length))// הוספת קייס שהכל מלא
    //         this.showSelectDeselect = true;
    //     else if (this.selectedRows.length <= 0 )
    //         this.showSelectDeselect = false;
    // }
    // get visibleColumns() {
    //     return this.columns.filter(column => column.hidden !== true);
    // }

    // handleRadioChange(event) {
    //     this.valueOwnerSA = event.target.value;
    //     this.selectedOption = JSON.parse(this.valueOwnerSA);
    //     this.valueOwnerSA  ? this.isBtnSA = false : this.isBtnSA = true; 
    // }
    // handleSearchChange(event) {
    //     this.searchString = event.target.value;
    //     console.log("searchString = ",JSON.stringify(this.searchString));
    //     this.optionsOwnersSAFiltered = this.optionsOwnersSA.filter(option => 
    //         option.Name.toLowerCase().includes(this.searchString.toLowerCase()));
    //         console.log("optionsOwnersSAFiltered = ",JSON.stringify(this.optionsOwnersSAFiltered));
    //     }

    // handleSearchTableChange(event) {
    //     this.isLoading = true;
    //     this.searchTableString = event.target.value.toLowerCase();
    //     this.updateTableData();
    //     this.isLoading = false;
    // } 

    // loadMoreData(event) {
    //     // Start loading indicator
    //     event.target.isLoading = true;
    //     console.log("currentIndex",this.currentIndex);
    //     // Calculate the next chunk's end index
    //     const endIndex = this.currentIndex + this.chunkSize;
        
    //     // Get the next chunk from resultData
    //     const nextChunk = this.filterResulteData.slice(this.currentIndex, endIndex);

    //     // Append the next chunk to the displayedData
    //     this.displayedData = [...this.displayedData, ...nextChunk];

    //     // Update the current index for the next load
    //     this.currentIndex = endIndex;

    //     // Check if all data has been loaded
    //     this.enableInfiniteLoading = this.checkEnableInfiniteLoading();
    //     // Stop loading indicator
    //     event.target.isLoading = false;
    //     this.selectedRows = [...this.selectedRows];
    // }
    // get optionsMainAddress()
    // {
    //     return this.filteredOptionsCountry;
    // }

    // get optionsClientSegment(){
    //     return [{label:'Super Elite', value:'Super Elite'},
    //             {label:'Elite', value:'Elite'},
    //             {label:'VVIC', value:'VVIC'},
    //             {label:'VIC' , value:'VIC'},
    //             {label:'VGC', value:'VGC'},
    //             {label:'GC', value:'GC'},
    //             {label:'Prospect', value:'Prospect'},
    //             {label:'Inactive' , value:'Inactive' },];
    // }

    // get optionsClientsMain(){
    //     return this.filteredOptionsStores ;
    // }
    // handleResetOptionsCountrys(){
    //     this.resetOptionsStores(true, false,true)
    //     this.resetOptionsCountrys(true,true);
    // }
    // resetOptionsCountrys(clearValue, updateTable){
    //     this.filteredOptionsCountry = [...this.filteredAllOptionsCountry];
    //     if(clearValue)
    //         this.valueMainAddress = null;
    //     if(updateTable)
    //         this.updateTableData();
    // }
    // handleResetOptionsStores(){
    //     this.resetOptionsStores(true,true,false);
    // }
    // resetOptionsStores(clearValue, updateTable,resetListOfStores){
    //     this.resetOptionsCountrys(false, false);
    //     if(resetListOfStores)
    //         this.filteredOptionsStores = [...this.filteredAllOptionsStores];
    //     if(clearValue)
    //         this.valueClientsMain = null;
    //     if(updateTable )
    //         this.updateTableData();
    // }
    // handleResetOptionsSegments(){
    //     this.resetOptionsSegments(true,true);
    // }
    // resetOptionsSegments(clearValue, updateTable){
    //     if(clearValue)
    //         this.valueClientSegment = null;
    //     if(updateTable)
    //         this.updateTableData();
    // }
    // resetSearchTable(clearValue, updateTable){
    //     if(clearValue)
    //         this.searchTableString = null;
    //     if( updateTable )
    //         this.updateTableData();
    // }
    // resetAllTableFilters(){
    //     this.selectedRows=[];
    //     this.valueCountrySA = '';
    //     this.valueOwnerSA = '';
    //     this.optionsOwnersSAFiltered = [];
    //     this.resetOptionsCountrys(true,false);
    //     this.resetOptionsStores(true,false,true);
    //     this.resetOptionsSegments(true,false);
    //     this.resetSearchTable(true,true);
    // }
    // updateTableData(){
    //     //this.resetOptionsStores()
    //     this.filterResulteData = [...this.resultData] ;
    //     if(this.valueMainAddress != null){
    //         this.filterResulteData =  this.filterResulteData.filter(res => res.countryId=== this.valueMainAddress);
    //     }
    //     if(this.valueClientsMain != null ){
    //     this.filterResulteData =  this.filterResulteData.filter(res => res.mainBoutique === (this.valueClientsMain));
    //     }
    //     if(this.valueClientSegment != null){
    //     this.filterResulteData =  this.filterResulteData.filter(res => res.segment.toLowerCase() === this.valueClientSegment.toLowerCase());
    //     }
    //     if(this.searchTableString != null){
    //     this.filterResulteData =  this.filterResulteData.filter(res => 
    //         res.name.toLowerCase().includes(this.searchTableString) | res.Id.toLowerCase().includes(this.searchTableString) );
    //     }
    //     this.currentIndex = this.chunkSize;
    //     this.enableInfiniteLoading = this.checkEnableInfiniteLoading();
    //     this.displayedData = [];
    //     this.displayedData = [...this.filterResulteData.slice(0,this.chunkSize)];
    //     this.selectedRows = [...this.selectedRows];
    // }

    // handleChangeClientSegment(event) {
    //     this.resetSearchTable(true,false);
    //     this.valueClientSegment = event.detail.value;
    //     this.updateTableData();
    // }

    //     handleChangeClientsMain(event) {
//         this.valueClientsMain = event.detail.value;
//         this.resetSearchTable(true,false);
//         let matchingOption = this.optionsCountry.find(option => option.value === this.resultData.find(res => res.mainBoutique === this.valueClientsMain).countryId);
//         this.resetOptionsCountrys(false,true);//הוספת כפתור אפשרות לראות את כולם בטבלה
//         if (matchingOption) {
//             this.valueMainAddress = matchingOption.value;
//             let seenStoreIds = new Set();
//             let rowsStores = this.resultData.filter(store => {
//                 if (store.countryId === this.valueMainAddress && !seenStoreIds.has(store.mainBoutique)) {
//                     seenStoreIds.add(store.mainBoutique);
//                     return true;
//                 }
//                 return false;
//             });
//             this.filteredOptionsStores = [...this.filteredAllOptionsStores.filter(option => 
//             rowsStores.some(value => value.mainBoutique === option.value))];     //this.filteredOptionsStores = rowsStores.map(item=>({label:item.name, value:item.Id}));    
//         }
//         this.filteredOptionsCountry = [...this.filteredAllOptionsCountry.filter(option => 
//         this.filterResulteData.some(row => row.countryId === option.value)
//         )]; 
//     }
//     handleChangeMainAddress(event) {
//         this.valueMainAddress = event.detail.value;
//         if(this.filterResulteData.includes(row => row.mainBoutique === this.valueClientsMain)) //&&
//             this.resetOptionsStores(true,false,true);
//         this.resetSearchTable(true,true);
//         this.filteredOptionsStores = [...this.filteredAllOptionsStores.filter(option => 
//             this.filterResulteData.some(row => row.mainBoutique === option.value)
//             )]; 
//     }
//     // Computed property for the clickable text
//     get selectDeselectText() {
//         return this.selectedRows.length === this.filterResulteData.length ? `Deselect All ${this.filterResulteData.length} Clients` : `Select All ${this.filterResulteData.length} Clients`;
//     }
//     // Handle the click on the text
//     handleSelectDeselectClick() {
//         if (this.selectedRows.length === this.filterResulteData.length) {
//             this.selectedRows = [];
//             this.isSelectAll = false;
//         } else {
//             // Logic to select all rows
//             this.selectedRows = this.filterResulteData.map(item => item.Id);
//             this.isSelectAll = true;
//         }
//     }
// }


