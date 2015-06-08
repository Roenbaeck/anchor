// custom function to determine valid PostgreSQL identity types
schema.setIdentityGenerator = function(entity) {
    if (entity == undefined || entity == null) {
        return false;
    }
    
    if (entity.identity == undefined || entity.identity == null) {
        return false;
    }
    
    switch (entity.identity) {
        case 'smallint': entity.identityGenerator = 'smallserial'; break;
        case 'bigint': entity.identityGenerator = 'bigserial'; break;
        default: entity.identityGenerator = 'serial'; break;
    }
    
    return true;
};