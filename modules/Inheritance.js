// global function providing inheritance
function extend(type, supertype){
    for(var member in supertype.prototype)
        if(!type.prototype[member])
            type.prototype[member] = supertype.prototype[member];
}
