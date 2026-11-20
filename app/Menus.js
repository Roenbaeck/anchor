// Menus: the keyboard (and the click) side of the menus in the bar. With a mouse a menu opens when the pointer is over it (CSS);
// this adds what the keyboard and a touch screen need, in the way of a menu bar:
//   Tab                  goes to the menu bar once (one of the names has tabindex 0, the others -1: the roving tabindex)
//   Left, Right          between the names; if a menu is open, the next one opens
//   Down, Up, Enter, Space   on a name: opens the menu and goes to its first (or last) item
//   Down, Up, Home, End  between the items; a letter goes to the next item that starts with it
//   Enter, Space         on an item: does it (Wiring), and the menu closes
//   Escape               closes the menu, and the focus returns to its name
//   Tab                  leaves the menu and closes it
// A click on a name opens the menu and a click on it again closes it, which is how it works where there is no pointer to hover with.
import { Actions } from './Actions.js';
export var Menus = {
    menus: function() {
        return Array.prototype.slice.call(document.querySelectorAll('#header .menu'));
    },
    label: function(menu) {
        return menu.querySelector(':scope > .menulabel');
    },
    items: function(menu) {
        return Array.prototype.slice.call(menu.querySelectorAll(':scope > .submenu > [role=menuitem]'));
    },
    isOpen: function(menu) {
        return menu.classList.contains('open');
    },
    setExpanded: function(menu, expanded) {
        Menus.label(menu).setAttribute('aria-expanded', expanded ? 'true' : 'false');
    },
    open: function(menu, which) {
        Menus.menus().forEach(function(other) { if(other !== menu) Menus.close(other); });
        menu.classList.add('open');
        Menus.setExpanded(menu, true);
        var items = Menus.items(menu);
        if(which === 'first' && items.length) items[0].focus();
        if(which === 'last' && items.length) items[items.length - 1].focus();
    },
    close: function(menu, refocus) {
        menu.classList.remove('open');
        Menus.setExpanded(menu, false);
        if(refocus) Menus.label(menu).focus();
    },
    closeAll: function() {
        Menus.menus().forEach(function(menu) { Menus.close(menu); });
    },
    // the name that has the focus, or the one that the item that has it belongs to
    current: function() {
        var active = document.activeElement;
        return active && active.closest ? active.closest('#header .menu') : null;
    },
    // moves to the name before or after, and opens its menu if one was open
    sideways: function(menu, step, keepOpen) {
        var menus = Menus.menus(), next = menus[(menus.indexOf(menu) + step + menus.length) % menus.length];
        Menus.rove(next);
        Menus.label(next).focus();
        Menus.close(menu);
        if(keepOpen) Menus.open(next, 'first');
    },
    // exactly one of the names can be reached with Tab: the one that had the focus last
    rove: function(menu) {
        Menus.menus().forEach(function(other) { Menus.label(other).setAttribute('tabindex', other === menu ? '0' : '-1'); });
    },
    init: function() {
        var menus = Menus.menus();
        menus.forEach(function(menu, i) {
            var label = Menus.label(menu), list = menu.querySelector(':scope > .submenu');
            label.setAttribute('tabindex', i === 0 ? '0' : '-1');
            // hovering shows the menu, which a screen reader is told
            menu.addEventListener('mouseenter', function() { Menus.setExpanded(menu, true); }, false);
            menu.addEventListener('mouseleave', function() { if(!Menus.isOpen(menu)) Menus.setExpanded(menu, false); }, false);
            label.addEventListener('focus', function() { Menus.rove(menu); }, false);
            label.addEventListener('click', function(event) {
                if(Menus.isOpen(menu)) Menus.close(menu);
                else Menus.open(menu, event.detail === 0 ? 'first' : null); // detail 0: Enter or Space, not a pointer
            }, false);
            label.addEventListener('keydown', function(event) {
                switch(event.key) {
                    case 'ArrowDown': Menus.open(menu, 'first'); break;
                    case 'ArrowUp': Menus.open(menu, 'last'); break;
                    case 'ArrowRight': Menus.sideways(menu, 1, Menus.isOpen(menu)); break;
                    case 'ArrowLeft': Menus.sideways(menu, -1, Menus.isOpen(menu)); break;
                    case 'Home': Menus.rove(menus[0]); Menus.label(menus[0]).focus(); break;
                    case 'End': Menus.rove(menus[menus.length - 1]); Menus.label(menus[menus.length - 1]).focus(); break;
                    case 'Escape': if(!Menus.isOpen(menu)) return; Menus.close(menu, true); break;
                    default: return;
                }
                event.preventDefault();
                event.stopPropagation();
            }, false);
            list.addEventListener('keydown', function(event) {
                var items = Menus.items(menu), at = items.indexOf(document.activeElement);
                switch(event.key) {
                    case 'ArrowDown': items[(at + 1) % items.length].focus(); break;
                    case 'ArrowUp': items[(at - 1 + items.length) % items.length].focus(); break;
                    case 'Home': items[0].focus(); break;
                    case 'End': items[items.length - 1].focus(); break;
                    case 'ArrowRight': Menus.sideways(menu, 1, true); break;
                    case 'ArrowLeft': Menus.sideways(menu, -1, true); break;
                    case 'Escape': Menus.close(menu, true); break;
                    case 'Tab': Menus.close(menu); return; // the browser moves on
                    case 'Enter': case ' ':
                        // Wiring does what the item says (it listens further out); then the menu closes, and the focus goes
                        // back to the name unless what the item did has taken it somewhere else (a dialog)
                        setTimeout(function() {
                            var stays = list.contains(document.activeElement);
                            Menus.close(menu, stays);
                        }, 0);
                        return;
                    default:
                        if(event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                            var letter = event.key.toLowerCase(), n = items.length, k;
                            for(k = 1; k <= n; k++) {
                                var candidate = items[(at + k) % n];
                                if(candidate.textContent.trim().toLowerCase().indexOf(letter) === 0) {
                                    candidate.focus();
                                    event.preventDefault();
                                    event.stopPropagation();
                                    break;
                                }
                            }
                        }
                        return;
                }
                event.preventDefault();
                event.stopPropagation();
            }, false);
            // a click on an item closes the menu that a click or a key opened (one that the pointer holds open closes as it leaves)
            list.addEventListener('click', function() { Menus.close(menu); }, false);
        });
        // a click anywhere else closes what is open
        document.addEventListener('click', function(event) {
            var inside = event.target.closest && event.target.closest('#header .menu');
            Menus.menus().forEach(function(menu) { if(menu !== inside) Menus.close(menu); });
        }, false);
        // the keys of the modeler (a, t, d ...) must not act on what is typed in the bar
        document.getElementById('header').addEventListener('focusin', function() { Actions.stopKeyboardEvents(); }, false);
    }
};
