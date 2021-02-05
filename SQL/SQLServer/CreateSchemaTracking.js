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
IF Object_ID('$schema.metadata.encapsulation$._Schema', 'U') IS NULL
   CREATE TABLE [$schema.metadata.encapsulation].[_Schema] (
      [version] int identity(1, 1) not null,
      [activation] $schema.metadata.chronon not null,
      [schema] xml not null,
      constraint pk_Schema primary key (
         [version]
      )
   );
GO
-- Insert the XML schema (as of now)
INSERT INTO [$schema.metadata.encapsulation].[_Schema] (
   [activation],
   [schema]
)
SELECT
   current_timestamp,
   N'$schema.serialization._serialization';
GO
-- Schema expanded view -----------------------------------------------------------------------------------------------
-- A view of the schema table that expands the XML attributes into columns
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$schema.metadata.encapsulation$._Schema_Expanded', 'V') IS NOT NULL
DROP VIEW [$schema.metadata.encapsulation].[_Schema_Expanded]
GO

CREATE VIEW [$schema.metadata.encapsulation].[_Schema_Expanded]
AS
SELECT
	[version],
	[activation],
	[schema],
	[schema].value('schema[1]/@format', 'nvarchar(max)') as [format],
	[schema].value('schema[1]/@date', 'datetime') + [schema].value('schema[1]/@time', 'datetime') as [date],
	[schema].value('schema[1]/metadata[1]/@temporalization', 'nvarchar(max)') as [temporalization],
	[schema].value('schema[1]/metadata[1]/@databaseTarget', 'nvarchar(max)') as [databaseTarget],
	[schema].value('schema[1]/metadata[1]/@changingRange', 'nvarchar(max)') as [changingRange],
	[schema].value('schema[1]/metadata[1]/@encapsulation', 'nvarchar(max)') as [encapsulation],
	[schema].value('schema[1]/metadata[1]/@identity', 'nvarchar(max)') as [identity],
	[schema].value('schema[1]/metadata[1]/@metadataPrefix', 'nvarchar(max)') as [metadataPrefix],
	[schema].value('schema[1]/metadata[1]/@metadataType', 'nvarchar(max)') as [metadataType],
	[schema].value('schema[1]/metadata[1]/@metadataUsage', 'nvarchar(max)') as [metadataUsage],
	[schema].value('schema[1]/metadata[1]/@changingSuffix', 'nvarchar(max)') as [changingSuffix],
	[schema].value('schema[1]/metadata[1]/@identitySuffix', 'nvarchar(max)') as [identitySuffix],
	[schema].value('schema[1]/metadata[1]/@positIdentity', 'nvarchar(max)') as [positIdentity],
	[schema].value('schema[1]/metadata[1]/@positGenerator', 'nvarchar(max)') as [positGenerator],
	[schema].value('schema[1]/metadata[1]/@positingRange', 'nvarchar(max)') as [positingRange],
	[schema].value('schema[1]/metadata[1]/@positingSuffix', 'nvarchar(max)') as [positingSuffix],
	[schema].value('schema[1]/metadata[1]/@positorRange', 'nvarchar(max)') as [positorRange],
	[schema].value('schema[1]/metadata[1]/@positorSuffix', 'nvarchar(max)') as [positorSuffix],
	[schema].value('schema[1]/metadata[1]/@reliabilityRange', 'nvarchar(max)') as [reliabilityRange],
	[schema].value('schema[1]/metadata[1]/@reliabilitySuffix', 'nvarchar(max)') as [reliabilitySuffix],
	[schema].value('schema[1]/metadata[1]/@deleteReliability', 'nvarchar(max)') as [deleteReliability],
	[schema].value('schema[1]/metadata[1]/@assertionSuffix', 'nvarchar(max)') as [assertionSuffix],
	[schema].value('schema[1]/metadata[1]/@partitioning', 'nvarchar(max)') as [partitioning],
	[schema].value('schema[1]/metadata[1]/@entityIntegrity', 'nvarchar(max)') as [entityIntegrity],
	[schema].value('schema[1]/metadata[1]/@restatability', 'nvarchar(max)') as [restatability],
	[schema].value('schema[1]/metadata[1]/@idempotency', 'nvarchar(max)') as [idempotency],
	[schema].value('schema[1]/metadata[1]/@assertiveness', 'nvarchar(max)') as [assertiveness],
	[schema].value('schema[1]/metadata[1]/@naming', 'nvarchar(max)') as [naming],
	[schema].value('schema[1]/metadata[1]/@positSuffix', 'nvarchar(max)') as [positSuffix],
	[schema].value('schema[1]/metadata[1]/@annexSuffix', 'nvarchar(max)') as [annexSuffix],
	[schema].value('schema[1]/metadata[1]/@chronon', 'nvarchar(max)') as [chronon],
	[schema].value('schema[1]/metadata[1]/@now', 'nvarchar(max)') as [now],
	[schema].value('schema[1]/metadata[1]/@dummySuffix', 'nvarchar(max)') as [dummySuffix],
	[schema].value('schema[1]/metadata[1]/@statementTypeSuffix', 'nvarchar(max)') as [statementTypeSuffix],
	[schema].value('schema[1]/metadata[1]/@checksumSuffix', 'nvarchar(max)') as [checksumSuffix],
	[schema].value('schema[1]/metadata[1]/@businessViews', 'nvarchar(max)') as [businessViews],
	[schema].value('schema[1]/metadata[1]/@equivalence', 'nvarchar(max)') as [equivalence],
	[schema].value('schema[1]/metadata[1]/@equivalentSuffix', 'nvarchar(max)') as [equivalentSuffix],
	[schema].value('schema[1]/metadata[1]/@equivalentRange', 'nvarchar(max)') as [equivalentRange]
