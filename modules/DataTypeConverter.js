/* list of generic data types

// Numeric      min                         max
tinyint	        0	                        255
smallint        -32,768	                    32,767
integer	        -2,147,483,648              2,147,483,647
bigint	        -9,223,372,036,854,775,808  9,223,372,036,854,775,807
decimal	        -10^38 +1	                10^38 -1
numeric	        -10^38 +1	                10^38 -1
float	        -3.40E + 38	                3.40E + 38
double	        -1.79E + 308	            1.79E + 308

// Boolean
boolean         true, yes, on, 1            false, no, off, 0

// Monetary
money           

// Date/Time
date	        Stores date in the format YYYY-MM-DD
time	        Stores time in the format HH:MI:SS
timetz          Stores time in the format HH:MI:SS, with time zone
datetime	    Stores date and time information in the format YYYY-MM-DD HH:MI:SS
timestamp	    Stores date and time information in the format YYYY-MM-DD HH:MI:SS.ssssssssss
timestamptz     Stores date and time information in the format YYYY-MM-DD HH:MI:SS.ssssssssss, with time zone
interval        Interval time data

// Character
char	        Fixed length with maximum length of 8000 characters
varchar	        Variable length storage with maximum length of 8000 characters
longvarchar     Variable length storage with maximum size of 2GB data
clob            4GB
nchar	        Fixed length with maximum length of 4000 characters
nvarchar	    Variable length storage with maximum length of 4000 characters
longnvarchar    Variable length storage with maximum size of 1GB data
nclob           4GB

// Binary
binary	        Fixed length with maximum length of 8,000 bytes
varbinary   	Variable length storage with maximum length of 8,000 bytes
longvarbinary	Variable length storage with maximum size of 2GB data
blob	        4GB binary data

// Miscellaneous
xml	            for storing xml data
json	        for storing JSON data
array           (offered in SQL99) is a set-length and ordered a collection of elements
multiset        (added in SQL2003) is a variable-length and unordered collection of elements
guid            Globally unique identifier

// geotypes ?

*/

