var DataTypeConverter = {
    MATCH: 0,
    REPLACE: 1,
    SQLServer_to_Oracle: [
        // exact numbers
        [/"tinyint"/ig,                         '"NUMBER(3)"'],
        [/"smallint"/ig,                        '"NUMBER(5)"'],
        [/"int"|"integer"/ig,                   '"NUMBER(10)"'],
        [/"bigint"/ig,                          '"NUMBER(19)"'],
        [/"decimal\(([0-9]+),\s*([0-9]+)\)"/ig, '"NUMBER($1,$2)"'],
        [/"numeric\(([0-9]+),\s*([0-9]+)\)"/ig, '"NUMBER($1,$2)"'],
        [/"smallmoney"/ig,                      '"NUMBER(10,4)"'],
        [/"money"/ig,                           '"NUMBER(19,4)"'],
        // approximate numbers
        [/"real"/ig,                            '"BINARY_FLOAT"'],
        [/"float"/ig,                           '"BINARY_DOUBLE"'],
        // time types
        [/"smalldatetime"/ig,                   '"TIMESTAMP(3)"'],
        [/"datetime"/ig,                        '"TIMESTAMP(3)"'],
        [/"datetime2\(([0-9]+)\)"/ig,           '"TIMESTAMP($1)"'],
        [/"datetimeoffset\(([0-9]+)\)"/ig,      '"TIMESTAMP($1) WITH TIME ZONE"'],
        // strings
        [/"varchar\(([0-9]+)\)"/ig,             '"VARCHAR2($1)"'],
        [/"varchar\(max\)"/ig,                  '"CLOB"'],
        [/"text"/ig,                            '"LONG"'],
        // binaries
        [/"binary\(([0-9]+)\)"/ig,              '"RAW($1)"'],
        [/"varbinary\(([0-9]+)\)"/ig,           '"LONG RAW"'],
        [/"varbinary\(max\)"/ig,                '"BLOB"'],
        [/"image"/ig,                           '"LONG RAW"'],
        // other
        [/"xml"/ig,                             '"XMLTYPE"'],
        [/"bit"/ig,                             '"NUMBER(1)"'],
        [/"uniqueidentifier"/ig,                '"RAW(16)"']
    ],
    SQLServer_to_PostgreSQL: [
        [/"tinyint"/ig,                         '"smallint"'],
        [/"NUMBER\(([0-9]+)\)"/ig,              '"numeric($1)"'],
        [/"datetime"/ig,                        '"timestamp"'],
        [/"datetime2\(([0-9]+)\)"/ig,           '"timestamp($1)"'],
        [/"varchar"/ig,                         '"char(1)"']
    ],
    PostgreSQL_to_SQLServer: [
        [/"numeric\(([0-9]+)\)"/ig,             '"NUMBER($1)"'],
        [/"timestamp"/ig,                       '"datetime"'],
        [/"timestamp\(([0-9]+)\)"/ig,           '"datetime2($1)"'],
        [/"char(1)"/ig,                         '"varchar"']
    ],
    convert: function(xml, source, target) {
        var ruleset = this[source + '_to_' + target];
        if(!ruleset) {
            alert('Conversion between ' + source + ' and ' + target + ' is not supported.');
            return xml;
        }
        var str = (new XMLSerializer()).serializeToString(xml);
        var rule;
        for(var i = 0; rule = ruleset[i]; i++) {
            str = str.replace(rule[this.MATCH], rule[this.REPLACE]);
        }
        xml = (new DOMParser()).parseFromString(str, 'text/xml');
        return xml;
    }
};
