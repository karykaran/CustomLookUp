public without sharing class LookupLWCController {
    @AuraEnabled(cacheable=true)
    public static List<Object> searchRecords(String searchKey, String objectApiName,List<Id> selectedIds ,Map<String,List<String>> filters){
        
            String key ='%'+ searchKey + '%';
            String query = 'SELECT Id,Name FROM '+ objectApiName+' WHERE Name LIKE :key AND Id NOT IN :selectedIds';
            if(filters != null){
                for(String filterName :filters.keySet()){
                    SObjectType r = ((SObject)(Type.forName('Schema.'+objectApiName).newInstance())).getSObjectType();
                    DescribeSObjectResult d = r.getDescribe();
                    if(d.fields.getMap().get(filterName).getDescribe().getType() ==  Schema.DisplayType.BOOLEAN){
                        query+=' AND '+ filterName+ ' IN ('+ String.join(filters.get(filterName), '\',\'') + ')';
                    }else{
                        query+=' AND '+ filterName+ ' IN (\''+ String.join(filters.get(filterName), '\',\'') + '\')';
                    }
                }
            }
            query +=' LIMIT 10';
            return Database.query(query);
    }

    public class LookupWrapper{
        @AuraEnabled public ID Id;
        @AuraEnabled public String Name;
        public LookupWrapper(User u){
            this.Id = u.ContactId;
            this.Name = u.Contact.Name;
        }
    }
}
