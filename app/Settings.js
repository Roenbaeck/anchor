// Settings: the settings and defaults, and the fields that show them.
import { DEBUG, SVGLayer, VERSION, setDebug } from './config.js';
import { Model } from './Model.js';
import { DrawingEngine } from './DrawingEngine.js';
import { Editables } from './Editables.js';
import { Attribute } from './Attribute.js';
import { Anchor } from './Anchor.js';
import { Knot } from './Knot.js';
import { Tie } from './Tie.js';
import { Features } from './Features.js';
import { init } from './init.js';
export var Settings = {
    // default values for some 'global' settings
    calculations: 'simple',
    showMnemonics: false,
    showCardinalities: true,
    init: function() {
        document.getElementById('damping').value = ((1 - LayoutEngine.damping) * 100).toFixed(0);
        document.getElementById('longRangeEffect').value = (LayoutEngine.longRangeEffect * 100).toFixed(0);
        document.getElementById('fuzziness').value = (LayoutEngine.fuzziness * 100).toFixed(0);
        document.getElementById('normalDistance').value = LayoutEngine.normalDistance.toFixed(0);
        document.getElementById('stoppingVelocity').value = LayoutEngine.stoppingVelocity.toFixed(1);
        document.getElementById('minimumStartingVelocity').value = LayoutEngine.minimumStartingVelocity.toFixed(1);
        document.getElementById('maximumStartingVelocity').value = LayoutEngine.maximumStartingVelocity.toFixed(1);
        document.getElementById('partitionFactor').value = LayoutEngine.partitionFactor.toFixed(0);
        document.getElementById('stiffness').value = LayoutEngine.stiffness.toFixed(1);
        document.getElementById('temporalization').value = Defaults.temporalization;
        document.getElementById('database').value = Defaults.databaseTarget;
        document.getElementById('miniatureFramesBetweenRefresh').value = DrawingEngine.miniatureFramesBetweenRefresh;
        document.getElementById('calculations').value = this.calculations;
        document.getElementById('encapsulation').value = Defaults.encapsulation;
        document.getElementById('defaultIdentity').value = Defaults.identity;
        document.getElementById('defaultChronon').value = Defaults.chronon;
        document.getElementById('defaultNow').value = Defaults.now;
        document.getElementById('defaultChangingRange').value = Defaults.changingRange;
        document.getElementById('deletability').checked = Defaults.deletability === 'true';
        document.getElementById('restatability').checked = Defaults.restatability === 'true';
        document.getElementById('idempotency').checked = Defaults.idempotency === 'true';
        document.getElementById('metadataUsage').checked = Defaults.metadataUsage === 'true';
        document.getElementById('businessViews').checked = Defaults.businessViews === 'true';
        document.getElementById('triggers').checked = Defaults.triggers === 'true';
        document.getElementById('naturalKeyAttributes').checked = Defaults.naturalKeyAttributes === 'true';
        document.getElementById('decisiveness').checked = Defaults.decisiveness === 'true';
        document.getElementById('entityIntegrity').checked = Defaults.entityIntegrity === 'true';
        document.getElementById('equivalence').checked = Defaults.equivalence === 'true';
        document.getElementById('partitioning').checked = Defaults.partitioning === 'true';
        document.getElementById('changingSuffix').value = Defaults.changingSuffix;
        document.getElementById('checksumSuffix').value = Defaults.checksumSuffix;
        document.getElementById('identitySuffix').value = Defaults.identitySuffix;
        document.getElementById('deletablePrefix').value = Defaults.deletablePrefix;
        document.getElementById('deletionSuffix').value = Defaults.deletionSuffix;
        document.getElementById('equivalentSuffix').value = Defaults.equivalentSuffix;
        document.getElementById('equivalentRange').value = Defaults.equivalentRange;
        document.getElementById('metadataPrefix').value = Defaults.metadataPrefix;
        document.getElementById('metadataType').value = Defaults.metadataType;
        document.getElementById('encryptionGroup').value = Defaults.encryptionGroup;
        document.getElementById('naming').value = Defaults.naming;
        // Populate temporalization-dependent inputs (static elements always present)
        document.getElementById('positIdentity').value = Defaults.positIdentity;
        document.getElementById('positingRange').value = Defaults.positingRange;
        document.getElementById('positingSuffix').value = Defaults.positingSuffix;
        document.getElementById('positorRange').value = Defaults.positorRange;
        document.getElementById('positorSuffix').value = Defaults.positorSuffix;
        document.getElementById('reliabilityRange').value = Defaults.reliabilityRange;
        document.getElementById('reliabilitySuffix').value = Defaults.reliabilitySuffix;
        document.getElementById('defaultReliability').value = Defaults.defaultReliability;
        document.getElementById('deleteReliability').value = Defaults.deleteReliability;
        document.getElementById('assertionSuffix').value = Defaults.assertionSuffix;
        document.getElementById('assertiveness').checked = Defaults.assertiveness === 'true';
    },
    resetDefaults: function(warn) {
        var reset = false;
        if(warn)
            reset = confirm(
                    "Are you sure you want to reset to default values? " +
                    "This will overwrite any changes you have made."
            );
        else
            reset = true;
        if(reset) {
            this.setEncapsulation('dbo');
            this.setPrivacy('Ignore');
            this.setDefaultIdentity('int');
            this.setDefaultChronon('datetime2(7)');
            this.setDefaultNow('sysdatetime()');
            this.setDefaultChangingRange('datetime');
            this.setMetadataPrefix('Metadata');
            this.setDeletablePrefix('Deletable');
            this.setDeletionSuffix('Deleted');
            this.setMetadataType('int');
            this.setEquivalentSuffix('EQ');
            this.setEquivalentRange('tinyint');
            this.setDeletability('false');
            this.setRestatability('true');
            this.setIdempotency('false');
            this.setAssertiveness('true');
            this.setMetadataUsage('true');
            this.setBusinessViews('false');
            this.setKnotAliases('false');
            this.setTriggers('true');
            this.setNaturalKeyAttributes('false');
            this.setDecisiveness('true');
            this.setEquivalence('false');
            this.setEquivalentRange('tinyint');
            this.setEquivalentSuffix('EQ');
            this.setChangingSuffix('ChangedAt');
            this.setIdentitySuffix('ID');
            this.setPositIdentityRange('int');
            this.setPositingRange('datetime');
            this.setPositingSuffix('PositedAt');
            this.setPositorRange('tinyint');
            this.setPositorSuffix('Positor');
            this.setReliabilityRange('decimal(5,2)');
            this.setReliabilitySuffix('Reliability');
            this.setDefaultReliability('1');
            this.setDeleteReliability('0');
            this.setAssertionSuffix('Assertion');
            this.setPartitioning('false');
            this.setEntityIntegrity('true');
            this.setTemporalization('uni');
            this.setDeletability('false');
            this.setEncryptionGroup('');
            this.setDatabase('SQLServer', false);
            this.setNaming('improved');
            this.init();
        }
    },
    resetSettings: function(warn) {
        var reset = false;
        if(warn)
            reset = confirm(
                    "Are you sure you want to reset to default values? " +
                    "This will overwrite any changes you have made."
            );
        else
            reset = true;
        if(reset) {
            this.setDamping(4);
            this.setLongRangeEffect(25);
            this.setFuzziness(10);
            this.setNormalDistance(30);
            this.setStoppingVelocity(0.1);
            this.setMinimumStartingVelocity(1);
            this.setMaximumStartingVelocity(5);
            this.setPartitionFactor(15);
            this.setStiffness(1);
            this.setMiniRate(50);
            this.setCalculations('simple');
            NodeType.mass[NodeType.KNOT] = 5;
            NodeType.charge[NodeType.KNOT] = 1;
            NodeType.mass[NodeType.ANCHOR] = 2;
            NodeType.charge[NodeType.ANCHOR] = 1;
            NodeType.mass[NodeType.ATTRIBUTE] = 3;
            NodeType.charge[NodeType.ATTRIBUTE] = 1;
            NodeType.mass[NodeType.TIE] = 5;
            NodeType.charge[NodeType.TIE] = 1;
            NodeType.mass[NodeType.EDGE] = 2;
            NodeType.charge[NodeType.EDGE] = 4;
            this.init();
        }
    },
    storeSettings: function(storage) {
        storage.setItem("version", VERSION);
        storage.setItem("damping", (1 - LayoutEngine.damping) * 100);
        storage.setItem("longRangeEffect", LayoutEngine.longRangeEffect * 100);
        storage.setItem("fuzziness", LayoutEngine.fuzziness * 100);
        storage.setItem("normalDistance", LayoutEngine.normalDistance);
        storage.setItem("stoppingVelocity", LayoutEngine.stoppingVelocity);
        storage.setItem("minimumStartingVelocity", LayoutEngine.minimumStartingVelocity);
        storage.setItem("maximumStartingVelocity", LayoutEngine.maximumStartingVelocity);
        storage.setItem("partitionFactor", LayoutEngine.partitionFactor);
        storage.setItem("stiffness", LayoutEngine.stiffness);
        storage.setItem("temporalization", Defaults.temporalization);
        storage.setItem("database", Defaults.databaseTarget);
        storage.setItem("miniatureFramesBetweenRefresh", DrawingEngine.miniatureFramesBetweenRefresh);
        storage.setItem("calculations", this.calculations);
        storage.setItem("encapsulation", Defaults.encapsulation);
        storage.setItem("privacy", Defaults.privacy);
        storage.setItem("defaultIdentity", Defaults.identity);
        storage.setItem("defaultChronon", Defaults.chronon);
        storage.setItem("defaultNow", Defaults.now);
        storage.setItem("defaultChangingRange", Defaults.changingRange);
        storage.setItem("deletablePrefix", Defaults.deletablePrefix);
        storage.setItem("deletionSuffix", Defaults.deletionSuffix);
        storage.setItem("metadataPrefix", Defaults.metadataPrefix);
        storage.setItem("metadataType", Defaults.metadataType);
        storage.setItem("equivalentSuffix", Defaults.equivalentSuffix);
        storage.setItem("equivalentRange", Defaults.equivalentRange);
        storage.setItem("metadataUsage", Defaults.metadataUsage);
        storage.setItem("businessViews", Defaults.businessViews);
        storage.setItem("triggers", Defaults.triggers);
        storage.setItem("naturalKeyAttributes", Defaults.naturalKeyAttributes);
        storage.setItem("decisiveness", Defaults.decisiveness);
        storage.setItem("equivalence", Defaults.equivalence);
        storage.setItem("deletability", Defaults.deletability);
        storage.setItem("restatability", Defaults.restatability);
        storage.setItem("idempotency", Defaults.idempotency);
        storage.setItem("assertiveness", Defaults.assertiveness);
        storage.setItem("changingSuffix", Defaults.changingSuffix);
        storage.setItem("identitySuffix", Defaults.identitySuffix);
        storage.setItem("positIdentity", Defaults.positIdentity);
        storage.setItem("positingRange", Defaults.positingRange);
        storage.setItem("positingSuffix", Defaults.positingSuffix);
        storage.setItem("positorRange", Defaults.positorRange);
        storage.setItem("positorSuffix", Defaults.positorSuffix);
        storage.setItem("checksumSuffix", Defaults.checksumSuffix);
        storage.setItem("reliabilityRange", Defaults.reliabilityRange);
        storage.setItem("reliabilitySuffix", Defaults.reliabilitySuffix);
        storage.setItem("defaultReliability", Defaults.defaultReliability);
        storage.setItem("deleteReliability", Defaults.deleteReliability);
        storage.setItem("encryptionGroup", Defaults.encryptionGroup);
        storage.setItem("assertionSuffix", Defaults.assertionSuffix);
        storage.setItem("partitioning", Defaults.partitioning);
        storage.setItem("entityIntegrity", Defaults.entityIntegrity);
        storage.setItem("naming", Defaults.naming);
        storage.setItem("knotMass", NodeType.mass[NodeType.KNOT]);
        storage.setItem("knotCharge", NodeType.charge[NodeType.KNOT]);
        storage.setItem("anchorMass", NodeType.mass[NodeType.ANCHOR]);
        storage.setItem("anchorCharge", NodeType.charge[NodeType.ANCHOR]);
        storage.setItem("attributeMass", NodeType.mass[NodeType.ATTRIBUTE]);
        storage.setItem("attributeCharge", NodeType.charge[NodeType.ATTRIBUTE]);
        storage.setItem("tieMass", NodeType.mass[NodeType.TIE]);
        storage.setItem("tieCharge", NodeType.charge[NodeType.TIE]);
        storage.setItem("edgeMass", NodeType.mass[NodeType.EDGE]);
        storage.setItem("edgeCharge", NodeType.charge[NodeType.EDGE]);
    },
    loadSettings: function(storage) {
        if(storage.getItem("version") != VERSION) {
            this.resetDefaults(false);
            this.resetSettings(false);
        }
        else {
            this.setDamping(storage.getItem('damping') || 4);
            this.setLongRangeEffect(storage.getItem('longRangeEffect') || 25);
            this.setFuzziness(storage.getItem('fuzziness') || 10);
            this.setNormalDistance(storage.getItem('normalDistance') || 30);
            this.setStoppingVelocity(storage.getItem('stoppingVelocity') || 0.1);
            this.setMinimumStartingVelocity(storage.getItem('minimumStartingVelocity') || 1);
            this.setMaximumStartingVelocity(storage.getItem('maximumStartingVelocity') || 5);
            this.setPartitionFactor(storage.getItem('partitionFactor') || 15);
            this.setStiffness(storage.getItem('stiffness') || 1);
            this.setDatabase(storage.getItem('database') || 'SQLServer', false);
            this.setMiniRate(storage.getItem('miniatureFramesBetweenRefresh') || 50);
            this.setCalculations(storage.getItem('calculations') || 'simple');
            this.setEncapsulation(storage.getItem('encapsulation') || Defaults.encapsulation);
            this.setPrivacy(storage.getItem('privacy') || Defaults.privacy);
            this.setDefaultIdentity(storage.getItem('defaultIdentity') || Defaults.identity);
            this.setDefaultChronon(storage.getItem('defaultChronon') || Defaults.chronon);
            this.setDefaultNow(storage.getItem('defaultNow') || Defaults.now);
            this.setDefaultChangingRange(storage.getItem('defaultChangingRange') || Defaults.changingRange);
            this.setDeletablePrefix(storage.getItem('deletablePrefix') || Defaults.deletablePrefix);
            this.setDeletionSuffix(storage.getItem('deletionSuffix') || Defaults.deletionSuffix);
            this.setMetadataPrefix(storage.getItem('metadataPrefix') || Defaults.metadataPrefix);
            this.setMetadataType(storage.getItem('metadataType') || Defaults.metadataType);
            this.setEquivalentRange(storage.getItem('equivalentRange') || Defaults.equivalentRange);
            this.setEquivalentSuffix(storage.getItem('equivalentSuffix') || Defaults.equivalentSuffix);
            this.setMetadataUsage(storage.getItem('metadataUsage') || Defaults.metadataUsage);
            this.setMetadataType(storage.getItem('metadataType') || Defaults.metadataType);
            this.setMetadataPrefix(storage.getItem('metadataPrefix') || Defaults.metadataPrefix);
            this.setBusinessViews(storage.getItem('businessViews') || Defaults.businessViews);
            this.setKnotAliases(storage.getItem('knotAliases') || Defaults.knotAliases);
            this.setTriggers(storage.getItem('triggers') || Defaults.triggers);
            this.setNaturalKeyAttributes(storage.getItem('naturalKeyAttributes') || Defaults.naturalKeyAttributes);
            this.setDecisiveness(storage.getItem('decisiveness') || Defaults.decisiveness);
            this.setEquivalence(storage.getItem('equivalence') || Defaults.equivalence);
            this.setEquivalentRange(storage.getItem('equivalentRange') || Defaults.equivalentRange);
            this.setEquivalentSuffix(storage.getItem('equivalentSuffix') || Defaults.equivalentSuffix);
            this.setChangingSuffix(storage.getItem('changingSuffix') || Defaults.changingSuffix);
            this.setIdentitySuffix(storage.getItem('identitySuffix') || Defaults.identitySuffix);
            this.setPositIdentityRange(storage.getItem('positIdentity') || Defaults.positIdentity);
            this.setPositingRange(storage.getItem('positingRange') || Defaults.positingRange);
            this.setPositingSuffix(storage.getItem('positingSuffix') || Defaults.positingSuffix);
            this.setPositorRange(storage.getItem('positorRange') || Defaults.positorRange);
            this.setPositorSuffix(storage.getItem('positorSuffix') || Defaults.positorSuffix);
            this.setChecksumSuffix(storage.getItem('checksumSuffix') || Defaults.checksumSuffix);
            this.setReliabilityRange(storage.getItem('reliabilityRange') || Defaults.reliabilityRange);
            this.setReliabilitySuffix(storage.getItem('reliabilitySuffix') || Defaults.reliabilitySuffix);
            this.setDefaultReliability(storage.getItem('defaultReliability') || Defaults.defaultReliability);
            this.setDeleteReliability(storage.getItem('deleteReliability') || Defaults.deleteReliability);
            this.setAssertionSuffix(storage.getItem('assertionSuffix') || Defaults.assertionSuffix);
            this.setPartitioning(storage.getItem('partitioning') || Defaults.partitioning);
            this.setEntityIntegrity(storage.getItem('entityIntegrity') || Defaults.entityIntegrity);
            this.setDeletability(storage.getItem('deletability') || Defaults.deletability);
            this.setEncryptionGroup(storage.getItem('encryptionGroup') || Defaults.encryptionGroup);
            this.setRestatability(storage.getItem('restatability') || Defaults.restatability);
            this.setIdempotency(storage.getItem('idempotency') || Defaults.idempotency);
            this.setAssertiveness(storage.getItem('assertiveness') || Defaults.assertiveness);
            this.setNaming(storage.getItem('naming') || Defaults.naming);
            NodeType.mass[NodeType.KNOT] = 1 * storage.getItem('knotMass') || 5;
            NodeType.charge[NodeType.KNOT] = 1 * storage.getItem('knotCharge') || 1;
            NodeType.mass[NodeType.ANCHOR] = 1 * storage.getItem('anchorMass') || 2;
            NodeType.charge[NodeType.ANCHOR] = 1 * storage.getItem('anchorCharge') || 1;
            NodeType.mass[NodeType.ATTRIBUTE] = 1 * storage.getItem('attributeMass') || 3;
            NodeType.charge[NodeType.ATTRIBUTE] = 1 * storage.getItem('attributeCharge') || 1;
            NodeType.mass[NodeType.TIE] = 1 * storage.getItem('tieMass') || 5;
            NodeType.charge[NodeType.TIE] = 1 * storage.getItem('tieCharge') || 1;
            NodeType.mass[NodeType.EDGE] = 1 * storage.getItem('edgeMass') || 2;
            NodeType.charge[NodeType.EDGE] = 1 * storage.getItem('edgeCharge') || 4;
            // must be done after Defaults have been populated with previously stored values
            this.setTemporalization(storage.getItem('temporalization') || Defaults.temporalization);
        }
        this.init();
    },
    setPositIdentityRange: function(value) {
        Defaults.positIdentity = value;
    },
    setPositingRange: function(value) {
        Defaults.positingRange = value;
    },
    setPositingSuffix: function(value) {
        Defaults.positingSuffix = value;
    },
    setPositorRange: function(value) {
        Defaults.positorRange = value;
    },
    setPositorSuffix: function(value) {
        Defaults.positorSuffix = value;
    },
    setChecksumSuffix: function(value) {
        Defaults.checksumSuffix = value;
    },
    setReliabilityRange: function(value) {
        Defaults.reliabilityRange = value;
    },
    setReliabilitySuffix: function(value) {
        Defaults.reliabilitySuffix = value;
    },
    setDefaultReliability: function(value) {
        Defaults.defaultReliability = value;
    },
    setDeleteReliability: function(value) {
        Defaults.deleteReliability = value;
    },
    setEncryptionGroup: function(value) {
        Defaults.encryptionGroup = value;
    },
    setAssertionSuffix: function(value) {
        Defaults.assertionSuffix = value;
    },
    setPartitioning: function(value) {
        Defaults.partitioning = value;
    },
    setEntityIntegrity: function(value) {
        Defaults.entityIntegrity = value;
    },
    setNaming: function(value) {
        Defaults.naming = value;
    },
    addTextItem: function(item, destination, before, label, title, listener) {
        if(!this[item]) {
            this[item] = {
                container: document.createElement('li'),
                input: document.createElement('input')
            };
            this[item].input.setAttribute('type', 'text');
            this[item].input.setAttribute('class', 'inputDefaults');
            this[item].input.addEventListener('blur', listener, false);
            this[item].input.value = Defaults[item];
            this[item].container.setAttribute('title', title);
            this[item].container.appendChild(this[item].input);
            this[item].container.appendChild(document.createTextNode(label));
            destination.insertBefore(this[item].container, before);
        }
        else // update values in case settings have changed
            this[item].input.value = Defaults[item];
    },
    addBoolItem: function(item, destination, before, label, title, listener) {
        if(!this[item]) {
            this[item] = {
                container: document.createElement('li'),
                input: document.createElement('input')
            };
            this[item].input.setAttribute('type', 'checkbox');
            this[item].input.setAttribute('class', 'inputDefaults');
            this[item].input.addEventListener('change', listener, false);
            this[item].input.checked = Defaults[item] === 'true';
            this[item].container.setAttribute('title', title);
            this[item].container.appendChild(this[item].input);
            this[item].container.appendChild(document.createTextNode(label));
            destination.insertBefore(this[item].container, before);
        }
        else // update values in case settings have changed
            this[item].input.checked = Defaults[item] === 'true';
    },
    removeItem: function(item, from) {
        if(this[item]) {
            this[item].container.removeChild(this[item].input);
            from.removeChild(this[item].container);
            this[item] = null;
        }
    },
    setTemporalization: function(value) {
        Defaults.temporalization = value;
        var temporalizationSelect = document.getElementById('temporalization');
        if(temporalizationSelect) temporalizationSelect.value = value;
        // toggle body class for CSS-driven visibility
        var body = document.body;
        body.classList.remove('temporal-uni','temporal-bi','temporal-crt');
        body.classList.add('temporal-' + value);
        // Ensure temporalization-dependent inputs reflect defaults when becoming visible
        this.init();
        var enable = (value === 'crt' || value === 'bi');
        Editables.setEditability(Editables.positIdentityEdit, enable);
        Editables.setEditability(Editables.positGeneratorEdit, enable);
        Editables.setEditability(Editables.assertivenessEdit, enable);
        // Deletability only in uni-temporal
        Editables.setEditability(Editables.deletabilityEdit, value === 'uni');
        Features.apply();
        Features.report();
    },
    setDeletablePrefix: function(value) {
        Defaults.deletablePrefix = value;
    },
    setDeletionSuffix: function(value) {
        Defaults.deletionSuffix = value;
    },
    setMetadataPrefix: function(value) {
        Defaults.metadataPrefix = value;
    },
    setMetadataType: function(value) {
        Defaults.metadataType = value;
    },
    setEquivalentSuffix: function(value) {
        Defaults.equivalentSuffix = value;
    },
    setEquivalentRange: function(value) {
        Defaults.equivalentRange = value;
    },
    setMetadataUsage: function(value) {
        Defaults.metadataUsage = value;
        var body = document.body;
        // Toggle dedicated body class for equivalence-specific UI items
        if (value === 'true') body.classList.add('metadata');
        else body.classList.remove('metadata');
        this.init();
    },
    setBusinessViews: function(value, userToggle) {
        Defaults.businessViews = value;
        if(userToggle && value === 'true')
            alert(
                    "Please note that when business views are used " +
                    "descriptors must follow the same rules of uniqueness as mnemonics do, " +
                    "otherwise naming clashes may occur."
            );
    },
    setKnotAliases: function(value, userToggle) {
        Defaults.knotAliases = value;
        if(userToggle && value === 'true')
            alert(
                    "Please note that knot aliases will create aliases for knot values " +
                    "in the views that mimic the naming of regular attributes, " +
                    "making them semantically indistinguishable from non-knotted attributes."
            );
    },
    setTriggers: function(value, userToggle) {
        Defaults.triggers = value;
        if(userToggle && value === 'false')
            alert(
                    "Please note that turning off triggers will leave " +
                    "more implementation details to the ETL or API using the model, " +
                    "and the views will no longer accept inserts and updates."
            );
    },
    setNaturalKeyAttributes: function(value, userToggle) {
        Defaults.naturalKeyAttributes = value;
        if(userToggle && value === 'true') {
            // Optional: brief informational notice (kept minimal to avoid alert fatigue)
            console.log('Natural key attribute table generation enabled.');
        }
    },
    setDecisiveness: function(value) {
        Defaults.decisiveness = value;
    },
    setEquivalence: function(value) {
        Defaults.equivalence = value;
        this.init();
        Features.apply(); // the body class of the equivalence settings, which needs it implemented too
        var enable = (value === 'true');
        Editables.setEditability(Editables.equivalenceEdit, enable);
    },
    setDeletability: function(value) {
        Defaults.deletability = value;
    },
    setRestatability: function(value) {
        Defaults.restatability = value;
    },
    setIdempotency: function(value) {
        Defaults.idempotency = value;
    },
    setAssertiveness: function(value) {
        Defaults.assertiveness = value;
    },
    setChangingSuffix: function(value) {
        Defaults.changingSuffix = value;
    },
    setIdentitySuffix: function(value) {
        Defaults.identitySuffix = value;
    },
    setEncapsulation: function(value) {
        Defaults.encapsulation = value;
    },
    setPrivacy: function(value) {
        Defaults.privacy = value;
    },
    setDefaultIdentity: function(value) {
        Defaults.identity = value;
    },
    setDefaultChronon: function(value) {
        Defaults.chronon = value;
    },
    setDefaultNow: function(value) {
        Defaults.now = value;
    },
    setDefaultChangingRange: function(value) {
        Defaults.changingRange = value;
    },
    setDamping: function(value) {
        LayoutEngine.damping = (100 - value)/100;
        LayoutEngine.init();
    },
    setLongRangeEffect: function(value) {
        LayoutEngine.longRangeEffect = value/100;
        LayoutEngine.init();
    },
    setFuzziness: function(value) {
        LayoutEngine.fuzziness = value/100;
        LayoutEngine.init();
    },
    setNormalDistance: function(value) {
        LayoutEngine.normalDistance = 1 * value;
        LayoutEngine.init();
    },
    setStoppingVelocity: function(value) {
        LayoutEngine.stoppingVelocity = 1 * value;
        LayoutEngine.init();
    },
    setMinimumStartingVelocity: function(value) {
        LayoutEngine.minimumStartingVelocity = 1 * value;
        LayoutEngine.init();
    },
    setMaximumStartingVelocity: function(value) {
        LayoutEngine.maximumStartingVelocity = 1 * value;
        LayoutEngine.init();
    },
    setPartitionFactor: function(value) {
        LayoutEngine.partitionFactor = 1 * value;
        LayoutEngine.init();
    },
    setStiffness: function(value) {
        LayoutEngine.stiffness = 1 * value;
        LayoutEngine.init();
    },
    setDatabase: function(value, convert) {
        if(convert && confirm("Would you like to convert data types to " + value + "?")) {
            var original = Defaults.databaseTarget;
            Defaults.databaseTarget = value;
            var xml = DataTypeConverter.convert(Model.toXML(false), original, value);
            Model.fromXML(xml);
        }
        Defaults.databaseTarget = value;
        // "now" is a database function, so it follows the target. Only the defaults are swapped;
        // anything else was typed in on purpose. Snowflake: sysdate() is UTC without a time zone,
        // which is what a timestamp_ntz ChangedAt holds. current_timestamp() would be local time.
        var nowDefaults = { SQLServer: 'sysdatetime()', Snowflake: 'sysdate()' };
        var knownNow = [nowDefaults.SQLServer, nowDefaults.Snowflake];
        if(nowDefaults[value] && knownNow.indexOf(Defaults.now) >= 0) {
            this.setDefaultNow(nowDefaults[value]);
            var field = document.getElementById('defaultNow');
            if(field) field.value = Defaults.now;
        }
        Features.apply();
        Features.report();
    },
    setMiniRate: function(value) {
        DrawingEngine.miniatureFramesBetweenRefresh = 1 * value;
    },
    toggleDebug: function () {
        setDebug(!DEBUG);
        var component;
        var i = Model.components.length;
        if(DEBUG) {
            SVGLayer.show('debugPartitions');
            SVGLayer.show('debug');
            while(i--) {
                component = Model.components[i];
                if(component.visible)
                    component.svg.showDebug(SVGLayer.debug);
            }
        }
        else {
            while(i--) {
                component = Model.components[i];
                if(component.visible)
                    component.svg.hideDebug(SVGLayer.debug);
            }
            SVGLayer.hide('debug');
            SVGLayer.hide('debugPartitions');
        }
        DrawingEngine.start(false);
    },
    knotMass: null,
    knotCharge: null,
    anchorMass: null,
    anchorCharge: null,
    attributeMass: null,
    attributeCharge: null,
    tieMass: null,
    tieCharge: null,
    edgeMass: null,
    edgeCharge: null,
    setCalculations: function(value) {
        var listOfSettings = document.getElementById('listOfSettings');
        var calcsItem = document.getElementById('calcsItem');
        if(value === 'simple') {
            LayoutEngine.layout = LayoutEngine.simpleLayout;
            if(this.knotMass) listOfSettings.removeChild(this.knotMass);
            if(this.knotCharge) listOfSettings.removeChild(this.knotCharge);
            if(this.anchorMass) listOfSettings.removeChild(this.anchorMass);
            if(this.anchorCharge) listOfSettings.removeChild(this.anchorCharge);
            if(this.attributeMass) listOfSettings.removeChild(this.attributeMass);
            if(this.attributeCharge) listOfSettings.removeChild(this.attributeCharge);
            if(this.tieMass) listOfSettings.removeChild(this.tieMass);
            if(this.tieCharge) listOfSettings.removeChild(this.tieCharge);
            if(this.edgeMass) listOfSettings.removeChild(this.edgeMass);
            if(this.edgeCharge) listOfSettings.removeChild(this.edgeCharge);
            this.knotMass = null;
            this.knotCharge = null;
            this.anchorMass = null;
            this.anchorCharge = null;
            this.attributeMass = null;
            this.attributeCharge = null;
            this.tieMass = null;
            this.tieCharge = null;
            this.edgeMass = null;
            this.edgeCharge = null;
        }
        else if (value === 'complex') {
            LayoutEngine.layout = LayoutEngine.complexLayout;
            this.knotMass = document.createElement('li');
            this.knotCharge = document.createElement('li');
            this.anchorMass = document.createElement('li');
            this.anchorCharge = document.createElement('li');
            this.attributeMass = document.createElement('li');
            this.attributeCharge = document.createElement('li');
            this.tieMass = document.createElement('li');
            this.tieCharge = document.createElement('li');
            this.edgeMass = document.createElement('li');
            this.edgeCharge = document.createElement('li');
            var knotMassInput = document.createElement('input');
            var knotChargeInput = document.createElement('input');
            var anchorMassInput = document.createElement('input');
            var anchorChargeInput = document.createElement('input');
            var attributeMassInput = document.createElement('input');
            var attributeChargeInput = document.createElement('input');
            var tieMassInput = document.createElement('input');
            var tieChargeInput = document.createElement('input');
            var edgeMassInput = document.createElement('input');
            var edgeChargeInput = document.createElement('input');
            knotMassInput.setAttribute('type', 'number');
            knotChargeInput.setAttribute('type', 'number');
            anchorMassInput.setAttribute('type', 'number');
            anchorChargeInput.setAttribute('type', 'number');
            attributeMassInput.setAttribute('type', 'number');
            attributeChargeInput.setAttribute('type', 'number');
            tieMassInput.setAttribute('type', 'number');
            tieChargeInput.setAttribute('type', 'number');
            edgeMassInput.setAttribute('type', 'number');
            edgeChargeInput.setAttribute('type', 'number');
            knotMassInput.setAttribute('step', '0.1');
            knotChargeInput.setAttribute('step', '0.1');
            anchorMassInput.setAttribute('step', '0.1');
            anchorChargeInput.setAttribute('step', '0.1');
            attributeMassInput.setAttribute('step', '0.1');
            attributeChargeInput.setAttribute('step', '0.1');
            tieMassInput.setAttribute('step', '0.1');
            tieChargeInput.setAttribute('step', '0.1');
            edgeMassInput.setAttribute('step', '0.1');
            edgeChargeInput.setAttribute('step', '0.1');
            knotMassInput.value = NodeType.mass[NodeType.KNOT];
            knotChargeInput.value = NodeType.charge[NodeType.KNOT];
            anchorMassInput.value = NodeType.mass[NodeType.ANCHOR];
            anchorChargeInput.value = NodeType.charge[NodeType.ANCHOR];
            attributeMassInput.value = NodeType.mass[NodeType.ATTRIBUTE];
            attributeChargeInput.value = NodeType.charge[NodeType.ATTRIBUTE];
            tieMassInput.value = NodeType.mass[NodeType.TIE];
            tieChargeInput.value = NodeType.charge[NodeType.TIE];
            edgeMassInput.value = NodeType.mass[NodeType.EDGE];
            edgeChargeInput.value = NodeType.charge[NodeType.EDGE];
            knotMassInput.addEventListener('blur', function() { NodeType.mass[NodeType.KNOT] = 1 * this.value; }, false);
            knotChargeInput.addEventListener('blur', function() { NodeType.charge[NodeType.KNOT] = 1 * this.value; }, false);
            anchorMassInput.addEventListener('blur', function() { NodeType.mass[NodeType.ANCHOR] = 1 * this.value; }, false);
            anchorChargeInput.addEventListener('blur', function() { NodeType.charge[NodeType.ANCHOR] = 1 * this.value; }, false);
            attributeMassInput.addEventListener('blur', function() { NodeType.mass[NodeType.ATTRIBUTE] = 1 * this.value; }, false);
            attributeChargeInput.addEventListener('blur', function() { NodeType.charge[NodeType.ATTRIBUTE] = 1 * this.value; }, false);
            tieMassInput.addEventListener('blur', function() { NodeType.mass[NodeType.TIE] = 1 * this.value; }, false);
            tieChargeInput.addEventListener('blur', function() { NodeType.charge[NodeType.TIE] = 1 * this.value; }, false);
            edgeMassInput.addEventListener('blur', function() { NodeType.mass[NodeType.EDGE] = 1 * this.value; }, false);
            edgeChargeInput.addEventListener('blur', function() { NodeType.charge[NodeType.EDGE] = 1 * this.value; }, false);
            this.knotMass.appendChild(knotMassInput);
            this.knotCharge.appendChild(knotChargeInput);
            this.anchorMass.appendChild(anchorMassInput);
            this.anchorCharge.appendChild(anchorChargeInput);
            this.attributeMass.appendChild(attributeMassInput);
            this.attributeCharge.appendChild(attributeChargeInput);
            this.tieMass.appendChild(tieMassInput);
            this.tieCharge.appendChild(tieChargeInput);
            this.edgeMass.appendChild(edgeMassInput);
            this.edgeCharge.appendChild(edgeChargeInput);
            this.knotMass.appendChild(document.createTextNode(' Knot mass'));
            this.knotCharge.appendChild(document.createTextNode(' Knot charge'));
            this.anchorMass.appendChild(document.createTextNode(' Anchor mass'));
            this.anchorCharge.appendChild(document.createTextNode(' Anchor charge'));
            this.attributeMass.appendChild(document.createTextNode(' Attribute mass'));
            this.attributeCharge.appendChild(document.createTextNode(' Attribute charge'));
            this.tieMass.appendChild(document.createTextNode(' Tie mass'));
            this.tieCharge.appendChild(document.createTextNode(' Tie charge'));
            this.edgeMass.appendChild(document.createTextNode(' Edge mass'));
            this.edgeCharge.appendChild(document.createTextNode(' Edge charge'));
            listOfSettings.insertBefore(this.edgeCharge, calcsItem);
            listOfSettings.insertBefore(this.edgeMass, calcsItem);
            listOfSettings.insertBefore(this.tieCharge, calcsItem);
            listOfSettings.insertBefore(this.tieMass, calcsItem);
            listOfSettings.insertBefore(this.attributeCharge, calcsItem);
            listOfSettings.insertBefore(this.attributeMass, calcsItem);
            listOfSettings.insertBefore(this.anchorCharge, calcsItem);
            listOfSettings.insertBefore(this.anchorMass, calcsItem);
            listOfSettings.insertBefore(this.knotCharge, calcsItem);
            listOfSettings.insertBefore(this.knotMass, calcsItem);
        }
    }
};
