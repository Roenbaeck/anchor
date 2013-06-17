// sets positions, first, last

var knot;
for(var k = 0; knot = schema.knot[schema.knots[k]]; k++) {
    if(k == 0) knot.first = true;
    if(k == schema.knots.length - 1) knot.last = true;
    knot.position = k;
}

var anchor;
for(var a = 0; anchor = schema.anchor[schema.anchors[a]]; a++) {
    if(a == 0) anchor.first = true;
    if(a == schema.anchors.length - 1) anchor.last = true;
    anchor.position = a;
    var attribute;
    for(var b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
        if(b == 0) attribute.first = true;
        if(b == anchor.attributes.length - 1) attribute.last = true;
        attribute.position = b;
    }
}

var tie;
for(var t = 0; tie = schema.tie[schema.ties[t]]; t++) {
    var key, anchorRole, knotRole;
    for(var r = 0; r < tie.roles.length; r++) {
        key = tie.roles[r];
        anchorRole = tie.anchorRole ? tie.anchorRole[key] : null;
        knotRole = tie.knotRole ? tie.knotRole[key] : null;
        var role = anchorRole ? anchorRole : knotRole;
        if(r == 0) role.first = true;
        if(r == tie.roles.length - 1) role.last = true;
        role.position = r;
    }
}
