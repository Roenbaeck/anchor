var anchor;

while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
/*~

-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$anchor.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $anchor.capsule\.n$anchor.name AS
SELECT
    *
FROM
    $anchor.capsule\.p$anchor.name($schema.metadata.now);
~*/
    } // end of if anchor has any attributes
}