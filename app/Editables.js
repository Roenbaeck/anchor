// Editables: the fields that a construct can be edited with.
"use strict";

function createOption(value, text) {
    var o = document.createElement('option');
    o.value = value;
    if(!text) text = value;
    o.text = text;
    return o;
};

var Editables = {
    setEditability: function(edit, isEditable) { edit.editable = isEditable; },
    descriptorEdit: {
        name: 'Descriptor',
        description:
               'Should be a descriptive name of that which you are creating. ' +
               'An understandable description of something found in the domain ' +
               'you are modeling, for example "CoffeeMachine".',
        setMember: function (element, component) { component.descriptor = element.value; },
        getMember: function (component) { return component.descriptor; },
        setElement: function (element, component) { element.value = component.descriptor; },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'input',
        pattern: '(' + UPPER + LOWER + '*)+',
        event: 'blur',
        attributes: ['type', 'text', 'required', 'required']
    },
    twoMnemonicEdit: {
        name: 'Mnemonic',
        description:
               'A two letter mnemonic, that needs to be unique within the entire ' +
               'model. If an anchor is named "CoffeeMachine" for example, then ' +
               '"CM" is a suitable mnemonic.',
        setMember: function (element, component) { component.mnemonic = element.value; },
        getMember: function (component) { return component.mnemonic; },
        setElement: function (element, component) { element.value = component.mnemonic; },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'input',
        pattern: UPPER + '{2}',
        event: 'blur',
        attributes: ['type', 'text', 'required', 'required']
    },
    threeMnemonicEdit: {
        name: 'Mnemonic',
        description:
               'A three letter mnemonic, that needs to be unique within the entire ' +
               'model for knots, but only within the anchor for attributes. If an ' +
               'attribute is named "Capacity" for example, then "CAP" is a ' +
               'suitable mnemonic.',
        setMember: function (element, component) { component.mnemonic = element.value; },
        getMember: function (component) { return component.mnemonic; },
        setElement: function (element, component) { element.value = component.mnemonic; },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'input',
        pattern: UPPER + '{3}',
        event: 'blur',
        attributes: ['type', 'text', 'required', 'required']
    },
    dataRangeEdit: {
        name: 'Data range',
        description: 'The data type of the column in the resulting implementation.',
        setMember: function (element, component) { component.dataRange = element.value; },
        getMember: function (component) { return component.dataRange; },
        setElement: function (element, component) { element.value = component.dataRange; },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'input',
        pattern: '.*',
        event: 'blur',
        attributes: ['type', 'text', 'required', 'required','list','datatypeList']
    },
    changingRangeEdit: {
        name: 'Time range',
        description:
               'Changing time data type. Versions of data are stored over changing time ' +
               'and this data type should be granular enough to handle the expected ' +
               'update frequency.',
        setMember: function (element, component) { component.changingRange = element.value; },
        getMember: function (component) { return component.changingRange; },
        setElement: function (element, component) { element.value = component.changingRange; },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'input',
        pattern: '.*',
        event: 'blur',
        attributes: ['type', 'text', 'required', 'required','list','datetimeList']
    },
    positIdentityEdit: {
        name: 'Posit identity',
        description:
                'Posit identity data type. This should be at large enough to be able to give ' +
                'identities to all posits that will be stored. With rapidly changing ' +
                'data this may be much larger than the other involved identities.',
        setMember: function (element, component) { component.positIdentity = element.value; },
        getMember: function (component) { return component.positIdentity; },
        setElement: function (element, component) { element.value = component.positIdentity; },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'input',
        pattern: '.*',
        event: 'blur',
        attributes: ['type', 'text', 'required', 'required','list','integerList']
    },
    identityEdit: {
        name: 'Identity',
        description:
               'Identity data type. The identity is an abstract and immutable property ' +
               'that uniquely identifies an entity. If you expect to store very many ' +
               'entities you also need an appropriately large data type.',
        setMember: function (element, component) { component.identity = element.value; },
        getMember: function (component) { return component.identity; },
        setElement: function (element, component) { element.value = component.identity; },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'input',
        pattern: '.*',
        event: 'blur',
        attributes: ['type', 'text', 'required', 'required','list','integerList']
    },
    positGeneratorEdit: {
        name: 'Posit generator',
        description:
                'Posit identity generator. Check this if you would like the database to generate ' +
                ' posit identities for you through some auto incremented sequence. Uncheck if you ' +
                'intend to manage your identities somewhere else.',
        setMember: function (element, component) { component.positGenerator = element.checked; },
        getMember: function (component) { return component.positGenerator; },
        setElement: function (element, component) { element.checked = component.positGenerator; },
        getElement: function (element) { return element.checked; },
        editable: true,
        type: 'input',
        event: 'click',
        attributes: ['type', 'checkbox']
    },
    generatorEdit: {
        name: 'Generator',
        description:
               'Identity generator. Check this if you would like the database to generate ' +
               'identities for you through some auto incremented sequence. Uncheck if you ' +
               'intend to manage your identities somewhere else.',
        setMember: function (element, component) { component.generator = element.checked; },
        getMember: function (component) { return component.generator; },
        setElement: function (element, component) { element.checked = component.generator; },
        getElement: function (element) { return element.checked; },
        editable: true,
        type: 'input',
        event: 'click',
        attributes: ['type', 'checkbox']
    },
    deletabilityEdit: {
        name: 'Deletable',
        description:
               'Check this if you want to be able to "delete" values using an update statement ' +
               'with a null value and a later changing time then of the latest existing value. ' +
               'Affected rows will be moved to a deletion table.',
        setMember: function (element, component) { component.deletable = element.checked; },
        getMember: function (component) { return component.deletable; },
        setElement: function (element, component) { element.checked = component.deletable; },
        getElement: function (element) { return element.checked; },
        editable: true,
        type: 'input',
        event: 'click',
        attributes: ['type', 'checkbox']
    },
    restatabilityEdit: {
        name: 'Restatable',
        description:
               'Check this if you want to allow temporal restatements. A temporal restatement ' +
               'is when two consecutive values over changing time are identical. Uncheck this ' +
               'to introduce a constraint preventing restatements from being made.',
        setMember: function (element, component) { component.restatable = element.checked; },
        getMember: function (component) { return component.restatable; },
        setElement: function (element, component) { element.checked = component.restatable; },
        getElement: function (element) { return element.checked; },
        editable: true,
        type: 'input',
        event: 'click',
        attributes: ['type', 'checkbox']
    },
    idempotencyEdit: {
        name: 'Idempotent',
        description:
               'Checking this modifies the insert and update triggers such that changed values ' +
               'must be different in order to be recorded. Idempotency is not recommended when ' +
               'data can arrive asynchronously with respect to changing time.',
        setMember: function (element, component) { component.idempotent = element.checked; },
        getMember: function (component) { return component.idempotent; },
        setElement: function (element, component) { element.checked = component.idempotent; },
        getElement: function (element) { return element.checked; },
        editable: true,
        type: 'input',
        event: 'click',
        attributes: ['type', 'checkbox']
    },
    assertivenessEdit: {
        name: 'Assertive',
        description:
               'Checking this modifies the insert and update triggers such that the annex will ' +
               'get new rows everytime a posit is made with a different positing time. Otherwise ' +
               'the annex will only get new rows if the reliability changes as well.',
        setMember: function (element, component) { component.assertive = element.checked; },
        getMember: function (component) { return component.assertive; },
        setElement: function (element, component) { element.checked = component.assertive; },
        getElement: function (element) { return element.checked; },
        editable: true,
        type: 'input',
        event: 'click',
        attributes: ['type', 'checkbox']
    },
    equivalenceEdit: {
        name: 'Equivalent',
        feature: 'equivalence', // hidden where the selected database and temporalization do not implement it (Features)
        description:
                'Checking this makes it possible to store several equivalent values, ' +
                'which for example is useful when multilingualism or multitenancy is desired.',
        setMember: function (element, component) { component.equivalent = element.checked; },
        getMember: function (component) { return component.equivalent; },
        setElement: function (element, component) { element.checked = component.equivalent; },
        getElement: function (element) { return element.checked; },
        editable: true,
        type: 'input',
        event: 'click',
        attributes: ['type', 'checkbox']
    },
    checksumEdit: {
        name: 'Checksum',
        description:
                'Checking this indicates that your data type is too large to fit in ' +
                'indexes, and a calculated checksum column will be added that can be  ' +
                'used instead.',
        setMember: function (element, component) { component.checksum = element.checked; },
        getMember: function (component) { return component.checksum; },
        setElement: function (element, component) { element.checked = component.checksum; },
        getElement: function (element) { return element.checked; },
        editable: true,
        type: 'input',
        event: 'click',
        attributes: ['type', 'checkbox']
    },
    encryptionGroupEdit: {
        name: 'Encryption group',
        feature: 'encryption',
        description:
                'Setting this to anything but an empty string indicates that your data should be encrypted at rest. ' +
                'When encryption is used, data is encrypted according to different encryption gruoups. These ' +
                'groups are identified by the strings you assign here.',
        setMember: function (element, component) { component.encryptionGroup = element.value; },
        getMember: function (component) { return component.encryptionGroup; },
        setElement: function (element, component) { element.value = component.encryptionGroup; },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'input',
        pattern: null, // anything and nothing are all fine
        event: 'blur',
        attributes: ['type', 'text']
    },
    roleEdit: {
        name: 'Role',
        description:
               'The role of the connected entity in the relationship. The same entity may, for example ' +
               'participate more than once in the same relationship and must therefore be distinguished ' +
               'through which role it plays. Because of this, roles must be unique within a tie.',
        setMember: function (element, component) { component.role = element.value; },
        getMember: function (component) { return component.role; },
        setElement: function (element, component) { element.value = component.role; },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'input',
        pattern: '(' + LOWER + UPPER + '*)+',
        event: 'blur',
        attributes: ['type', 'text', 'required', 'required']
    },
    coloringEdit: {
        name: 'Coloring',
        description:
                'Coloring can be used to create your own visual separation of the components in a model. It ' +
                'has no effect on the implementation.',
        setMember: function (element, component) { component.setColoring(element.value); },
        getMember: function (component) { return component.coloring; },
        setElement: function (element, component) { element.value = component.coloring; },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'input',
        pattern: '#[0-9A-Fa-f]{6}',
        event: 'change',
        attributes: ['type', 'color', 'required', 'required']
    },
    encapsulationEdit: {
        name: 'Capsule',
        description:
               'In order to achieve separation of concerns, different parts of the model can be encapsulated ' +
               'in different "capsules", which translate to schemas in the relational database implementation.',
        setMember: function (element, component) { component.encapsulation = element.value; },
        getMember: function (component) { return component.encapsulation; },
        setElement: function (element, component) { element.value = component.encapsulation; },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'input',
        pattern: LOWER + '*',
        event: 'blur',
        attributes: ['type', 'text', 'required', 'required']
    },
    descriptionEdit: {
        name: 'Description',
        description:
                'A textual description of this item.',
        setMember: function (element, component) { component.description = element.value; },
        getMember: function (component) { return component.description; },
        setElement: function (element, component) { element.value = component.description; },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'textarea',
        pattern: null, // anything and nothing are all fine
        event: 'blur',
        attributes: ['rows', '3', 'cols', '16']
    },
    privacyEdit: {
        name: 'Privacy action',
        description:
                'Determines the action to take when data in this attribute becomes subject to ' +
                'privacy regulations, such as being "forgotten" according to GDPR. This is so ' +
                'far only of informational character and is stored in the model metadata, but ' +
                'can be used to create your own automation procedures.',
        setMember: function (element, component) { component.privacy = element.value; },
        getMember: function (component) { return component.privacy; },
        setElement: function (element, component) { element.value = component.privacy; },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'select',
        pattern: null, // anything and nothing are all fine
        event: 'click',
        attributes: [],
        elements: [
            createOption('Ignore'),
            createOption('Delete'),
            createOption('Anonymize'),
            createOption('Pseudonymize'),
            createOption('Encrypt')
        ]
    },
    keySelectEdit: {
        name: 'Select key',
        description:
                'Selects which key this identifier should be built from.',
        setMember: function (element, component) { component.setRoute(element.value); },
        getMember: function (component) { return component.getRoute(); },
        setElement: function (element, component) { element.value = component.getRoute(); },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'select',
        pattern: null, // anything and nothing are all fine
        event: 'click',
        attributes: [],
        prepare: function(component) { component.prepareEditing(this) },
        elements: [] // needs to be set by the creating component in prepareEditing()
    },
    chronicleEdit: {
        name: 'Chronicle ordinal',
        description:
                'The ordinal number for this chronicle provider. 0 means not a provider, 1+ means provider with that order.',
        setMember: function (element, component) { 
            component.component.chronicle = parseInt(element.value) || 0;
            if (component.svg.textElement) {
                component.svg.textElement.textContent = component.component.chronicle || '';
            }
        },
        getMember: function (component) { return component.component.chronicle; },
        setElement: function (element, component) { element.value = component.component.chronicle; },
        getElement: function (element) { return element.value; },
        editable: true,
        type: 'input',
        pattern: '[0-9]*',
        event: 'blur',
        attributes: ['type', 'number', 'min', '0']
    }
};
