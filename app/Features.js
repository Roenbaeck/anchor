// Features: what the target database and temporalization implement.
import { Model } from './Model.js';
import { Actions } from './Actions.js';
// What the templates of the selected database implement for the selected temporalization. The table is in
// SQL/Helpers.js (FEATURES), which the generators read, and is read from there. A feature that is not implemented
// is hidden, in the settings and in what can be edited, and ignored by the generated SQL; what a model says about
// it stays in the model. Until the table has been read, and for a database that it does not list, nothing is hidden.
export var Features = {
    table: null,
    names: ["equivalence", "encryption"],
    load: async function() {
        try {
            var text = await Actions.getDirectives("SQL/Helpers.js");
            var found = /\/\*features\*\/([\s\S]*?)\/\*end features\*\//.exec(text);
            if(!found) throw new Error("no table of features in SQL/Helpers.js");
            this.table = JSON.parse(found[1]);
        }
        catch(e) {
            this.table = null;
            if(console) console.warn("The table of features could not be read, so nothing is hidden:", e);
        }
    },
    // whether the selected database and temporalization implement a feature (also true for no feature)
    has: function(feature) {
        if(!feature || !this.table) return true;
        var database = this.table[Defaults.databaseTarget];
        var features = database ? database[Defaults.temporalization] : null;
        return !features || features[feature] !== false;
    },
    // hides what is not implemented: body classes that application.css hides the settings with
    apply: function() {
        var body = document.body;
        for(var i = 0; i < this.names.length; i++)
            body.classList.toggle("no-" + this.names[i], !this.has(this.names[i]));
        // the settings of equivalence only show when equivalence is on, and implemented
        body.classList.toggle("equivalence", Defaults.equivalence === "true" && this.has("equivalence"));
    },
    // says in the console what the model has that the generated SQL will ignore
    report: function() {
        if(!this.table || typeof Model === "undefined" || !Model.components) return;
        var equivalent = 0, encrypted = 0;
        for(var i = 0; i < Model.components.length; i++) {
            var component = Model.components[i];
            if(component.equivalent === true) equivalent++;
            if(component.encryptionGroup && String(component.encryptionGroup).trim()) encrypted++;
        }
        var where = Defaults.databaseTarget + " " + Defaults.temporalization;
        if(equivalent && !this.has("equivalence"))
            console.warn("[Features] " + equivalent + " items are equivalent, which " + where + " does not implement: the generated SQL ignores it");
        if(encrypted && !this.has("encryption"))
            console.warn("[Features] " + encrypted + " items are in an encryption group, which " + where + " does not implement: the generated SQL stores them as they are");
    }
};
