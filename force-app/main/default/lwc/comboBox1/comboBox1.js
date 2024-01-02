import { LightningElement, track } from 'lwc';
import getAccount from '@salesforce/apex/comboboxDemo.getAccounts';


export default class ComboBox1 extends LightningElement {

    @track value = '';
    @track optionsArray = [];
   // @track cardVisible = false
    get options(){
        return this.optionsArray;
    }


    connectedCallback(){
        getAccount()
        .then(result =>{
            let arr = [];
            for( var i = 0 ; i < 100; i++){
                arr.push({ label : result[i].Name , value: result[i].Id })
            }
            this.optionsArray = arr;
        })
    }
        handleChanged(event){
          //  this.cardVisible = true;

            this.value = event.detail.value;
        }
}