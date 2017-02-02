// TODO -self referencing keys!
// recursive extension of key paths!
/*~
-- KEY paths
~*/	
var anchor, key, attribute, tie, role;
schema.keys = [];
schema.keyPath = {}
while (anchor = schema.nextAnchor()) {
/*~
-- ANCHOR $anchor.name
~*/	
	while (key = anchor.nextKey()) {
/*~
-- -- ANCHOR KEY $key.descriptor  
~*/	
		var anchorKey = {};
		anchorKey.id = anchor.mnemonic + '_' + key.mnemonic;
		anchorKey.mnemonic = key.mnemonic;
		anchorKey.descriptor = key.descriptor;
		anchorKey.anchorMnemonic = anchor.mnemonic;
		anchorKey.anchorName = anchor.name;
		anchorKey.attributePath = {};
		schema.keyPath[anchorKey.id] = anchorKey;
		schema.keys.push(anchorKey.id);
		var test = JSON.stringify(schema.keyPath);
	}
	while (attribute = anchor.nextAttribute()) {
/*~
-- -- -- ATTRIBUTE $attribute.name
~*/			
        while(role = attribute.nextKeyRole()){
            var test = schema.keyPath[role.id].descriptor;
/*~
-- -- -- -- KEY ROLE $role.identifier in $test 
~*/		        	
        	var path = [];
        	path.push(anchor.id);
        	path.push(attribute.name);
        	schema.keyPath[role.id].attributePath[role.identifier] = path;
		}
	}
}
// check the TIES for key roles
while(tie = schema.nextTie()){
	var test = JSON.stringify(tie);
/*~
-- TIE $tie.name
~*/
    while(role = tie.nextKeyRole()){
    	var test = schema.keyPath[role.id].descriptor;
/*~
-- -- KEY ROLE $role.identifier in $test
~*/ 
    	var test = schema.keyPath[role.id].descriptor
    	var path = [];
    	path.push(role.type);
    	// find the anchor role with the same type
    	// it has the same path as the key on the anchor
    	// and is the starting point the path
        var anchorRole
        var pathKey = 0;
    	while(anchorRole = tie.nextRole()){
/*~
-- -- -- ANCHOR ROLE check $anchorRole.id 
~*/     		
    		if (role.type === anchorRole.type) {
/*~
-- -- -- start from -> ANCHOR ROLE  $anchorRole.id 
~*/    			
    			path.push(anchorRole.columnName);
    			//break; // there can only be one!
    		}
    	}
    	path.push(tie.name);
    	while(anchorRole = tie.nextRole()){
    		var subPath = []
/*~
-- -- -- ANCHOR ROLE check $anchorRole.id 
~*/      		
    		if (role.type !== anchorRole.type) {
/*~
-- -- -- next from -> ANCHOR ROLE  $anchorRole.id 
~*/      			
    			subPath.push(anchorRole.columnName);
    			subPath.push(anchorRole.type);
    			schema.keyPath[role.id].attributePath[role.identifier + '.' + pathKey] = path.concat(subPath);
    			pathKey++;
    		}
    	}
    	
    }		
}


/*~
-- Print key path 
~*/	
 
var schemaKeyPath = JSON.stringify(schema.keyPath);
/*~
$schemaKeyPath
~*/	     
