// the following builds specific the naming convention of Anchor Modeling, change if you want something else

// set some hard coded defaults if they are missing
schema.metadata.encapsulation = schema.metadata.encapsulation || 'dbo';
schema.metadata.chronon = schema.metadata.chronon || 'datetime';

// knots get a dummy column too when there are no metadata columns, as anchors and nexuses do in the common naming
// convention: SQL Server cannot insert several rows at once into a table that has nothing but an identity column,
// so the identity table of an equivalent knot gets a column to insert into
var knot;
while(knot = schema.nextKnot())
    knot.dummyColumnName = knot.mnemonic + D + schema.metadata.dummySuffix;
