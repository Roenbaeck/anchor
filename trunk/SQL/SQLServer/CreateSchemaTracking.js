if(schema.serialization) {
    if(!schema.defaultCapsule)
        schema.defaultCapsule = 'dbo';
    if(!schema.chronon)
        schema.chronon = 'datetime';
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
IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = '_Schema' and type LIKE '%U%')
   CREATE TABLE [$schema.defaultCapsule].[_Schema] (
      [version] int identity(1, 1) not null primary key,
      [activation] $schema.chronon not null,
      [schema] xml not null
   );
GO
-- Insert the XML schema (as of now)
INSERT INTO [$schema.defaultCapsule].[_Schema] (
   [activation],
   [schema]
)
SELECT
   current_timestamp,
   N'$schema._serialization';
GO
-- Anchor view --------------------------------------------------------------------------------------------------------
-- The anchor view shows information about all the anchors in a schema
-----------------------------------------------------------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.views WHERE name = '_Anchor')
DROP VIEW [$schema.defaultCapsule].[_Anchor]
GO

CREATE VIEW [$schema.defaultCapsule].[_Anchor]
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
   [$schema.defaultCapsule].[_Schema] S
CROSS APPLY
   S.[schema].nodes('/schema/anchor') as Nodeset(anchor);
GO
-- Knot view ----------------------------------------------------------------------------------------------------------
-- The knot view shows information about all the knots in a schema
-----------------------------------------------------------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.views WHERE name = '_Knot')
DROP VIEW [$schema.defaultCapsule].[_Knot]
GO

CREATE VIEW [$schema.defaultCapsule].[_Knot]
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
   Nodeset.knot.value('@dataRange', 'nvarchar(max)') as [dataRange]
FROM
   [$schema.defaultCapsule].[_Schema] S
CROSS APPLY
   S.[schema].nodes('/schema/knot') as Nodeset(knot);
GO
-- Attribute view -----------------------------------------------------------------------------------------------------
-- The attribute view shows information about all the attributes in a schema
-----------------------------------------------------------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.views WHERE name = '_Attribute')
DROP VIEW [$schema.defaultCapsule].[_Attribute]
GO

CREATE VIEW [$schema.defaultCapsule].[_Attribute]
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
   ParentNodeset.anchor.value('@mnemonic', 'nvarchar(max)') as [anchorMnemonic],
   ParentNodeset.anchor.value('@descriptor', 'nvarchar(max)') as [anchorDescriptor],
   ParentNodeset.anchor.value('@identity', 'nvarchar(max)') as [anchorIdentity],
   Nodeset.attribute.value('@dataRange', 'nvarchar(max)') as [dataRange],
   Nodeset.attribute.value('@knotRange', 'nvarchar(max)') as [knotRange],
   Nodeset.attribute.value('@timeRange', 'nvarchar(max)') as [timeRange]
FROM
   [$schema.defaultCapsule].[_Schema] S
CROSS APPLY
   S.[schema].nodes('/schema/anchor') as ParentNodeset(anchor)
OUTER APPLY
   ParentNodeset.anchor.nodes('attribute') as Nodeset(attribute);
GO
-- Tie view -----------------------------------------------------------------------------------------------------------
-- The tie view shows information about all the ties in a schema
-----------------------------------------------------------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.views WHERE name = '_Tie')
DROP VIEW [$schema.defaultCapsule].[_Tie]
GO

CREATE VIEW [$schema.defaultCapsule].[_Tie]
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
   Nodeset.tie.value('@timeRange', 'nvarchar(max)') as [timeRange]
FROM
   [$schema.defaultCapsule].[_Schema] S
CROSS APPLY
   S.[schema].nodes('/schema/tie') as Nodeset(tie);
GO
-- Evolution function -------------------------------------------------------------------------------------------------
-- The evolution function shows what the schema looked like at the given
-- point in time with additional information about missing or added
-- modeling components since that time.
--
-- @timepoint   The point in time to which you would like to travel.
-----------------------------------------------------------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.objects WHERE name = '_Evolution' and type LIKE '%F%')
DROP FUNCTION [$schema.defaultCapsule].[_Evolution];
GO

CREATE FUNCTION [$schema.defaultCapsule].[_Evolution] (
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
                  [$schema.defaultCapsule].[_Schema]
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
      [$schema.defaultCapsule].[_Schema]
   WHERE
      [activation] <= @timepoint
) V
JOIN (
   SELECT
      [name],
      [version]
   FROM
      [$schema.defaultCapsule].[_Anchor] a
   UNION ALL
   SELECT
      [name],
      [version]
   FROM
      [$schema.defaultCapsule].[_Knot] k
   UNION ALL
   SELECT
      [name],
      [version]
   FROM
      [$schema.defaultCapsule].[_Attribute] b
   UNION ALL
   SELECT
      [name],
      [version]
   FROM
      [$schema.defaultCapsule].[_Tie] t
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

~*/
}