import { LightningElement } from 'lwc';

export default class MyDataTable extends LightningElement {
    connectedCallback(){
        let result = [{Id: "1", message: "Hello World"}];
        this.tableColumns.push({
            label:'message',
            fieldName:'SAId',
            type: 'customType_message',
            typeAttributes:{
                messageWelcome:{fieldName:'message'}
            }
        });
    }
}