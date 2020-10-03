var tie, role, knot;

while (tie = schema.nextTie()) {
    if(schema.EQUIVALENCE) {
/*~
-- Now equivalence perspective ----------------------------------------------------------------------------------------
-- en$tie.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[en$tie.name] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE AS RETURN
SELECT
    *
FROM
    [$tie.capsule].[ep$tie.name](@equivalent, $schema.metadata.now);
GO
~*/
    } // end of if equivalence
}