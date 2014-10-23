if(schema.BUSINESS_VIEWS) {
/*~
-- ANCHOR TEMPORAL BUSINESS PERSPECTIVES ------------------------------------------------------------------------------
--
~*/
    var anchor;
    while (anchor = schema.nextAnchor()) {
/*~
-- Drop perspectives --------------------------------------------------------------------------------------------------
~*/
        if(schema.EQUIVALENCE) {
/*~
IF Object_ID('$anchor.capsule$.EQ_Difference_$anchor.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[EQ_Difference_$anchor.businessName];
IF Object_ID('$anchor.capsule$.EQ_Current_$anchor.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[EQ_Current_$anchor.businessName];
IF Object_ID('$anchor.capsule$.EQ_Point_$anchor.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[EQ_Point_$anchor.businessName];
IF Object_ID('$anchor.capsule$.EQ_Latest_$anchor.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[EQ_Latest_$anchor.businessName];
~*/
        }
/*~
IF Object_ID('$anchor.capsule$.Difference_$anchor.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[Difference_$anchor.businessName];
IF Object_ID('$anchor.capsule$.Current_$anchor.businessName', 'V') IS NOT NULL
DROP VIEW [$anchor.capsule].[Current_$anchor.businessName];
IF Object_ID('$anchor.capsule$.Point_$anchor.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[Point_$anchor.businessName];
IF Object_ID('$anchor.capsule$.Latest_$anchor.businessName', 'V') IS NOT NULL
DROP VIEW [$anchor.capsule].[Latest_$anchor.businessName];
GO
~*/
    }
}