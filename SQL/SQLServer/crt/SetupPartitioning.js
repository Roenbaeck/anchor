if(PARTITIONING) {
/*~
-- PARTITIONING -------------------------------------------------------------------------------------------------------
--
-- Partitioning can be used on some versions of SQL Server to speed up querying.
--
-- Partition function -------------------------------------------------------------------------------------------------
-- this function sends current information into the overflow partition, where what is current is
-- determined by the Reliable computed column and the Reliability Cutoff value
-----------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.partition_functions WHERE name = 'ReliabilityPartition')
CREATE PARTITION FUNCTION ReliabilityPartition (tinyint)
AS RANGE LEFT FOR VALUES(0);
GO
-- Partition scheme ---------------------------------------------------------------------------------------------------
-- data will be split up onto two filegroups (change from [PRIMARY] if desired):, 
-- 1st filegroup ($$partition 1) - previously recorded (erased) information,
-- 2nd filegroup ($$partition 2) - currently recorded information,
-----------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.partition_schemes WHERE name = 'ReliabilityScheme')
CREATE PARTITION SCHEME ReliabilityScheme
AS PARTITION ReliabilityPartition
TO ([PRIMARY], [PRIMARY]);
GO
~*/
}