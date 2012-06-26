<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text" indent="no"/>

    <!-- lookup hash tables -->
    <xsl:key name="knotLookup" match="//knot[@mnemonic]" use="@mnemonic"/>
    <xsl:key name="anchorLookup" match="//anchor[@mnemonic]" use="@mnemonic"/>

    <!-- parameters controlling the output -->
    <xsl:param name="metadataPrefix">
        <xsl:text>Metadata</xsl:text>
    </xsl:param>
    <xsl:param name="metadataType">
        <xsl:text>int</xsl:text>
    </xsl:param>
    <xsl:param name="metadataUsage">
        <xsl:text>true</xsl:text>
    </xsl:param>
    <xsl:param name="changingSuffix">
        <xsl:text>ChangedAt</xsl:text>
    </xsl:param>
    <xsl:param name="identitySuffix">
        <xsl:text>ID</xsl:text>
    </xsl:param>
    <xsl:param name="temporalization">
        <xsl:text>mono</xsl:text>
    </xsl:param>
    <xsl:param name="recordingSuffix">
        <xsl:text>RecordedAt</xsl:text>
    </xsl:param>
    <xsl:param name="erasingSuffix">
        <xsl:text>ErasedAt</xsl:text>
    </xsl:param>
    <xsl:param name="recordingRange">
        <xsl:text>datetime</xsl:text>
    </xsl:param>
    <xsl:param name="partitioning">
        <xsl:text>false</xsl:text>
    </xsl:param>
    <xsl:param name="entityIntegrity">
        <xsl:text>true</xsl:text>
    </xsl:param>
    <xsl:param name="defaultCapsule">
        <xsl:text>dbo</xsl:text>
    </xsl:param>

    <!-- "global" variables -->
    <xsl:variable name="N"><xsl:text>&#13;&#10;</xsl:text></xsl:variable>
    <xsl:variable name="T"><xsl:text>&#32;&#32;&#32;</xsl:text></xsl:variable>
    <xsl:variable name="Q"><xsl:text>'</xsl:text></xsl:variable>
    <xsl:variable name="D"><xsl:text>"</xsl:text></xsl:variable>

    <!-- change if on SQL Server 2005, use smallest possible granularity -->
    <xsl:variable name="chronon">
        <xsl:value-of select="'DATETIME2(7)'"/>
    </xsl:variable>

    <xsl:variable name="now">
        <xsl:value-of select="concat('DECLARE @now ', $chronon, ' = SYSDATETIME();')"/>
    </xsl:variable>

    <!-- any date equal to or larger than this value is considered infinity -->
    <xsl:variable name="infinity">
        <xsl:choose>
            <xsl:when test="$recordingRange = 'smalldatetime'">
                <xsl:text>'2079-06-06'</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>'9999-12-31'</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>

    <!-- match the schema (root element) and process the different elements using for-each loops -->
	<xsl:template match="/schema">

        <!-- check if partitioning should be used and set it up here -->
        <xsl:if test="$temporalization = 'bi' and $partitioning = 'true'">
            <xsl:value-of select="concat(
            '------------------------------- [Partition function] ---------------------------------', $N,
            '-- sends current information into the overflow partition, where passed values', $N,
            '-- less than ', $infinity, ' (assumed infinity) are considered erased', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF NOT EXISTS (SELECT * FROM sys.partition_functions WHERE name = ', $Q, 'RecordingPartition', $Q, ')', $N,
            'CREATE PARTITION FUNCTION RecordingPartition (', $recordingRange, ')', $N,
            'AS RANGE RIGHT FOR VALUES(', $infinity, ');', $N,
            'GO', $N, $N,
            '-------------------------------- [Partition scheme] ----------------------------------', $N,
            '-- data will be split up onto two filegroups (change from [PRIMARY] if desired):', $N,
            '-- 1st filegroup ($partition 1) - previously recorded (erased) information', $N,
            '-- 2nd filegroup ($partition 2) - currently recorded information', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF NOT EXISTS (SELECT * FROM sys.partition_schemes WHERE name = ', $Q, 'RecordingScheme', $Q, ')', $N,
            'CREATE PARTITION SCHEME RecordingScheme', $N,
            'AS PARTITION RecordingPartition', $N,
            'TO ([PRIMARY], [PRIMARY]);', $N,
            'GO', $N, $N
            )"/>
        </xsl:if>

        <!-- due to schemabinding, we can no longer drop things in random order -->
        <xsl:for-each select="anchor">
            <xsl:variable name="anchorCapsule" select="metadata/@capsule"/>
            <xsl:variable name="anchorName" select="concat(@mnemonic, '_', @descriptor)"/>
            <xsl:variable name="latestPerspective" select="concat('l', $anchorName)"/>
            <xsl:variable name="point-in-timePerspective" select="concat('p', $anchorName)"/>
            <xsl:variable name="differencePerspective" select="concat('d', $anchorName)"/>
            <xsl:variable name="llPerspective" select="concat('ll', $anchorName)"/>
            <xsl:variable name="lpPerspective" select="concat('lp', $anchorName)"/>
            <xsl:variable name="plPerspective" select="concat('pl', $anchorName)"/>
            <xsl:variable name="ppPerspective" select="concat('pp', $anchorName)"/>
            <xsl:value-of select="concat(
            '-------------------------------- [Drop Perspectives] ---------------------------------', $N,
            '-- perspectives are recreated every time the script is run', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $differencePerspective, $Q, ' and type LIKE ', $Q, '%F%', $Q, ')', $N,
            'DROP FUNCTION [', $anchorCapsule, '].[', $differencePerspective, '];', $N,
            'GO', $N,
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $point-in-timePerspective, $Q, ' AND type LIKE ', $Q, '%F%', $Q, ')', $N,
            'DROP FUNCTION [', $anchorCapsule, '].[', $point-in-timePerspective, '];', $N,
            'GO', $N,
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $latestPerspective, $Q, ' AND type LIKE ', $Q, '%V%', $Q, ')', $N,
            'DROP VIEW [', $anchorCapsule, '].[', $latestPerspective, '];', $N,
            'GO', $N
            )"/>
            <xsl:if test="$temporalization = 'bi'">
                <xsl:value-of select="concat(
                'IF EXISTS (SELECT * FROM sys.synonyms WHERE name = ', $Q, $llPerspective, $Q, ')', $N,
                'DROP SYNONYM [', $anchorCapsule, '].[', $llPerspective, '];', $N,
                'GO', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $lpPerspective, $Q, ' and type LIKE ', $Q, '%F%', $Q, ')', $N,
                'DROP FUNCTION [', $anchorCapsule, '].[', $lpPerspective, '];', $N,
                'GO', $N,
                'IF EXISTS (SELECT * FROM sys.synonyms WHERE name = ', $Q, $plPerspective, $Q, ')', $N,
                'DROP SYNONYM [', $anchorCapsule, '].[', $plPerspective, '];', $N,
                'GO', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $ppPerspective, $Q, ' and type LIKE ', $Q, '%F%', $Q, ')', $N,
                'DROP FUNCTION [', $anchorCapsule, '].[', $ppPerspective, '];', $N,
                'GO', $N
                )"/>
            </xsl:if>
            <xsl:value-of select="$N"/>
        </xsl:for-each>

        <xsl:for-each select="tie">
            <xsl:variable name="tieCapsule" select="metadata/@capsule"/>
            <xsl:variable name="tieName">
                <xsl:for-each select="anchorRole|knotRole">
                    <xsl:value-of select="concat(@type, '_', @role)"/>
                    <xsl:if test="not(position() = last())">
                        <xsl:text>_</xsl:text>
                    </xsl:if>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="latestPerspective" select="concat('l', $tieName)"/>
            <xsl:variable name="point-in-timePerspective" select="concat('p', $tieName)"/>
            <xsl:variable name="differencePerspective" select="concat('d', $tieName)"/>
            <xsl:variable name="llPerspective" select="concat('ll', $tieName)"/>
            <xsl:variable name="lpPerspective" select="concat('lp', $tieName)"/>
            <xsl:variable name="plPerspective" select="concat('pl', $tieName)"/>
            <xsl:variable name="ppPerspective" select="concat('pp', $tieName)"/>
            <xsl:value-of select="concat(
            '-------------------------------- [Drop Perspectives] ---------------------------------', $N,
            '-- perspectives are recreated every time the script is run', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $differencePerspective, $Q, ' and type LIKE ', $Q, '%F%', $Q, ')', $N,
            'DROP FUNCTION [', $tieCapsule, '].[', $differencePerspective, '];', $N,
            'GO', $N,
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $point-in-timePerspective, $Q, ' AND type LIKE ', $Q, '%F%', $Q, ')', $N,
            'DROP FUNCTION [', $tieCapsule, '].[', $point-in-timePerspective, '];', $N,
            'GO', $N,
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $latestPerspective, $Q, ' AND type LIKE ', $Q, '%V%', $Q, ')', $N,
            'DROP VIEW [', $tieCapsule, '].[', $latestPerspective, '];', $N,
            'GO', $N
            )"/>
            <xsl:if test="$temporalization = 'bi'">
                <xsl:value-of select="concat(
                'IF EXISTS (SELECT * FROM sys.synonyms WHERE name = ', $Q, $llPerspective, $Q, ')', $N,
                'DROP SYNONYM [', $tieCapsule, '].[', $llPerspective, '];', $N,
                'GO', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $lpPerspective, $Q, ' and type LIKE ', $Q, '%F%', $Q, ')', $N,
                'DROP FUNCTION [', $tieCapsule, '].[', $lpPerspective, '];', $N,
                'GO', $N,
                'IF EXISTS (SELECT * FROM sys.synonyms WHERE name = ', $Q, $plPerspective, $Q, ')', $N,
                'DROP SYNONYM [', $tieCapsule, '].[', $plPerspective, '];', $N,
                'GO', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $ppPerspective, $Q, ' and type LIKE ', $Q, '%F%', $Q, ')', $N,
                'DROP FUNCTION [', $tieCapsule, '].[', $ppPerspective, '];', $N,
                'GO', $N
                )"/>
            </xsl:if>
            <xsl:value-of select="$N"/>
        </xsl:for-each>

		<!-- process all knots -->
		<xsl:for-each select="knot">
            <xsl:variable name="knotName" select="concat(@mnemonic, '_', @descriptor)"/>
            <xsl:variable name="knotMetadata" select="concat($metadataPrefix, '_', @mnemonic)"/>
            <xsl:variable name="knotIdentity" select="concat(@mnemonic, '_', $identitySuffix)"/>
            <xsl:variable name="knotIdentityType" select="@identity"/>
            <xsl:variable name="knotDataType" select="@dataRange"/>
            <xsl:variable name="knotCapsule" select="metadata/@capsule"/>
            <xsl:variable name="knotIdentityGenerator">
                <xsl:if test="string(metadata/@generator) = 'true'">
                    <xsl:text> identity(1, 1)</xsl:text>
                </xsl:if>
            </xsl:variable>
            <xsl:variable name="knotMetadataDefinition">
            	<xsl:if test="$metadataUsage = 'true'">
            		<xsl:value-of select="concat($T, $knotMetadata, ' ', $metadataType, ' not null,', $N)"/>
            	</xsl:if>
            </xsl:variable>
            <xsl:value-of select="concat(
            '----------------------------------- [Knot Table] -------------------------------------', $N,
            '-- ', $knotName, ' table', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $knotName, $Q, ' and type LIKE ', $Q, '%U%', $Q, ')', $N,
            'CREATE TABLE [', $knotCapsule, '].[', $knotName, '] (', $N,
            $T, $knotIdentity, ' ', $knotIdentityType, $knotIdentityGenerator, ' not null,', $N,
            $T, $knotName, ' ', $knotDataType, ' not null,', $N,
            $knotMetadataDefinition,
            $T, 'constraint pk', $knotName, ' primary key (', $N,
            $T, $T, $knotIdentity, ' asc', $N,
            $T, '),', $N,
            $T, 'constraint uq', $knotName, ' unique (', $N,
            $T, $T, $knotName, $N,
            $T, ')', $N,
            ');', $N,
            'GO', $N, $N
            )"/>
		</xsl:for-each>
        <!-- process all anchors -->
        <xsl:for-each select="anchor">
            <xsl:variable name="anchorMnemonic" select="@mnemonic"/>
            <xsl:variable name="anchorName" select="concat(@mnemonic, '_', @descriptor)"/>
            <xsl:variable name="anchorMetadata" select="concat($metadataPrefix, '_', @mnemonic)"/>
            <xsl:variable name="anchorIdentity" select="concat(@mnemonic, '_', $identitySuffix)"/>
            <xsl:variable name="anchorIdentityType" select="@identity"/>
            <xsl:variable name="anchorCapsule" select="metadata/@capsule"/>
            <xsl:variable name="llPerspective" select="concat('ll', $anchorName)"/>
            <xsl:variable name="lpPerspective" select="concat('lp', $anchorName)"/>
            <xsl:variable name="plPerspective" select="concat('pl', $anchorName)"/>
            <xsl:variable name="ppPerspective" select="concat('pp', $anchorName)"/>
            <xsl:variable name="latestPerspective" select="concat('l', $anchorName)"/>
            <xsl:variable name="point-in-timePerspective" select="concat('p', $anchorName)"/>
            <xsl:variable name="differencePerspective" select="concat('d', $anchorName)"/>
            <xsl:variable name="anchorIdentityGenerator">
                <xsl:if test="string(metadata/@generator) = 'true'">
                    <xsl:text> identity(1, 1)</xsl:text>
                </xsl:if>
            </xsl:variable>
            <xsl:variable name="anchorMetadataDefinition">
                <xsl:choose>
                    <xsl:when test="$metadataUsage = 'true'">
                        <xsl:value-of select="concat($T, $anchorMetadata, ' ', $metadataType, ' not null,', $N)"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="concat($T, $anchorMnemonic, '_Dummy bit null,', $N)"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <xsl:value-of select="concat(
            '---------------------------------- [Anchor Table] ------------------------------------', $N,
            '-- ', $anchorName, ' table (with ', count(attribute), ' attributes)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $anchorName, $Q, ' AND type LIKE ', $Q, '%U%', $Q, ')', $N,
            'CREATE TABLE [', $anchorCapsule, '].[', $anchorName, '] (', $N,
            $T, $anchorIdentity, ' ', $anchorIdentityType, $anchorIdentityGenerator, ' not null,', $N,
            $anchorMetadataDefinition,
            $T, 'constraint pk', $anchorName, ' primary key (', $N,
            $T, $T, $anchorIdentity, ' asc', $N,
            $T, ')', $N,
            ');', $N,
            'GO', $N, $N
            )"/>
            <xsl:variable name="insertIntoStatement">
                <xsl:choose>
                    <xsl:when test="$metadataUsage = 'true'">
                        <xsl:value-of select="concat($T, $T, 'INSERT INTO [', $anchorCapsule, '].[', $anchorName, '] (', $anchorMetadata, ')', $N)"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="concat($T, $T, 'INSERT INTO [', $anchorCapsule, '].[', $anchorName, '] (', $anchorMnemonic, '_Dummy)', $N)"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <xsl:variable name="insertIntoValue">
                <xsl:choose>
                    <xsl:when test="$metadataUsage = 'true'">
                        <xsl:value-of select="concat($T, $T, $T, '@', $anchorMetadata, $N)"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="concat($T, $T, $T, 'null', $N)"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <xsl:if test="string(metadata/@generator) = 'true'">
                <xsl:variable name="anchorKeyGenerator" select="concat('k', $anchorName)"/>
                <xsl:variable name="metadataParameter">
                    <xsl:if test="$metadataUsage = 'true'">
                        <xsl:value-of select="concat(',', $N, $T, '@', $anchorMetadata, ' ', $metadataType)"/>
                    </xsl:if>
                </xsl:variable>
                <xsl:value-of select="concat(
                '----------------------- [Key Generation Stored Procedure] ----------------------------', $N,
                '-- ', $anchorName, ' surrogate key generation stored procedure', $N,
                '--------------------------------------------------------------------------------------', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $anchorKeyGenerator, $Q, ' AND type in (', $Q, 'P', $Q, ',', $Q, 'PC', $Q, '))', $N,
                'DROP PROCEDURE [', $anchorCapsule, '].[', $anchorKeyGenerator, ']', $N,
                'GO', $N,
                'CREATE PROCEDURE [', $anchorCapsule, '].[', $anchorKeyGenerator, '] (', $N,
	            $T, '@requestedNumberOfIdentities bigint',
	            $metadataParameter, $N,
	            ') AS', $N,
                'BEGIN', $N,
	            $T, 'SET NOCOUNT ON;', $N,
	            $T, 'IF @requestedNumberOfIdentities &gt; 0', $N,
	            $T, 'BEGIN', $N,
	            $T, $T, 'WITH rowGenerator (rowNumber) AS (', $N,
		        $T, $T, $T, 'SELECT', $N,
			    $T, $T, $T, $T, '1', $N,
		        $T, $T, $T, 'UNION ALL', $N,
		        $T, $T, $T, 'SELECT', $N,
			    $T, $T, $T, $T, 'rowNumber + 1', $N,
		        $T, $T, $T, 'FROM', $N,
			    $T, $T, $T, $T, 'rowGenerator', $N,
		        $T, $T, $T, 'WHERE', $N,
			    $T, $T, $T, $T, 'rowNumber &lt; @requestedNumberOfIdentities', $N,
	            $T, $T, ')', $N,
	            $insertIntoStatement,
	            $T, $T, 'OUTPUT', $N,
		        $T, $T, $T, 'inserted.', $anchorIdentity, $N,
	            $T, $T, 'SELECT', $N,
	            $insertIntoValue,
	            $T, $T, 'FROM', $N,
		        $T, $T, $T, 'rowGenerator', $N,
	            $T, $T, 'OPTION (maxrecursion 0);', $N,
	            $T, 'END', $N,
                'END', $N,
                'GO', $N, $N
                )"/>
            </xsl:if>
            <!-- process all attributes in the current anchor -->
            <xsl:for-each select="attribute">
                <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', @mnemonic)"/>
                <xsl:variable name="attributeMetadata" select="concat($metadataPrefix, '_', $attributeMnemonic)"/>
                <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', parent::*/@descriptor, '_', @descriptor)"/>
                <xsl:variable name="attributeCapsule" select="metadata/@capsule"/>
                <xsl:variable name="attributeRestatements" select="metadata/@restatements"/>
                <xsl:variable name="attributeMetadataDefinition">
					<xsl:if test="$metadataUsage = 'true'">
						<xsl:value-of select="concat($T, $attributeMetadata, ' ', $metadataType, ' not null,', $N)"/>
					</xsl:if>
				</xsl:variable>
                <xsl:variable name="knotOrDataDefinition">
                    <xsl:choose>
                        <xsl:when test="key('knotLookup', @knotRange)">
                            <xsl:variable name="knot" select="key('knotLookup', @knotRange)"/>
                            <xsl:value-of select="concat($T, @knotRange, '_', $identitySuffix,' ', $knot/@identity, ' not null foreign key references [', $knot/metadata/@capsule, '].[', @knotRange, '_', $knot/@descriptor, '](', @knotRange, '_', $identitySuffix,'),', $N)"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="concat($T, $attributeName, ' ', @dataRange, ' not null,', $N)"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable name="attributeChangingDefinition">
                    <xsl:if test="@timeRange">
                        <xsl:value-of select="concat($T, $attributeMnemonic, '_', $changingSuffix, ' ', @timeRange, ' not null,', $N)"/>
                    </xsl:if>
                </xsl:variable>
                <xsl:variable name="attributeChangingKey">
                    <xsl:if test="@timeRange">
                        <xsl:value-of select="concat(',', $N, $T, $T, $attributeMnemonic, '_', $changingSuffix, ' desc')"/>
                    </xsl:if>
                </xsl:variable>
                <xsl:variable name="attributeRecordingDefinition">
                    <xsl:if test="$temporalization = 'bi'">
                        <xsl:value-of select="concat(
                        $T, $attributeMnemonic, '_', $recordingSuffix, ' ', $recordingRange, ' not null,', $N,
                        $T, $attributeMnemonic, '_', $erasingSuffix, ' ', $recordingRange, ' not null,', $N
                        )"/>
                    </xsl:if>
                </xsl:variable> 
                <xsl:variable name="attributeRecordingKey">
                    <xsl:if test="$temporalization = 'bi'">
                        <xsl:value-of select="concat(
                        ', ', $N, $T, $T, $attributeMnemonic, '_', $recordingSuffix, ' desc, ', $N,
                        $T, $T, $attributeMnemonic, '_', $erasingSuffix, ' desc'
                        )"/>
                    </xsl:if>
                    <xsl:value-of select="$N"/>
                </xsl:variable> 
                <xsl:variable name="attributePartition">
                    <xsl:choose>
                        <xsl:when test="$temporalization = 'bi' and $partitioning = 'true'">
                            <xsl:value-of select="concat('RecordingScheme(', $attributeMnemonic, '_', $erasingSuffix, ')')"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="'[PRIMARY]'"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:if test="@timeRange and $attributeRestatements = 'false'">
                    <xsl:variable name="knotOrDataType">
                        <xsl:choose>
                            <xsl:when test="key('knotLookup', @knotRange)">
                                <xsl:variable name="knot" select="key('knotLookup', @knotRange)"/>
                                <xsl:value-of select="$knot/@identity"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="@dataRange"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:variable>
                    <xsl:variable name="knotOrDataName">
                        <xsl:choose>
                            <xsl:when test="key('knotLookup', @knotRange)">
                                <xsl:variable name="knot" select="key('knotLookup', @knotRange)"/>
                                <xsl:value-of select="concat($knot/@mnemonic, '_', $identitySuffix)"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="$attributeName"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:variable>
                    <xsl:variable name="erasedAtParameter">
                        <xsl:if test="$temporalization = 'bi'">
                            <xsl:value-of select="concat(',', $N, $T, '@erasedAt ', $recordingRange)"/>
                        </xsl:if>
                    </xsl:variable>
                    <xsl:variable name="erasedAtCondition">
                        <xsl:if test="$temporalization = 'bi'">
                            <xsl:value-of select="concat($N, $T, $T, 'AND', $N, $T, $T, $T, $attributeMnemonic, '_', $erasingSuffix, ' = @erasedAt')"/>
                        </xsl:if>
                    </xsl:variable>
                    <xsl:value-of select="concat(
                    '------------------------------- [Restatement Checker] --------------------------------', $N,
                    '-- s', $attributeName, ' restatement checker, returns 0 when last value differs', $N,
                    '--------------------------------------------------------------------------------------', $N,
                    'IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, 's', $attributeName, $Q, ' AND type LIKE ', $Q, '%F%', $Q, ')', $N,
                    'EXEC (', $Q, $N,
                    'CREATE FUNCTION [', $attributeCapsule, '].[s', $attributeName, '] (', $N,
                    $T, '@identity ', $anchorIdentityType, ',', $N,
                    $T, '@value ', $knotOrDataType, ',', $N,
                    $T, '@changedAt ', @timeRange,
                    $erasedAtParameter, $N,
                    ')', $N,
                    'RETURNS tinyint AS BEGIN RETURN (', $N,
                    $T, 'SELECT', $N,
                    $T, $T, 'count(*)', $N,
                    $T, 'WHERE (', $N,
                    $T, $T, 'SELECT TOP 1', $N,
                    $T, $T, $T, $knotOrDataName, $N,
                    $T, $T, 'FROM', $N,
                    $T, $T, $T, '[', $attributeCapsule, '].[', $attributeName, ']', $N,
                    $T, $T, 'WHERE', $N,
                    $T, $T, $T, $anchorIdentity, ' = @identity', $N,
                    $T, $T, 'AND', $N,
                    $T, $T, $T, $attributeMnemonic, '_', $changingSuffix, ' &lt; @changedAt',
                    $erasedAtCondition, $N,
                    $T, $T, 'ORDER BY', $N,
                    $T, $T, $T, $attributeMnemonic, '_', $changingSuffix, ' desc', $N,
                    $T, ') = @value', $N,
                    ')', $N,
                    'END', $Q, ');', $N,
                    'GO', $N, $N
                    )"/>
                </xsl:if>
                <!-- guarantee only one current version of the information -->
                <xsl:variable name="attributeEntityIntegrity">
                    <xsl:variable name="attributeChangingParameter">
                        <xsl:if test="@timeRange">
                            <xsl:value-of select="concat($T, $T, $T, $attributeMnemonic, '_', $changingSuffix, ',', $N)"/>
                        </xsl:if>
                    </xsl:variable>
                    <xsl:if test="$temporalization = 'bi' and $entityIntegrity = 'true'">
                        <xsl:value-of select="concat(
                        $T, 'constraint uq', $attributeName, ' unique (', $N,
                        $T, $T, $attributeMnemonic, '_', $erasingSuffix, ', ', $N,
                        $T, $T, $anchorIdentity,
                        $attributeChangingKey, $N,
                        $T, '),', $N,
                        $T, 'constraint in', $attributeName, ' check (', $N,
                        $T, $T, $attributeMnemonic, '_', $recordingSuffix, ' &lt; ', $attributeMnemonic, '_', $erasingSuffix, $N,
                        $T, '),', $N,
                        $T, 'constraint ov', $attributeName, ' check (', $N,
                        $T, $T, '[', $attributeCapsule, '].[o', $attributeName, '] (', $N,
                        $T, $T, $T, $anchorIdentity, ',', $N,
                        $attributeChangingParameter,
                        $T, $T, $T, $attributeMnemonic, '_', $recordingSuffix, ',', $N,
                        $T, $T, $T, $attributeMnemonic, '_', $erasingSuffix, $N,
                        $T, $T, ') = 0', $N,
                        $T, '),', $N
                        )"/>
                    </xsl:if>
                </xsl:variable>
                <xsl:variable name="attributeRestatementPrevention">
                    <xsl:variable name="knotOrDataName">
                        <xsl:choose>
                            <xsl:when test="key('knotLookup', @knotRange)">
                                <xsl:variable name="knot" select="key('knotLookup', @knotRange)"/>
                                <xsl:value-of select="concat($knot/@mnemonic, '_', $identitySuffix)"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="$attributeName"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:variable>
                    <xsl:variable name="erasedAtParameter">
                        <xsl:if test="$temporalization = 'bi'">
                            <xsl:value-of select="concat(',', $N, $T, $T, $T, $attributeMnemonic, '_', $recordingSuffix)"/>
                        </xsl:if>
                    </xsl:variable>
                    <xsl:if test="@timeRange and $attributeRestatements = 'false'">
                        <xsl:value-of select="concat(
                        $T, 'constraint rs', $attributeName, ' check (', $N,
                        $T, $T, '[', $attributeCapsule, '].[s', $attributeName, '] (', $N,
                        $T, $T, $T, $anchorIdentity, ',', $N,
                        $T, $T, $T, $knotOrDataName, ',', $N,
                        $T, $T, $T, $attributeMnemonic, '_', $changingSuffix,
                        $erasedAtParameter, $N,
                        $T, $T, ') = 0', $N,
                        $T, '),', $N
                        )"/>
                    </xsl:if>
                </xsl:variable>
                <xsl:if test="$temporalization = 'bi' and $entityIntegrity = 'true'">
                    <xsl:variable name="attributeChangingParameter">
                        <xsl:if test="@timeRange">
                            <xsl:value-of select="concat($T, '@changedAt ', @timeRange, ', ', $N)"/>
                        </xsl:if>
                    </xsl:variable>
                    <xsl:variable name="attributeChangingCondition">
                        <xsl:if test="@timeRange">
                            <xsl:value-of select="concat($T, 'AND', $N, $T, $T, $attributeMnemonic, '_', $changingSuffix, ' = @changedAt', $N)"/>
                        </xsl:if>
                    </xsl:variable>
                    <xsl:value-of select="concat(
                    '--------------------------------- [Overlap Counter] ----------------------------------', $N,
                    '-- o', $attributeName, ' counter', $N,
                    '--------------------------------------------------------------------------------------', $N,
                    'IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, 'o', $attributeName, $Q, ' AND type LIKE ', $Q, '%F%', $Q, ')', $N,
                    'EXEC (', $Q, $N,
                    'CREATE FUNCTION [', $attributeCapsule, '].[o', $attributeName, '] (', $N,
                    $T, '@identity ', $anchorIdentityType, ',', $N,
                    $attributeChangingParameter,
                    $T, '@recordedAt ', $recordingRange, ',', $N,
                    $T, '@erasedAt ', $recordingRange, $N,
                    ')', $N,
                    'RETURNS ', $anchorIdentityType, ' AS BEGIN RETURN (', $N,
                    $T, 'SELECT', $N,
                    $T, $T, 'count(*)', $N,
                    $T, 'FROM', $N,
                    $T, $T, '[', $attributeCapsule, '].[', $attributeName, ']', $N,
                    $T, 'WHERE', $N,
                    $T, $T, $anchorIdentity, ' = @identity', $N,
                    $attributeChangingCondition,
                    $T, 'AND (', $N,
                    $T, $T, $T, $attributeMnemonic, '_', $recordingSuffix, ' &lt;&gt; @recordedAt', $N,
                    $T, $T, 'OR', $N,
                    $T, $T, $T, $attributeMnemonic, '_', $erasingSuffix, ' &lt;&gt; @erasedAt', $N,
                    $T, ')', $N,
                    $T, 'AND ((', $N,
                    $T, $T, $T, '@recordedAt &gt;= ', $attributeMnemonic, '_', $recordingSuffix, $N,
                    $T, $T, 'AND', $N,
                    $T, $T, $T, '@recordedAt &lt; ', $attributeMnemonic, '_', $erasingSuffix, $N,
                    $T, ') OR (', $N,
                    $T, $T, $T, '@erasedAt &gt; ', $attributeMnemonic, '_', $recordingSuffix, $N,
                    $T, $T, 'AND', $N,
                    $T, $T, $T, '@erasedAt &lt;= ', $attributeMnemonic, '_', $erasingSuffix, $N,
                    $T, '))', $N,
                    ')', $N,
                    'END', $Q, ');', $N,
                    'GO', $N, $N
                    )"/>
                </xsl:if>
                <xsl:value-of select="concat(
                '--------------------------------- [Attribute Table] ----------------------------------', $N,
                '-- ', $attributeName, ' table (on ', $anchorName, ')', $N,
                '--------------------------------------------------------------------------------------', $N,
                'IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $attributeName, $Q, ' AND type LIKE ', $Q, '%U%', $Q, ')', $N,
                'CREATE TABLE [', $attributeCapsule, '].[', $attributeName, '] (', $N,
                $T, $anchorIdentity, ' ', $anchorIdentityType, ' not null foreign key references [', $anchorCapsule, '].[', $anchorName, '](', $anchorIdentity, '),', $N,
                $knotOrDataDefinition,
                $attributeChangingDefinition,
                $attributeRecordingDefinition,
                $attributeMetadataDefinition,
                $attributeEntityIntegrity,
                $attributeRestatementPrevention,
                $T, 'constraint pk', $attributeName, ' primary key (', $N,
                $T, $T, $anchorIdentity, ' asc',
                $attributeChangingKey,
                $attributeRecordingKey,
                $T, ')', $N,
                ') ON ', $attributePartition, ';', $N,
                'GO', $N, $N
                )"/>
                <xsl:variable name="attributeMetadataColumn">
                    <xsl:if test="$metadataUsage = 'true'">
                        <xsl:value-of select="concat(', ', $N, $T, $attributeMetadata)"/>
                    </xsl:if>
                    <xsl:value-of select="$N"/>
                </xsl:variable>
                <xsl:variable name="attributeChangingColumn">
                    <xsl:if test="@timeRange">
                        <xsl:value-of select="concat(', ',$N, $T, $attributeMnemonic, '_', $changingSuffix)"/>
                    </xsl:if>
                </xsl:variable>
                <xsl:variable name="knotOrDataColumn">
                    <xsl:choose>
                        <xsl:when test="key('knotLookup', @knotRange)">
                            <xsl:value-of select="concat($T, @knotRange, '_', $identitySuffix)"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="concat($T, $attributeName)"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:choose>
                    <xsl:when test="$temporalization = 'mono'">
                        <xsl:if test="@timeRange">
                            <xsl:value-of select="concat(
                            '--------------------------- [Rewind changing perspective] ----------------------------', $N,
                            '-- r', $attributeName, ' function', $N,
                            '--------------------------------------------------------------------------------------', $N,
                            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, 'r', $attributeName, $Q, ' AND type LIKE ', $Q, '%F%', $Q, ')', $N,
                            'DROP FUNCTION [', $attributeCapsule, '].[r', $attributeName, '];', $N,
                            'GO', $N,
                            'CREATE FUNCTION [', $attributeCapsule, '].[r', $attributeName, '] (@changingTimepoint ', @timeRange, ')', $N,
                            'RETURNS TABLE WITH SCHEMABINDING AS RETURN', $N,
                            'SELECT', $N,
                            $T, $anchorIdentity, ', ', $N,
                            $knotOrDataColumn,
                            $attributeChangingColumn,
                            $attributeMetadataColumn,
                            'FROM', $N,
                            $T, '[', $attributeCapsule, '].[', $attributeName, ']', $N,
                            'WHERE', $N,
                            $T, $attributeMnemonic, '_', $changingSuffix, ' &lt;= @changingTimepoint;', $N,
                            'GO', $N, $N
                            )"/>
                        </xsl:if>
                    </xsl:when>
                    <xsl:when test="$temporalization = 'bi'">
                        <xsl:value-of select="concat(
                        '-------------------- [All changing currently recorded perspective] -------------------', $N,
                        '-- ac', $attributeName, ' view', $N,
                        '--------------------------------------------------------------------------------------', $N,
                        'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, 'ac', $attributeName, $Q, ' AND type LIKE ', $Q, '%V%', $Q, ')', $N,
                        'DROP VIEW [', $attributeCapsule, '].[ac', $attributeName, '];', $N,
                        'GO', $N,
                        'CREATE VIEW [', $attributeCapsule, '].[ac', $attributeName, '] WITH SCHEMABINDING AS', $N,
                        'SELECT', $N,
                        $T, $anchorIdentity, ', ', $N,
                        $knotOrDataColumn,
                        $attributeChangingColumn, ', ', $N,
                        $T, $attributeMnemonic, '_', $recordingSuffix, ', ', $N,
                        $T, $attributeMnemonic, '_', $erasingSuffix,
                        $attributeMetadataColumn,
                        'FROM', $N,
                        $T, '[', $attributeCapsule, '].[', $attributeName, ']', $N,
                        'WHERE', $N,
                        $T, $attributeMnemonic, '_', $erasingSuffix, ' &gt;= ', $infinity, ';', $N,
                        'GO', $N, $N
                        )"/>
                        <xsl:value-of select="concat(
                        '--------------------- [All changing rewind recording perspective] --------------------', $N,
                        '-- ar', $attributeName, ' function', $N,
                        '--------------------------------------------------------------------------------------', $N,
                        'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, 'ar', $attributeName, $Q, ' AND type LIKE ', $Q, '%F%', $Q, ')', $N,
                        'DROP FUNCTION [', $attributeCapsule, '].[ar', $attributeName, '];', $N,
                        'GO', $N,
                        'CREATE FUNCTION [', $attributeCapsule, '].[ar', $attributeName, '] (@recordingTimepoint ', $recordingRange, ')', $N,
                        'RETURNS TABLE WITH SCHEMABINDING AS RETURN', $N,
                        'SELECT', $N,
                        $T, $anchorIdentity, ', ', $N,
                        $knotOrDataColumn,
                        $attributeChangingColumn, ', ', $N,
                        $T, $attributeMnemonic, '_', $recordingSuffix, ', ', $N,
                        $T, $attributeMnemonic, '_', $erasingSuffix,
                        $attributeMetadataColumn,
                        'FROM', $N,
                        $T, '[', $attributeCapsule, '].[', $attributeName, ']', $N,
                        'WHERE', $N,
                        $T, $attributeMnemonic, '_', $erasingSuffix, ' &gt; @recordingTimepoint', $N,
                        'AND', $N,
                        $T, $attributeMnemonic, '_', $recordingSuffix, ' &lt;= @recordingTimepoint;', $N,
                        'GO', $N, $N
                        )"/>
                        <xsl:if test="@timeRange">
                            <xsl:value-of select="concat(
                            '------------------ [Rewind changing currently recorded perspective] ------------------', $N,
                            '-- rc', $attributeName, ' function', $N,
                            '--------------------------------------------------------------------------------------', $N,
                            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, 'rc', $attributeName, $Q, ' AND type LIKE ', $Q, '%F%', $Q, ')', $N,
                            'DROP FUNCTION [', $attributeCapsule, '].[rc', $attributeName, '];', $N,
                            'GO', $N,
                            'CREATE FUNCTION [', $attributeCapsule, '].[rc', $attributeName, '] (@changingTimepoint ', @timeRange, ')', $N,
                            'RETURNS TABLE WITH SCHEMABINDING AS RETURN', $N,
                            'SELECT', $N,
                            $T, $anchorIdentity, ', ', $N,
                            $knotOrDataColumn,
                            $attributeChangingColumn, ', ', $N,
                            $T, $attributeMnemonic, '_', $recordingSuffix, ', ', $N,
                            $T, $attributeMnemonic, '_', $erasingSuffix,
                            $attributeMetadataColumn,
                            'FROM', $N,
                            $T, '[', $attributeCapsule, '].[', $attributeName, ']', $N,
                            'WHERE', $N,
                            $T, $attributeMnemonic, '_', $erasingSuffix, ' &gt;= ', $infinity, $N,
                            'AND', $N,
                            $T, $attributeMnemonic, '_', $changingSuffix, ' &lt;= @changingTimepoint;', $N,
                            'GO', $N, $N
                            )"/>
                            <xsl:value-of select="concat(
                            '------------------- [Rewind changing rewind recording perspective] -------------------', $N,
                            '-- rr', $attributeName, ' function', $N,
                            '--------------------------------------------------------------------------------------', $N,
                            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, 'rr', $attributeName, $Q, ' AND type LIKE ', $Q, '%F%', $Q, ')', $N,
                            'DROP FUNCTION [', $attributeCapsule, '].[rr', $attributeName, '];', $N,
                            'GO', $N,
                            'CREATE FUNCTION [', $attributeCapsule, '].[rr', $attributeName, '] (', $N,
                            $T, '@changingTimepoint ', @timeRange, ', ', $N,
                            $T, '@recordingTimepoint ', $recordingRange, $N,
                            ')', $N,
                            'RETURNS TABLE WITH SCHEMABINDING AS RETURN', $N,
                            'SELECT', $N,
                            $T, $anchorIdentity, ', ', $N,
                            $knotOrDataColumn,
                            $attributeChangingColumn, ', ', $N,
                            $T, $attributeMnemonic, '_', $recordingSuffix, ', ', $N,
                            $T, $attributeMnemonic, '_', $erasingSuffix,
                            $attributeMetadataColumn,
                            'FROM', $N,
                            $T, '[', $attributeCapsule, '].[', $attributeName, ']', $N,
                            'WHERE', $N,
                            $T, $attributeMnemonic, '_', $erasingSuffix, ' &gt; @recordingTimepoint', $N,
                            'AND', $N,
                            $T, $attributeMnemonic, '_', $changingSuffix, ' &lt;= @changingTimepoint', $N,
                            'AND', $N,
                            $T, $attributeMnemonic, '_', $recordingSuffix, ' &lt;= @recordingTimepoint;', $N,
                            'GO', $N, $N
                            )"/>
                        </xsl:if>
                    </xsl:when>
                </xsl:choose>
            </xsl:for-each>
            <!-- create the time perspectives -->
            <xsl:variable name="columnReferences">
                <xsl:for-each select="attribute">
                    <xsl:call-template name="columnReference">
                        <xsl:with-param name="attribute" select="."/>
                    </xsl:call-template>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="latestJoinConditions">
                <xsl:for-each select="attribute">
                    <xsl:call-template name="joinCondition">
                        <xsl:with-param name="attribute" select="."/>
                    </xsl:call-template>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="anchorMetadataColumnReference">
            	<xsl:if test="$metadataUsage = 'true'">
            		<xsl:value-of select="concat(', ', $N, $T, '[', $anchorMnemonic, '].', $anchorMetadata)"/>
            	</xsl:if>
            </xsl:variable>
            <xsl:value-of select="concat(
            '------------------------------- [Latest Perspective] ---------------------------------', $N,
            '-- ', $anchorName, ' viewed as is (given by the latest available information)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'CREATE VIEW [', $anchorCapsule, '].[', $latestPerspective, '] WITH SCHEMABINDING AS', $N,
            'SELECT', $N,
            $T, '[', $anchorMnemonic, '].', $anchorIdentity,
            $anchorMetadataColumnReference,
            $columnReferences, $N,
            'FROM', $N,
            $T, '[', $anchorCapsule, '].[', $anchorName, '] [', $anchorMnemonic, ']',
            $latestJoinConditions, ';', $N,
            'GO', $N, $N
            )"/>
            <xsl:if test="$temporalization = 'bi'">
                <xsl:value-of select="concat(
                'CREATE SYNONYM [', $anchorCapsule, '].[', $llPerspective, '] FOR [', $anchorCapsule, '].[', $latestPerspective, '];', $N,
                'GO', $N, $N
                )"/>
                <xsl:variable name="lpJoinConditions">
                    <xsl:for-each select="attribute">
                        <xsl:call-template name="joinCondition">
                            <xsl:with-param name="attribute" select="."/>
                            <xsl:with-param name="recordingTimepoint" select="'@recordingTimepoint'"/>
                        </xsl:call-template>
                    </xsl:for-each>
                </xsl:variable>
                <xsl:value-of select="concat(
                '----------------- [Latest changing point-in-recording Perspective] -------------------', $N,
                '-- ', $anchorName, ' viewed as is at the given recording time', $N,
                '--------------------------------------------------------------------------------------', $N,
                'CREATE FUNCTION [', $anchorCapsule, '].[', $lpPerspective, '] (@recordingTimepoint ', $recordingRange, ')', $N,
                'RETURNS TABLE WITH SCHEMABINDING AS RETURN', $N,
                'SELECT', $N,
                $T, '[', $anchorMnemonic, '].', $anchorIdentity,
                $anchorMetadataColumnReference,
                $columnReferences, $N,
                'FROM', $N,
                $T, '[', $anchorCapsule, '].[', $anchorName, '] [', $anchorMnemonic, ']',
                $lpJoinConditions, ';', $N,
                'GO', $N, $N
                )"/>
            </xsl:if>
            <xsl:variable name="insertStatements">
                <xsl:for-each select="attribute">
                    <xsl:call-template name="insertStatement">
                        <xsl:with-param name="attribute" select="."/>                        
                    </xsl:call-template>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="insertColumnReference">
                <xsl:choose>
                    <xsl:when test="$metadataUsage = 'true'">
                        <xsl:value-of select="concat($T, $T, $anchorMetadata, $N)"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="concat($T, $T, $anchorMnemonic, '_Dummy', $N)"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <xsl:variable name="insertColumnValue">
                <xsl:choose>
                    <xsl:when test="$metadataUsage = 'true'">
                        <xsl:value-of select="concat($T, $T, $anchorMetadata, $N)"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="concat($T, $T, 'null', $N)"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <xsl:variable name="insertTriggerName" select="concat('it', $anchorName)"/>
            <xsl:value-of select="concat(
            '--------------------------------- [Insert Trigger] -----------------------------------', $N,
            '-- ', $anchorName, ' insert trigger on the latest perspective', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF EXISTS (SELECT * FROM sys.triggers WHERE name = ', $Q, $insertTriggerName, $Q, ')', $N,
            'DROP TRIGGER [', $anchorCapsule, '].[', $insertTriggerName, ']', $N,
            'GO', $N,
            'CREATE TRIGGER [', $anchorCapsule, '].[', $insertTriggerName, '] ON ', $latestPerspective, $N,
            'INSTEAD OF INSERT', $N,
            'AS', $N,
            'BEGIN', $N,
	        $T, 'SET NOCOUNT ON;', $N,
	        $T, $now, $N,
            $T, 'DECLARE @', $anchorMnemonic, ' TABLE (', $N,
            $T, $T, 'Row ', $anchorIdentityType, ' identity(1,1) not null primary key,', $N,
            $T, $T, $anchorIdentity, ' ', $anchorIdentityType, ' not null', $N,
            $T, ');', $N,
	        $T, 'INSERT INTO [', $anchorCapsule, '].[', $anchorName, '](', $N,
	        $insertColumnReference,
	        $T, ')', $N,
	        $T, 'OUTPUT', $N,
	        $T, $T, 'inserted.', $anchorIdentity, $N,
	        $T, 'INTO', $N,
	        $T, $T, '@', $anchorMnemonic, $N,
	        $T, 'SELECT', $N,
	        $insertColumnValue,
	        $T, 'FROM', $N,
	        $T, $T, 'inserted', $N,
	        $T, 'WHERE', $N,
	        $T, $T, 'inserted.', $anchorIdentity, ' is null;', $N,
	        $insertStatements,
	        'END', $N,
	        'GO', $N, $N
            )"/>
            <xsl:variable name="updateStatements">
                <xsl:for-each select="attribute">
                    <xsl:call-template name="updateStatement">
                        <xsl:with-param name="attribute" select="."/>
                    </xsl:call-template>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="updateTriggerName" select="concat('ut', $anchorName)"/>
            <xsl:value-of select="concat(
            '--------------------------------- [Update Trigger] -----------------------------------', $N,
            '-- ', $anchorName, ' update trigger on the latest perspective', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF EXISTS (SELECT * FROM sys.triggers WHERE name = ', $Q, $updateTriggerName, $Q, ')', $N,
            'DROP TRIGGER [', $anchorCapsule, '].[', $updateTriggerName, ']', $N,
            'GO', $N,
            'CREATE TRIGGER [', $anchorCapsule, '].[', $updateTriggerName, '] ON ', $latestPerspective, $N,
            'INSTEAD OF UPDATE', $N,
            'AS', $N,
            'BEGIN', $N,
	        $T, 'SET NOCOUNT ON;', $N,
	        $T, $now, $N,
	        $updateStatements,
	        'END', $N,
	        'GO', $N, $N
            )"/>
            <xsl:variable name="deleteTriggerName" select="concat('dt', $anchorName)"/>
            <xsl:variable name="deleteStatements">
                <xsl:for-each select="attribute">
                    <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', @mnemonic)"/>
                    <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', parent::*/@descriptor, '_', @descriptor)"/>
                    <xsl:variable name="attributeCapsule" select="metadata/@capsule"/>
                    <xsl:variable name="changingCondition">
                        <xsl:if test="@timeRange">
                            <xsl:value-of select="concat(
                            $N, $T, 'AND', $N,
                            $T, $T, 'd.', $attributeMnemonic, '_', $changingSuffix, ' = ', $attributeMnemonic, '.', $attributeMnemonic, '_', $changingSuffix
                            )"/>
                        </xsl:if>
                    </xsl:variable>
                    <xsl:variable name="recordingCondition">
                        <xsl:if test="$temporalization = 'bi'">
                            <xsl:value-of select="concat(
                            $N, $T, 'AND', $N,
                            $T, $T, 'd.', $attributeMnemonic, '_', $recordingSuffix, ' = ', $attributeMnemonic, '.', $attributeMnemonic, '_', $recordingSuffix
                            )"/>
                        </xsl:if>
                    </xsl:variable>
                    <xsl:variable name="logicalOrActualDelete">
                        <xsl:choose>
                            <xsl:when test="$temporalization = 'mono'">
                                <xsl:value-of select="concat(
                                $T, 'DELETE ', $attributeMnemonic, $N
                                )"/>
                            </xsl:when>
                            <xsl:when test="$temporalization = 'bi'">
                                <xsl:value-of select="concat(
                                $T, 'UPDATE ', $attributeMnemonic, $N,
                                $T, 'SET', $N,
                                $T, $T, $attributeMnemonic, '.', $attributeMnemonic, '_', $erasingSuffix, ' = @now', $N
                                )"/>
                            </xsl:when>
                        </xsl:choose>
                    </xsl:variable>
                    <xsl:value-of select="concat(
                    $logicalOrActualDelete,
                    $T, 'FROM', $N,
                    $T, $T, '[', $attributeCapsule, '].[', $attributeName, '] ', $attributeMnemonic, $N,
                    $T, 'JOIN', $N,
                    $T, $T, 'deleted d', $N,
                    $T, 'ON', $N,
                    $T, $T, 'd.', $anchorIdentity, ' = ', $attributeMnemonic, '.', $anchorIdentity,
                    $changingCondition,
                    $recordingCondition, ';', $N
                    )"/>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="deleteAnchorStatement">
                <xsl:variable name="joinStatements">
                    <xsl:for-each select="attribute">
                        <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', @mnemonic)"/>
                        <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', parent::*/@descriptor, '_', @descriptor)"/>
                        <xsl:variable name="attributeCapsule" select="metadata/@capsule"/>
                        <xsl:value-of select="concat(
                        $T, 'LEFT JOIN', $N,
                        $T, $T, '[', $attributeCapsule, '].[', $attributeName, '] ', $attributeMnemonic, $N,
                        $T, 'ON', $N,
                        $T, $T, $attributeMnemonic, '.', $anchorIdentity, ' = [', $anchorMnemonic, '].', $anchorIdentity, $N
                        )"/>
                    </xsl:for-each>
                </xsl:variable>
                <xsl:variable name="whereConditions">
                    <xsl:for-each select="attribute">
                        <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', @mnemonic)"/>
                        <xsl:choose>
                            <xsl:when test="position() = 1">
                                <xsl:value-of select="concat($T, 'WHERE', $N)"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="concat($T, 'AND', $N)"/>
                            </xsl:otherwise>
                        </xsl:choose>
                        <xsl:value-of select="concat(
                        $T, $T, $attributeMnemonic, '.', $anchorIdentity, ' is null', $N
                        )"/>
                    </xsl:for-each>
                </xsl:variable>
                <xsl:if test="$temporalization = 'mono'">
                    <xsl:value-of select="concat(
                    $T, 'DELETE [', $anchorMnemonic, ']', $N,
                    $T, 'FROM', $N,
                    $T, $T, '[', $anchorCapsule, '].[', $anchorName, '] [', $anchorMnemonic, ']', $N,
                    $joinStatements,
                    $whereConditions
                    )"/>
                </xsl:if>
            </xsl:variable>
            <xsl:value-of select="concat(
            '--------------------------------- [Delete Trigger] -----------------------------------', $N,
            '-- ', $anchorName, ' delete trigger on the latest perspective', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF EXISTS (SELECT * FROM sys.triggers WHERE name = ', $Q, $deleteTriggerName, $Q, ')', $N,
            'DROP TRIGGER [', $anchorCapsule, '].[', $deleteTriggerName, ']', $N,
            'GO', $N,
            'CREATE TRIGGER [', $anchorCapsule, '].[', $deleteTriggerName, '] ON ', $latestPerspective, $N,
            'INSTEAD OF DELETE', $N,
            'AS', $N,
            'BEGIN', $N,
	        $T, 'SET NOCOUNT ON;', $N,
	        $T, $now, $N,
	        $deleteStatements,
	        $deleteAnchorStatement,
	        'END', $N,
	        'GO', $N, $N
            )"/>
            <xsl:variable name="point-in-timeJoinConditions">
                <xsl:for-each select="attribute">
                    <xsl:call-template name="joinCondition">
                        <xsl:with-param name="attribute" select="."/>
                        <xsl:with-param name="changingTimepoint" select="'@changingTimepoint'"/>
                    </xsl:call-template>
                </xsl:for-each>
            </xsl:variable>
            <xsl:value-of select="concat(
            '---------------------------- [Point-in-Time Perspective] -----------------------------', $N,
            '-- ', $anchorName, ' viewed as was (at the given timepoint)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'CREATE FUNCTION [', $anchorCapsule, '].[', $point-in-timePerspective, '] (@changingTimepoint ', $chronon, ')', $N,
            'RETURNS TABLE WITH SCHEMABINDING AS RETURN', $N,
            'SELECT', $N,
            $T, '[', $anchorMnemonic, '].', $anchorIdentity,
            $anchorMetadataColumnReference,
            $columnReferences, $N,
            'FROM', $N,
            $T, '[', $anchorCapsule, '].[', $anchorName, '] [', $anchorMnemonic, ']',
            $point-in-timeJoinConditions, ';', $N,
            'GO', $N, $N
            )"/>
            <xsl:if test="$temporalization = 'bi'">
                <xsl:value-of select="concat(
                'CREATE SYNONYM [', $anchorCapsule, '].[', $plPerspective, '] FOR [', $anchorCapsule, '].[', $point-in-timePerspective, '];', $N,
                'GO', $N, $N
                )"/>
                <xsl:variable name="ppJoinConditions">
                    <xsl:for-each select="attribute">
                        <xsl:call-template name="joinCondition">
                            <xsl:with-param name="attribute" select="."/>
                            <xsl:with-param name="changingTimepoint" select="'@changingTimepoint'"/>
                            <xsl:with-param name="recordingTimepoint" select="'@recordingTimepoint'"/>
                        </xsl:call-template>
                    </xsl:for-each>
                </xsl:variable>
                <xsl:value-of select="concat(
                '----------------- [Point-in-changing point-in-recording Perspective] -------------------', $N,
                '-- ', $anchorName, ' viewed as was (timepoint) at the given recording timepoint', $N,
                '--------------------------------------------------------------------------------------', $N,
                'CREATE FUNCTION [', $anchorCapsule, '].[', $ppPerspective, '] (@changingTimepoint ', $chronon, ', @recordingTimepoint ', $recordingRange, ')', $N,
                'RETURNS TABLE WITH SCHEMABINDING AS RETURN', $N,
                'SELECT', $N,
                $T, '[', $anchorMnemonic, '].', $anchorIdentity,
                $anchorMetadataColumnReference,
                $columnReferences, $N,
                'FROM', $N,
                $T, '[', $anchorCapsule, '].[', $anchorName, '] [', $anchorMnemonic, ']',
                $ppJoinConditions, ';', $N,
                'GO', $N, $N
                )"/>
            </xsl:if>
            <xsl:for-each select="attribute[@timeRange]">
                <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', @mnemonic)"/>
                <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', parent::*/@descriptor, '_', @descriptor)"/>
                <xsl:variable name="attributeCapsule" select="metadata/@capsule"/>
                <xsl:variable name="attributeDifferencePerspective" select="concat('d', $attributeName)"/>
                <xsl:value-of select="concat(
                '------------------------------ [Difference Perspective] ------------------------------', $N,
                '-- ', $anchorName, ' viewed by differences in ', $attributeName, $N,
                '--------------------------------------------------------------------------------------', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $attributeDifferencePerspective, $Q, ' AND type LIKE ', $Q, '%F%', $Q, ')', $N,
                'DROP FUNCTION [', $anchorCapsule, '].[', $attributeDifferencePerspective, '];', $N,
                'GO', $N,
                'CREATE FUNCTION [', $anchorCapsule, '].[', $attributeDifferencePerspective, '] (@intervalStart ', $chronon, ', @intervalEnd ', $chronon, ')', $N,
                'RETURNS TABLE AS RETURN', $N,
                'SELECT', $N,
                $T, 'timepoints.inspectedTimepoint,', $N,
                $T, '[', $anchorMnemonic, '].*', $N,
                'FROM (', $N,
                $T, 'SELECT DISTINCT', $N,
                $T, $T, $attributeMnemonic, '_', $changingSuffix, ' AS inspectedTimepoint', $N,
                $T, 'FROM', $N,
                $T, $T, '[', $attributeCapsule, '].[', $attributeName, ']', $N,
                $T, 'WHERE', $N,
                $T, $T, $attributeMnemonic, '_', $changingSuffix, ' BETWEEN @intervalStart AND @intervalEnd', $N,
                ') timepoints', $N,
                'CROSS APPLY', $N,
                $T, $point-in-timePerspective, '(timepoints.inspectedTimepoint) [', $anchorMnemonic, '];', $N,
                'GO', $N, $N
                )"/>
            </xsl:for-each>
            <xsl:if test="attribute[@timeRange]">
                <xsl:variable name="unionOfTimepoints">
                    <xsl:for-each select="attribute[@timeRange]">
                        <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', @mnemonic)"/>
                        <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', parent::*/@descriptor, '_', @descriptor)"/>
                        <xsl:variable name="attributeCapsule" select="metadata/@capsule"/>
                        <xsl:value-of select="concat(
                        $T, 'SELECT DISTINCT', $N,
                        $T, $T, $attributeMnemonic, '_', $changingSuffix, ' AS inspectedTimepoint', $N,
                        $T, 'FROM', $N,
                        $T, $T, '[', $attributeCapsule, '].[', $attributeName, ']', $N,
                        $T, 'WHERE', $N,
                        $T, $T, $attributeMnemonic, '_', $changingSuffix, ' BETWEEN @intervalStart AND @intervalEnd', $N
                        )"/>
                        <xsl:if test="not(position() = last())">
                            <xsl:value-of select="concat($T, 'UNION', $N)"/>
                        </xsl:if>
                    </xsl:for-each>
                </xsl:variable>
                <xsl:value-of select="concat(
                '------------------------------ [Difference Perspective] ------------------------------', $N,
                '-- ', $anchorName, ' viewed by differences in every historized attribute', $N,
                '--------------------------------------------------------------------------------------', $N,
                'CREATE FUNCTION [', $anchorCapsule, '].[', $differencePerspective, '] (@intervalStart ', $chronon, ', @intervalEnd ', $chronon, ')', $N,
                'RETURNS TABLE AS RETURN', $N,
                'SELECT', $N,
                $T, 'timepoints.inspectedTimepoint,', $N,
                $T, '[', $anchorMnemonic, '].*', $N,
                'FROM (', $N,
                $unionOfTimepoints,
                ') timepoints', $N,
                'CROSS APPLY', $N,
                $T, '[', $anchorCapsule, '].[', $point-in-timePerspective, '](timepoints.inspectedTimepoint) [', $anchorMnemonic, '];', $N,
                'GO', $N, $N
                )"/>                
            </xsl:if>
        </xsl:for-each>
        <!-- process all ties -->
        <xsl:for-each select="tie">
            <xsl:variable name="tieName">
                <xsl:for-each select="anchorRole|knotRole">
                    <xsl:value-of select="concat(@type, '_', @role)"/>
                    <xsl:if test="not(position() = last())">
                        <xsl:text>_</xsl:text>
                    </xsl:if>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="tieMetadata" select="concat($metadataPrefix, '_', $tieName)"/>
            <xsl:variable name="columnDefinitions">
                <xsl:for-each select="anchorRole|knotRole">
                    <xsl:variable name="identityType" select="concat(key('anchorLookup', @type)/@identity, key('knotLookup', @type)/@identity)"/>
                    <xsl:variable name="referent" select="concat(@type, '_', key('anchorLookup', @type)/@descriptor, key('knotLookup', @type)/@descriptor)"/>
                    <xsl:variable name="capsule" select="concat(key('anchorLookup', @type)/metadata/@capsule, key('knotLookup', @type)/metadata/@capsule)"/>
                    <xsl:value-of select="concat($T, @type, '_', $identitySuffix, '_', @role, ' ', $identityType, ' not null foreign key references [', $capsule, '].[', $referent, '](', @type, '_', $identitySuffix, '),', $N)"/>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="primaryKeyColumns">
                <xsl:choose>
                    <xsl:when test="count(anchorRole[string(@identifier) = 'true']|knotRole[string(@identifier) = 'true']) > 0">
                        <xsl:for-each select="anchorRole[string(@identifier) = 'true']|knotRole[string(@identifier) = 'true']">
                            <xsl:value-of select="concat($T, $T, @type, '_', $identitySuffix, '_', @role, ' asc')"/>
                            <xsl:if test="not(position() = last())">
                                <xsl:value-of select="concat(',', $N)"/>
                            </xsl:if>
                        </xsl:for-each>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:for-each select="anchorRole[1]">
                            <xsl:value-of select="concat($T, $T, @type, '_', $identitySuffix, '_', @role, ' asc')"/>
                        </xsl:for-each>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <xsl:variable name="tieChangingDefinition">
                <xsl:if test="@timeRange">
                    <xsl:value-of select="concat($T, $tieName, '_', $changingSuffix, ' ', @timeRange, ' not null,', $N)"/>
                </xsl:if>
            </xsl:variable>
            <xsl:variable name="tieChangingKey">
                <xsl:if test="@timeRange">
                    <xsl:value-of select="concat(',', $N, $T, $T, $tieName, '_', $changingSuffix, ' desc')"/>
                </xsl:if>
            </xsl:variable>
            <xsl:variable name="tieRecordingDefinition">
                <xsl:if test="$temporalization = 'bi'">
                    <xsl:value-of select="concat(
                    $T, $tieName, '_', $recordingSuffix, ' ', $recordingRange, ' not null,', $N,
                    $T, $tieName, '_', $erasingSuffix, ' ', $recordingRange, ' not null,', $N
                    )"/>
                </xsl:if>
            </xsl:variable> 
            <xsl:variable name="tieRecordingKey">
                <xsl:if test="$temporalization = 'bi'">
                    <xsl:value-of select="concat(
                    ', ', $N, $T, $T, $tieName, '_', $recordingSuffix, ' desc, ', $N,
                    $T, $T, $tieName, '_', $erasingSuffix, ' desc'
                    )"/>
                </xsl:if>
                <xsl:value-of select="$N"/>
            </xsl:variable> 
            <xsl:variable name="tiePartition">
                <xsl:choose>
                    <xsl:when test="$temporalization = 'bi' and $partitioning = 'true'">
                        <xsl:value-of select="concat('RecordingScheme(', $tieName, '_', $erasingSuffix, ')')"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="'[PRIMARY]'"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>                
            <xsl:variable name="uniqueConstraints">
                <xsl:if test="count(anchorRole[string(@identifier) = 'true']|knotRole[string(@identifier) = 'true']) = 0">
                    <xsl:for-each select="anchorRole[position() > 1]">
                        <xsl:value-of select="concat(',', $N, $T, 'unique (', $N, $T, $T, @type, '_', $identitySuffix, '_', @role, ' asc', $tieChangingKey, $N, $T, ')')"/>
                        <xsl:if test="not(position() = last())">
                            <xsl:value-of select="concat(',', $N)"/>
                        </xsl:if>
                    </xsl:for-each>
                </xsl:if>
            </xsl:variable>
            <xsl:variable name="tieCapsule" select="metadata/@capsule"/>
            <xsl:variable name="tieMetadataDefinition">
				<xsl:if test="$metadataUsage = 'true'">
					<xsl:value-of select="concat($T, $tieMetadata, ' ', $metadataType, ' not null,', $N)"/>
				</xsl:if>
			</xsl:variable>
            <!-- guarantee only one current version of the information -->
            <xsl:variable name="tieUniqueRecordingConstraint">
                <xsl:variable name="primaryKeyParameters">
                    <xsl:choose>
                        <xsl:when test="count(anchorRole[string(@identifier) = 'true']|knotRole[string(@identifier) = 'true']) > 0">
                            <xsl:for-each select="anchorRole[string(@identifier) = 'true']|knotRole[string(@identifier) = 'true']">
                                <xsl:value-of select="concat($T, $T, $T, @type, '_', $identitySuffix, '_', @role, ',', $N)"/>
                            </xsl:for-each>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:for-each select="anchorRole[1]">
                                <xsl:value-of select="concat($T, $T, $T, @type, '_', $identitySuffix, '_', @role, ',', $N)"/>
                            </xsl:for-each>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable name="tieChangingParameter">
                    <xsl:if test="@timeRange">
                        <xsl:value-of select="concat($T, $T, $T, $tieName, '_', $changingSuffix, ',', $N)"/>
                    </xsl:if>
                </xsl:variable>
                <xsl:if test="$temporalization = 'bi' and $entityIntegrity = 'true'">
                    <xsl:value-of select="concat(
                    $T, 'constraint uq', $tieName, ' unique (', $N,
                    $T, $T, $tieName, '_', $erasingSuffix, ', ', $N,
                    $primaryKeyColumns,
                    $tieChangingKey, $N,
                    $T, '),', $N,
                    $T, 'constraint in', $tieName, ' check (', $N,
                    $T, $T, $tieName, '_', $recordingSuffix, ' &lt; ', $tieName, '_', $erasingSuffix, $N,
                    $T, '),', $N,
                    $T, 'constraint ov', $tieName, ' check (', $N,
                    $T, $T, '[', $tieCapsule, '].[o', $tieName, '] (', $N,
                    $primaryKeyParameters,
                    $tieChangingParameter,
                    $T, $T, $T, $tieName, '_', $recordingSuffix, ',', $N,
                    $T, $T, $T, $tieName, '_', $erasingSuffix, $N,
                    $T, $T, ') = 0', $N,
                    $T, '),', $N
                    )"/>
                </xsl:if>
            </xsl:variable>
            <xsl:if test="$temporalization = 'bi' and $entityIntegrity = 'true'">
                <xsl:variable name="primaryKeyParameters">
                    <xsl:choose>
                        <xsl:when test="count(anchorRole[string(@identifier) = 'true']|knotRole[string(@identifier) = 'true']) > 0">
                            <xsl:for-each select="anchorRole[string(@identifier) = 'true']|knotRole[string(@identifier) = 'true']">
                                <xsl:variable name="identityType" select="concat(key('anchorLookup', @type)/@identity, key('knotLookup', @type)/@identity)"/>
                                <xsl:value-of select="concat($T, '@', @role, ' ', $identityType, ',', $N)"/>
                            </xsl:for-each>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:for-each select="anchorRole[1]">
                                <xsl:variable name="identityType" select="concat(key('anchorLookup', @type)/@identity, key('knotLookup', @type)/@identity)"/>
                                <xsl:value-of select="concat($T, '@', @role, ' ', $identityType, ',', $N)"/>
                            </xsl:for-each>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable name="primaryKeyConditions">
                    <xsl:choose>
                        <xsl:when test="count(anchorRole[string(@identifier) = 'true']|knotRole[string(@identifier) = 'true']) > 0">
                            <xsl:for-each select="anchorRole[string(@identifier) = 'true']|knotRole[string(@identifier) = 'true']">
                                <xsl:value-of select="concat($T, $T, @type, '_', $identitySuffix, '_', @role, ' = @', @role, $N)"/>
                                <xsl:if test="not(position() = last())">
                                    <xsl:value-of select="concat($T, 'AND', $N)"/>
                                </xsl:if>
                            </xsl:for-each>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:for-each select="anchorRole[1]">
                                <xsl:value-of select="concat($T, $T, @type, '_', $identitySuffix, '_', @role, ' = @', @role, $N)"/>
                            </xsl:for-each>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable name="tieChangingParameter">
                    <xsl:if test="@timeRange">
                        <xsl:value-of select="concat($T, '@changedAt ', @timeRange, ', ', $N)"/>
                    </xsl:if>
                </xsl:variable>
                <xsl:variable name="tieChangingCondition">
                    <xsl:if test="@timeRange">
                        <xsl:value-of select="concat($T, 'AND', $N, $T, $T, $tieName, '_', $changingSuffix, ' = @changedAt', $N)"/>
                    </xsl:if>
                </xsl:variable>
                <xsl:value-of select="concat(
                '--------------------------------- [Overlap Counter] ----------------------------------', $N,
                '-- o', $tieName, ' counter', $N,
                '--------------------------------------------------------------------------------------', $N,
                'IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, 'o', $tieName, $Q, ' AND type LIKE ', $Q, '%F%', $Q, ')', $N,
                'EXEC (', $Q, $N,
                'CREATE FUNCTION [', $tieCapsule, '].[o', $tieName, '] (', $N,
                $primaryKeyParameters,
                $tieChangingParameter,
                $T, '@recordedAt ', $recordingRange, ',', $N,
                $T, '@erasedAt ', $recordingRange, $N,
                ')', $N,
                'RETURNS bigint AS BEGIN RETURN (', $N,
                $T, 'SELECT', $N,
                $T, $T, 'count(*)', $N,
                $T, 'FROM', $N,
                $T, $T, '[', $tieCapsule, '].[', $tieName, ']', $N,
                $T, 'WHERE', $N,
                $primaryKeyConditions,
                $tieChangingCondition,
                $T, 'AND (', $N,
                $T, $T, $T, $tieName, '_', $recordingSuffix, ' &lt;&gt; @recordedAt', $N,
                $T, $T, 'OR', $N,
                $T, $T, $T, $tieName, '_', $erasingSuffix, ' &lt;&gt; @erasedAt', $N,
                $T, ')', $N,
                $T, 'AND ((', $N,
                $T, $T, $T, '@recordedAt &gt;= ', $tieName, '_', $recordingSuffix, $N,
                $T, $T, 'AND', $N,
                $T, $T, $T, '@recordedAt &lt; ', $tieName, '_', $erasingSuffix, $N,
                $T, ') OR (', $N,
                $T, $T, $T, '@erasedAt &gt; ', $tieName, '_', $recordingSuffix, $N,
                $T, $T, 'AND', $N,
                $T, $T, $T, '@erasedAt &lt;= ', $tieName, '_', $erasingSuffix, $N,
                $T, '))', $N,
                ')', $N,
                'END', $Q, ');', $N,
                'GO', $N, $N
                )"/>
            </xsl:if>
            <xsl:value-of select="concat(
            '------------------------------------- [Tie Table] ------------------------------------', $N,
            '-- ', $tieName, ' table (', count(anchorRole|knotRole), '-ary)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $tieName, $Q, ' and type LIKE ', $Q, '%U%', $Q, ')', $N,
            'CREATE TABLE [', $tieCapsule, '].[', $tieName, '] (', $N,
            $columnDefinitions,
            $tieChangingDefinition,
            $tieRecordingDefinition,
            $tieMetadataDefinition,
            $tieUniqueRecordingConstraint,
            $T, 'constraint pk', $tieName, ' primary key (', $N,
            $primaryKeyColumns,
            $tieChangingKey,
            $tieRecordingKey,
            $T, ')',
            $uniqueConstraints, $N,
            ') ON ', $tiePartition, ';', $N,
            'GO', $N, $N
            )"/>
            <xsl:variable name="columnReferencesWithoutKnotValues">
                <xsl:for-each select="anchorRole|knotRole">
                    <xsl:value-of select="concat($T, 'tie.', @type, '_', $identitySuffix, '_', @role)"/>
                    <xsl:if test="not(position() = last())">
                        <xsl:value-of select="concat(',', $N)"/>
                    </xsl:if>
                </xsl:for-each>
                <xsl:if test="@timeRange">
                    <xsl:value-of select="concat(',', $N, $T, 'tie.', $tieName, '_', $changingSuffix)"/>
                </xsl:if>
                <xsl:if test="$temporalization = 'bi'">
                    <xsl:value-of select="concat(
                    ',', $N, $T, 'tie.', $tieName, '_', $recordingSuffix,
                    ',', $N, $T, 'tie.', $tieName, '_', $erasingSuffix
                    )"/>
                </xsl:if>
                <xsl:value-of select="$N"/>
            </xsl:variable>
            <xsl:variable name="columnReferences">
                <xsl:for-each select="anchorRole|knotRole">
                    <xsl:choose>
                        <xsl:when test="local-name(.) = 'anchorRole'">
                            <xsl:value-of select="concat($T, 'tie.', @type, '_', $identitySuffix, '_', @role)"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="concat($T, 'tie.', @type, '_', $identitySuffix, '_', @role, ',', $N)"/>
                            <xsl:value-of select="concat($T, '[', @type, '].', @type, '_', key('knotLookup', @type)/@descriptor)"/>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:if test="not(position() = last())">
                        <xsl:value-of select="concat(',', $N)"/>
                    </xsl:if>
                </xsl:for-each>
                <xsl:if test="@timeRange">
                    <xsl:value-of select="concat(',', $N, $T, 'tie.', $tieName, '_', $changingSuffix)"/>
                </xsl:if>
                <xsl:if test="$temporalization = 'bi'">
                    <xsl:value-of select="concat(
                    ',', $N, $T, 'tie.', $tieName, '_', $recordingSuffix,
                    ',', $N, $T, 'tie.', $tieName, '_', $erasingSuffix
                    )"/>
                </xsl:if>
                <xsl:value-of select="$N"/>
            </xsl:variable>
            <xsl:variable name="joinConditions">
                <xsl:for-each select="knotRole">
                    <xsl:variable name="identity" select="concat(@type, '_', $identitySuffix)"/>
                    <xsl:variable name="knotName" select="concat(@type, '_', key('knotLookup', @type)/@descriptor)"/>
                    <xsl:variable name="knotCapsule" select="key('knotLookup', @type)/metadata/@capsule"/>
                    <xsl:value-of select="concat(
                    $N, 'LEFT JOIN', $N,
                    $T, '[', $knotCapsule, '].[', $knotName, '] [', @type, ']', $N,
                    'ON', $N,
                    $T, '[', @type, '].', $identity, ' = tie.', $identity, '_', @role
                    )"/>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="tieMetadataReference">
				<xsl:if test="$metadataUsage = 'true'">
					<xsl:value-of select="concat($T, 'tie.', $tieMetadata, ',', $N)"/>
				</xsl:if>
			</xsl:variable>
            <xsl:if test="$temporalization = 'bi'">
                <xsl:value-of select="concat(
                '-------------------------- [Currently recorded perspective] --------------------------', $N,
                '-- c', $tieName, ' view', $N,
                '--------------------------------------------------------------------------------------', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, 'c', $tieName, $Q, ' AND type LIKE ', $Q, '%V%', $Q, ')', $N,
                'DROP VIEW [', $tieCapsule, '].[c', $tieName, '];', $N,
                'GO', $N,
                'CREATE VIEW [', $tieCapsule, '].[c', $tieName, '] WITH SCHEMABINDING AS', $N,
                'SELECT', $N,
                $tieMetadataReference,
                $columnReferencesWithoutKnotValues,
                'FROM', $N,
                $T, '[', $tieCapsule, '].[', $tieName, '] tie', $N,
                'WHERE', $N,
                $T, $tieName, '_', $erasingSuffix, ' &gt;= ', $infinity, ';', $N,
                'GO', $N, $N
                )"/>
                <xsl:value-of select="concat(
                '--------------------------- [Rewind recording perspective] ---------------------------', $N,
                '-- r', $tieName, ' function', $N,
                '--------------------------------------------------------------------------------------', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, 'r', $tieName, $Q, ' AND type LIKE ', $Q, '%F%', $Q, ')', $N,
                'DROP FUNCTION [', $tieCapsule, '].[r', $tieName, '];', $N,
                'GO', $N,
                'CREATE FUNCTION [', $tieCapsule, '].[r', $tieName, '] (@recordingTimepoint ', $recordingRange, ')', $N,
                'RETURNS TABLE WITH SCHEMABINDING AS RETURN', $N,
                'SELECT', $N,
                $tieMetadataReference,
                $columnReferencesWithoutKnotValues,
                'FROM', $N,
                $T, '[', $tieCapsule, '].[', $tieName, '] tie', $N,
                'WHERE', $N,
                $T, $tieName, '_', $erasingSuffix, ' &gt; @recordingTimepoint', $N,
                'AND', $N,
                $T, $tieName, '_', $recordingSuffix, ' &lt;= @recordingTimepoint;', $N,
                'GO', $N, $N
                )"/>
            </xsl:if>
            <xsl:variable name="latestCurrentWhereCondition">
                <xsl:if test="@timeRange">
                    <xsl:value-of select="concat($N, 'WHERE', $N)"/>
                    <xsl:call-template name="whereCondition">
                        <xsl:with-param name="tie" select="."/>
                        <xsl:with-param name="tieName" select="$tieName"/>
                        <xsl:with-param name="changingType" select="'latest'"/>
                        <xsl:with-param name="recordingType" select="'c'"/>
                    </xsl:call-template>
                </xsl:if>
            </xsl:variable>
            <xsl:variable name="latestPerspective" select="concat('l', $tieName)"/>
            <xsl:variable name="llPerspective" select="concat('ll', $tieName)"/>
            <xsl:variable name="lpPerspective" select="concat('lp', $tieName)"/>
            <xsl:variable name="plPerspective" select="concat('pl', $tieName)"/>
            <xsl:variable name="ppPerspective" select="concat('pp', $tieName)"/>
            <xsl:variable name="prefixCurrent">
                <xsl:if test="$temporalization = 'bi'">
                    <xsl:value-of select="'c'"/>
                </xsl:if>
            </xsl:variable>
            <xsl:value-of select="concat(
            '--------------------------------- [Latest Perspective] -------------------------------', $N,
            '-- ', $tieName, ' viewed as is (given by the latest available information)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'CREATE VIEW [', $tieCapsule, '].[', $latestPerspective, '] WITH SCHEMABINDING AS', $N,
            'SELECT', $N,
            $tieMetadataReference,
            $columnReferences,
            'FROM', $N,
            $T, '[', $tieCapsule, '].[', $prefixCurrent, $tieName, '] tie',
            $joinConditions,
            $latestCurrentWhereCondition, ';', $N,
            'GO', $N, $N
            )"/>
            <xsl:if test="$temporalization = 'bi'">
                <xsl:variable name="latestRewindWhereCondition">
                    <xsl:if test="@timeRange">
                        <xsl:value-of select="concat($N, 'WHERE', $N)"/>
                        <xsl:call-template name="whereCondition">
                            <xsl:with-param name="tie" select="."/>
                            <xsl:with-param name="tieName" select="$tieName"/>
                            <xsl:with-param name="changingType" select="'latest'"/>
                            <xsl:with-param name="recordingType" select="'r'"/>
                        </xsl:call-template>
                    </xsl:if>
                </xsl:variable>
                <xsl:value-of select="concat(
                'CREATE SYNONYM [', $tieCapsule, '].[', $llPerspective, '] FOR [', $tieCapsule, '].[', $latestPerspective, '];', $N,
                'GO', $N, $N
                )"/>
                <xsl:value-of select="concat(
                '----------------- [Latest changing point-in-recording Perspective] -------------------', $N,
                '-- ', $tieName, ' viewed as is at the given recording timepoint', $N,
                '--------------------------------------------------------------------------------------', $N,
                'CREATE FUNCTION [', $tieCapsule, '].[', $lpPerspective, '] (@recordingTimepoint ', $recordingRange, ')', $N,
                'RETURNS TABLE WITH SCHEMABINDING AS RETURN', $N,
                'SELECT', $N,
                $tieMetadataReference,
                $columnReferences,
                'FROM', $N,
                $T, '[', $tieCapsule, '].[r', $tieName, '](@recordingTimepoint) tie',
                $joinConditions,
                $latestRewindWhereCondition, ';', $N,
                'GO', $N, $N
                )"/>
            </xsl:if>
            <xsl:variable name="point-in-timeCurrentWhereCondition">
                <xsl:if test="@timeRange">
                    <xsl:value-of select="concat($N, 'WHERE', $N)"/>
                    <xsl:call-template name="whereCondition">
                        <xsl:with-param name="tie" select="."/>
                        <xsl:with-param name="tieName" select="$tieName"/>
                        <xsl:with-param name="changingType" select="'point-in-time'"/>
                        <xsl:with-param name="recordingType" select="'c'"/>
                    </xsl:call-template>
                </xsl:if>
            </xsl:variable>
            <xsl:variable name="point-in-timePerspective" select="concat('p', $tieName)"/>
            <xsl:value-of select="concat(
            '---------------------------- [Point-in-Time Perspective] -----------------------------', $N,
            '-- ', $tieName, ' viewed as was (at the given timepoint)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'CREATE FUNCTION [', $tieCapsule, '].[', $point-in-timePerspective, '] (@changingTimepoint ', $chronon, ')', $N,
            'RETURNS TABLE WITH SCHEMABINDING AS RETURN', $N,
            'SELECT', $N,
            $tieMetadataReference,
            $columnReferences,
            'FROM', $N,
            $T, '[', $tieCapsule, '].[', $prefixCurrent, $tieName, '] tie',
            $joinConditions,
            $point-in-timeCurrentWhereCondition, ';', $N,
            'GO', $N, $N
            )"/>
            <xsl:if test="$temporalization = 'bi'">
                <xsl:variable name="point-in-timeRewindWhereCondition">
                    <xsl:if test="@timeRange">
                        <xsl:value-of select="concat($N, 'WHERE', $N)"/>
                        <xsl:call-template name="whereCondition">
                            <xsl:with-param name="tie" select="."/>
                            <xsl:with-param name="tieName" select="$tieName"/>
                            <xsl:with-param name="changingType" select="'point-in-time'"/>
                            <xsl:with-param name="recordingType" select="'r'"/>
                        </xsl:call-template>
                    </xsl:if>
                </xsl:variable>
                <xsl:value-of select="concat(
                'CREATE SYNONYM [', $tieCapsule, '].[', $plPerspective, '] FOR [', $tieCapsule, '].[', $point-in-timePerspective, '];', $N,
                'GO', $N, $N
                )"/>
                <xsl:value-of select="concat(
                '----------------- [Point-in-changing point-in-recording Perspective] -------------------', $N,
                '-- ', $tieName, ' viewed as was (timepoint) at the given recording timepoint', $N,
                '--------------------------------------------------------------------------------------', $N,
                'CREATE FUNCTION [', $tieCapsule, '].[', $ppPerspective, '] (@changingTimepoint ', $chronon, ', @recordingTimepoint ', $recordingRange, ')', $N,
                'RETURNS TABLE WITH SCHEMABINDING AS RETURN', $N,
                'SELECT', $N,
                $tieMetadataReference,
                $columnReferences,
                'FROM', $N,
                $T, '[', $tieCapsule, '].[r', $tieName, '](@recordingTimepoint) tie',
                $joinConditions,
                $point-in-timeRewindWhereCondition, ';', $N,
                'GO', $N, $N
                )"/>
            </xsl:if>
            <xsl:variable name="differenceCurrentWhereCondition">
                <xsl:if test="@timeRange">
                    <xsl:value-of select="concat($N, 'WHERE', $N)"/>
                    <xsl:call-template name="whereCondition">
                        <xsl:with-param name="tie" select="."/>
                        <xsl:with-param name="tieName" select="$tieName"/>
                        <xsl:with-param name="changingType" select="'difference'"/>
                        <xsl:with-param name="recordingType" select="'c'"/>
                    </xsl:call-template>
                </xsl:if>
            </xsl:variable>
            <xsl:variable name="differencePerspective" select="concat('d', $tieName)"/>
            <xsl:value-of select="concat(
            '------------------------------ [Difference Perspective] ------------------------------', $N,
            '-- ', $tieName, ' viewed by differences in the tie', $N,
            '--------------------------------------------------------------------------------------', $N,
            'CREATE FUNCTION [', $tieCapsule, '].[', $differencePerspective, '] (@intervalStart ', $chronon, ', @intervalEnd ', $chronon, ')', $N,
            'RETURNS TABLE WITH SCHEMABINDING AS RETURN', $N,
            'SELECT', $N,
            $tieMetadataReference,
            $columnReferences,
            'FROM', $N,
            $T, '[', $tieCapsule, '].[', $prefixCurrent, $tieName, '] tie',
            $joinConditions,
            $differenceCurrentWhereCondition, ';', $N,
            'GO', $N, $N
            )"/>
        </xsl:for-each>
        <xsl:variable name="schema">
            <xsl:value-of select="serialization"/>
        </xsl:variable>
        <xsl:value-of select="concat(
        '--------------------------------- [Schema Evolution] ---------------------------------', $N,
        '-- Schema evolution tables, views and functions', $N,
        '--------------------------------------------------------------------------------------', $N,
        'IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, '_Schema', $Q, ' and type LIKE ', $Q, '%U%', $Q, ')', $N,
        $T,'CREATE TABLE [', $defaultCapsule, '].[_Schema] (', $N,
	    $T,$T, '[version] int identity(1, 1) not null primary key,', $N,
	    $T,$T, '[activation] ', $chronon, ' not null,', $N,
	    $T,$T, '[schema] xml not null', $N,
        $T,');', $N,
        'GO', $N, $N,
        'INSERT INTO [', $defaultCapsule, '].[_Schema] (', $N,
        $T, '[activation],', $N,
	    $T, '[schema]', $N,
        ')', $N,
        'SELECT', $N,
	    $T, 'current_timestamp,', $N,
	    $T, 'N', $Q, $schema, $Q, ';', $N,
        'GO', $N, $N,
        'IF EXISTS (SELECT * FROM sys.views WHERE name = ', $Q, '_Anchor', $Q, ')', $N,
        'DROP VIEW [', $defaultCapsule, '].[_Anchor]', $N,
        'GO', $N, $N,
        'CREATE VIEW [', $defaultCapsule, '].[_Anchor]', $N,
        'AS', $N,
        'SELECT', $N,
	    $T, 'S.version,', $N,
	    $T, 'S.activation,', $N,
	    $T, 'Nodeset.anchor.value(', $Q, 'concat(@mnemonic, ', $D, '_', $D, ', @descriptor)', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [name],', $N,
	    $T, 'Nodeset.anchor.value(', $Q, 'metadata[1]/@capsule', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [capsule],', $N,
	    $T, 'Nodeset.anchor.value(', $Q, '@mnemonic', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [mnemonic],', $N,
	    $T, 'Nodeset.anchor.value(', $Q, '@descriptor', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [descriptor],', $N,
	    $T, 'Nodeset.anchor.value(', $Q, '@identity', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [identity],', $N,
	    $T, 'Nodeset.anchor.value(', $Q, 'metadata[1]/@generator', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [generator],', $N,
	    $T, 'Nodeset.anchor.value(', $Q, 'count(attribute)', $Q, ', ', $Q, 'int', $Q, ') as [numberOfAttributes]', $N,
        'FROM', $N,
	    $T, '[', $defaultCapsule, '].[_Schema] S', $N,
        'CROSS APPLY', $N,
	    $T, 'S.[schema].nodes(', $Q, '/schema/anchor', $Q, ') as Nodeset(anchor);', $N,
        'GO', $N, $N,
        'IF EXISTS (SELECT * FROM sys.views WHERE name = ', $Q, '_Knot', $Q, ')', $N,
        'DROP VIEW [', $defaultCapsule, '].[_Knot]', $N,
        'GO', $N, $N,
        'CREATE VIEW [', $defaultCapsule, '].[_Knot]', $N,
        'AS', $N,
        'SELECT', $N,
	    $T, 'S.version,', $N,
	    $T, 'S.activation,', $N,
	    $T, 'Nodeset.knot.value(', $Q, 'concat(@mnemonic, ', $D, '_', $D, ', @descriptor)', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [name],', $N,
	    $T, 'Nodeset.knot.value(', $Q, 'metadata[1]/@capsule', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [capsule],', $N,
	    $T, 'Nodeset.knot.value(', $Q, '@mnemonic', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [mnemonic],', $N,
	    $T, 'Nodeset.knot.value(', $Q, '@descriptor', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [descriptor],', $N,
	    $T, 'Nodeset.knot.value(', $Q, '@identity', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [identity],', $N,
	    $T, 'Nodeset.knot.value(', $Q, 'metadata[1]/@generator', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [generator],', $N,
	    $T, 'Nodeset.knot.value(', $Q, '@dataRange', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [dataRange]', $N,
        'FROM', $N,
	    $T, '[', $defaultCapsule, '].[_Schema] S', $N,
        'CROSS APPLY', $N,
	    $T, 'S.[schema].nodes(', $Q, '/schema/knot', $Q, ') as Nodeset(knot);', $N,
        'GO', $N, $N,
        'IF EXISTS (SELECT * FROM sys.views WHERE name = ', $Q, '_Attribute', $Q, ')', $N,
        'DROP VIEW [', $defaultCapsule, '].[_Attribute]', $N,
        'GO', $N, $N,
        'CREATE VIEW [', $defaultCapsule, '].[_Attribute]', $N,
        'AS', $N,
        'SELECT', $N,
	    $T, 'S.version,', $N,
	    $T, 'S.activation,', $N,
	    $T, 'ParentNodeset.anchor.value(', $Q, 'concat(@mnemonic, ', $D, '_', $D, ')', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') +', $N,
	    $T, 'Nodeset.attribute.value(', $Q, 'concat(@mnemonic, ', $D, '_', $D, ')', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') +', $N,
	    $T, 'ParentNodeset.anchor.value(', $Q, 'concat(@descriptor, ', $D, '_', $D, ')', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') +', $N,
	    $T, 'Nodeset.attribute.value(', $Q, '@descriptor', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [name],', $N,
	    $T, 'Nodeset.attribute.value(', $Q, 'metadata[1]/@capsule', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [capsule],', $N,
	    $T, 'Nodeset.attribute.value(', $Q, '@mnemonic', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [mnemonic],', $N,
	    $T, 'Nodeset.attribute.value(', $Q, '@descriptor', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [descriptor],', $N,
	    $T, 'ParentNodeset.anchor.value(', $Q, '@mnemonic', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [anchorMnemonic],', $N,
	    $T, 'ParentNodeset.anchor.value(', $Q, '@descriptor', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [anchorDescriptor],', $N,
	    $T, 'ParentNodeset.anchor.value(', $Q, '@identity', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [anchorIdentity],', $N,
	    $T, 'Nodeset.attribute.value(', $Q, '@dataRange', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [dataRange],', $N,
	    $T, 'Nodeset.attribute.value(', $Q, '@knotRange', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [knotRange],', $N,
	    $T, 'Nodeset.attribute.value(', $Q, '@timeRange', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [timeRange]', $N,
        'FROM', $N,
	    $T, '[', $defaultCapsule, '].[_Schema] S', $N,
        'CROSS APPLY', $N,
	    $T, 'S.[schema].nodes(', $Q, '/schema/anchor', $Q, ') as ParentNodeset(anchor)', $N,
        'OUTER APPLY', $N,
	    $T, 'ParentNodeset.anchor.nodes(', $Q, 'attribute', $Q, ') as Nodeset(attribute);', $N,
        'GO', $N, $N,
        'IF EXISTS (SELECT * FROM sys.views WHERE name = ', $Q, '_Tie', $Q, ')', $N,
        'DROP VIEW [', $defaultCapsule, '].[_Tie]', $N,
        'GO', $N, $N,
        'CREATE VIEW [', $defaultCapsule, '].[_Tie]', $N,
        'AS', $N,
        'SELECT', $N,
	    $T, 'S.version,', $N,
	    $T, 'S.activation,', $N,
	    $T, 'REPLACE(Nodeset.tie.query(', $Q, $N,
		$T, $T, 'for $role in *[local-name() = ', $D, 'anchorRole', $D, ' or local-name() = ', $D, 'knotRole', $D, ']', $N,
		$T, $T, 'return concat($role/@type, ', $D, '_', $D, ', $role/@role)', $N,
	    $T, $Q, ').value(', $Q, '.', $Q, ', ', $Q, 'nvarchar(max)', $Q, '), ', $Q, ' ', $Q, ', ', $Q, '_', $Q, ') as [name],', $N,
	    $T, 'Nodeset.tie.value(', $Q, 'metadata[1]/@capsule', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [capsule],', $N,
	    $T, 'Nodeset.tie.value(', $Q, 'count(anchorRole) + count(knotRole)', $Q, ', ', $Q, 'int', $Q, ') as [numberOfRoles],', $N,
	    $T, 'Nodeset.tie.query(', $Q, $N,
		$T, $T, 'for $role in *[local-name() = ', $D, 'anchorRole', $D, ' or local-name() = ', $D, 'knotRole', $D, ']', $N,
		$T, $T, 'return string($role/@role)', $N,
	    $T, $Q, ').value(', $Q, '.', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [roles],', $N,
	    $T, 'Nodeset.tie.value(', $Q, 'count(anchorRole)', $Q, ', ', $Q, 'int', $Q, ') as [numberOfAnchors],', $N,
	    $T, 'Nodeset.tie.query(', $Q, $N,
		$T, $T, 'for $role in anchorRole', $N,
		$T, $T, 'return string($role/@type)', $N,
	    $T, $Q, ').value(', $Q, '.', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [anchors],', $N,
	    $T, 'Nodeset.tie.value(', $Q, 'count(knotRole)', $Q, ', ', $Q, 'int', $Q, ') as [numberOfKnots],', $N,
	    $T, 'Nodeset.tie.query(', $Q, $N,
		$T, $T, 'for $role in knotRole', $N,
		$T, $T, 'return string($role/@type)', $N,
	    $T, $Q, ').value(', $Q, '.', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [knots],', $N,
	    $T, 'Nodeset.tie.value(', $Q, 'count(*[local-name() = ', $D, 'anchorRole', $D, ' or local-name() = ', $D, 'knotRole', $D, '][@identifier = ', $D, 'true', $D, '])', $Q, ', ', $Q, 'int', $Q, ') as [numberOfIdentifiers],', $N,
	    $T, 'Nodeset.tie.query(', $Q, $N,
		$T, $T, 'for $role in *[local-name() = ', $D, 'anchorRole', $D, ' or local-name() = ', $D, 'knotRole', $D, '][@identifier = ', $D, 'true', $D, ']', $N,
		$T, $T, 'return string($role/@type)', $N,
	    $T, $Q, ').value(', $Q, '.', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [identifiers],', $N,
	    $T, 'Nodeset.tie.value(', $Q, '@timeRange', $Q, ', ', $Q, 'nvarchar(max)', $Q, ') as [timeRange]', $N,
        'FROM', $N,
	    $T, '[', $defaultCapsule, '].[_Schema] S', $N,
        'CROSS APPLY', $N,
	    $T, 'S.[schema].nodes(', $Q, '/schema/tie', $Q, ') as Nodeset(tie);', $N,
        'GO', $N, $N,
        'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, '_Evolution', $Q, ' and type LIKE ', $Q, '%F%', $Q, ')', $N,
        'DROP FUNCTION [', $defaultCapsule, '].[_Evolution];', $N,
        'GO', $N, $N,
        'CREATE FUNCTION [', $defaultCapsule, '].[_Evolution] (', $N,
	    $T, $T, '@timepoint AS ', $chronon, $N,
        ')', $N,
        'RETURNS TABLE', $N,
        'RETURN', $N,
        'SELECT', $N,
	    $T, 'V.[version],', $N,
	    $T, 'ISNULL(S.[name], T.[name]) AS [name],', $N,
	    $T, 'ISNULL(V.[activation], T.[create_date]) AS [activation],', $N,
	    $T, 'CASE', $N,
		$T, $T, 'WHEN S.[name] is null THEN', $N,
		$T, $T, $T, 'CASE', $N,
		$T, $T, $T, $T, 'WHEN T.[create_date] > (', $N,
		$T, $T, $T, $T, $T, 'SELECT', $N,
		$T, $T, $T, $T, $T, $T, 'ISNULL(MAX([activation]), @timepoint)', $N,
		$T, $T, $T, $T, $T, 'FROM', $N,
		$T, $T, $T, $T, $T, $T, '[', $defaultCapsule, '].[_Schema]', $N,
		$T, $T, $T, $T, $T, 'WHERE', $N,
		$T, $T, $T, $T, $T, $T, '[activation] &lt;= @timepoint', $N,
		$T, $T, $T, $T, ') THEN ', $Q, 'Future', $Q, $N,
		$T, $T, $T, $T, 'ELSE ', $Q, 'Past', $Q, $N,
		$T, $T, $T, 'END', $N,
		$T, $T, 'WHEN T.[name] is null THEN ', $Q, 'Missing', $Q, $N,
		$T, $T, 'ELSE ', $Q, 'Present', $Q, $N,
	    $T, 'END AS Existence', $N,
        'FROM (', $N,
        $T, 'SELECT', $N,
        $T, $T, 'MAX([version]) as [version],', $N,
        $T, $T, 'MAX([activation]) as [activation]', $N,
        $T, 'FROM', $N,
        $T, $T, '[', $defaultCapsule, '].[_Schema]', $N,
        $T, 'WHERE', $N,
        $T, $T, '[activation] &lt;= @timepoint', $N,
        ') V', $N,
        'JOIN (', $N,
        $T, 'SELECT', $N,
        $T, $T, '[name],', $N,
        $T, $T, '[version]', $N,
        $T, 'FROM', $N,
        $T, $T, '[', $defaultCapsule, '].[_Anchor] a', $N,
        $T, 'UNION ALL', $N,
        $T, 'SELECT', $N,
        $T, $T, '[name],', $N,
        $T, $T, '[version]', $N,
        $T, 'FROM', $N,
        $T, $T, '[', $defaultCapsule, '].[_Knot] k', $N,
        $T, 'UNION ALL', $N,
        $T, 'SELECT', $N,
        $T, $T, '[name],', $N,
        $T, $T, '[version]', $N,
        $T, 'FROM', $N,
        $T, $T, '[', $defaultCapsule, '].[_Attribute] b', $N,
        $T, 'UNION ALL', $N,
        $T, 'SELECT', $N,
        $T, $T, '[name],', $N,
        $T, $T, '[version]', $N,
        $T, 'FROM', $N,
        $T, $T, '[', $defaultCapsule, '].[_Tie] t', $N,
        ') S', $N,
        'ON', $N,
	    $T, 'S.[version] = V.[version]', $N,
        'FULL OUTER JOIN (', $N,
        $T, 'SELECT', $N,
		$T, $T, '[name],', $N,
		$T, $T, '[create_date]', $N,
		$T, 'FROM', $N,
		$T, $T, 'sys.tables', $N,
	    $T, 'WHERE', $N,
		$T, $T, '[type] like ', $Q, '%U%', $Q, $N,
	    $T, 'AND', $N,
		$T, $T, 'LEFT([name], 1) &lt;&gt; ', $Q, '_', $Q, $N,
        ') T', $N,
        'ON', $N,
	    $T, $T, 'S.[name] = T.[name]', $N,
        'GO', $N
        )"/>
    </xsl:template>
    <xsl:template name="whereCondition">
        <xsl:param name="tie"/>
        <xsl:param name="tieName"/>
        <xsl:param name="changingType"/>
        <xsl:param name="recordingType"/>
        <xsl:variable name="tieCapsule" select="$tie/metadata/@capsule"/>
        <xsl:variable name="joinConditions">
            <xsl:choose>
                <!-- one-to-one -->
                <xsl:when test="count($tie/*[string(@identifier) = 'true']) = 0">
                    <xsl:for-each select="$tie/anchorRole[1]">
                        <xsl:variable name="identity" select="concat(@type, '_', $identitySuffix, '_', @role)"/>
                        <xsl:value-of select="concat($T, $T, $T, 'sub.', $identity, ' = tie.', $identity, $N)"/>
                        <xsl:if test="not(position() = last())">
                            <xsl:value-of select="concat($T, $T, 'AND', $N)"/>
                        </xsl:if>
                    </xsl:for-each>
                </xsl:when>
                <!-- other cardinalities -->
                <xsl:otherwise>
                    <xsl:for-each select="$tie/*[string(@identifier) = 'true']">
                        <xsl:variable name="identity" select="concat(@type, '_', $identitySuffix, '_', @role)"/>
                        <xsl:value-of select="concat($T, $T, $T, 'sub.', $identity, ' = tie.', $identity, $N)"/>
                        <xsl:if test="not(position() = last())">
                            <xsl:value-of select="concat($T, $T, 'AND', $N)"/>
                        </xsl:if>
                    </xsl:for-each>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="restriction">
            <xsl:choose>
                <xsl:when test="$changingType = 'point-in-time'">
                    <xsl:value-of select="concat($T, $T, 'AND', $N, $T, $T, $T, 'sub.', $tieName, '_', $changingSuffix, ' &lt;= @changingTimepoint', $N)"/>
                </xsl:when>
                <xsl:when test="$changingType = 'difference'">
                    <xsl:value-of select="concat($T, $T, 'AND', $N, $T, $T, $T, 'sub.', $tieName, '_', $changingSuffix, ' BETWEEN @intervalStart AND @intervalEnd', $N)"/>
                </xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="operator">
            <xsl:choose>
                <xsl:when test="$changingType = 'difference'">
                    <xsl:text>IN</xsl:text>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:text>=</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="selection">
            <xsl:choose>
                <xsl:when test="$changingType = 'difference'">
                    <xsl:value-of select="concat($T, $T, $T, 'sub.', $tieName, '_', $changingSuffix, $N)"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="concat($T, $T, $T, 'max(sub.', $tieName, '_', $changingSuffix, ')', $N)"/>
                </xsl:otherwise>
            </xsl:choose>            
        </xsl:variable>
        <xsl:variable name="parameter">
            <xsl:if test="$recordingType = 'r'">
                <xsl:value-of select="'(@recordingTimepoint)'"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="prefix">
            <xsl:if test="$temporalization = 'bi'">
                <xsl:value-of select="$recordingType"/>
            </xsl:if>
        </xsl:variable>
        <xsl:value-of select="concat(
        $T, 'tie.', $tieName, '_', $changingSuffix, ' ', $operator, ' (', $N,
        $T, $T, 'SELECT', $N,
        $selection,
        $T, $T, 'FROM', $N,
        $T, $T, $T, '[', $tieCapsule, '].[', $prefix, $tieName, ']', $parameter, ' sub', $N,
        $T, $T, 'WHERE', $N,
        $joinConditions,
        $restriction,
        $T, ')'
        )"/>        
    </xsl:template>
    <xsl:template name="joinCondition">
        <xsl:param name="attribute"/>
        <xsl:param name="changingTimepoint" select="'?'"/>
        <xsl:param name="recordingTimepoint" select="'?'"/>
        <xsl:variable name="anchor" select="$attribute/parent::anchor"/>
        <xsl:variable name="anchorMnemonic" select="$anchor/@mnemonic"/>
        <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', $attribute/@mnemonic)"/>
        <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', $anchor/@descriptor, '_', $attribute/@descriptor)"/>
        <xsl:variable name="attributeCapsule" select="$attribute/metadata/@capsule"/>
        <xsl:variable name="anchorIdentity" select="concat($anchorMnemonic, '_', $identitySuffix)"/>
        <xsl:variable name="attributeSource">
            <xsl:choose>
                <xsl:when test="$temporalization = 'mono' and not($attribute/@timeRange)">
                    <xsl:value-of select="concat('[', $attributeCapsule, '].[', $attributeName, ']')"/>
                </xsl:when>
                <xsl:when test="$temporalization = 'mono' and $attribute/@timeRange and $changingTimepoint = '?'">
                    <xsl:value-of select="concat('[', $attributeCapsule, '].[', $attributeName, ']')"/>
                </xsl:when>
                <xsl:when test="$temporalization = 'mono' and $attribute/@timeRange and not($changingTimepoint = '?')">
                    <xsl:value-of select="concat('[', $attributeCapsule, '].[r', $attributeName, '] (', $changingTimepoint, ')')"/>
                </xsl:when>
                <xsl:when test="$temporalization = 'bi' and not($attribute/@timeRange) and $recordingTimepoint = '?'">
                    <xsl:value-of select="concat('[', $attributeCapsule, '].[ac', $attributeName, ']')"/>
                </xsl:when>
                <xsl:when test="$temporalization = 'bi' and not($attribute/@timeRange) and not($recordingTimepoint = '?')">
                    <xsl:value-of select="concat('[', $attributeCapsule, '].[ar', $attributeName, '] (', $recordingTimepoint, ')')"/>
                </xsl:when>
                <xsl:when test="$temporalization = 'bi' and $attribute/@timeRange and $changingTimepoint = '?' and $recordingTimepoint = '?'">
                    <xsl:value-of select="concat('[', $attributeCapsule, '].[ac', $attributeName, ']')"/>
                </xsl:when>
                <xsl:when test="$temporalization = 'bi' and $attribute/@timeRange and $changingTimepoint = '?' and not($recordingTimepoint = '?')">
                    <xsl:value-of select="concat('[', $attributeCapsule, '].[ar', $attributeName, '] (', $recordingTimepoint, ')')"/>
                </xsl:when>
                <xsl:when test="$temporalization = 'bi' and $attribute/@timeRange and not($changingTimepoint = '?') and $recordingTimepoint = '?'">
                    <xsl:value-of select="concat('[', $attributeCapsule, '].[rc', $attributeName, '] (', $changingTimepoint, ')')"/>
                </xsl:when>
                <xsl:when test="$temporalization = 'bi' and $attribute/@timeRange and not($changingTimepoint = '?') and not($recordingTimepoint = '?')">
                    <xsl:value-of select="concat('[', $attributeCapsule, '].[rr', $attributeName, '] (', $changingTimepoint, ', ', $recordingTimepoint, ')')"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="concat(
                        'YOU SHOULD NEVER SEE THIS:', $N,
                        'changingTimepoint = ', $Q, $changingTimepoint, $Q, $N,
                        'recordingTimepoint = ', $Q, $recordingTimepoint, $Q, $N,
                        'timeRange = ', $Q, $attribute/@timeRange, $Q, $N,
                        'temporalization = ', $Q, $temporalization, $Q, $N
                        )"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:value-of select="concat($N, 'LEFT JOIN', $N, $T, $attributeSource, ' [',  $attributeMnemonic, ']')"/>
        <xsl:value-of select="concat($N, 'ON', $N, $T, '[',  $attributeMnemonic, '].', $anchorIdentity, ' = [', $anchorMnemonic, '].', $anchorIdentity)"/>
        <xsl:if test="$attribute/@timeRange">
            <xsl:value-of select="concat($N, 'AND', $N, $T, '[', $attributeMnemonic, '].', $attributeMnemonic, '_', $changingSuffix, ' = (')"/>
            <xsl:value-of select="concat($N, $T, $T, 'SELECT', $N, $T, $T, $T, 'max(sub.', $attributeMnemonic, '_', $changingSuffix, ')')"/>
            <xsl:value-of select="concat($N, $T, $T, 'FROM', $N, $T, $T, $T, $attributeSource, ' sub')"/>
            <xsl:value-of select="concat($N, $T, $T, 'WHERE', $N, $T, $T, $T, 'sub.', $anchorIdentity, ' = [', $anchorMnemonic, '].', $anchorIdentity)"/>
            <xsl:value-of select="concat($N, $T, ')')"/>
        </xsl:if>
        <xsl:if test="key('knotLookup', $attribute/@knotRange)">
            <xsl:variable name="knotMnemonic" select="$attribute/@knotRange"/>
            <xsl:variable name="knotName" select="concat($knotMnemonic, '_', key('knotLookup', $attribute/@knotRange)/@descriptor)"/>
            <xsl:variable name="knotCapsule" select="key('knotLookup', $attribute/@knotRange)/metadata/@capsule"/>
            <xsl:variable name="knotIdentity" select="concat($knotMnemonic, '_', $identitySuffix)"/>
            <xsl:variable name="knotSource" select="concat('[', $knotCapsule, '].[', $knotName, ']')"/>
            <xsl:value-of select="concat($N, 'LEFT JOIN', $N, $T, $knotSource, ' [',  $knotMnemonic, ']')"/>
            <xsl:value-of select="concat($N, 'ON', $N, $T, '[',  $knotMnemonic, '].', $knotIdentity, ' = [', $attributeMnemonic, '].', $knotIdentity)"/>
        </xsl:if>
    </xsl:template>
    <xsl:template name="columnReference">
        <xsl:param name="attribute"/>
        <xsl:variable name="anchor" select="$attribute/parent::anchor"/>
        <xsl:variable name="anchorMnemonic" select="$anchor/@mnemonic"/>
        <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', $attribute/@mnemonic)"/>
        <xsl:variable name="attributeMetadata" select="concat($metadataPrefix, '_', $attributeMnemonic)"/>
        <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', $anchor/@descriptor, '_', $attribute/@descriptor)"/>
        <xsl:choose>
            <xsl:when test="key('knotLookup', @knotRange)">
                <xsl:variable name="knotMnemonic" select="$attribute/@knotRange"/>
                <xsl:variable name="knotMetadata" select="concat($metadataPrefix, '_', $knotMnemonic)"/>
                <xsl:variable name="knotName" select="concat($knotMnemonic, '_', key('knotLookup', $attribute/@knotRange)/@descriptor)"/>
                <xsl:variable name="knotIdentity" select="concat($knotMnemonic, '_', $identitySuffix)"/>
                <xsl:value-of select="concat(',', $N, $T, '[', $knotMnemonic, '].', $knotIdentity)"/>
                <xsl:value-of select="concat(',', $N, $T, '[', $knotMnemonic, '].', $knotName)"/>
                <xsl:if test="$metadataUsage = 'true'">
                    <xsl:value-of select="concat(',', $N, $T, '[', $knotMnemonic, '].', $knotMetadata)"/>
                </xsl:if>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="concat(',', $N, $T, '[', $attributeMnemonic, '].', $attributeName)"/>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="@timeRange">
            <xsl:value-of select="concat(',', $N, $T, '[', $attributeMnemonic, '].', $attributeMnemonic, '_', $changingSuffix)"/>
        </xsl:if>
        <xsl:if test="$metadataUsage = 'true'">
            <xsl:value-of select="concat(',', $N, $T, '[', $attributeMnemonic, '].', $attributeMetadata)"/>
        </xsl:if>
        <xsl:if test="$temporalization = 'bi'">
            <xsl:value-of select="concat(
            ',', $N, $T, '[', $attributeMnemonic, '].', $attributeMnemonic, '_', $recordingSuffix, ', ', $N,
            $T, '[', $attributeMnemonic, '].', $attributeMnemonic, '_', $erasingSuffix
            )"/>
        </xsl:if>
    </xsl:template>
    <xsl:template name="insertStatement">
        <xsl:param name="attribute"/>
        <xsl:variable name="anchor" select="$attribute/parent::anchor"/>
        <xsl:variable name="anchorMnemonic" select="$anchor/@mnemonic"/>
        <xsl:variable name="anchorIdentity" select="concat($anchorMnemonic, '_', $identitySuffix)"/>
        <xsl:variable name="anchorMetadata" select="concat($metadataPrefix, '_', $anchorMnemonic)"/>
        <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', $attribute/@mnemonic)"/>
        <xsl:variable name="attributeMetadata" select="concat($metadataPrefix, '_', $attributeMnemonic)"/>
        <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', $anchor/@descriptor, '_', $attribute/@descriptor)"/>
        <xsl:variable name="attributeCapsule" select="$attribute/metadata/@capsule"/>
        <xsl:variable name="attributeHistorizationColumn">
            <xsl:if test="$attribute/@timeRange">
                <xsl:value-of select="concat(', ', $N, $T, $T, $attributeMnemonic, '_', $changingSuffix)"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeHistorizationValue">
            <xsl:if test="$attribute/@timeRange">
                <xsl:value-of select="concat(', ', $N, $T, $T, 'ISNULL(i.', $attributeMnemonic, '_', $changingSuffix, ', @now)')"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeMetadataColumn">
            <xsl:if test="$metadataUsage = 'true'">
                <xsl:value-of select="concat(', ', $N, $T, $T, $attributeMetadata)"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeMetadataInsert">
            <xsl:if test="$metadataUsage = 'true'">
                <xsl:value-of select="concat(', ', $N, $T, $T, 'ISNULL(i.', $attributeMetadata, ', i.', $anchorMetadata, ')')"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeRecordingColumns">
            <xsl:if test="$temporalization = 'bi'">
                <xsl:value-of select="concat(
                ',', $N, $T, $T, $attributeMnemonic, '_', $recordingSuffix, ', ', $N,
                $T, $T, $attributeMnemonic, '_', $erasingSuffix
                )"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeRecordingValues">
            <xsl:if test="$temporalization = 'bi'">
                <xsl:value-of select="concat(
                ',', $N, $T, $T, 'ISNULL(i.', $attributeMnemonic, '_', $recordingSuffix, ', @now),', $N,
                $T, $T, 'ISNULL(i.', $attributeMnemonic, '_', $erasingSuffix, ', ', $infinity, ')'
                )"/>
            </xsl:if>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$attribute/@knotRange">
                <xsl:variable name="knot" select="key('knotLookup', $attribute/@knotRange)"/>
                <xsl:variable name="knotMnemonic" select="$knot/@mnemonic"/>
                <xsl:variable name="knotName" select="concat($knotMnemonic, '_', $knot/@descriptor)"/>
                <xsl:variable name="knotCapsule" select="$knot/metadata/@capsule"/>
                <xsl:variable name="knotIdentity" select="concat($knotMnemonic, '_', $identitySuffix)"/>
                <xsl:value-of select="concat(
                $T, 'INSERT INTO [', $attributeCapsule, '].[', $attributeName, '](', $N,
                $T, $T, $anchorIdentity, ', ', $N,
                $T, $T, $knotIdentity,
                $attributeMetadataColumn,
                $attributeHistorizationColumn,
                $attributeRecordingColumns, $N,
                $T, ')', $N,
                $T, 'SELECT', $N,
                $T, $T, 'ISNULL(i.', $anchorIdentity, ', a.', $anchorIdentity, '),', $N,
                $T, $T, 'k.', $knotIdentity,
                $attributeMetadataInsert,
                $attributeHistorizationValue,
                $attributeRecordingValues, $N,
                $T, 'FROM (', $N,
                $T, $T, 'SELECT', $N,
                $T, $T, $T, '*,', $N,
                $T, $T, $T, 'ROW_NUMBER() OVER (PARTITION BY ', $anchorIdentity, ' ORDER BY ', $anchorIdentity, ') AS Row', $N,
                $T, $T, 'FROM', $N,
                $T, $T, $T, 'inserted', $N,
                $T, ') i', $N,
                $T, 'LEFT JOIN', $N,
                $T, $T, '@', $anchorMnemonic, ' a', $N,
                $T, 'ON', $N,
                $T, $T, 'a.Row = i.Row', $N,
                $T, 'JOIN', $N,
                $T, $T, '[', $knotCapsule, '].[', $knotName, '] k', $N,
                $T, 'ON', $N,
                $T, $T, 'k.', $knotName, ' = i.', $knotName, $N,
                $T, 'WHERE', $N,
                $T, $T, 'i.', $knotName, ' is not null;', $N
                )"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="concat(
                $T, 'INSERT INTO [', $attributeCapsule, '].[', $attributeName, '](', $N,
                $T, $T, $anchorIdentity, ', ', $N,
                $T, $T, $attributeName,
                $attributeMetadataColumn,
                $attributeHistorizationColumn,
                $attributeRecordingColumns, $N,
                $T, ')', $N,
                $T, 'SELECT', $N,
                $T, $T, 'ISNULL(i.', $anchorIdentity, ', a.', $anchorIdentity, '),', $N,
                $T, $T, 'i.', $attributeName, 
                $attributeMetadataInsert,
                $attributeHistorizationValue,
                $attributeRecordingValues, $N,
                $T, 'FROM (', $N,
                $T, $T, 'SELECT', $N,
                $T, $T, $T, '*,', $N,
                $T, $T, $T, 'ROW_NUMBER() OVER (PARTITION BY ', $anchorIdentity, ' ORDER BY ', $anchorIdentity, ') AS Row', $N,
                $T, $T, 'FROM', $N,
                $T, $T, $T, 'inserted', $N,
                $T, ') i', $N,
                $T, 'LEFT JOIN', $N,
                $T, $T, '@', $anchorMnemonic, ' a', $N,
                $T, 'ON', $N,
                $T, $T, 'a.Row = i.Row', $N,
                $T, 'WHERE', $N,
                $T, $T, 'i.', $attributeName, ' is not null;', $N
                )"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template name="updateStatement">
        <xsl:param name="attribute"/>
        <xsl:variable name="anchor" select="$attribute/parent::anchor"/>
        <xsl:variable name="anchorMnemonic" select="$anchor/@mnemonic"/>
        <xsl:variable name="anchorIdentity" select="concat($anchorMnemonic, '_', $identitySuffix)"/>
        <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', $attribute/@mnemonic)"/>
        <xsl:variable name="attributeMetadata" select="concat($metadataPrefix, '_', $attributeMnemonic)"/>
        <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', $anchor/@descriptor, '_', $attribute/@descriptor)"/>
        <xsl:variable name="attributeCapsule" select="$attribute/metadata/@capsule"/>
        <xsl:variable name="changingColumn" select="concat($attributeMnemonic, '_', $changingSuffix)"/>
        <xsl:variable name="recordingColumn" select="concat($attributeMnemonic, '_', $recordingSuffix)"/>
        <xsl:variable name="erasingColumn" select="concat($attributeMnemonic, '_', $erasingSuffix)"/>
        <xsl:variable name="attributeHistorization">
            <xsl:if test="$attribute/@timeRange">
                <xsl:value-of select="concat(', ', $N, $T, $T, $changingColumn)"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeHistorizationAliased">
            <xsl:if test="$attribute/@timeRange">
                <xsl:choose>
                    <xsl:when test="$temporalization = 'mono'">
                        <xsl:value-of select="concat(', ', $N, $T, $T, '@now')"/>
                    </xsl:when>
                    <xsl:when test="$temporalization = 'bi'">
                        <xsl:value-of select="concat(', ', $N, $T, $T, 'CASE WHEN UPDATE(', $erasingColumn, ') THEN i.', $changingColumn, ' ELSE @now END')"/>
                    </xsl:when>
                </xsl:choose>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeMetadataColumn">
            <xsl:if test="$metadataUsage = 'true'">
                <xsl:value-of select="concat(', ', $N, $T, $T, $attributeMetadata)"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeMetadataValue">
            <xsl:if test="$metadataUsage = 'true'">
                <xsl:value-of select="concat(', ', $N, $T, $T, 'CASE WHEN UPDATE(', $attributeMetadata, ') THEN i.', $attributeMetadata, ' ELSE 0 END')"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeRecordingColumns">
            <xsl:if test="$temporalization = 'bi'">
                <xsl:value-of select="concat(
                ',', $N, $T, $T, $recordingColumn, ', ', $N,
                $T, $T, $erasingColumn
                )"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeRecordingValues">
            <xsl:if test="$temporalization = 'bi'">
                <xsl:value-of select="concat(
                ',', $N, $T, $T, 'CASE WHEN UPDATE(', $erasingColumn, ') THEN ISNULL(i.', $erasingColumn, ', @now) ELSE @now END, ', $N,
                $T, $T, $infinity
                )"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeChangingCondition">
            <xsl:if test="$attribute/@timeRange">
                <xsl:value-of select="concat(
                $T, 'AND', $N,
                $T, $T, 'i.', $changingColumn, ' = ', $attributeMnemonic, '.', $changingColumn, $N
                )"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="updatePrevious">
            <xsl:if test="$temporalization = 'bi'">
                <xsl:value-of select="concat(
                $T, 'IF(UPDATE(', $erasingColumn, '))', $N,
                $T, 'UPDATE ', $attributeMnemonic, $N,
                $T, 'SET', $N,
                $T, $T, $attributeMnemonic, '.', $erasingColumn, ' = ISNULL(i.', $erasingColumn, ', @now)', $N,
                $T, 'FROM', $N,
                $T, $T, '[', $attributeCapsule, '].[', $attributeName, '] ', $attributeMnemonic, $N,
                $T, 'JOIN', $N,
                $T, $T, 'inserted i', $N,
                $T, 'ON', $N,
                $T, $T, 'i.', $anchorIdentity, ' = ', $attributeMnemonic, '.', $anchorIdentity, $N,
                $attributeChangingCondition,
                $T, 'AND', $N,
                $T, $T, 'i.', $recordingColumn, ' = ', $attributeMnemonic, '.', $recordingColumn, ';', $N
                )"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="changingCheck">
            <xsl:if test="$attribute/@timeRange">
                <xsl:value-of select="concat(' OR UPDATE(', $changingColumn, ')')"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="recordingCheck">
            <xsl:if test="$temporalization = 'bi'">
                <xsl:value-of select="concat(' OR UPDATE(', $recordingColumn, ')')"/>
            </xsl:if>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$attribute/@knotRange">
                <xsl:variable name="knot" select="key('knotLookup', $attribute/@knotRange)"/>
                <xsl:variable name="knotMnemonic" select="$knot/@mnemonic"/>
                <xsl:variable name="knotName" select="concat($knotMnemonic, '_', $knot/@descriptor)"/>
                <xsl:variable name="knotIdentity" select="concat($knotMnemonic, '_', $identitySuffix)"/>
                <xsl:variable name="knotCapsule" select="$knot/metadata/@capsule"/>
                <xsl:value-of select="concat(
                $T, 'IF(UPDATE(', $anchorIdentity, ')', $changingCheck, $recordingCheck, ')', $N,
                $T, 'RAISERROR(', $Q, 'Primary key columns are not updatable.', $Q, ', 16, 1);', $N,
                $updatePrevious,
                $T, 'IF(UPDATE(', $knotName, '))', $N,
                $T, 'INSERT INTO [', $attributeCapsule, '].[', $attributeName, '](', $N,
                $T, $T, $anchorIdentity, ', ', $N,
                $T, $T, $knotIdentity,
                $attributeMetadataColumn,
                $attributeHistorization,
                $attributeRecordingColumns, $N,
                $T, ')', $N,
                $T, 'SELECT', $N,
                $T, $T, 'i.', $anchorIdentity, ', ', $N,
                $T, $T, 'k.', $knotIdentity,
                $attributeMetadataValue,
                $attributeHistorizationAliased,
                $attributeRecordingValues, $N,
                $T, 'FROM', $N,
                $T, $T, 'inserted i', $N,
                $T, 'JOIN', $N,
                $T, $T, '[', $knotCapsule, '].[', $knotName, '] k', $N,
                $T, 'ON', $N,
                $T, $T, 'k.', $knotName, ' = i.', $knotName, ';', $N
                )"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="concat(
                $T, 'IF(UPDATE(', $anchorIdentity, ')', $changingCheck, $recordingCheck, ')', $N,
                $T, 'RAISERROR(', $Q, 'Primary key columns are not updatable.', $Q, ', 16, 1);', $N,
                $updatePrevious,
                $T, 'IF(UPDATE(', $attributeName, '))', $N,
                $T, 'INSERT INTO [', $attributeCapsule, '].[', $attributeName, '](', $N,
                $T, $T, $anchorIdentity, ', ', $N,
                $T, $T, $attributeName,
                $attributeMetadataColumn,
                $attributeHistorization,
                $attributeRecordingColumns, $N,
                $T, ')', $N,
                $T, 'SELECT', $N,
                $T, $T, 'i.', $anchorIdentity, ', ', $N,
                $T, $T, 'i.', $attributeName,
                $attributeMetadataValue,
                $attributeHistorizationAliased,
                $attributeRecordingValues, $N,
                $T, 'FROM', $N,
                $T, $T, 'inserted i;', $N
                )"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>