// only add a regex when the types are different!
var DataTypeConverter = {
    MATCH: 0,
    REPLACE: 1,
    SQLServer_to_Generic: [
    // Numeric 
        [/"int"/ig,                             '"integer"'],
        [/"real"/ig,                            '"float"'],
        [/"float"/ig,                           '"double"'],  
    // Boolean
        [/"bit"/ig,                             '"boolean"'],       
    // Monetairy 
        [/"smallmoney"/ig,                      '"money"'],  
    // Date/Time
        [/"smalldatetime"/ig,                   '"datetime"'],
        [/"datetime"/ig,                        '"timestamp"'],
        [/"datetime2\(([0-9]+)\)"/ig,           '"timestamp($1)"'],
        [/"datetime2"/ig,                       '"timestamp"'],                
        [/"datetimeoffset\(([0-9]+)\)"/ig,      '"timestamptz($1)"'],
        [/"datetimeoffset"/ig,                  '"timestamptz"'],     
    // Character
        [/"varchar\(max\)"/ig,                  '"longvarchar"'],   
        [/"text"/ig,                            '"longvarchar"'],   
        [/"nvarchar\(max\)"/ig,                 '"longnvarchar"'],   
        [/"ntext"/ig,                           '"longnvarchar"'],
    // Binary   
        [/"varbinary\(max\)"/ig,                '"longvarbinary"'],
        [/"image"/ig,                           '"longvarbinary"'], 
    // Miscellaneous
        [/"uniqueidentifier"/ig,                '"guid"']             
    ],
    Generic_to_SQLServer: [
    // Numeric     
        [/"float"/ig,                           '"real"'],
        [/"double"/ig,                          '"float"'], 
    // Boolean
        [/"boolean"/ig,                         '"bit"'],
    // Date/Time
        [/"timetz\(([0-9]+)\)"/ig,              '"time($1)"'],
        [/"timetz"/ig,                          '"time"'],
        [/"timestamp\(([0-9]+)\)"/ig,           '"datetime2($1)"'],    
        [/"timestamp"/ig,                       '"datetime2"'],
        [/"timestamptz\(([0-9]+)\)"/ig,         '"datetimeoffset($1)"'],
        [/"timestamptz"/ig,                     '"datetimeoffset"'],
    // Character
        [/"longvarchar"/ig,                     '"varchar(max)"'], 
        [/"clob"/ig,                            '"varchar(max)"'],         
        [/"longnvarchar"/ig,                    '"nvarchar(max)"'], 
        [/"nclob"/ig,                           '"nvarchar(max)"'],   
    // Binary
        [/"longvarbinary"/ig,                   '"varbinary(max)"'],
        [/"blob"/ig,                            '"varbinary(max)"'],       
    // Miscellaneous
        [/"json"/ig,                            '"nvarchar(max)"'], // add CHECK (ISJSON(jsonColumn)>0) !
        [/"array"/ig,                           '"varbinary(max)"'], // convert to table or stingdelimited?    
        [/"multiset"/ig,                        '"varbinary(max)"'], // convert to table or json document?
        [/"guid"/ig,                            '"uniqueidentifier"']  
    ], 
    Generic_to_Oracle: [
    // Numeric
        [/"tinyint"/ig,                         '"number(3)"'],
        [/"smallint"/ig,                        '"number(5)"'],
        [/"integer"/ig,                         '"number(10)"'],
        [/"bigint"/ig,                          '"number(19)"'],
        [/"decimal\(([0-9]+),\s*([0-9]+)\)"/ig, '"number($1,$2)"'],
        [/"decimal\(([0-9]+)\)"/ig,             '"number($1)"'],                
        [/"numeric\(([0-9]+),\s*([0-9]+)\)"/ig, '"number($1,$2)"'],
        [/"numeric\(([0-9]+)\)"/ig,             '"number($1)"'],
        [/"float"/ig,                           '"binary_float"'],
        [/"double"/ig,                          '"binary_double"'],
    // Boolean
        [/"boolean"/ig,                         '"number(1)"'],
    // Monetairy 
        [/"money"/ig,                           '"number(19,4)"'],
    // Date/Time
        [/"time\(([0-9]+)\)"/ig,                '"timestamp($1)"'],
        [/"time"/ig,                            '"timestamp"'],     
        [/"timetz\(([0-9]+)\)"/ig,              '"timestamp($1) with time zone"'],
        [/"timetz"/ig,                          '"timestamp with time zone"'],
        [/"datetime"/ig,                        '"date"'],        
        [/"timestamp\(([0-9]+)\)"/ig,           '"timestamp($1)"'],    
        [/"timestamp"/ig,                       '"timestamp"'],
        [/"timestamptz\(([0-9]+)\)"/ig,         '"timestamp($1) with time zone"'],
        [/"timestamptz"/ig,                     '"timestamp with time zone"'],
    // Character        
        [/"varchar\(([0-9]+)\)"/ig,             '"varchar2($1)"'],
        [/"longvarchar"/ig,                     '"clob"'],                  
        [/"nvarchar\(([0-9]+)\)"/ig,            '"nvarchar2($1)"'],
        [/"longnvarchar"/ig,                    '"nclob"'],         
    // Binary
        [/"binary\(([0-9]+)\)"/ig,              '"raw($1)"'],
        [/"varbinary\(([0-9]+)\)"/ig,           '"blob"'],
        [/"longvarbinary"/ig,                   '"blob"'],
    // Miscellaneous
        [/"xml"/ig,                             '"xmltype"'],    
        [/"json"/ig,                            '"clob"'], // add CHECK (jsonColumn IS JSON)!
        [/"array"/ig,                           '"blob"'], // create type with nested table?    
        [/"multiset"/ig,                        '"blob"'], // create type with nested table? 
        [/"guid"/ig,                            '"raw(16)"']
    ],
    Oracle_to_Generic: [
    // Numeric      
        [/"number\((1|2)(,0)?\)"/ig,            '"tinyint"'],	  
        [/"number\(([3-5])(,0)?\)"/ig,          '"smallint"'],
        [/"number\(([6-9])(,0)?\)"/ig,          '"integer"'],       	              
        [/"number\((1[0-9])(,0)?\)"/ig,         '"bigint"'],
        [/"number\(([0-9]+),\s*([0-9]+)\)"/ig,  '"decimal($1,$2)"'],          
        [/"number\(([0-9]+)\)"/ig,              '"decimal($1)"'],
        [/"number(\(\*\))?"/ig,                 '"double"'],    
        [/"binary_float"/ig,                    '"float"'],
        [/"binary_double"/ig,                   '"double"'],
        [/"float\(([0-9]+)\)"/ig,               '"double"'],        
    // Boolean
    // Monetary     
    // Date/Time
        [/"date"/ig,                            '"datetime"'], 
        [/"timestamp\(([0-9])\)\s+with\s+time\s+zone"/ig, '"timestamptz($1)"'],    
        [/"timestamp\s+with\s+time\s+zone"/ig,  '"timestamptz"'],             
    // Character
        [/"char\(([0-9]+)\s*(byte|char)?\s*\)"/ig, '"char($1)"'],
        [/"varchar2\(([0-9]+)\s*(byte|char)?\s*\)"/ig, '"varchar($1)"'],
        [/"nvarchar2\(([0-9]+)\)"/ig,           '"nvarchar($1)"'],
        [/"long"/ig,                            '"longvarchar"'],
    // Binary
        [/"raw\(([0-9]+)\)"/ig,                 '"binary($1)"'],    
        [/"long raw"/ig,                        '"longvarbinary"'],  
        [/"bfile"/ig,                           '"blob"'],                 
    // Miscellaneous
        [/"xmltype"/ig,                         '"xml"'],    
        [/"uritype"/ig,                         '"clob"'], 
        [/"rowid"/ig,                           '"binary(16)"'], 
        [/"urowid(\([0-9]+\))?"/ig,             '"longvarbinary"'], 
        [/"guid"/ig,                            '"raw(16)"']
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
        [/"boolean"|"bool"/ig,                  '"bit"'],
        [/"uuid"/ig,                            '"uniqueidentifier"'],
        [/"json"|"jsonb"/ig,                    '"nvarchar(max)"']
    ],
    convert: function(xml, source, target) {
        var sourceToGen = this[source + '_to_Generic'];
        var genToTarget = this['Generic_to_' + target];
        if(!sourceToGen & !genToTarget) {
            alert('Conversion between ' + source + ' and ' + target + ' is not supported.');
            return xml;
        }
        if(!sourceToGen) {
            alert('Conversion from ' + source + ' is not supported.');
            return xml;
        }
        var str = (new XMLSerializer()).serializeToString(xml);
        var rule;
        for(var i = 0; rule = sourceToGen[i]; i++) {
            str = str.replace(rule[this.MATCH], rule[this.REPLACE]);
        }
        if(!genToTarget) {
            alert('Conversion to ' + target + ' is not supported.');
        } else {
            for(var i = 0; rule = genToTarget[i]; i++) {
                str = str.replace(rule[this.MATCH], rule[this.REPLACE]);
            }           
        }
        xml = (new DOMParser()).parseFromString(str, 'text/xml');
        return xml;
    }
};