FROM
	_Schema;
GO
-- Anchor view --------------------------------------------------------------------------------------------------------
-- The anchor view shows information about all the anchors in a schema
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$schema.metadata.encapsulation$._Anchor', 'V') IS NOT NULL
DROP VIEW [$schema.metadata.encapsulation].[_Anchor]
GO

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
   Nodeset.anchor.value('count(attribute)', 'int') as [numberOfAttributes],
   Nodeset.anchor.value('description[1]/.', 'nvarchar(max)') as [description]
FROM
   [$schema.metadata.encapsulation].[_Schema] S
CROSS APPLY
   S.[schema].nodes('/schema/anchor') as Nodeset(anchor);
GO
-- Knot view ----------------------------------------------------------------------------------------------------------
-- The knot view shows information about all the knots in a schema
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$schema.metadata.encapsulation$._Knot', 'V') IS NOT NULL
DROP VIEW [$schema.metadata.encapsulation].[_Knot]
GO

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
   isnull(Nodeset.knot.value('metadata[1]/@equivalent', 'nvarchar(max)'), 'false') as [equivalent],
   Nodeset.knot.value('description[1]/.', 'nvarchar(max)') as [description]
FROM
   [$schema.metadata.encapsulation].[_Schema] S
CROSS APPLY
   S.[schema].nodes('/schema/knot') as Nodeset(knot);
