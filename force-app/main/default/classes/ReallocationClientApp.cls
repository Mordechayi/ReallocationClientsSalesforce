// Apex class for the ReallocationClientApp
public with sharing class ReallocationClientApp {
    
    // AuraEnabled method to get a list of countries from the Country__c object
    // Marked as cacheable for client-side caching in Lightning components
    @AuraEnabled(cacheable=true)
    public static List<Country__c> getCountries(){
        // SOQL query to retrieve all countries ordered by name
        return [SELECT Id, Name 
                FROM Country__c   
                ORDER BY Name];
    }

    // AuraEnabled method to get a list of stores based on a list of country IDs
    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getStores(List<String> listCountry){
        System.debug('listCountry' + listCountry);
        // SOQL query to retrieve stores that match the given country IDs
        return [SELECT Name, Id
                FROM Store__c 
                WHERE Id != null AND ISO_code__c IN :listCountry
                GROUP BY Id, Name, ISO_code__c
                ORDER BY Name];
    }

    // AuraEnabled method to get a list of owners based on a list of store IDs
    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getOwners(List<String> listStores){
        // SOQL query to retrieve owners for accounts in the specified stores
        return [SELECT MainBoutique__c, OwnerId, Owner.LastName, Owner.FirstName, COUNT(Id) accountCount 
                FROM Account 
                WHERE MainBoutique__c IN :listStores  
                GROUP BY MainBoutique__c, OwnerId, Owner.LastName, Owner.FirstName];
    }
    
    // AuraEnabled method to get a list of accounts based on a list of owner IDs
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(List<String> listOwners){
        // SOQL query to retrieve accounts owned by the specified owners
        return [SELECT Name, Id, Segment__c, MainBoutique__r.Name, Owner.Name, Owner.Id, MainBoutique__c, MainBoutique__r.ISO_code__r.Id, MainBoutique__r.ISO_code__r.Name
                FROM Account
                WHERE Owner.Id IN :listOwners];
    }
    
    // AuraEnabled method to reallocate clients to a new owner and boutique
    @AuraEnabled
    public static string ReallocClients(List<String> listOfAccountsSelected, Id newOwnerId, String newOwnerMainBoutique){
        System.debug('listOfAccountsSelected =' + listOfAccountsSelected + ' newOwner = ' + newOwnerId + ' newOwnerMainBoutique = ' + newOwnerMainBoutique);
        try {
            // Preparing a list of accounts for update
            List<Account> listToUpdate = new List<Account>();
            for(String account : listOfAccountsSelected){
                Account updateAccount = new Account();
                updateAccount.Id = account;
                updateAccount.OwnerId = newOwnerId;
                updateAccount.MainBoutique__c = newOwnerMainBoutique;
                listToUpdate.add(updateAccount);
            }
            // Performing the update operation
            update listToUpdate;                       
            return 'reallocation successful';
        }           
        catch (Exception e) {
            // Handling exceptions and rethrowing as AuraHandledException for client-side handling
            throw new AuraHandledException(e.getMessage());
        }
    }
}


// public with sharing class ReallocationClientApp {
//     @AuraEnabled(cacheable=true)
//     public static List<Country__c> getCountries(){
//         return [SELECT  Id, Name 
//                 FROM Country__c   
//                 ORDER BY Name];
//     }

    
//     @AuraEnabled(cacheable=true)
//     public static List<AggregateResult> getStores(List<String> listCountry){
//         System.debug('listCountry' + listCountry);
//         return[SELECT Name,Id
//         FROM Store__c 
//         WHERE Id != null AND ISO_code__c IN :listCountry
//         GROUP BY Id, Name, ISO_code__c
//         ORDER BY Name
//         ];
//     }
//     @AuraEnabled(cacheable=true)
//     public static List<AggregateResult> getOwners(List<String> listStores){
//         return [SELECT MainBoutique__c, OwnerId,  Owner.LastName, Owner.FirstName, COUNT(Id) accountCount 
//         FROM Account 
//         WHERE MainBoutique__c IN :listStores  
//         GROUP BY MainBoutique__c, OwnerId , Owner.LastName, Owner.FirstName];
//     }
    
    
//     @AuraEnabled(cacheable=true)
//     public static List<Account> getAccounts(List<String> listOwners){
//         return [SELECT Name, Id, Segment__c, MainBoutique__r.Name, Owner.Name,Owner.Id, MainBoutique__c, MainBoutique__r.ISO_code__r.Id, MainBoutique__r.ISO_code__r.Name
//         FROM Account
//         WHERE Owner.Id  IN :listOwners];
//     }
    
    
    
