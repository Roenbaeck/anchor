if(schema.PARTITIONING) {
/*~
-- schema.PARTITIONING -------------------------------------------------------------------------------------------------------
--
-- Partitioning can be used on some versions of SQL Server to speed up querying.
-- Extend the partition function with more numbers if you have more than one hundred positors.
--
-- Partition function -------------------------------------------------------------------------------------------------
-- this function sends information from each positor into its own partition
-----------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.partition_functions WHERE name = 'PositorPartition')
CREATE PARTITION FUNCTION PositorPartition ($schema.metadata.positorRange)
AS RANGE LEFT FOR VALUES (
    00,01,02,03,04,05,06,07,08,09,
    10,11,12,13,14,15,16,17,18,19,
    20,21,22,23,24,25,26,27,28,29,
    30,31,32,33,34,35,36,37,38,39,
    40,41,42,43,44,45,46,47,48,49,
    50,51,52,53,54,55,56,57,58,59,
    60,61,62,63,64,65,66,67,68,69,
    70,71,72,73,74,75,76,77,78,79,
    80,81,82,83,84,85,86,87,88,89,
    90,91,92,93,94,95,96,97,98,99
);
GO
-- Partition scheme ---------------------------------------------------------------------------------------------------
-- data will be split up onto filegroups matching the positor (change from [PRIMARY] if desired)
-----------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.partition_schemes WHERE name = 'PositorScheme')
CREATE PARTITION SCHEME PositorScheme
AS PARTITION PositorPartition
ALL TO ([PRIMARY]);
GO
~*/
}