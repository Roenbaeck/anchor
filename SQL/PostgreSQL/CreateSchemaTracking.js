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
CREATE TABLE IF NOT EXISTS $schema.metadata.encapsulation._Schema 
( version int $schema.metadata.identityProperty primary key
, activation $schema.metadata.chronon not null
, schema jsonb not null
)
;

-- Insert the JSON schema (as of now)
INSERT INTO $schema.metadata.encapsulation._Schema 
( activation
, schema
)
SELECT current_timestamp
	 , '$jsonSchema'
;

-- Schema expanded view -----------------------------------------------------------------------------------------------
-- A view of the schema table that expands the XML attributes into columns
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $schema.metadata.encapsulation._Schema_Expanded 
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
  FROM _Schema
;

-- Anchor view --------------------------------------------------------------------------------------------------------
-- The anchor view shows information about all the anchors in a schema
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $schema.metadata.encapsulation._Anchor
AS
SELECT s.version
     , s.activation
	 , a.key || '_' || v.descriptor as name
	 , v.descriptor	
     , a.key as mnemonic	  
     , v.metadata ->> 'capsule' as capsule
     , v.identity
     , v.metadata ->> 'generator' as generator
     , coalesce(cardinality(v.attributes),0) as numberOfAttributes
  FROM _schema as s
     , jsonb_each(s.schema -> 'schema' -> 'anchor') as a
	 , jsonb_to_record(a.value) as v(descriptor text, identity text, "dataRange" text, metadata jsonb, attributes text[])
;	 

-- Knot view ----------------------------------------------------------------------------------------------------------
-- The knot view shows information about all the knots in a schema
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $schema.metadata.encapsulation._Knot
AS
SELECT s.version
     , s.activation
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
  FROM $schema.metadata.encapsulation._schema as s
     , jsonb_each(s.schema -> 'schema' -> 'knot') as k
     , jsonb_to_record(k.value) as v(descriptor text, identity text, "dataRange" text, description text, metadata jsonb)
;

-- Attribute view -----------------------------------------------------------------------------------------------------
-- The attribute view shows information about all the attributes in a schema
-----------------------------------------------------------------------------------------------------------------------
DROP VIEW IF EXISTS _Attribute;

CREATE VIEW $schema.metadata.encapsulation._Attribute
AS
SELECT s.version
     , s.activation
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
  FROM $schema.metadata.encapsulation._schema as s
     , jsonb_each(s.schema -> 'schema' -> 'anchor') as a
     , jsonb_each(a.value -> 'attribute') as t
     , jsonb_to_record(t.value) as v(descriptor text, identity text, "dataRange" text, "knotRange" text, "timeRange" text, description text, metadata jsonb, keys text[])   
;

-- Tie view -----------------------------------------------------------------------------------------------------------
-- The tie view shows information about all the ties in a schema
-----------------------------------------------------------------------------------------------------------------------
DROP VIEW IF EXISTS _Tie;

CREATE VIEW $schema.metadata.encapsulation._Tie
AS
SELECT s.version
     , s.activation
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
  FROM $schema.metadata.encapsulation._schema as s
     , jsonb_each(s.schema -> 'schema' -> 'tie') as t
     , jsonb_to_record(t.value) as v("timeRange" text, roles text[], metadata jsonb, "anchorRole" jsonb, "knotRole" jsonb)

-- Evolution function -------------------------------------------------------------------------------------------------
-- The evolution function shows what the schema looked like at the given
-- point in time with additional information about missing or added
-- modeling components since that time.
--
-- @timepoint   The point in time to which you would like to travel.
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$schema.metadata.encapsulation$._Evolution', 'IF') IS NOT NULL
DROP FUNCTION [$schema.metadata.encapsulation].[_Evolution];
GO

CREATE FUNCTION [$schema.metadata.encapsulation].[_Evolution] (
    @timepoint AS DATETIME2(7)
)
RETURNS TABLE
RETURN
SELECT
   V.[version],
   ISNULL(S.[name], T.[name]) AS [name],
   ISNULL(V.[activation], T.[create_date]) AS [activation],
   CASE
      WHEN S.[name] is null THEN
         CASE
            WHEN T.[create_date] > (
               SELECT
                  ISNULL(MAX([activation]), @timepoint)
               FROM
                  [$schema.metadata.encapsulation].[_Schema]
               WHERE
                  [activation] <= @timepoint
            ) THEN 'Future'
            ELSE 'Past'
         END
      WHEN T.[name] is null THEN 'Missing'
      ELSE 'Present'
   END AS Existence
