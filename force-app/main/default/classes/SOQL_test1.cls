public class SOQL_test1 {
    
    public static void soql1(){
		List<account> accList = [SELECT Id, Name from account];
		Double i = 0;
		for(account acc: accList){
    		i++;
    		System.debug('            acount num            '+ i + ' = ' + acc);
		}
    }
    public static void soql2(){
		 Double i = 0;
		for(account acc: [SELECT Id, Name, Owner.FirstName, MainBoutique__c from account]){
    		i++;
    		System.debug('  acount num  '+ i + ' = ' + acc);
		}
    }
    
}