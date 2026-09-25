// the following builds specific the naming convention of Anchor Modeling, change if you want something else

// set some hard coded defaults if they are missing
schema.metadata.encapsulation = schema.metadata.encapsulation || 'dbo';
schema.metadata.chronon = schema.metadata.chronon || 'datetime';

// returns the description of a construct as an escaped string literal body, or null if it has none
var describe = function(construct) {
    if(!construct || !construct.description || !construct.description._description)
        return null;
    var text = String(construct.description._description).replace(/\s+/g, ' ').trim();
    if(text.length == 0)
        return null;
    return text.replace(/\\/g, '\\\\').replace(/'/g, "''");
};
// returns a COMMENT clause for a view column, since view column comments can only be given when the view is created
var columnCommentClause = function(construct) {
    var comment = describe(construct);
    return comment ? " COMMENT '" + comment + "'" : '';
};
// returns a COMMENT = clause for a view, placed before AS in the view definition
var viewCommentClause = function(construct) {
    var comment = describe(construct);
    return comment ? "COMMENT = '" + comment + "'" : '';
};
