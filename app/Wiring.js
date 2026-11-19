// Wiring: what the controls in the markup do, said with data attributes instead of code in the markup.
"use strict";

//   data-action="Actions.newModel"         clicking the element (or pressing Enter or Space on it, if it can be reached with
//                                          Tab) calls that function, with the object it belongs to as this
//   data-args='["example.xml", true]'      the arguments, as JSON (for a setting they come after the value)
//   data-setting="setDefaultIdentity"      a field that calls Settings.<name>(value): when a text or number field is left, when
//                                          a list or a check box is changed (a check box gives 'true' or 'false')
//
// The functions are looked up when they are called, so what is named here can be replaced afterwards, as the tests do.
var Wiring = {
    // 'Actions.newModel' gives the function and the object that it is called on
    resolve: function(path) {
        var parts = path.split('.'), owner = window, i;
        for(i = 0; i < parts.length - 1; i++)
            owner = owner[parts[i]];
        return { owner: owner, fn: owner[parts[parts.length - 1]] };
    },
    args: function(element) {
        var raw = element.getAttribute('data-args');
        return raw ? JSON.parse(raw) : [];
    },
    call: function(path, args) {
        var target = Wiring.resolve(path);
        if(typeof target.fn !== 'function')
            throw new Error('Wiring: ' + path + ' is not a function');
        return target.fn.apply(target.owner, args);
    },
    activate: function(element) {
        Wiring.call(element.getAttribute('data-action'), Wiring.args(element));
    },
    // a field gives its value to the setting that it is for
    setting: function(field) {
        var value = field.type === 'checkbox' ? (field.checked ? 'true' : 'false') : field.value;
        Wiring.call('Settings.' + field.getAttribute('data-setting'), [value].concat(Wiring.args(field)));
    },
    // text and number fields tell their setting when they are left; lists and check boxes when they are changed
    reportsOnBlur: function(field) {
        return field.tagName === 'INPUT' && field.type !== 'checkbox';
    },
    init: function() {
        document.addEventListener('click', function(event) {
            var element = event.target.closest && event.target.closest('[data-action]');
            if(element) Wiring.activate(element);
        }, false);
        document.addEventListener('keydown', function(event) {
            var element = event.target.closest && event.target.closest('[data-action][tabindex]');
            if(element && element === event.target && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                Wiring.activate(element);
            }
        }, false);
        document.addEventListener('change', function(event) {
            var field = event.target;
            if(field.hasAttribute && field.hasAttribute('data-setting') && !Wiring.reportsOnBlur(field)) Wiring.setting(field);
        }, false);
        // blur does not bubble, but it can be caught on the way down
        document.addEventListener('blur', function(event) {
            var field = event.target;
            if(field.hasAttribute && field.hasAttribute('data-setting') && Wiring.reportsOnBlur(field)) Wiring.setting(field);
        }, true);
        Wiring.search();
    },
    // the search filter and the list of nodes
    search: function() {
        var filter = document.getElementById('searchFilter'), selector = document.getElementById('nodeSelector');
        // the keys of the modeler must not act on the letters that are typed in the filter
        filter.addEventListener('focus', function() { Actions.stopKeyboardEvents(); }, false);
        filter.addEventListener('blur', function() { Actions.populateSelector(selector, this.value); }, false);
        selector.addEventListener('mouseover', function() { Actions.populateSelector(this, filter.value); }, false);
        selector.addEventListener('change', function() { Actions.selectNode(this.value); }, false);
    }
};
