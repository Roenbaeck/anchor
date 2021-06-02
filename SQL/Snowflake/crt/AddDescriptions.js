/*~
-- DESCRIPTIONS -------------------------------------------------------------------------------------------------------
~*/
var knot;
while (knot = schema.nextKnot()) {
    if(knot.description &&
       knot.description._description &&
       knot.description._description.length > 0) {
/*~
BEGIN TRY
EXEC sp_dropextendedproperty
@name = N'MS_Description',
@level0type = N'Schema', @level0name = '$knot.capsule',
@level1type = N'Table',  @level1name = '$knot.name';
END TRY BEGIN CATCH BEGIN TRY ROLLBACK END TRY BEGIN CATCH END CATCH END CATCH -- workaround for MS bug 658556
EXEC sp_addextendedproperty
@name = N'MS_Description',
@value = '$knot.description._description',
@level0type = N'Schema', @level0name = '$knot.capsule',
@level1type = N'Table',  @level1name = '$knot.name';
GO
~*/
    }
}
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.description &&
       anchor.description._description &&
       anchor.description._description.length > 0) {
/*~
BEGIN TRY
EXEC sp_dropextendedproperty
@name = N'MS_Description',
@level0type = N'Schema', @level0name = '$anchor.capsule',
@level1type = N'Table',  @level1name = '$anchor.name';
END TRY BEGIN CATCH BEGIN TRY ROLLBACK END TRY BEGIN CATCH END CATCH END CATCH -- workaround for MS bug 658556
EXEC sp_addextendedproperty
@name = N'MS_Description',
@value = '$anchor.description._description',
@level0type = N'Schema', @level0name = '$anchor.capsule',
@level1type = N'Table',  @level1name = '$anchor.name';
GO
~*/
    }
    var attribute;
    while (attribute = anchor.nextAttribute()) {
        if(attribute.description &&
           attribute.description._description &&
           attribute.description._description.length > 0) {
/*~
BEGIN TRY
EXEC sp_dropextendedproperty
@name = N'MS_Description',
@level0type = N'Schema', @level0name = '$attribute.capsule',
@level1type = N'Table',  @level1name = '$attribute.positName';
END TRY BEGIN CATCH BEGIN TRY ROLLBACK END TRY BEGIN CATCH END CATCH END CATCH -- workaround for MS bug 658556
EXEC sp_addextendedproperty
@name = N'MS_Description',
@value = '$attribute.description._description',
@level0type = N'Schema', @level0name = '$attribute.capsule',
@level1type = N'Table',  @level1name = '$attribute.positName';
GO
~*/
        }
    }
}
var tie;
while (tie = schema.nextTie()) {
    if(tie.description &&
       tie.description._description &&
       tie.description._description.length > 0) {
/*~
BEGIN TRY
EXEC sp_dropextendedproperty
@name = N'MS_Description',
@level0type = N'Schema', @level0name = '$tie.capsule',
@level1type = N'Table',  @level1name = '$tie.positName';
END TRY BEGIN CATCH BEGIN TRY ROLLBACK END TRY BEGIN CATCH END CATCH END CATCH -- workaround for MS bug 658556
EXEC sp_addextendedproperty
@name = N'MS_Description',
@value = '$tie.description._description',
@level0type = N'Schema', @level0name = '$tie.capsule',
@level1type = N'Table',  @level1name = '$tie.positName';
GO
~*/
    }
    var role;
    while (role = tie.nextRole()) {
        if(role.description &&
           role.description._description &&
           role.description._description.length > 0) {
/*~
BEGIN TRY
EXEC sp_dropextendedproperty
@name = N'MS_Description',
@level0type = N'Schema', @level0name = '$tie.capsule',
@level1type = N'Table',  @level1name = '$tie.positName',
@level2type = N'Column', @level2name = '$role.columnName';
END TRY BEGIN CATCH BEGIN TRY ROLLBACK END TRY BEGIN CATCH END CATCH END CATCH -- workaround for MS bug 658556
EXEC sp_addextendedproperty
@name = N'MS_Description',
@value = '$role.description._description',
@level0type = N'Schema', @level0name = '$tie.capsule',
@level1type = N'Table',  @level1name = '$tie.positName',
@level2type = N'Column', @level2name = '$role.columnName';
GO
~*/
        }
    }
}