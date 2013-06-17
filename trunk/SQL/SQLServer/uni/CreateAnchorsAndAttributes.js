var anchor;
for(var a = 0; anchor = schema.anchor[schema.anchors[a]]; a++) {
// tilde delimits the sisula code
~
CREATE TABLE $anchor.name (
    col1 int
);
~
var attribute;
for(var b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
// inner sisula code
~
CREATE TABLE ${attribute.name}$
    col int not null
);
~
}}