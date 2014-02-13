/*~
-- DESCRIPTIONS -------------------------------------------------------------------------------------------------------
--
-- Adds descriptions to tables and columns in the database.
--
 ~*/
var knot;
while (knot = schema.nextKnot()) {
    if(knot.description && knot.description.length > 0) {
/*~
EXEC sp_addextendedproperty
@name = N'MS_Description',
@value = '$knot.description',
@level0type = N'Schema', @level0name = '$knot.capsule',
@level1type = N'Table',  @level1name = '$knot.name';
GO
~*/
    }
}