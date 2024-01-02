public class comboboxDemo {
    @AuraEnabled
    public static List<Country__c> getAccounts(){
        return [SELECT Id , Name FROM Country__c ];
         
    }
}