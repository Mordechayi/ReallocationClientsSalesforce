public with sharing class CheckboxController {
    @AuraEnabled(cacheable=true)
    public static List<SObject> getRecords(String objectApiName) {
        String query = 'SELECT Id, Name FROM ' + objectApiName;
        return Database.query(query);
    }
}
