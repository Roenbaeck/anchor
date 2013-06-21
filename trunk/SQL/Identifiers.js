var tie;
for(var t = 0; tie = schema.tie[schema.ties[t]]; t++) {
    tie.identifiers = [];
    var key, role, anchorRole, knotRole;
    for(var r = 0; r < tie.roles.length; r++) {
        key = tie.roles[r];
        anchorRole = tie.anchorRole ? tie.anchorRole[key] : null;
        knotRole = tie.knotRole ? tie.knotRole[key] : null;
        role = anchorRole || knotRole;
        if(role.identifier == 'true')
            tie.identifiers.push(key);
    }
}