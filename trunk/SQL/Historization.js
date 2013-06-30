var anchor;
for(var a = 0; anchor = schema.anchor[schema.anchors[a]]; a++) {
    anchor.historizedAttributes = [];
    var attribute;
    for(var b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
        if(attribute.timeRange)
            anchor.historizedAttributes.push(anchor.attributes[b]);
    }
}
schema.historizedTies = [];
var tie;
for(var t = 0; tie = schema.tie[schema.ties[t]]; t++) {
    if(tie.timeRange)
        schema.historizedTies.push(schema.ties[t]);
}
