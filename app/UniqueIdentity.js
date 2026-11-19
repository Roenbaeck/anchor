// UniqueIdentity: identities for the constructs of a model.
"use strict";

var UniqueIdentity = {
    lastId: 0,
    usedIds: [],
    nextId: function() {
        while(this.usedIds[++this.lastId]);
        this.usedIds[this.lastId] = true;
        return this.lastId;
    },
    takeId: function(id) {
        this.usedIds[id] = true;
        return id;
    }
};