FROM (
   SELECT
      MAX([version]) as [version],
      MAX([activation]) as [activation]
   FROM
      [$schema.metadata.encapsulation].[_Schema]
   WHERE
      [activation] <= @timepoint
) V
JOIN (
   SELECT
      [name],
      [version]
   FROM
      [$schema.metadata.encapsulation].[_Anchor] a
   UNION ALL
   SELECT
      [name],
      [version]
   FROM
      [$schema.metadata.encapsulation].[_Knot] k
   UNION ALL
   SELECT
      [name],
      [version]
   FROM
      [$schema.metadata.encapsulation].[_Attribute] b
   UNION ALL
   SELECT
      [name],
      [version]
   FROM
      [$schema.metadata.encapsulation].[_Tie] t
) S
ON
   S.[version] = V.[version]
FULL OUTER JOIN (
   SELECT
      [name],
      [create_date]
   FROM
      sys.tables
   WHERE
      [type] like '%U%'
   AND
      LEFT([name], 1) <> '_'
) T
ON
   S.[name] = T.[name];
GO
-- Drop Script Generator ----------------------------------------------------------------------------------------------
-- generates a drop script, that must be run separately, dropping everything in an Anchor Modeled database
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$schema.metadata.encapsulation$._GenerateDropScript', 'P') IS NOT NULL
DROP PROCEDURE [$schema.metadata.encapsulation].[_GenerateDropScript];
GO

