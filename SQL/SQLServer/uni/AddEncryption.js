// adds enryption section
var anchor, attribute, encryptionGroup;
var encryptionExists = false;
var encryptionGroups = {};
while(anchor = schema.nextAnchor()) {
    while(attribute = anchor.nextAttribute()) {
        if(encryptionGroup = attribute.getEncryptionGroup()) {
        	if(!encryptionGroups[encryptionGroup]) {
        		encryptionGroups[encryptionGroup] = [];
        	}
            encryptionGroups[encryptionGroup].push(attribute);
            encryptionExists = true;
        }
    }
}
if(encryptionExists) {
/*~
-- ENCRYPTION GROUPS  -------------------------------------------------------------------------------------------------
--
-- Certificates are created for the encryption groups defined in the metadata.
-- Please note that the "master" password is not stored anywhere after this script
-- has been run. In other words, YOU NEED TO KEEP TRACK OF THIS ELSEWHERE!
--
~*/	
	var password = prompt("Please enter a strong password for the master key. Note that you will need to keep this in some safe place for later use, since it is not stored in the model metadata.", "<TYPE STRONG PASSWORD HERE>");
  	if (password != null) {
/*~
-- MASTER KEY ---------------------------------------------------------------------------------------------------------
-- The master key used to create certificates and other keys (should not be stored)
-----------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.symmetric_keys WHERE [name] = '##MS_DatabaseMasterKey##')
BEGIN
    CREATE MASTER KEY ENCRYPTION BY PASSWORD = '$password';
END
GO
~*/	
	}
	for(encryptionGroup in encryptionGroups) {
/*~ 
-- GROUP CERTIFICATE --------------------------------------------------------------------------------------------------
-- An encryption certificate used by the "$encryptionGroup" group
-----------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.certificates WHERE [name] = '$encryptionGroup')
BEGIN
    CREATE CERTIFICATE [$encryptionGroup] WITH SUBJECT = '$encryptionGroup';
END
-- GROUP KEY ----------------------------------------------------------------------------------------------------------
-- An encryption key used to encrypt the data in the attributes: 
~*/
		while(attribute = encryptionGroups[encryptionGroup].pop()) {
/*~
--	$attribute.name
~*/		
		}
/*~
-----------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.symmetric_keys WHERE [name] = '$encryptionGroup')
BEGIN
    CREATE SYMMETRIC KEY [$encryptionGroup]
    WITH ALGORITHM = AES_256,  
    IDENTITY_VALUE = '$encryptionGroup'
    ENCRYPTION BY CERTIFICATE [$encryptionGroup];
END
~*/
	}
}
