-- InsertAndVerifyExample.sql
-- Test data for the example model (SQL Server, uni-temporal naming)
-- Use with the generated schema from `example.xml` (SQLServer / uni target).
-- Review and adapt if your naming or metadata settings differ from Defaults.

SET NOCOUNT ON;
BEGIN TRANSACTION;

PRINT '--- Insert knots ---';
-- Knots: PAT (ParentalType), GEN (Gender), PLV (ProfessionalLevel), UTL (Utilization), ONG (Ongoing), RAT (Rating), ETY (EventType)
IF OBJECT_ID('dbo.PAT_ParentalType','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.PAT_ParentalType (PAT_ID, PAT_ParentalType, Metadata_PAT) VALUES (1, 'Mother', 1), (2, 'Father', 1);
END
IF OBJECT_ID('dbo.GEN_Gender','U') IS NOT NULL 
BEGIN 
    INSERT INTO dbo.GEN_Gender (GEN_ID, GEN_Gender, Metadata_GEN) VALUES (0, 'Male', 1), (1, 'Female', 1);
END
IF OBJECT_ID('dbo.PLV_ProfessionalLevel','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.PLV_ProfessionalLevel (PLV_ID, PLV_ProfessionalLevel, Metadata_PLV) VALUES (1, 'Junior', 1), (2, 'Senior', 1);
END
IF OBJECT_ID('dbo.UTL_Utilization','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.UTL_Utilization (UTL_ID, UTL_Utilization, Metadata_UTL) VALUES (1, 10, 1), (2, 20, 1);
END
IF OBJECT_ID('dbo.ONG_Ongoing','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.ONG_Ongoing (ONG_ID, ONG_Ongoing, Metadata_ONG) VALUES (1, 'yes', 1), (2, 'no', 1);
END
IF OBJECT_ID('dbo.RAT_Rating','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.RAT_Rating (RAT_ID, RAT_Rating, Metadata_RAT) VALUES (1, 'A', 1), (2, 'B', 1);
END
IF OBJECT_ID('dbo.ETY_EventType','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.ETY_EventType (ETY_ID, ETY_EventType, Metadata_ETY) VALUES (1, 'Conference', 1), (2, 'Meetup', 1);
END

PRINT '--- Insert anchors ---';
IF OBJECT_ID('dbo.PN_Person','U') IS NOT NULL
BEGIN
	SET IDENTITY_INSERT dbo.PN_Person ON;
    INSERT INTO dbo.PN_Person (PN_ID, Metadata_PN) VALUES (1, 1), (2, 1);
	SET IDENTITY_INSERT dbo.PN_Person OFF;
END
IF OBJECT_ID('dbo.ST_Stage','U') IS NOT NULL
BEGIN
	SET IDENTITY_INSERT dbo.ST_Stage ON;
    INSERT INTO dbo.ST_Stage (ST_ID, Metadata_ST) VALUES (10, 1), (11, 1);
	SET IDENTITY_INSERT dbo.ST_Stage OFF;
END
IF OBJECT_ID('dbo.AC_Actor','U') IS NOT NULL
BEGIN
	SET IDENTITY_INSERT dbo.AC_Actor ON;
    INSERT INTO dbo.AC_Actor (AC_ID, Metadata_AC) VALUES (100, 1), (101, 1);
	SET IDENTITY_INSERT dbo.AC_Actor OFF;
END
IF OBJECT_ID('dbo.PR_Program','U') IS NOT NULL
BEGIN
	SET IDENTITY_INSERT dbo.PR_Program ON;
    INSERT INTO dbo.PR_Program (PR_ID, Metadata_PR) VALUES (200, 1), (201, 1);
	SET IDENTITY_INSERT dbo.PR_Program OFF;
END

PRINT '--- Insert anchor attributes ---';
-- ST: NAM (historized), LOC (static, checksum), AVG (historized knot UTL), MIN (static knot UTL)
IF OBJECT_ID('dbo.ST_NAM_Stage_Name','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.ST_NAM_Stage_Name (ST_NAM_ST_ID, ST_NAM_Stage_Name, ST_NAM_ChangedAt, Metadata_ST_NAM)
    VALUES (10, 'Main Stage', SYSUTCDATETIME(), 1);
    INSERT INTO dbo.ST_NAM_Stage_Name (ST_NAM_ST_ID, ST_NAM_Stage_Name, ST_NAM_ChangedAt, Metadata_ST_NAM)
    VALUES (11, 'Secondary Stage', SYSUTCDATETIME(), 1);
END
IF OBJECT_ID('dbo.ST_LOC_Stage_Location','U') IS NOT NULL
BEGIN 
    -- select * from sys.spatial_reference_systems where well_known_text like '%World Geodetic System 1984%'
    INSERT INTO dbo.ST_LOC_Stage_Location (ST_LOC_ST_ID, ST_LOC_Stage_Location, Metadata_ST_LOC)
    VALUES (10, Geography::Point(0, 0, 4326), 1), (11, Geography::Point(0, 0, 4326), 1);
END
IF OBJECT_ID('dbo.ST_AVG_Stage_Average','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.ST_AVG_Stage_Average (ST_AVG_UTL_ID, ST_AVG_ST_ID, ST_AVG_ChangedAt, Metadata_ST_AVG)
    VALUES (1, 10, SYSUTCDATETIME(), 1);
END
IF OBJECT_ID('dbo.ST_MIN_Stage_Minimum','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.ST_MIN_Stage_Minimum (ST_MIN_UTL_ID, ST_MIN_ST_ID, Metadata_ST_MIN)
    VALUES (2, 11, 1);
END

-- AC: NAM (historized), GEN (knot), PLV (historized knot)
IF OBJECT_ID('dbo.AC_NAM_Actor_Name','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.AC_NAM_Actor_Name (AC_NAM_AC_ID, AC_NAM_Actor_Name, AC_NAM_ChangedAt, Metadata_AC_NAM)
    VALUES (100, 'Alice', SYSUTCDATETIME(), 1);
    INSERT INTO dbo.AC_NAM_Actor_Name (AC_NAM_AC_ID, AC_NAM_Actor_Name, AC_NAM_ChangedAt, Metadata_AC_NAM)
    VALUES (101, 'Bob', SYSUTCDATETIME(), 1);
END
IF OBJECT_ID('dbo.AC_GEN_Actor_Gender','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.AC_GEN_Actor_Gender (AC_GEN_GEN_ID, AC_GEN_AC_ID, Metadata_AC_GEN)
    VALUES (1, 100, 1), (2, 101, 1);
END
IF OBJECT_ID('dbo.AC_PLV_Actor_ProfessionalLevel','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.AC_PLV_Actor_ProfessionalLevel (AC_PLV_PLV_ID, AC_PLV_AC_ID, AC_PLV_ChangedAt, Metadata_AC_PLV)
    VALUES (1, 100, SYSUTCDATETIME(), 1);
END

-- PR: NAM (static with metadata)
IF OBJECT_ID('dbo.PR_NAM_Program_Name','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.PR_NAM_Program_Name (PR_NAM_PR_ID, PR_NAM_Program_Name, Metadata_PR_NAM)
    VALUES (200, 'Alpha', 1), (201, 'Beta', 1);
END

PRINT '--- Insert nexus (EV) and attributes ---';
-- Nexus EV: roles wasHeldAt (ST), wasPlayed (PR), of (ETY) and attributes DAT (chronicle), AUD, REV
IF OBJECT_ID('dbo.EV_Event','U') IS NOT NULL
BEGIN
	SET IDENTITY_INSERT dbo.EV_Event ON;
    INSERT INTO dbo.EV_Event (EV_ID, ST_ID_wasHeldAt, PR_ID_wasPlayed, ETY_ID_of, Metadata_EV)
    VALUES (1000, 10, 200, 1, 1);
	SET IDENTITY_INSERT dbo.EV_Event OFF;
END
IF OBJECT_ID('dbo.EV_DAT_Event_Date','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.EV_DAT_Event_Date (EV_DAT_EV_ID, EV_DAT_Event_Date, Metadata_EV_DAT)
    VALUES (1000, GETDATE(), 1);
END
IF OBJECT_ID('dbo.EV_AUD_Event_Audience','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.EV_AUD_Event_Audience (EV_AUD_EV_ID, EV_AUD_Event_Audience, Metadata_EV_AUD)
    VALUES (1000, 42, 1);
END
IF OBJECT_ID('dbo.EV_REV_Event_Revenue','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.EV_REV_Event_Revenue (EV_REV_EV_ID, EV_REV_Event_Revenue, Metadata_EV_REV)
    VALUES (1000, 1234.56, 1);
END

PRINT '--- Insert ties ---';
-- Tie names are concatenation of role.type + '_' + role.role parts.
-- Tie 1 (historized): AC_exclusive_AC_with_ONG_currently
IF OBJECT_ID('dbo.AC_exclusive_AC_with_ONG_currently','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.AC_exclusive_AC_with_ONG_currently (AC_ID_exclusive, AC_ID_with, ONG_ID_currently, AC_exclusive_AC_with_ONG_currently_ChangedAt, Metadata_AC_exclusive_AC_with_ONG_currently)
    VALUES (100, 101, 1, SYSUTCDATETIME(), 1);
END

-- Tie 2 (static): AC_subset_PN_of
IF OBJECT_ID('dbo.AC_subset_PN_of','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.AC_subset_PN_of (AC_ID_subset, PN_ID_of, Metadata_AC_subset_PN_of)
    VALUES (100, 1, 1);
END

-- Tie 3 (static identifiers): EV_in_AC_wasCast
IF OBJECT_ID('dbo.EV_in_AC_wasCast','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.EV_in_AC_wasCast (EV_ID_in, AC_ID_wasCast, Metadata_EV_in_AC_wasCast)
    VALUES (1000, 100, 1);
END

-- Tie 4 (historized): AC_part_PR_in_RAT_got
IF OBJECT_ID('dbo.AC_part_PR_in_RAT_got','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.AC_part_PR_in_RAT_got (AC_ID_part, PR_ID_in, RAT_ID_got, AC_part_PR_in_RAT_got_ChangedAt, Metadata_AC_part_PR_in_RAT_got)
    VALUES (100, 200, 1, SYSUTCDATETIME(), 1);
END

-- Tie 5 (historized): ST_at_PR_isPlaying
IF OBJECT_ID('dbo.ST_at_PR_isPlaying','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.ST_at_PR_isPlaying (ST_ID_at, PR_ID_isPlaying, ST_at_PR_isPlaying_ChangedAt, Metadata_ST_at_PR_isPlaying)
    VALUES (10, 200, SYSUTCDATETIME(), 1);
END

-- Tie 6 (static): AC_parent_AC_child_PAT_having
IF OBJECT_ID('dbo.AC_parent_AC_child_PAT_having','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.AC_parent_AC_child_PAT_having (AC_ID_parent, AC_ID_child, PAT_ID_having, Metadata_AC_parent_AC_child_PAT_having)
    VALUES (100, 101, 1, 1);
END

-- Tie 7 (static): PR_content_ST_location_EV_of
IF OBJECT_ID('dbo.PR_content_ST_location_EV_of','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.PR_content_ST_location_EV_of (PR_ID_content, ST_ID_location, EV_ID_of, Metadata_PR_content_ST_location_EV_of)
    VALUES (200, 10, 1000, 1);
END

PRINT '--- Verification selects ---';

-- 1) Show knot values
SELECT 'KNOTS' as Category, * FROM dbo.PAT_ParentalType ORDER BY PAT_ID;
SELECT 'KNOTS' as Category, * FROM dbo.GEN_Gender ORDER BY GEN_ID;
SELECT 'KNOTS' as Category, * FROM dbo.PLV_ProfessionalLevel ORDER BY PLV_ID;

-- 2) Anchors and their attributes (join)
SELECT a.PN_ID, 'Person' AS Entity FROM dbo.PN_Person a;

SELECT s.ST_ID, n.ST_NAM_Stage_Name, n.ST_NAM_ChangedAt
FROM dbo.ST_Stage s
LEFT JOIN dbo.ST_NAM_Stage_Name n ON n.ST_NAM_ST_ID = s.ST_ID;

SELECT ac.AC_ID, name.AC_NAM_Actor_Name, gen.AC_GEN_GEN_ID as GenderID, plv.AC_PLV_PLV_ID as PLV
FROM dbo.AC_Actor ac
LEFT JOIN dbo.AC_NAM_Actor_Name name ON name.AC_NAM_AC_ID = ac.AC_ID
LEFT JOIN dbo.AC_GEN_Actor_Gender gen ON gen.AC_GEN_AC_ID = ac.AC_ID
LEFT JOIN dbo.AC_PLV_Actor_ProfessionalLevel plv ON plv.AC_PLV_AC_ID = ac.AC_ID;

-- 3) Nexus and its flattened attributes
SELECT ev.EV_ID, ev.ST_ID_wasHeldAt, stn.ST_NAM_Stage_Name as HeldAtStage, prn.PR_NAM_Program_Name as ProgramName, ety.ETY_EventType
FROM dbo.EV_Event ev
LEFT JOIN dbo.ST_Stage st ON st.ST_ID = ev.ST_ID_wasHeldAt
LEFT JOIN dbo.ST_NAM_Stage_Name stn ON stn.ST_NAM_ST_ID = st.ST_ID
LEFT JOIN dbo.PR_Program pr ON pr.PR_ID = ev.PR_ID_wasPlayed
LEFT JOIN dbo.PR_NAM_Program_Name prn ON prn.PR_NAM_PR_ID = pr.PR_ID
LEFT JOIN dbo.ETY_EventType ety ON ety.ETY_ID = ev.ETY_ID_of;

-- 4) Ties checks
SELECT * FROM dbo.AC_exclusive_AC_with_ONG_currently;
SELECT * FROM dbo.AC_subset_PN_of;
SELECT * FROM dbo.EV_in_AC_wasCast;
SELECT * FROM dbo.AC_part_PR_in_RAT_got;
SELECT * FROM dbo.ST_at_PR_isPlaying;
SELECT * FROM dbo.AC_parent_AC_child_PAT_having;
SELECT * FROM dbo.PR_content_ST_location_EV_of;

COMMIT TRANSACTION;
PRINT '--- Done ---';

-- NOTE: If your naming settings differ (naming = "improved" vs "classic"), adapt table/column names accordingly.
-- If any of the INSERT statements fail because the table/column names differ, paste the output here and I will adapt the script.