CREATE PROCEDURE [$schema.metadata.encapsulation]._GenerateDropScript (
   @exclusionPattern varchar(42) = '[_]%', -- exclude Metadata by default
   @inclusionPattern varchar(42) = '%'     -- include everything by default
)
AS
BEGIN
   DECLARE @xml XML;
   WITH objects AS (
      SELECT
         'DROP ' + ft.[type] + ' ' + fn.[name] + '; -- ' + fn.[description] as [statement],
         row_number() OVER (
            ORDER BY
               -- restatement finders last
               CASE dc.[description]
                  WHEN 'restatement finder' THEN 1
                  ELSE 0
               END ASC,
               -- order based on type
               CASE ft.[type]
                  WHEN 'PROCEDURE' THEN 1
                  WHEN 'FUNCTION' THEN 2
                  WHEN 'VIEW' THEN 3
                  WHEN 'TABLE' THEN 4
                  ELSE 5
               END ASC,
               -- order within type
               CASE dc.[description]
                  WHEN 'key generator' THEN 1
                  WHEN 'latest perspective' THEN 2
                  WHEN 'current perspective' THEN 3
                  WHEN 'difference perspective' THEN 4
                  WHEN 'point-in-time perspective' THEN 5
                  WHEN 'time traveler' THEN 6
                  WHEN 'rewinder' THEN 7
                  WHEN 'assembled view' THEN 8
                  WHEN 'annex table' THEN 9
                  WHEN 'posit table' THEN 10
                  WHEN 'table' THEN 11
                  WHEN 'restatement finder' THEN 12
                  ELSE 13
               END,
               -- order within description
               CASE ft.[type]
                  WHEN 'TABLE' THEN
                     CASE cl.[class]
                        WHEN 'Attribute' THEN 1
                        WHEN 'Attribute Annex' THEN 2
                        WHEN 'Attribute Posit' THEN 3
                        WHEN 'Tie' THEN 4
                        WHEN 'Anchor' THEN 5
                        WHEN 'Knot' THEN 6
                        ELSE 7
                     END
                  ELSE
                     CASE cl.[class]
                        WHEN 'Anchor' THEN 1
                        WHEN 'Attribute' THEN 2
                        WHEN 'Attribute Annex' THEN 3
                        WHEN 'Attribute Posit' THEN 4
                        WHEN 'Tie' THEN 5
                        WHEN 'Knot' THEN 6
                        ELSE 7
                     END
               END,
               -- finally alphabetically
               o.[name] ASC
         ) AS [ordinal]
      FROM
         sys.objects o
      JOIN
         sys.schemas s
      ON
         s.[schema_id] = o.[schema_id]
      CROSS APPLY (
         SELECT
            CASE
               WHEN o.[name] LIKE '[_]%'
               COLLATE Latin1_General_BIN THEN 'Metadata'
               WHEN o.[name] LIKE '%[A-Z][A-Z][_][a-z]%[A-Z][A-Z][_][a-z]%'
               COLLATE Latin1_General_BIN THEN 'Tie'
               WHEN o.[name] LIKE '%[A-Z][A-Z][_][A-Z][A-Z][A-Z][_][A-Z]%[_]%'
               COLLATE Latin1_General_BIN THEN 'Attribute'
               WHEN o.[name] LIKE '%[A-Z][A-Z][A-Z][_][A-Z]%'
               COLLATE Latin1_General_BIN THEN 'Knot'
               WHEN o.[name] LIKE '%[A-Z][A-Z][_][A-Z]%'
               COLLATE Latin1_General_BIN THEN 'Anchor'
               ELSE 'Other'
            END
      ) cl ([class])
      CROSS APPLY (
         SELECT
            CASE o.[type]
               WHEN 'P'  THEN 'PROCEDURE'
               WHEN 'IF' THEN 'FUNCTION'
               WHEN 'FN' THEN 'FUNCTION'
               WHEN 'V'  THEN 'VIEW'
               WHEN 'U'  THEN 'TABLE'
            END
      ) ft ([type])
      CROSS APPLY (
         SELECT
            CASE
               WHEN ft.[type] = 'PROCEDURE' AND cl.[class] = 'Anchor' AND o.[name] LIKE 'k%'
               COLLATE Latin1_General_BIN THEN 'key generator'
               WHEN ft.[type] = 'FUNCTION' AND o.[name] LIKE 't%'
               COLLATE Latin1_General_BIN THEN 'time traveler'
               WHEN ft.[type] = 'FUNCTION' AND o.[name] LIKE 'rf%'
               COLLATE Latin1_General_BIN THEN 'restatement finder'
               WHEN ft.[type] = 'FUNCTION' AND o.[name] LIKE 'r%'
               COLLATE Latin1_General_BIN THEN 'rewinder'
               WHEN ft.[type] = 'VIEW' AND o.[name] LIKE 'l%'
               COLLATE Latin1_General_BIN THEN 'latest perspective'
               WHEN ft.[type] = 'FUNCTION' AND o.[name] LIKE 'p%'
               COLLATE Latin1_General_BIN THEN 'point-in-time perspective'
               WHEN ft.[type] = 'VIEW' AND o.[name] LIKE 'n%'
               COLLATE Latin1_General_BIN THEN 'current perspective'
               WHEN ft.[type] = 'FUNCTION' AND o.[name] LIKE 'd%'
               COLLATE Latin1_General_BIN THEN 'difference perspective'
               WHEN ft.[type] = 'VIEW' AND cl.[class] = 'Attribute'
               COLLATE Latin1_General_BIN THEN 'assembled view'
               WHEN ft.[type] = 'TABLE' AND o.[name] LIKE '%Annex'
               COLLATE Latin1_General_BIN THEN 'annex table'
               WHEN ft.[type] = 'TABLE' AND o.[name] LIKE '%Posit'
               COLLATE Latin1_General_BIN THEN 'posit table'
               WHEN ft.[type] = 'TABLE'
               COLLATE Latin1_General_BIN THEN 'table'
               ELSE 'other'
            END
      ) dc ([description])
      CROSS APPLY (
         SELECT
            s.[name] + '.' + o.[name],
            cl.[class] + ' ' + dc.[description]
      ) fn ([name], [description])
      WHERE
         o.[type] IN ('P', 'IF', 'FN', 'V', 'U')
      AND
         o.[name] NOT LIKE ISNULL(@exclusionPattern, '')
      AND
         o.[name] LIKE ISNULL(@inclusionPattern, '%')
   )
   SELECT @xml = (
       SELECT
          [statement] + CHAR(13) as [text()]
       FROM
          objects
       ORDER BY
          [ordinal]
       FOR XML PATH('')
   );
   SELECT isnull(@xml.value('.', 'varchar(max)'), '');  
END
GO
-- Database Copy Script Generator -------------------------------------------------------------------------------------
-- generates a copy script, that must be run separately, copying all data between two identically modeled databases
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$schema.metadata.encapsulation$._GenerateCopyScript', 'P') IS NOT NULL
DROP PROCEDURE [$schema.metadata.encapsulation].[_GenerateCopyScript];
GO

