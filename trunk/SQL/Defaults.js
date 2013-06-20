// this makes the defaults from the tool available in the schema object
for(var d in Defaults) {
    schema[d] = Defaults[d];
}
// this function returns an empty string for null or undefined values
schema.empty = function(string) {
    if(string) return string;
    return '';
}