// import { LightningElement , api, track} from 'lwc';

// export default class TableDataPerso extends LightningElement {


//     @api mydata=[];
//     @track selectedRows = [];
//     get columns() {
//         return columns;
//     }
//     handleRowSelection(event) {
//         this.selectedRows = event.detail.selectedRows;
//     }
//     handleGetSelectedIds() {
//         const selectedIds = this.selectedRows.map(row => row.Id);
//       const selectedIdsEvent = new CustomEvent('selectedids', {
//         detail: { selectedIds },
//         });
//        this.dispatchEvent(selectedIdsEvent);
//         console.log('Id selected:', selectedIds);
//     }
// }
import { LightningElement,api } from 'lwc';
//import generateData from './generateData';

const columns = [
    { label: 'Client Name', fieldName: 'name', type: 'string' },
    { label: 'Client ID', fieldName: 'id', type: 'string' },
    { label: 'Current Segment', fieldName: 'segment',  },
    // { label: 'Nationality', fieldName: 'country',  },
    { label: 'Corrent Main Boutique', fieldName: 'main_boutique',  },
    { label: 'Corrent Main SA', fieldName: 'cor_main_sa',  },
    { label: 'New Main SA', fieldName: 'new_main_sa', },
];
// const data =[{name: 'vvvv',
// id: 123322222222222,
// segment: 'VVG',
// // country: 'NNNNNNNN',
// main_boutique: 'ccccccccccccccc',
// cor_main_sa: 'fffffffffffffff',
// new_main_sa: 'dddddddddddddddd',
// }
// ,
// {name: 'vvvv',
// id: 123322222222222,
// segment: 'VVG',
// country: 'NNNNNNNN',
// main_boutique: 'ccccccccccccccc',
// cor_main_sa: 'fffffffffffffff',
// new_main_sa: 'dddddddddddddddd',
// }
// ];
export default class BasicDatatable extends LightningElement {
    @api resulteData =[];
    columns = columns;
    rowOffset = 0;

    connectedCallback() {
   // rendreredCallback() {
       // this.data = generateData({ amountOfRecords: 100 });
       this.resulteData = this.resulteData;
       }
    

    increaseRowOffset() {
        this.rowOffset += 100;
    }
}
