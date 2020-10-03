var anchor;

while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
        if(schema.EQUIVALENCE) {
/*~
-- Now equivalence perspective ----------------------------------------------------------------------------------------
-- en$anchor.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[en$anchor.name] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE AS RETURN
SELECT
    *
FROM
    [$anchor.capsule].[ep$anchor.name](@equivalent, $schema.metadata.now);
GO
~*/
        } // end of if equivalence
    } // end of if anchor has any attributes
}