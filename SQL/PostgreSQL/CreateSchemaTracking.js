if(schema.serialization) {
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
CREATE TABLE IF NOT EXISTS _Schema (
    version serial not null primary key,
    activation $schema.metadata.chronon not null,
    schema xml not null
);
   
-- Insert the XML schema (as of now)
INSERT INTO _Schema (
   activation,
   schema
)
SELECT
   LOCALTIMESTAMP,
   '$schema.serialization._serialization';

-- Schema expanded view -----------------------------------------------------------------------------------------------
-- A view of the schema table that expands the XML attributes into columns
-----------------------------------------------------------------------------------------------------------------------
DROP VIEW IF EXISTS _Schema_Expanded;

CREATE OR REPLACE VIEW _Schema_Expanded AS
SELECT
	version,
	activation,
	schema,
	(xpath('/schema[1]/@format[1]', schema))[1]::text as format,
	(xpath('/schema[1]/@date[1]', schema))[1]::text as date,
	(xpath('/schema[1]/@time[1]', schema))[1]::text as time,
	(xpath('/schema[1]/metadata[1]/@temporalization[1]', schema))[1]::text as temporalization,
	(xpath('/schema[1]/metadata[1]/@databaseTarget[1]', schema))[1]::text as databaseTarget,
	(xpath('/schema[1]/metadata[1]/@changingRange[1]', schema))[1]::text as changingRange,
	(xpath('/schema[1]/metadata[1]/@encapsulation[1]', schema))[1]::text as encapsulation,
	(xpath('/schema[1]/metadata[1]/@identity[1]', schema))[1]::text as identity,
	(xpath('/schema[1]/metadata[1]/@metadataPrefix[1]', schema))[1]::text as metadataPrefix,
	(xpath('/schema[1]/metadata[1]/@metadataType[1]', schema))[1]::text as metadataType,
	(xpath('/schema[1]/metadata[1]/@metadataUsage[1]', schema))[1]::text as metadataUsage,
	(xpath('/schema[1]/metadata[1]/@changingSuffix[1]', schema))[1]::text as changingSuffix,
	(xpath('/schema[1]/metadata[1]/@identitySuffix[1]', schema))[1]::text as identitySuffix,
	(xpath('/schema[1]/metadata[1]/@positIdentity[1]', schema))[1]::text as positIdentity,
	(xpath('/schema[1]/metadata[1]/@positGenerator[1]', schema))[1]::text as positGenerator,
	(xpath('/schema[1]/metadata[1]/@positingRange[1]', schema))[1]::text as positingRange,
	(xpath('/schema[1]/metadata[1]/@positingSuffix[1]', schema))[1]::text as positingSuffix,
	(xpath('/schema[1]/metadata[1]/@positorRange[1]', schema))[1]::text as positorRange,
	(xpath('/schema[1]/metadata[1]/@positorSuffix[1]', schema))[1]::text as positorSuffix,
	(xpath('/schema[1]/metadata[1]/@reliabilityRange[1]', schema))[1]::text as reliabilityRange,
	(xpath('/schema[1]/metadata[1]/@reliabilitySuffix[1]', schema))[1]::text as reliabilitySuffix,
	(xpath('/schema[1]/metadata[1]/@reliableCutoff[1]', schema))[1]::text as reliableCutoff,
	(xpath('/schema[1]/metadata[1]/@deleteReliability[1]', schema))[1]::text as deleteReliability,
	(xpath('/schema[1]/metadata[1]/@reliableSuffix[1]', schema))[1]::text as reliableSuffix,
	(xpath('/schema[1]/metadata[1]/@partitioning[1]', schema))[1]::text as partitioning,
	(xpath('/schema[1]/metadata[1]/@entityIntegrity[1]', schema))[1]::text as entityIntegrity,
	(xpath('/schema[1]/metadata[1]/@restatability[1]', schema))[1]::text as restatability,
	(xpath('/schema[1]/metadata[1]/@idempotency[1]', schema))[1]::text as idempotency,
	(xpath('/schema[1]/metadata[1]/@assertiveness[1]', schema))[1]::text as assertiveness,
	(xpath('/schema[1]/metadata[1]/@naming[1]', schema))[1]::text as naming,
	(xpath('/schema[1]/metadata[1]/@positSuffix[1]', schema))[1]::text as positSuffix,
	(xpath('/schema[1]/metadata[1]/@annexSuffix[1]', schema))[1]::text as annexSuffix,
	(xpath('/schema[1]/metadata[1]/@chronon[1]', schema))[1]::text as chronon,
	(xpath('/schema[1]/metadata[1]/@now[1]', schema))[1]::text as now,
	(xpath('/schema[1]/metadata[1]/@dummySuffix[1]', schema))[1]::text as dummySuffix,
	(xpath('/schema[1]/metadata[1]/@statementTypeSuffix[1]', schema))[1]::text as statementTypeSuffix,
	(xpath('/schema[1]/metadata[1]/@checksumSuffix[1]', schema))[1]::text as checksumSuffix,
	(xpath('/schema[1]/metadata[1]/@businessViews[1]', schema))[1]::text as businessViews,
	(xpath('/schema[1]/metadata[1]/@equivalence[1]', schema))[1]::text as equivalence,
	(xpath('/schema[1]/metadata[1]/@equivalentSuffix[1]', schema))[1]::text as equivalentSuffix,
	(xpath('/schema[1]/metadata[1]/@equivalentRange[1]', schema))[1]::text as equivalentRange
FROM 
	_Schema;

-- Anchor view --------------------------------------------------------------------------------------------------------
-- The anchor view shows information about all the anchors in a schema
-----------------------------------------------------------------------------------------------------------------------
DROP VIEW IF EXISTS _Anchor;

CREATE VIEW [$schema.metadata.encapsulation].[_Anchor]
AS
SELECT
   S.version,
   S.activation,
   Nodeset.anchor.value('concat(@mnemonic, ""_"", @descriptor)', 'nvarchar(max)') as [name],
   Nodeset.anchor.value('metadata[1]/@capsule', 'nvarchar(max)') as [capsule],
   Nodeset.anchor.value('@mnemonic', 'nvarchar(max)') as [mnemonic],
   Nodeset.anchor.value('@descriptor', 'nvarchar(max)') as [descriptor],
   Nodeset.anchor.value('@identity', 'nvarchar(max)') as [identity],
   Nodeset.anchor.value('metadata[1]/@generator', 'nvarchar(max)') as [generator],
   Nodeset.anchor.value('count(attribute)', 'int') as [numberOfAttributes]
FROM
   [$schema.metadata.encapsulation].[_Schema] S
CROSS APPLY
   S.[schema].nodes('/schema/anchor') as Nodeset(anchor);

-- Knot view ----------------------------------------------------------------------------------------------------------
-- The knot view shows information about all the knots in a schema
-----------------------------------------------------------------------------------------------------------------------
DROP VIEW IF EXISTS _Knot;

CREATE VIEW [$schema.metadata.encapsulation].[_Knot]
AS
SELECT
   S.version,
   S.activation,
   Nodeset.knot.value('concat(@mnemonic, ""_"", @descriptor)', 'nvarchar(max)') as [name],
   Nodeset.knot.value('metadata[1]/@capsule', 'nvarchar(max)') as [capsule],
   Nodeset.knot.value('@mnemonic', 'nvarchar(max)') as [mnemonic],
   Nodeset.knot.value('@descriptor', 'nvarchar(max)') as [descriptor],
   Nodeset.knot.value('@identity', 'nvarchar(max)') as [identity],
   Nodeset.knot.value('metadata[1]/@generator', 'nvarchar(max)') as [generator],
   Nodeset.knot.value('@dataRange', 'nvarchar(max)') as [dataRange],
   isnull(Nodeset.knot.value('metadata[1]/@checksum', 'nvarchar(max)'), 'false') as [checksum],
   isnull(Nodeset.knot.value('metadata[1]/@equivalent', 'nvarchar(max)'), 'false') as [equivalent]
FROM
   [$schema.metadata.encapsulation].[_Schema] S
CROSS APPLY
   S.[schema].nodes('/schema/knot') as Nodeset(knot);

-- Attribute view -----------------------------------------------------------------------------------------------------
-- The attribute view shows information about all the attributes in a schema
-----------------------------------------------------------------------------------------------------------------------
DROP VIEW IF EXISTS _Attribute;

CREATE VIEW [$schema.metadata.encapsulation].[_Attribute]
AS
SELECT
   S.version,
   S.activation,
   ParentNodeset.anchor.value('concat(@mnemonic, ""_"")', 'nvarchar(max)') +
   Nodeset.attribute.value('concat(@mnemonic, ""_"")', 'nvarchar(max)') +
   ParentNodeset.anchor.value('concat(@descriptor, ""_"")', 'nvarchar(max)') +
   Nodeset.attribute.value('@descriptor', 'nvarchar(max)') as [name],
   Nodeset.attribute.value('metadata[1]/@capsule', 'nvarchar(max)') as [capsule],
   Nodeset.attribute.value('@mnemonic', 'nvarchar(max)') as [mnemonic],
   Nodeset.attribute.value('@descriptor', 'nvarchar(max)') as [descriptor],
   Nodeset.attribute.value('@identity', 'nvarchar(max)') as [identity],
   isnull(Nodeset.attribute.value('metadata[1]/@equivalent', 'nvarchar(max)'), 'false') as [equivalent],
   Nodeset.attribute.value('metadata[1]/@generator', 'nvarchar(max)') as [generator],
   Nodeset.attribute.value('metadata[1]/@assertive', 'nvarchar(max)') as [assertive],
   isnull(Nodeset.attribute.value('metadata[1]/@checksum', 'nvarchar(max)'), 'false') as [checksum],
   Nodeset.attribute.value('metadata[1]/@restatable', 'nvarchar(max)') as [restatable],
   Nodeset.attribute.value('metadata[1]/@idempotent', 'nvarchar(max)') as [idempotent],
   ParentNodeset.anchor.value('@mnemonic', 'nvarchar(max)') as [anchorMnemonic],
   ParentNodeset.anchor.value('@descriptor', 'nvarchar(max)') as [anchorDescriptor],
   ParentNodeset.anchor.value('@identity', 'nvarchar(max)') as [anchorIdentity],
   Nodeset.attribute.value('@dataRange', 'nvarchar(max)') as [dataRange],
   Nodeset.attribute.value('@knotRange', 'nvarchar(max)') as [knotRange],
   Nodeset.attribute.value('@timeRange', 'nvarchar(max)') as [timeRange]
FROM
   [$schema.metadata.encapsulation].[_Schema] S
CROSS APPLY
   S.[schema].nodes('/schema/anchor') as ParentNodeset(anchor)
OUTER APPLY
   ParentNodeset.anchor.nodes('attribute') as Nodeset(attribute);

-- Tie view -----------------------------------------------------------------------------------------------------------
-- The tie view shows information about all the ties in a schema
-----------------------------------------------------------------------------------------------------------------------
DROP VIEW IF EXISTS _Tie;

CREATE VIEW [$schema.metadata.encapsulation].[_Tie]
AS
SELECT
   S.version,
   S.activation,
   REPLACE(Nodeset.tie.query('
      for $$role in *[local-name() = ""anchorRole"" or local-name() = ""knotRole""]
      return concat($$role/@type, ""_"", $$role/@role)
   ').value('.', 'nvarchar(max)'), ' ', '_') as [name],
   Nodeset.tie.value('metadata[1]/@capsule', 'nvarchar(max)') as [capsule],
   Nodeset.tie.value('count(anchorRole) + count(knotRole)', 'int') as [numberOfRoles],
   Nodeset.tie.query('
      for $$role in *[local-name() = ""anchorRole"" or local-name() = ""knotRole""]
      return string($$role/@role)
   ').value('.', 'nvarchar(max)') as [roles],
   Nodeset.tie.value('count(anchorRole)', 'int') as [numberOfAnchors],
   Nodeset.tie.query('
      for $$role in anchorRole
      return string($$role/@type)
   ').value('.', 'nvarchar(max)') as [anchors],
   Nodeset.tie.value('count(knotRole)', 'int') as [numberOfKnots],
   Nodeset.tie.query('
      for $$role in knotRole
      return string($$role/@type)
   ').value('.', 'nvarchar(max)') as [knots],
   Nodeset.tie.value('count(*[local-name() = ""anchorRole"" or local-name() = ""knotRole""][@identifier = ""true""])', 'int') as [numberOfIdentifiers],
   Nodeset.tie.query('
      for $$role in *[local-name() = ""anchorRole"" or local-name() = ""knotRole""][@identifier = ""true""]
      return string($$role/@type)
   ').value('.', 'nvarchar(max)') as [identifiers],
   Nodeset.tie.value('@timeRange', 'nvarchar(max)') as [timeRange],
   Nodeset.tie.value('metadata[1]/@generator', 'nvarchar(max)') as [generator],
   Nodeset.tie.value('metadata[1]/@assertive', 'nvarchar(max)') as [assertive],
   Nodeset.tie.value('metadata[1]/@restatable', 'nvarchar(max)') as [restatable],
   Nodeset.tie.value('metadata[1]/@idempotent', 'nvarchar(max)') as [idempotent]
FROM
   [$schema.metadata.encapsulation].[_Schema] S
CROSS APPLY
   S.[schema].nodes('/schema/tie') as Nodeset(tie);

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