// the following builds specific the naming convention of Anchor Modeling, change if you want something else

// set some hard coded defaults if they are missing
schema.metadata.encapsulation = schema.metadata.encapsulation || 'public';
schema.metadata.chronon = schema.metadata.chronon || 'datetime';

// (the common naming convention has to have been read first; the uni-temporal directive reads this one first, and its scripts do not use these)
if(typeof D !== 'undefined') {
// knots get a dummy column too, when there are no metadata columns (anchors and nexuses get theirs in
// the common naming convention); the table definitions have a column there to end their list with
var knot;
while(knot = schema.nextKnot())
    knot.dummyColumnName = knot.mnemonic + D + schema.metadata.dummySuffix;

// nexuses take their identities from a sequence, like anchors and knots do (the common naming convention
// names the sequence of an anchor and a knot); a load can then draw an identity before the row is inserted
var nexus;
while(nexus = schema.nextNexus())
    nexus.identitySequenceName = nexus.name + D + schema.metadata.identitySuffix + D + 'SEQ';

// the identity of a posit (bi and crt) also comes from a sequence, named after the posit table; so every
// identity in a model that is generated has one, whether it is of a knot, anchor, nexus, attribute or tie
var posited, attribute;
while(posited = schema.nextAnchor())
    while(attribute = posited.nextAttribute())
        attribute.identitySequenceName = attribute.positName + D + schema.metadata.identitySuffix + D + 'SEQ';
while(posited = schema.nextNexus())
    while(attribute = posited.nextAttribute())
        attribute.identitySequenceName = attribute.positName + D + schema.metadata.identitySuffix + D + 'SEQ';
var tie;
while(tie = schema.nextTie())
    tie.identitySequenceName = tie.positName + D + schema.metadata.identitySuffix + D + 'SEQ';
}
