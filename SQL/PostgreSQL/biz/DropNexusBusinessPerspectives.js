if(schema.BUSINESS_VIEWS) {
/*~
-- NEXUS TEMPORAL BUSINESS PERSPECTIVES -----------------------------------------------------------------------------
--
~*/
    var nexus;
    while (schema.nextNexus && (nexus = schema.nextNexus())) {
/*~
-- Drop perspectives -------------------------------------------------------------------------------------------------
IF Object_ID('$nexus.capsule$.Current_$nexus.businessName', 'V') IS NOT NULL
DROP VIEW [$nexus.capsule].[Current_$nexus.businessName];
IF Object_ID('$nexus.capsule$.Point_$nexus.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[Point_$nexus.businessName];
IF Object_ID('$nexus.capsule$.Latest_$nexus.businessName', 'V') IS NOT NULL
DROP VIEW [$nexus.capsule].[Latest_$nexus.businessName];
GO
~*/
    }
}
