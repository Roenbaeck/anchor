if(BUSINESS_VIEWS) {
/*~
-- ANCHOR TEMPORAL BUSINESS PERSPECTIVES ------------------------------------------------------------------------------
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
/*~
-- Drop perspectives --------------------------------------------------------------------------------------------------
IF Object_ID('Difference_$anchor.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[Difference_$anchor.businessName];
IF Object_ID('Current_$anchor.businessName', 'V') IS NOT NULL
DROP VIEW [$anchor.capsule].[Current_$anchor.businessName];
IF Object_ID('Point_$anchor.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[Point_$anchor.businessName];
IF Object_ID('Latest_$anchor.businessName', 'V') IS NOT NULL
DROP VIEW [$anchor.capsule].[Latest_$anchor.businessName];
GO
~*/
}
}