if(schema.BUSINESS_VIEWS) {
/*~
-- NEXUS TEMPORAL BUSINESS PERSPECTIVES -----------------------------------------------------------------------------
--
~*/
    var nexus;
    while (schema.nextNexus && (nexus = schema.nextNexus())) {
/*~
-- Drop perspectives -------------------------------------------------------------------------------------------------
~*/
        if(schema.EQUIVALENCE) {
/*~
IF Object_ID('$nexus.capsule$.EQ_Difference_$nexus.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[EQ_Difference_$nexus.businessName];
IF Object_ID('$nexus.capsule$.EQ_Current_$nexus.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[EQ_Current_$nexus.businessName];
IF Object_ID('$nexus.capsule$.EQ_Point_$nexus.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[EQ_Point_$nexus.businessName];
IF Object_ID('$nexus.capsule$.EQ_Latest_$nexus.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[EQ_Latest_$nexus.businessName];
~*/
        }
/*~
IF Object_ID('$nexus.capsule$.Difference_$nexus.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[Difference_$nexus.businessName];
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
