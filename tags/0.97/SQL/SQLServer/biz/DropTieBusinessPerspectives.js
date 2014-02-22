if(schema.BUSINESS_VIEWS) {
/*~
-- TIE TEMPORAL BUSINESS PERSPECTIVES ---------------------------------------------------------------------------------
--
~*/
var tie, role, knot;
while (tie = schema.nextTie()) {
/*~
-- Drop perspectives --------------------------------------------------------------------------------------------------
IF Object_ID('Difference_$tie.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[Difference_$tie.businessName];
IF Object_ID('Current_$tie.businessName', 'V') IS NOT NULL
DROP VIEW [$tie.capsule].[Current_$tie.businessName];
IF Object_ID('Point_$tie.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[Point_$tie.businessName];
IF Object_ID('Latest_$tie.businessName', 'V') IS NOT NULL
DROP VIEW [$tie.capsule].[Latest_$tie.businessName];
GO
~*/
}
}