CREATE PROCEDURE [$schema.metadata.encapsulation]._GenerateCopyScript (
	@source varchar(123),
	@target varchar(123)
)
as 
begin
	declare @R char(1) = CHAR(13);
	-- stores the built SQL code
	declare @sql varchar(max) = 'USE ' + @target + ';' + @R;
	declare @xml xml;

	-- find which version of the schema that is in effect
	declare @version int;
	select 
		@version = max([version]) 
	from
		_Schema;

	-- declare and set other variables we need
	declare @equivalentSuffix varchar(42);
	declare @identitySuffix varchar(42);
	declare @annexSuffix varchar(42);
	declare @positSuffix varchar(42);
	declare @temporalization varchar(42);
	select
		@equivalentSuffix = equivalentSuffix,
		@identitySuffix = identitySuffix,
		@annexSuffix = annexSuffix,
		@positSuffix = positSuffix,
		@temporalization = temporalization
	from
		_Schema_Expanded 
	where
		[version] = @version;

	-- build non-equivalent knot copy
	set @xml = (
		select 
			case
				when [generator] = 'true' then 'SET IDENTITY_INSERT ' + [capsule] + '.' + [name] + ' ON;' + @R 
			end,
			'INSERT INTO ' + [capsule] + '.' + [name] + '(' + [columns] + ')' + @R +
			'SELECT ' + [columns] + ' FROM ' + @source + '.' + [capsule] + '.' + [name] + ';' + @R,
			case
				when [generator] = 'true' then 'SET IDENTITY_INSERT ' + [capsule] + '.' + [name] + ' OFF;' + @R 
			end
		from 
			_Knot x
		cross apply (
			select stuff((
				select 
					', ' + [name]
				from
					sys.columns 
				where
					[object_Id] = object_Id(x.[capsule] + '.' + x.[name])
				and
					is_computed = 0
				for xml path('')
			), 1, 2, '')
		) c ([columns])
		where
			[version] = @version
		and
			isnull(equivalent, 'false') = 'false'
		for xml path('')
	);
	set @sql = @sql + isnull(@xml.value('.', 'varchar(max)'), '');
	
	-- build equivalent knot copy
	set @xml = (
		select 
			case
				when [generator] = 'true' then 'SET IDENTITY_INSERT ' + [capsule] + '.' + [name] + '_' + @identitySuffix + ' ON;' + @R 
			end,
			'INSERT INTO ' + [capsule] + '.' + [name] + '_' + @identitySuffix + '(' + [columns] + ')' + @R +
			'SELECT ' + [columns] + ' FROM ' + @source + '.' + [capsule] + '.' + [name] + '_' + @identitySuffix + ';' + @R,
			case
				when [generator] = 'true' then 'SET IDENTITY_INSERT ' + [capsule] + '.' + [name] + '_' + @identitySuffix + ' OFF;' + @R 
			end,
			'INSERT INTO ' + [capsule] + '.' + [name] + '_' + @equivalentSuffix + '(' + [columns] + ')' + @R +
			'SELECT ' + [columns] + ' FROM ' + @source + '.' + [capsule] + '.' + [name] + '_' + @equivalentSuffix + ';' + @R
		from 
			_Knot x
		cross apply (
			select stuff((
				select 
					', ' + [name]
				from
					sys.columns 
				where
					[object_Id] = object_Id(x.[capsule] + '.' + x.[name])
				and
					is_computed = 0
				for xml path('')
			), 1, 2, '')
		) c ([columns])
		where
			[version] = @version
		and
			isnull(equivalent, 'false') = 'true'
		for xml path('')
	);
	set @sql = @sql + isnull(@xml.value('.', 'varchar(max)'), '');

	-- build anchor copy
	set @xml = (
		select 
			case
				when [generator] = 'true' then 'SET IDENTITY_INSERT ' + [capsule] + '.' + [name] + ' ON;' + @R 
			end,
			'INSERT INTO ' + [capsule] + '.' + [name] + '(' + [columns] + ')' + @R +
			'SELECT ' + [columns] + ' FROM ' + @source + '.' + [capsule] + '.' + [name] + ';' + @R,
			case
				when [generator] = 'true' then 'SET IDENTITY_INSERT ' + [capsule] + '.' + [name] + ' OFF;' + @R 
			end
		from 
			_Anchor x
		cross apply (
			select stuff((
				select 
					', ' + [name]
				from
					sys.columns 
				where
					[object_Id] = object_Id(x.[capsule] + '.' + x.[name])
				and
					is_computed = 0
				for xml path('')
			), 1, 2, '')
		) c ([columns])
		where
			[version] = @version
		for xml path('')
	);
	set @sql = @sql + isnull(@xml.value('.', 'varchar(max)'), '');

	-- build attribute copy
	if (@temporalization = 'crt')
	begin
		set @xml = (
			select 
				case
					when [generator] = 'true' then 'SET IDENTITY_INSERT ' + [capsule] + '.' + [name] + '_' + @positSuffix + ' ON;' + @R 
				end,
				'INSERT INTO ' + [capsule] + '.' + [name] + '_' + @positSuffix + '(' + [positColumns] + ')' + @R +
				'SELECT ' + [positColumns] + ' FROM ' + @source + '.' + [capsule] + '.' + [name] + '_' + @positSuffix + ';' + @R,
				case
					when [generator] = 'true' then 'SET IDENTITY_INSERT ' + [capsule] + '.' + [name] + '_' + @positSuffix + ' OFF;' + @R 
				end,
				'INSERT INTO ' + [capsule] + '.' + [name] + '_' + @annexSuffix + '(' + [annexColumns] + ')' + @R +
				'SELECT ' + [annexColumns] + ' FROM ' + @source + '.' + [capsule] + '.' + [name] + '_' + @annexSuffix + ';' + @R
			from 
				_Attribute x
			cross apply (
				select stuff((
					select 
						', ' + [name]
					from
						sys.columns 
					where
						[object_Id] = object_Id(x.[capsule] + '.' + x.[name] + '_' + @positSuffix)
					and
						is_computed = 0
					for xml path('')
				), 1, 2, '')
			) pc ([positColumns])
			cross apply (
				select stuff((
					select 
						', ' + [name]
					from
						sys.columns 
					where
						[object_Id] = object_Id(x.[capsule] + '.' + x.[name] + '_' + @annexSuffix)
					and
						is_computed = 0
					for xml path('')
				), 1, 2, '')
			) ac ([annexColumns])
			where
				[version] = @version
			for xml path('')
		);
	end
	else -- uni
	begin
		set @xml = (
			select 
				'INSERT INTO ' + [capsule] + '.' + [name] + '(' + [columns] + ')' + @R +
				'SELECT ' + [columns] + ' FROM ' + @source + '.' + [capsule] + '.' + [name] + ';' + @R
			from 
				_Attribute x
			cross apply (
				select stuff((
					select 
						', ' + [name]
					from
						sys.columns 
					where
						[object_Id] = object_Id(x.[capsule] + '.' + x.[name])
					and
						is_computed = 0
					for xml path('')
				), 1, 2, '')
			) c ([columns])
			where
				[version] = @version
			for xml path('')
		);
	end
	set @sql = @sql + isnull(@xml.value('.', 'varchar(max)'), '');

	-- build tie copy
	if (@temporalization = 'crt')
	begin
		set @xml = (
			select 
				case
					when [generator] = 'true' then 'SET IDENTITY_INSERT ' + [capsule] + '.' + [name] + '_' + @positSuffix + ' ON;' + @R 
				end,
				'INSERT INTO ' + [capsule] + '.' + [name] + '_' + @positSuffix + '(' + [positColumns] + ')' + @R +
				'SELECT ' + [positColumns] + ' FROM ' + @source + '.' + [capsule] + '.' + [name] + '_' + @positSuffix + ';' + @R,
				case
					when [generator] = 'true' then 'SET IDENTITY_INSERT ' + [capsule] + '.' + [name] + '_' + @positSuffix + ' OFF;' + @R 
				end,
				'INSERT INTO ' + [capsule] + '.' + [name] + '_' + @annexSuffix + '(' + [annexColumns] + ')' + @R +
				'SELECT ' + [annexColumns] + ' FROM ' + @source + '.' + [capsule] + '.' + [name] + '_' + @annexSuffix + ';' + @R
			from 
				_Tie x
			cross apply (
				select stuff((
					select 
						', ' + [name]
					from
						sys.columns 
					where
						[object_Id] = object_Id(x.[capsule] + '.' + x.[name] + '_' + @positSuffix)
					and
						is_computed = 0
					for xml path('')
				), 1, 2, '')
			) pc ([positColumns])
			cross apply (
				select stuff((
					select 
						', ' + [name]
					from
						sys.columns 
					where
						[object_Id] = object_Id(x.[capsule] + '.' + x.[name] + '_' + @annexSuffix)
					and
						is_computed = 0
					for xml path('')
				), 1, 2, '')
			) ac ([annexColumns])
			where
				[version] = @version
			for xml path('')
		);
	end
	else -- uni
	begin
		set @xml = (
			select 
				'INSERT INTO ' + [capsule] + '.' + [name] + '(' + [columns] + ')' + @R +
				'SELECT ' + [columns] + ' FROM ' + @source + '.' + [capsule] + '.' + [name] + ';' + @R
			from 
				_Tie x
			cross apply (
				select stuff((
					select 
						', ' + [name]
					from
						sys.columns 
					where
						[object_Id] = object_Id(x.[capsule] + '.' + x.[name])
					and
						is_computed = 0
					for xml path('')
				), 1, 2, '')
			) c ([columns])
			where
				[version] = @version
			for xml path('')
		);
	end
	set @sql = @sql + isnull(@xml.value('.', 'varchar(max)'), '');

	select @sql;
end
~*/
}