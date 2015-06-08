if(schema.BUSINESS_VIEWS) {
/*~
-- TIE TEMPORAL BUSINESS PERSPECTIVES ---------------------------------------------------------------------------------
--
~*/
    var tie, role, knot;
    while (tie = schema.nextTie()) {
/*~
-- Drop perspectives --------------------------------------------------------------------------------------------------
~*/
        if(schema.EQUIVALENCE) {
/*~
IF Object_ID('$tie.capsule$.EQ_Difference_$tie.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[EQ_Difference_$tie.businessName];
IF Object_ID('$tie.capsule$.EQ_Current_$tie.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[EQ_Current_$tie.businessName];
IF Object_ID('$tie.capsule$.EQ_Point_$tie.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[EQ_Point_$tie.businessName];
IF Object_ID('$tie.capsule$.EQ_Latest_$tie.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[EQ_Latest_$tie.businessName];
~*/
        }
/*~
IF Object_ID('$tie.capsule$.Difference_$tie.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[Difference_$tie.businessName];
IF Object_ID('$tie.capsule$.Current_$tie.businessName', 'V') IS NOT NULL
DROP VIEW [$tie.capsule].[Current_$tie.businessName];
IF Object_ID('$tie.capsule$.Point_$tie.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[Point_$tie.businessName];
IF Object_ID('$tie.capsule$.Latest_$tie.businessName', 'V') IS NOT NULL
DROP VIEW [$tie.capsule].[Latest_$tie.businessName];
GO
~*/
    }
}