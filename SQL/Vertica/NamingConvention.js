// the following builds specific the naming convention of Anchor Modeling, change if you want something else

// set some hard coded defaults if they are missing
schema.metadata.encapsulation = schema.metadata.encapsulation || 'public';
schema.metadata.chronon = schema.metadata.chronon || 'datetime';
schema.metadata.identityProperty = 'IDENTITY(1,1)'