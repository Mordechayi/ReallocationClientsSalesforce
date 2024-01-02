public with sharing class MultiSelectComboBoxController {
    @AuraEnabled(cacheable=true)
    public static List<String> getOptions() {
        String query = 'SELECT Id name FROM account LIMIT 20';
        List<AggregateResult> results = Database.query(query);

        List<String> options = new List<String>();
        for (AggregateResult result : results) {
            if (result.get('Industry') != null) {
                options.add(String.valueOf(result.get('Industry')));
            }
        }

        return options;
    }
}
