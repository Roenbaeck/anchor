if(schema.serialization) {
// get the JSON variant of the XML	
    var jsonSchema = Actions.jsonify(Model.toXML(false));
/*~
-- SCHEMA EVOLUTION ---------------------------------------------------------------------------------------------------
--
-- The following tables, views, and functions are used to track schema changes
-- over time, as well as providing every XML that has been 'executed' against
-- the database.
--
-- Schema table -------------------------------------------------------------------------------------------------------
-- The schema table holds every xml that has been executed against the database
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $schema.metadata.encapsulation\._Schema 
     ( version int $schema.metadata.identityProperty primary key
     , activation $schema.metadata.chronon not null
     , schema jsonb not null
     )
;

-- Insert the JSON schema (as of now)
INSERT INTO $schema.metadata.encapsulation\._Schema 
     ( activation
     , schema
     )
SELECT current_timestamp
     , '$jsonSchema'
;

-- Schema expanded view -----------------------------------------------------------------------------------------------
-- A view of the schema table that expands the XML attributes into columns
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $schema.metadata.encapsulation\._Schema_Expanded 
AS
SELECT version
     , activation
     , (schema -> 'schema' ->> 'format') as format
     , (schema -> 'schema' ->> 'date')::date as date
     , (schema -> 'schema' ->> 'time')::time as time
     , (schema -> 'schema' -> 'metadata' ->> 'temporalization') as temporalization
     , (schema -> 'schema' -> 'metadata' ->> 'databaseTarget') as databaseTarget	 
     , (schema -> 'schema' -> 'metadata' ->> 'changingRange') as changingRange
     , (schema -> 'schema' -> 'metadata' ->> 'encapsulation') as encapsulation
     , (schema -> 'schema' -> 'metadata' ->> 'identity') as identity
     , (schema -> 'schema' -> 'metadata' ->> 'metadataPrefix') as metadataPrefix
     , (schema -> 'schema' -> 'metadata' ->> 'metadataType') as metadataType
     , (schema -> 'schema' -> 'metadata' ->> 'metadataUsage') as metadataUsage	 
     , (schema -> 'schema' -> 'metadata' ->> 'changingSuffix') as changingSuffix
     , (schema -> 'schema' -> 'metadata' ->> 'identitySuffix') as identitySuffix
     , (schema -> 'schema' -> 'metadata' ->> 'positIdentity') as positIdentity
     , (schema -> 'schema' -> 'metadata' ->> 'positGenerator') as positGenerator	 
     , (schema -> 'schema' -> 'metadata' ->> 'positingRange') as positingRange
     , (schema -> 'schema' -> 'metadata' ->> 'positingSuffix') as positingSuffix	 
     , (schema -> 'schema' -> 'metadata' ->> 'positorRange') as positorRange
     , (schema -> 'schema' -> 'metadata' ->> 'positorSuffix') as positorSuffix
     , (schema -> 'schema' -> 'metadata' ->> 'reliabilityRange') as reliabilityRange
     , (schema -> 'schema' -> 'metadata' ->> 'reliabilitySuffix') as reliabilitySuffix
     , (schema -> 'schema' -> 'metadata' ->> 'reliableCutoff') as reliableCutoff
     , (schema -> 'schema' -> 'metadata' ->> 'deleteReliability') as deleteReliability	 
     , (schema -> 'schema' -> 'metadata' ->> 'reliableSuffix') as reliableSuffix
     , (schema -> 'schema' -> 'metadata' ->> 'partitioning') as partitioning
     , (schema -> 'schema' -> 'metadata' ->> 'entityIntegrity') as entityIntegrity
     , (schema -> 'schema' -> 'metadata' ->> 'restatability') as restatability
     , (schema -> 'schema' -> 'metadata' ->> 'idempotency') as idempotency
     , (schema -> 'schema' -> 'metadata' ->> 'assertiveness') as assertiveness	 
     , (schema -> 'schema' -> 'metadata' ->> 'naming') as naming
     , (schema -> 'schema' -> 'metadata' ->> 'positSuffix') as positSuffix	 
     , (schema -> 'schema' -> 'metadata' ->> 'annexSuffix') as annexSuffix
     , (schema -> 'schema' -> 'metadata' ->> 'chronon') as chronon
     , (schema -> 'schema' -> 'metadata' ->> 'now') as now
     , (schema -> 'schema' -> 'metadata' ->> 'dummySuffix') as dummySuffix
     , (schema -> 'schema' -> 'metadata' ->> 'statementTypeSuffix') as statementTypeSuffix
     , (schema -> 'schema' -> 'metadata' ->> 'checksumSuffix') as checksumSuffix	 
     , (schema -> 'schema' -> 'metadata' ->> 'businessViews') as businessViews
     , (schema -> 'schema' -> 'metadata' ->> 'equivalence') as equivalence
     , (schema -> 'schema' -> 'metadata' ->> 'equivalentSuffix') as equivalentSuffix
     , (schema -> 'schema' -> 'metadata' ->> 'equivalentRange') as equivalentRange	 
  FROM $schema.metadata.encapsulation\._Schema
;

-- Anchor view --------------------------------------------------------------------------------------------------------
-- The anchor view shows information about all the anchors in a schema
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $schema.metadata.encapsulation\._Anchor
AS
SELECT s.version
     , s.activation
     , s.schema -> 'schema' -> 'metadata' ->> 'temporalization' as temporalization	 
     , a.key || '_' || v.descriptor as name
     , v.descriptor	
     , a.key as mnemonic	  
     , v.metadata ->> 'capsule' as capsule
     , v.identity
     , v.metadata ->> 'generator' as generator
     , coalesce(cardinality(v.attributes),0) as numberOfAttributes
  FROM $schema.metadata.encapsulation\._schema as s
     , jsonb_each(s.schema -> 'schema' -> 'anchor') as a
     , jsonb_to_record(a.value) as v(descriptor text, identity text, "dataRange" text, metadata jsonb, attributes text[])
;	 

-- Knot view ----------------------------------------------------------------------------------------------------------
-- The knot view shows information about all the knots in a schema
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $schema.metadata.encapsulation\._Knot
AS
SELECT s.version
     , s.activation
     , s.schema -> 'schema' -> 'metadata' ->> 'temporalization' as temporalization	 
     , k.key || '_' || v.descriptor as name	 
     , v.descriptor
     , k.key as mnemonic	 
     , v.metadata ->> 'capsule' as capsule
     , v."dataRange" as datarange	 
     , v.identity
     , v.metadata ->> 'generator' as generator
     , coalesce(v.metadata ->> 'checksum','false') as checksum
     , v.description	 
     , coalesce(v.metadata ->> 'equivalent','false') as equivalent
  FROM $schema.metadata.encapsulation\._schema as s
     , jsonb_each(s.schema -> 'schema' -> 'knot') as k
     , jsonb_to_record(k.value) as v(descriptor text, identity text, "dataRange" text, description text, metadata jsonb)
;

-- Attribute view -----------------------------------------------------------------------------------------------------
-- The attribute view shows information about all the attributes in a schema
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $schema.metadata.encapsulation\._Attribute
AS
SELECT s.version
     , s.activation
     , s.schema -> 'schema' -> 'metadata' ->> 'temporalization' as temporalization	 
     , a.key || '_' || t.key || '_' || (a.value ->> 'descriptor') || '_' || v.descriptor as name
     , v.descriptor 
     , t.key as mnemonic     
     , v.metadata ->> 'capsule' as capsule
     , v."dataRange" as dataRange
     , case when v."knotRange" is null then false else true end as knotted
     , v."knotRange" as knotRange
     , case when v."timeRange" is null then false else true end as historized    
     , v."timeRange" as timeRange 
     , v.metadata ->> 'generator' as generator 
     , v.metadata ->> 'assertive' as assertive     
     , v.metadata ->> 'privacy' as privacy
     , coalesce(v.metadata ->> 'checksum','false') as checksum     
     , coalesce(v.metadata ->> 'equivalent','false') as equivalent
     , v.metadata ->> 'restatable' as restatable 
     , v.metadata ->> 'idempotent' as idempotent       
     , a.key as anchorMnemonic
     , (a.value ->> 'descriptor') as anchorDescriptor
     , (a.value ->> 'identity') as anchorIdentity
     , v.metadata ->> 'deletable' as deletable
     , v.metadata ->> 'encryptionGroup' as encryptionGroup
     , v.description
     , coalesce(cardinality(v.keys),0) as numberKeyOfStops
  FROM $schema.metadata.encapsulation\._schema as s
     , jsonb_each(s.schema -> 'schema' -> 'anchor') as a
     , jsonb_each(a.value -> 'attribute') as t
     , jsonb_to_record(t.value) as v(descriptor text, identity text, "dataRange" text, "knotRange" text, "timeRange" text, description text, metadata jsonb, keys text[])   
;

-- Tie view -----------------------------------------------------------------------------------------------------------
-- The tie view shows information about all the ties in a schema
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $schema.metadata.encapsulation\._Tie
AS
SELECT s.version
     , s.activation
     , s.schema -> 'schema' -> 'metadata' ->> 'temporalization' as temporalization	 
     , t.key as name
     , v.metadata ->> 'capsule' as capsule	 
     , case when v."timeRange" is null then false else true end as historized   	 
     , v."timeRange" as timeRange
     , cardinality(roles) as numberOfRoles
     , array(select value ->> 'role' from jsonb_each(v."anchorRole")) || array(select value ->> 'role' from jsonb_each(v."knotRole")) as roles
     , cardinality(array(select jsonb_object_keys(v."anchorRole"))) as numberOfAnchors
     , array(select split_part(jsonb_object_keys(v."anchorRole"),'_',1)) as anchors
     , coalesce(cardinality(array(select jsonb_object_keys(v."knotRole")))) as numberOfKnots
     , array(select split_part(jsonb_object_keys(v."knotRole"),'_',1)) as knots	
     --, v."anchorRole"
     , cardinality(array(select value ->> 'identifier' from jsonb_each(v."anchorRole") where value ->> 'identifier' = 'true') || array(select value ->> 'identifier' from jsonb_each(v."knotRole") where value ->> 'identifier' = 'true')) as identifiers
     , v.metadata ->> 'generator' as generator 
     , v.metadata ->> 'assertive' as assertive     
     , v.metadata ->> 'restatable' as restatable 
     , v.metadata ->> 'idempotent' as idempotent   
  FROM $schema.metadata.encapsulation\._schema as s
     , jsonb_each(s.schema -> 'schema' -> 'tie') as t
     , jsonb_to_record(t.value) as v("timeRange" text, roles text[], metadata jsonb, "anchorRole" jsonb, "knotRole" jsonb)
;

~*/
}