//     @AuraEnabled
//     public static string ReallocClients(List<String> listOfAccountsSelected, Id newOwnerId, String newOwnerMainBoutique){
//         System.debug('listOfAccountsSelected =' + listOfAccountsSelected +' newOwner = ' + newOwnerId + ' newOwnerMainBoutique = ' + newOwnerMainBoutique);
//         try {
//             List<Account> listToUpdate= new List<Account>();
//             for(String accunt: listOfAccountsSelected){
//                 Account updateAccount = new Account() ;
//                 updateAccount.Id = accunt;
//                 updateAccount.OwnerId = newOwnerId;
//                 updateAccount.MainBoutique__c = newOwnerMainBoutique;
//                 listToUpdate.add(updateAccount);
//             }
//             update listToUpdate;                       
//             return 'reallocation successful';
//         }           
//         catch (Exception e) {
//             throw new AuraHandledException(e.getMessage());
//         }
//     }
// }
// List <Account> listOfAccountsData = [SELECT Id, OwnerId, MainBoutique__c
//                                      FROM Account
//                                      WHERE Id IN :listOfAccountsIds
//   
// List<User> newMainUser = [SELECT Id, Store_Code__c FROM User WHERE Id = :newOwner  ];
// User newMainUser =new User();
// newMainUser.Id ='005Qy0000016r0ZIAQ';
// newMainUser.Store_Code__c = 'F46223A4';

// @AuraEnabled(cacheable=true)
// public static List<AggregateResult> getNewOwners(List<String> listStores){
    //     return [SELECT MainBoutique__c, OwnerId, Owner.LastName, Owner.FirstName, COUNT(Id) acountCount 
    //     FROM Account 
    //     WHERE MainBoutique__c IN :listStores  
    //     GROUP BY MainBoutique__c, OwnerId , Owner.LastName, Owner.FirstName];
    // }

        
    
    //     @AuraEnabled(cacheable=true)
    //     public static List<CountryStoresWrapper> getCountriesWithStores(List<String> listCountry) {
            
    //         System.debug('listCountry' + listCountry);
    //         // Query all stores with their related country information
    //         List<Store__c> stores = [SELECT Name,Id, ISO_code__c,ISO_code__r.Name FROM Store__c
    //                                 WHERE Id != null AND ISO_code__c IN :listCountry
    //                                 ORDER BY Name];
    //         System.debug('stores' + stores);
    //         // Map to hold countries and their stores
    //         Map<Id, CountryStoresWrapper> countryMap = new Map<Id, CountryStoresWrapper>();
    
    //         // Iterate over the stores and group them by country
    //         for (Store__c store : stores) {
    //             Id countryId = store.ISO_code__c;
    //             String countryName = store.ISO_code__r.Name;
                
    //             // Check if the country is already in the map
    //             if (!countryMap.containsKey(countryId)) {
    //                 countryMap.put(countryId, new CountryStoresWrapper(new LabelValueWrapper(countryName, countryId), new List<LabelValueWrapper>()));
    //             }
    
    //             // Add the store to the country's store list
    //             countryMap.get(countryId).stores.add(new LabelValueWrapper(store.Name, store.Id));
    //         }
    //         System.debug('countryMap.values()' + countryMap.values());
    //         // Return the values of the map as a list
    //         return countryMap.values();
    //     }
    
    //     // Inner class for country and its stores
    // public class CountryStoresWrapper {
    //     @AuraEnabled public LabelValueWrapper country { get; set; }
    //     @AuraEnabled public List<LabelValueWrapper> stores { get; set; }

    //     public CountryStoresWrapper(LabelValueWrapper country, List<LabelValueWrapper> stores) {
    //         this.country = country;
    //         this.stores = stores;
    //     }
    // }

    // // Inner class for label-value pair
    // public class LabelValueWrapper {
    //     @AuraEnabled public String label { get; set; }
    //     @AuraEnabled public Id value { get; set; }

    //     public LabelValueWrapper(String label, Id value) {
    //         this.label = label;
    //         this.value = value;
    //     }
    // }
    
    
    // @AuraEnabled(cacheable=true)
    // public static List<AggregateResult> getStores(List<String> listCountry){
    //     return[SELECT MainBoutique__r.Name , MainBoutique__r.ISO_code__c,  MainBoutique__c
    //     FROM Account 
    //     WHERE MainBoutique__c != null AND MainBoutique__r.ISO_code__c IN :listCountry
    //     GROUP BY MainBoutique__c, MainBoutique__r.Name, MainBoutique__r.ISO_code__c
    //     ORDER BY MainBoutique__r.Name
    //     ];
    // }