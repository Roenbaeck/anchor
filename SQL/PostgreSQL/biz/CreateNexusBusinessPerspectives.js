if(schema.BUSINESS_VIEWS) {
/*~
-- NEXUS TEMPORAL BUSINESS PERSPECTIVES -----------------------------------------------------------------------------
--
-- These views and functions provide business friendly temporal perspectives over each nexus.
--
~*/
var nexus;
while (schema.nextNexus && (nexus = schema.nextNexus())) {
    if(nexus.hasMoreAttributes && nexus.hasMoreAttributes()) {
/*~
-- Latest perspective ------------------------------------------------------------------------------------------------
CREATE VIEW [$nexus.capsule].[Latest_$nexus.businessName] AS
SELECT
    $(schema.CRT)? [$nexus.mnemonic].Positor,
    [$nexus.mnemonic].$nexus.identityColumnName as [$nexus.businessIdentityColumnName],
~*/
        var role, knot, attribute;
        while (role = nexus.nextRole()) {
            if(role.knot) {
/*~
    [$nexus.mnemonic].$role.knotValueColumnName AS [$role.businessName]$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    [$nexus.mnemonic].$role.columnName as [$role.businessColumnName]$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
            }
        }
        while (attribute = nexus.nextAttribute()) {
            if(attribute.isKnotted()) {
/*~
    [$nexus.mnemonic].$attribute.knotValueColumnName as [$attribute.knotBusinessName]$(nexus.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    [$nexus.mnemonic].$attribute.valueColumnName as [$attribute.businessName]$(nexus.hasMoreAttributes())?,
~*/
            }
        }
/*~
FROM
    [$nexus.capsule].[l$nexus.name] [$nexus.mnemonic];
GO
-- Point-in-time perspective -----------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[Point_$nexus.businessName] (
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    $(schema.CRT)? [$nexus.mnemonic].Positor,
    [$nexus.mnemonic].$nexus.identityColumnName as [$nexus.businessIdentityColumnName],
~*/
        while (role = nexus.nextRole()) {
            if(role.knot) {
/*~
    [$nexus.mnemonic].$role.knotValueColumnName AS [$role.businessName]$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    [$nexus.mnemonic].$role.columnName as [$role.businessColumnName]$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
            }
        }
        while (attribute = nexus.nextAttribute()) {
            if(attribute.isKnotted && attribute.isKnotted()) {
/*~
    [$nexus.mnemonic].$attribute.knotValueColumnName as [$attribute.knotBusinessName]$(nexus.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    [$nexus.mnemonic].$attribute.valueColumnName as [$attribute.businessName]$(nexus.hasMoreAttributes())?,
~*/
            }
        }
/*~
FROM
    [$nexus.capsule].[p$nexus.name](@changingTimepoint) [$nexus.mnemonic]
GO
-- Now perspective ---------------------------------------------------------------------------------------------------
CREATE VIEW [$nexus.capsule].[Current_$nexus.businessName]
AS
SELECT
    *
FROM
    [$nexus.capsule].[Point_$nexus.businessName]($schema.metadata.now);
GO
~*/
    }
}
}