GO
-- Attribute view -----------------------------------------------------------------------------------------------------
-- The attribute view shows information about all the attributes in a schema
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$schema.metadata.encapsulation$._Attribute', 'V') IS NOT NULL
DROP VIEW [$schema.metadata.encapsulation].[_Attribute]
GO

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
   Nodeset.attribute.value('metadata[1]/@privacy', 'nvarchar(max)') as [privacy],
   isnull(Nodeset.attribute.value('metadata[1]/@checksum', 'nvarchar(max)'), 'false') as [checksum],
   Nodeset.attribute.value('metadata[1]/@restatable', 'nvarchar(max)') as [restatable],
   Nodeset.attribute.value('metadata[1]/@idempotent', 'nvarchar(max)') as [idempotent],
   ParentNodeset.anchor.value('@mnemonic', 'nvarchar(max)') as [anchorMnemonic],
   ParentNodeset.anchor.value('@descriptor', 'nvarchar(max)') as [anchorDescriptor],
   ParentNodeset.anchor.value('@identity', 'nvarchar(max)') as [anchorIdentity],
   Nodeset.attribute.value('@dataRange', 'nvarchar(max)') as [dataRange],
   Nodeset.attribute.value('@knotRange', 'nvarchar(max)') as [knotRange],
   Nodeset.attribute.value('@timeRange', 'nvarchar(max)') as [timeRange],
   Nodeset.attribute.value('metadata[1]/@deletable', 'nvarchar(max)') as [deletable],
   Nodeset.attribute.value('metadata[1]/@encryptionGroup', 'nvarchar(max)') as [encryptionGroup],
   Nodeset.attribute.value('description[1]/.', 'nvarchar(max)') as [description]
FROM
   [$schema.metadata.encapsulation].[_Schema] S
CROSS APPLY
   S.[schema].nodes('/schema/anchor') as ParentNodeset(anchor)
OUTER APPLY
   ParentNodeset.anchor.nodes('attribute') as Nodeset(attribute);
GO
-- Tie view -----------------------------------------------------------------------------------------------------------
-- The tie view shows information about all the ties in a schema
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$schema.metadata.encapsulation$._Tie', 'V') IS NOT NULL
DROP VIEW [$schema.metadata.encapsulation].[_Tie]
GO

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
   Nodeset.tie.value('metadata[1]/@idempotent', 'nvarchar(max)') as [idempotent],
   Nodeset.tie.value('description[1]/.', 'nvarchar(max)') as [description]
FROM
   [$schema.metadata.encapsulation].[_Schema] S
CROSS APPLY
   S.[schema].nodes('/schema/tie') as Nodeset(tie);
GO

-- Key view -----------------------------------------------------------------------------------------------------------
-- The key view shows information about all the keys in a schema
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$schema.metadata.encapsulation$._Key', 'V') IS NOT NULL
DROP VIEW [$schema.metadata.encapsulation].[_Key]
GO

