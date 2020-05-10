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
        [/"decimal\(([0-9]+)\)"/ig,             '"NUMBER($1)"'],                
        [/"numeric\(([0-9]+),\s*([0-9]+)\)"/ig, '"NUMBER($1,$2)"'],
        [/"numeric\(([0-9]+)\)"/ig,             '"NUMBER($1)"'],
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
        // exact numbers
        [/"tinyint"/ig,                         '"smallint"'],
        [/"int"|"integer"/ig,                   '"integer"'],
        [/"smallmoney"/ig,                      '"money"'],
        // approximate numbers
        [/"float"/ig,                           '"double precision"'],
        // time types
        [/"smalldatetime"/ig,                   '"timestamp"'],
        [/"datetime"/ig,                        '"timestamp"'],
        [/"datetime2\(([0-9]+)\)"/ig,           '"timestamp"'],
        [/"datetime2"/ig,                       '"timestamp"'],                
        [/"datetimeoffset\(([0-9]+)\)"/ig,      '"timestampz"'],
        [/"datetimeoffset"/ig,                  '"timestampz"'],                
        // strings
        [/"varchar\(max\)"/ig,                  '"text"'],
        [/"nvarchar\(([0-9]+)\)"/ig,            '"varchar($1)"'],
        [/"nvarchar\(max\)"/ig,                 '"text"'],
        [/"text"/ig,                            '"text"'],                
        [/"ntext"/ig,                           '"text"'],
        [/"nchar\(([0-9]+)\)"/ig,               '"text"'],
        // binaries
        [/"binary\(([0-9]+)\)"/ig,              '"bytea"'],
        [/"varbinary\(([0-9]+)\)"/ig,           '"bytea"'],
        [/"varbinary\(max\)"/ig,                '"bytea"'],
        [/"image"/ig,                           '"bytea"'],
        // other
        [/"bit"/ig,                             '"boolean"'],
        [/"uniqueidentifier"/ig,                '"uuid"'],
        [/"rowversion"/ig,                      '"bytea"'],
        [/"geography"/ig,                       '"bytea"']                
      ],
      PostgreSQL_to_SQLServer: [
        // exact numbers
        [/"smallserial"|"serial2|"int2"/ig,     '"smallint"'], // smallserial - smallint identity(1,1)
        [/"serial"|"serial4"|"int"|"int4"/ig,   '"integer"'], // serial - integer identity(1,1)
        [/"bigserial"|"serial8"|"int8"/ig,      '"bigint"'], // bigserial - bigint identity(1,1)
        // approximate numbers
        [/"real"|"float4"/ig,                   '"real"'],
        [/"double precision"|"float8"/ig,       '"double precision"'],
        // time types
        [/"timestamp\(([0-9]+)\)"/ig,           '"datetime2($1)"'],
        [/"timestampz\(([0-9]+)\)"/ig,          '"datetimeoffset($1)"'],
        [/"timestamp\(([0-9]+)\) with time zone"/ig,  '"datetimeoffset($1)"'],
        // strings
        [/"character varying\(([0-9]+)\)"/ig,   '"nvarchar($1)"'],
        [/"varchar\(([0-9]+)\)"/ig,             '"nvarchar($1)"'],
        [/"text"/ig,                            '"nvarchar(max)"'],                
        [/"character\(([0-9]+)\)"/ig,           '"nchar($1)"'],
        [/"char\(([0-9]+)\)"/ig,                '"nchar($1)"'],
        // binaries
        [/"bytea"/ig,                           '"varbinary(max)"'],
        // other
        [/"boolean"|"bool"/ig,                         '"bit"'],
        [/"uuid"/ig,                            '"uniqueidentifier"'],
        [/"json"|"jsonb"/ig,                    '"nvarchar(max)"']
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