CREATE VIEW [$schema.metadata.encapsulation].[_Key]
AS
SELECT
   S.version,
   S.activation,
   Nodeset.keys.value('@of', 'nvarchar(max)') as [of],
   Nodeset.keys.value('@route', 'nvarchar(max)') as [route],
   Nodeset.keys.value('@stop', 'nvarchar(max)') as [stop],
   case [parent]
      when 'tie'
      then Nodeset.keys.value('../@role', 'nvarchar(max)')
   end as [role],
   case [parent]
      when 'knot'
      then Nodeset.keys.value('concat(../@mnemonic, ""_"")', 'nvarchar(max)') +
          Nodeset.keys.value('../@descriptor', 'nvarchar(max)') 
      when 'attribute'
      then Nodeset.keys.value('concat(../../@mnemonic, ""_"")', 'nvarchar(max)') +
          Nodeset.keys.value('concat(../@mnemonic, ""_"")', 'nvarchar(max)') +
          Nodeset.keys.value('concat(../../@descriptor, ""_"")', 'nvarchar(max)') +
          Nodeset.keys.value('../@descriptor', 'nvarchar(max)') 
      when 'tie'
      then REPLACE(Nodeset.keys.query('
            for $$role in ../../*[local-name() = ""anchorRole"" or local-name() = ""knotRole""]
            return concat($$role/@type, "_", $$role/@role)
          ').value('.', 'nvarchar(max)'), ' ', '_')
   end as [in],
   [parent]
FROM
   [$schema.metadata.encapsulation].[_Schema] S
CROSS APPLY
   S.[schema].nodes('/schema//key') as Nodeset(keys)
CROSS APPLY (
   VALUES (
      case
         when Nodeset.keys.value('local-name(..)', 'nvarchar(max)') in ('anchorRole', 'knotRole')
         then 'tie'
         else Nodeset.keys.value('local-name(..)', 'nvarchar(max)')
      end 
   )
) p ([parent]);
GO

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
    @timepoint AS $schema.metadata.chronon
)
RETURNS TABLE AS
RETURN
WITH constructs AS (
   SELECT
      temporalization,
      [capsule] + '.' + [name] + s.suffix AS [qualifiedName],
      [version],
      [activation]
   FROM 
      [$schema.metadata.encapsulation].[_Anchor] a
   CROSS APPLY (
      VALUES ('uni', ''), ('crt', '')
   ) s (temporalization, suffix)
   UNION ALL
   SELECT
      temporalization,
      [capsule] + '.' + [name] + s.suffix AS [qualifiedName],
      [version],
      [activation]
   FROM
      [$schema.metadata.encapsulation].[_Knot] k
   CROSS APPLY (
      VALUES ('uni', ''), ('crt', '')
   ) s (temporalization, suffix)
   UNION ALL
   SELECT
      temporalization,
      [capsule] + '.' + [name] + s.suffix AS [qualifiedName],
      [version],
      [activation]
   FROM
      [$schema.metadata.encapsulation].[_Attribute] b
   CROSS APPLY (
      VALUES ('uni', ''), ('crt', '_Annex'), ('crt', '_Posit')
   ) s (temporalization, suffix)
   UNION ALL
   SELECT
      temporalization,
      [capsule] + '.' + [name] + s.suffix AS [qualifiedName],
      [version],
      [activation]
   FROM
      [$schema.metadata.encapsulation].[_Tie] t
   CROSS APPLY (
      VALUES ('uni', ''), ('crt', '_Annex'), ('crt', '_Posit')
   ) s (temporalization, suffix)
), 
selectedSchema AS (
   SELECT TOP 1
      *
   FROM
      [$schema.metadata.encapsulation].[_Schema_Expanded]
   WHERE
      [activation] <= @timepoint
   ORDER BY
      [activation] DESC
),
presentConstructs AS (
   SELECT
      C.*
   FROM
      selectedSchema S
   JOIN
      constructs C
   ON
      S.[version] = C.[version]
   AND
      S.temporalization = C.temporalization      
), 
allConstructs AS (
   SELECT
      C.*
   FROM
      selectedSchema S
   JOIN
      constructs C
   ON
      S.temporalization = C.temporalization
)
SELECT
   COALESCE(P.[version], X.[version]) as [version],
   COALESCE(P.[qualifiedName], T.[qualifiedName]) AS [name],
   COALESCE(P.[activation], X.[activation], T.[create_date]) AS [activation],
   CASE
      WHEN P.[activation] = S.[activation] THEN 'Present'
      WHEN X.[activation] > S.[activation] THEN 'Future'
      WHEN X.[activation] < S.[activation] THEN 'Past'
      ELSE 'Missing'
   END AS Existence
FROM 
   presentConstructs P
FULL OUTER JOIN (
   SELECT 
      s.[name] + '.' + t.[name] AS [qualifiedName],
      t.[create_date]
   FROM 
      sys.tables t
   JOIN
      sys.schemas s
   ON
      s.schema_id = t.schema_id
   WHERE
      t.[type] = 'U'
   AND
      LEFT(t.[name], 1) <> '_'
) T
ON
   T.[qualifiedName] = P.[qualifiedName]
LEFT JOIN
   allConstructs X
ON
   X.[qualifiedName] = T.[qualifiedName]
AND
   X.[activation] = (
      SELECT
         MIN(sub.[activation])
      FROM
         constructs sub
      WHERE
         sub.[qualifiedName] = T.[qualifiedName]
      AND 
         sub.[activation] >= T.[create_date]
   )
CROSS APPLY (
   SELECT
      *
   FROM
      selectedSchema
) S;
GO
-- Drop Script Generator ----------------------------------------------------------------------------------------------
-- generates a drop script, that must be run separately, dropping everything in an Anchor Modeled database
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$schema.metadata.encapsulation$._GenerateDropScript', 'P') IS NOT NULL
DROP PROCEDURE [$schema.metadata.encapsulation].[_GenerateDropScript];
GO

CREATE PROCEDURE [$schema.metadata.encapsulation]._GenerateDropScript (
   @exclusionPattern varchar(42) = '%.[[][_]%', -- exclude Metadata by default
   @inclusionPattern varchar(42) = '%', -- include everything by default
   @directions varchar(42) = 'Upwards, Downwards', -- do both up and down by default
   @qualifiedName varchar(555) = null -- can specify a single object
)
AS
BEGIN
   set nocount on;
   select
      ordinal,
      unqualifiedName,
      qualifiedName
   into 
      #constructs
   from (
      select distinct
         10 as ordinal,
         name as unqualifiedName,
         '[' + capsule + '].[' + name + ']' as qualifiedName
      from
         [$schema.metadata.encapsulation]._Attribute
      union all
      select distinct
         11 as ordinal,
         name as unqualifiedName,
         '[' + capsule + '].[' + name + '_Annex]' as qualifiedName
      from
         [$schema.metadata.encapsulation]._Attribute
      union all
      select distinct
         12 as ordinal,
         name as unqualifiedName,
         '[' + capsule + '].[' + name + '_Posit]' as qualifiedName
      from
         [$schema.metadata.encapsulation]._Attribute
      union all
      select distinct
         20 as ordinal,
         name as unqualifiedName,
         '[' + capsule + '].[' + name + ']' as qualifiedName
      from
         [$schema.metadata.encapsulation]._Tie
      union all
      select distinct
         21 as ordinal,
         name as unqualifiedName,
         '[' + capsule + '].[' + name + '_Annex]' as qualifiedName
      from
         [$schema.metadata.encapsulation]._Tie
      union all
      select distinct
         22 as ordinal,
         name as unqualifiedName,
         '[' + capsule + '].[' + name + '_Posit]' as qualifiedName
      from
         [$schema.metadata.encapsulation]._Tie
      union all
      select distinct
         30 as ordinal,
         name as unqualifiedName,
         '[' + capsule + '].[' + name + ']' as qualifiedName
      from
         [$schema.metadata.encapsulation]._Knot
      union all
      select distinct
         40 as ordinal,
         name as unqualifiedName,
         '[' + capsule + '].[' + name + ']' as qualifiedName
      from
         [$schema.metadata.encapsulation]._Anchor
   ) t;

   select
      c.ordinal,
      cast(c.unqualifiedName as nvarchar(517)) as unqualifiedName,
      cast(c.qualifiedName as nvarchar(517)) as qualifiedName,
      o.[object_id],
      o.[type]
   into
      #includedConstructs
   from
      #constructs c
   join
      sys.objects o
   on
      o.[object_id] = OBJECT_ID(c.qualifiedName)
   and 
      o.[type] = 'U'
   where
      OBJECT_ID(c.qualifiedName) = OBJECT_ID(isnull(@qualifiedName, c.qualifiedName));

   create unique clustered index ix_includedConstructs on #includedConstructs([object_id]);

   select distinct
      c.[object_id],
      c.qualifiedName,
      c.unqualifiedName,
      c.[type], 
      r.referencing_id as [referenced_by_object_id],
      n.qualifiedName as referenced_qualifiedName,
      n.unqualifiedName as referenced_unqualifiedName, 
      o.[type] as referenced_type
   into 
      #referencing_entities
   from 
      #includedConstructs c
    cross apply (
        select
         refs.referencing_id
        from 
         sys.dm_sql_referencing_entities(c.qualifiedName, 'OBJECT') refs
        where
         refs.referencing_id <> OBJECT_ID(c.qualifiedName)
    ) r
   join -- select top 100 * from 
         sys.objects o
      on
         o.[object_id] = r.referencing_id
      and
         o.type not in ('S')
      join
         sys.schemas s
      on 
         s.schema_id = o.schema_id
      cross apply (
         select
            cast('[' + s.name + '].[' + o.name + ']' as nvarchar(517)),
            cast(o.name as nvarchar(517))
      ) n (qualifiedName, unqualifiedName);

   create unique clustered index pk_referencing_entities 
   on #referencing_entities ([object_id], [referenced_by_object_id]);

   declare @inserts int = 1;
   while (@inserts > 0)
   begin
      insert into #referencing_entities
      select distinct
         c.[referenced_by_object_id] as [object_id],
         c.referenced_qualifiedName as qualifiedName,
         c.referenced_unqualifiedName as unqualifiedName, 
         c.referenced_type as [type],
         r.referencing_id as [referenced_by_object_id],
         n.qualifiedName as referenced_qualifiedName, 
         n.unqualifiedName as referenced_unqualifiedName, 
         o.[type] as referenced_type
      from 
         #referencing_entities c
      outer apply (
         select
            refs.referencing_id
         from 
            sys.dm_sql_referencing_entities(c.referenced_qualifiedName, 'OBJECT') refs
         where
            refs.referencing_id <> c.referenced_by_object_id
      ) r
      left join 
         #referencing_entities x
      on 
         x.[object_id] = c.[referenced_by_object_id]
      and
         x.referenced_by_object_id = r.referencing_id
      join -- select top 100 * from 
          sys.objects o
        on
          o.[object_id] = r.referencing_id
        and
          o.type not in ('S')
        join
          sys.schemas s
        on 
          s.schema_id = o.schema_id
        cross apply (
          select
            cast('[' + s.name + '].[' + o.name + ']' as nvarchar(517)),
            cast(o.name as nvarchar(517))
        ) n (qualifiedName, unqualifiedName)
      where
         x.[object_id] is null; 
      set @inserts = @@ROWCOUNT;
   end;

   with relatedUpwards as (
      select
         c.[object_id],
         c.[type],
         c.unqualifiedName,
         c.qualifiedName,
         1 as depth
      from
         #includedConstructs c
      union all
      select
         r.referenced_by_object_id,
         r.referenced_type,
         r.referenced_unqualifiedName,
         r.referenced_qualifiedName,
         c.depth + 1 as depth
      from
         relatedUpwards c
     join   
       #referencing_entities r
     on 
        r.[object_id] = c.[object_id]
   )
   select distinct
      [object_id],
      [type],
      unqualifiedName,
      qualifiedName,
      depth
   into
      #relatedUpwards
   from
      relatedUpwards u
   where
      depth = (
         select
            MAX(depth)
         from
            relatedUpwards s
         where
            s.[object_id] = u.[object_id]
      );
   
   create unique clustered index ix_relatedUpwards on #relatedUpwards([object_id]);

   select distinct
      c.[object_id],
      c.qualifiedName,
      c.unqualifiedName, 
      c.[type],
      r.referenced_id as [references_object_id],
      n.qualifiedName as references_qualifiedName, 
      n.unqualifiedName as references_unqualifiedName, 
      o.[type] as references_type
   into -- drop table
      #referenced_entities
   from 
      #includedConstructs c
    cross apply (
         select 
            refs.referenced_id 
         from
            sys.dm_sql_referenced_entities(c.qualifiedName, 'OBJECT') refs
         where
            refs.referenced_minor_id = 0
         and
            refs.referenced_id <> OBJECT_ID(c.qualifiedName)
         and 
            refs.referenced_id not in (select [object_id] from #relatedUpwards)
    ) r
      join -- select top 100 * from 
          sys.objects o
        on
          o.[object_id] = r.referenced_id
        and
          o.type not in ('S')
        join
          sys.schemas s
        on 
          s.schema_id = o.schema_id
        cross apply (
          select
            cast('[' + s.name + '].[' + o.name + ']' as nvarchar(517)),
            cast(o.name as nvarchar(517))
        ) n (qualifiedName, unqualifiedName);

   create unique clustered index pk_referenced_entities 
   on #referenced_entities ([object_id], [references_object_id]);

   set @inserts = 1;
   while(@inserts > 0)
   begin
      insert into #referenced_entities
      select distinct
         c.[references_object_id] as [object_id],
         c.references_qualifiedName as qualifiedName,
         c.references_unqualifiedName as unqualifiedName,
         c.references_type as [type],
         r.referenced_id as [references_object_id],
         n.qualifiedName as references_qualifiedName, 
         n.unqualifiedName as references_unqualifiedName, 
         o.[type] as references_type
      from 
         #referenced_entities c
      cross apply (
          select 
            refs.referenced_id 
          from
            sys.dm_sql_referenced_entities(c.references_qualifiedName, 'OBJECT') refs
          where
            refs.referenced_minor_id = 0
          and
            refs.referenced_id <> c.[references_object_id]
          and 
            refs.referenced_id not in (select [object_id] from #relatedUpwards)
      ) r
      left join
         #referenced_entities x
      on 
         x.[object_id] = c.[references_object_id]
      and
         x.references_object_id = r.referenced_id
      join -- select top 100 * from 
          sys.objects o
        on
          o.[object_id] = r.referenced_id
        and
          o.type not in ('S')
        join
          sys.schemas s
        on 
          s.schema_id = o.schema_id
        cross apply (
          select
            cast('[' + s.name + '].[' + o.name + ']' as nvarchar(517)),
            cast(o.name as nvarchar(517))
        ) n (qualifiedName, unqualifiedName)
      where
         x.[object_id] is null;
      set @inserts = @@ROWCOUNT;
   end;

   with relatedDownwards as (
      select
         cast('Upwards' as varchar(42)) as [relationType],
         c.[object_id],
         c.[type],
         c.unqualifiedName, 
         c.qualifiedName,
         c.depth
      from
         #relatedUpwards c 
      union all
      select
         cast('Downwards' as varchar(42)) as [relationType],
         r.references_object_id,
         r.references_type,
         r.references_unqualifiedName, 
         r.references_qualifiedName,
         c.depth - 1 as depth
      from
         relatedDownwards c
     join
      #referenced_entities r
     on 
      r.[object_id] = c.[object_id]
   )
   select distinct
      relationType,
      [object_id],
      [type],
      unqualifiedName,
      qualifiedName,
      depth
   into -- drop table 
      #relatedDownwards
   from
      relatedDownwards d
   where
      depth = (
         select
            MIN(depth)
         from
            relatedDownwards s
         where
            s.[object_id] = d.[object_id]
      );

   create unique clustered index ix_relatedDownwards on #relatedDownwards([object_id]);

   select distinct
      [object_id],
      [type],
      [unqualifiedName],
      [qualifiedName],
      [depth]
   into
      #affectedObjects
   from
      #relatedDownwards d
   where
      [qualifiedName] not like @exclusionPattern
   and
      [qualifiedName] like @inclusionPattern
   and
      @directions like '%' + [relationType] + '%';

   create unique clustered index ix_affectedObjects on #affectedObjects([object_id]);

   select distinct
      objectType,
      unqualifiedName,
      qualifiedName,
      dropOrder
   into
      #dropList
   from (
      select
         t.objectType,
         o.unqualifiedName,
         o.qualifiedName,
         dense_rank() over (
            order by
               o.depth desc,
               case o.[type]
                  when 'C'  then 0 -- CHECK CONSTRAINT
                  when 'TR' then 1 -- SQL_TRIGGER
                  when 'P'  then 2 -- SQL_STORED_PROCEDURE
                  when 'V'  then 3 -- VIEW
                  when 'IF' then 4 -- SQL_INLINE_TABLE_VALUED_FUNCTION
                  when 'FN' then 5 -- SQL_SCALAR_FUNCTION
                  when 'PK' then 6 -- PRIMARY_KEY_CONSTRAINT
                  when 'UQ' then 7 -- UNIQUE_CONSTRAINT
                  when 'F'  then 8 -- FOREIGN_KEY_CONSTRAINT
                  when 'U'  then 9 -- USER_TABLE
               end asc,
               isnull(c.ordinal, 0) asc
         ) as dropOrder
      from
         #affectedObjects o
      left join
         #includedConstructs c
      on
         c.[object_id] = o.[object_id]
      cross apply (
         select
            case o.[type]
               when 'C'  then 'CHECK'
               when 'TR' then 'TRIGGER'
               when 'V'  then 'VIEW'
               when 'IF' then 'FUNCTION'
               when 'FN' then 'FUNCTION'
               when 'P'  then 'PROCEDURE'
               when 'PK' then 'CONSTRAINT'
               when 'UQ' then 'CONSTRAINT'
               when 'F'  then 'CONSTRAINT'
               when 'U'  then 'TABLE'
            end
         ) t (objectType)
      where
         t.objectType in (
            'CHECK',
            'VIEW',
            'FUNCTION',
            'PROCEDURE',
            'TABLE'
         )
   ) r;

   select
      case 
         when d.objectType = 'CHECK'
         then 'ALTER TABLE ' + p.parentName + ' DROP CONSTRAINT ' + d.unqualifiedName
         else 'DROP ' + d.objectType + ' ' + d.qualifiedName
      end + ';' + CHAR(13) as [text()]
   from
      #dropList d
   join
      sys.objects o
   on
      o.[object_id] = OBJECT_ID(d.qualifiedName)
   join
      sys.schemas s
   on
      s.[schema_id] = o.[schema_id]
   cross apply (
      select
         '[' + s.name + '].[' + OBJECT_NAME(o.parent_object_id) + ']'
   ) p (parentName)
   order by
      d.dropOrder asc
   for xml path('');
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
	declare @R char(1);
    set @R = CHAR(13);
	-- stores the built SQL code
	declare @sql varchar(max);
    set @sql = 'USE ' + @target + ';' + @R;
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

	select @sql for xml path('');
end
go
-- Delete Everything with a Certain Metadata Id -----------------------------------------------------------------------
-- deletes all rows from all tables that have the specified metadata id
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$schema.metadata.encapsulation$._DeleteWhereMetadataEquals', 'P') IS NOT NULL
DROP PROCEDURE [$schema.metadata.encapsulation].[_DeleteWhereMetadataEquals];
GO

CREATE PROCEDURE [$schema.metadata.encapsulation]._DeleteWhereMetadataEquals (
	@metadataID $schema.metadata.metadataType,
	@schemaVersion int = null,
	@includeKnots bit = 0
)
as
begin
	declare @sql varchar(max);
	set @sql = 'print ''Null is not a valid value for @metadataId''';

	if(@metadataId is not null)
	begin
		if(@schemaVersion is null)
		begin
			select
				@schemaVersion = max(Version)
			from
				_Schema;
		end;

		with constructs as (
			select
				'l' + name as name,
				2 as prio,
				'$schema.metadata.metadataPrefix' + name as metadataColumn
			from
				_Tie
			where
				[version] = @schemaVersion
			union all
			select
				'l' + name as name,
				3 as prio,
				'$schema.metadata.metadataPrefix' + mnemonic as metadataColumn
			from
				_Anchor
			where
				[version] = @schemaVersion
			union all
			select
				name,
				4 as prio,
				'$schema.metadata.metadataPrefix' + mnemonic as metadataColumn
			from
				_Knot
			where
				[version] = @schemaVersion
			and
				@includeKnots = 1
		)
		select
			@sql = (
				select
					'DELETE FROM ' + name + ' WHERE ' + metadataColumn + ' = ' + cast(@metadataId as varchar(max)) + '; '
				from
					constructs
        order by
					prio, name
				for xml
					path('')
			);
	end
	exec(@sql);
end
go
~*/
}
