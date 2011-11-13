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
    <xsl:param name="historizationSuffix">
        <xsl:text>ChangedAt</xsl:text>
    </xsl:param>
    <xsl:param name="identitySuffix">
        <xsl:text>ID</xsl:text>
    </xsl:param>

    <!-- "global" variables -->
    <xsl:variable name="N"><xsl:text>&#13;&#10;</xsl:text></xsl:variable>
    <xsl:variable name="T"><xsl:text>&#32;&#32;&#32;</xsl:text></xsl:variable>
    <xsl:variable name="Q"><xsl:text>'</xsl:text></xsl:variable>
    <xsl:variable name="D"><xsl:text>"</xsl:text></xsl:variable>

    <!-- match the schema (root element) and process the different elements using for-each loops -->
	<xsl:template match="/schema">

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
            $T, $knotName, ' ', $knotDataType, ' not null unique,', $N,
            $knotMetadataDefinition,
            $T, 'primary key (', $N,
            $T, $T, $knotIdentity, ' asc', $N,
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
            $T, 'primary key (', $N,
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
                <xsl:value-of select="concat(
                '----------------------- [Key Generation Stored Procedure] ----------------------------', $N,
                '-- ', $anchorName, ' surrogate key generation stored procedure', $N,
                '--------------------------------------------------------------------------------------', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $anchorKeyGenerator, $Q, ' AND type in (', $Q, 'P', $Q, ',', $Q, 'PC', $Q, '))', $N,
                'DROP PROCEDURE [', $anchorCapsule, '].[', $anchorKeyGenerator, ']', $N,
                'GO', $N,
                'CREATE PROCEDURE [', $anchorCapsule, '].[', $anchorKeyGenerator, '] (', $N,
	            $T, '@requestedNumberOfIdentities bigint,', $N,
	            $T, '@', $anchorMetadata, ' ', $metadataType, $N,
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
                <xsl:variable name="historizationDefinition">
                    <xsl:if test="@timeRange">
                        <xsl:value-of select="concat($T, $attributeMnemonic, '_', $historizationSuffix, ' ', @timeRange, ' not null,', $N)"/>
                    </xsl:if>
                </xsl:variable>
                <xsl:variable name="historizationKey">
                    <xsl:choose>
                        <xsl:when test="@timeRange">
                            <xsl:value-of select="concat(',', $N, $T, $T, $attributeMnemonic, '_', $historizationSuffix, ' desc', $N)"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="$N"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:value-of select="concat(
                '--------------------------------- [Attribute Table] ----------------------------------', $N,
                '-- ', $attributeName, ' table (on ', $anchorName, ')', $N,
                '--------------------------------------------------------------------------------------', $N,
                'IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $attributeName, $Q, ' AND type LIKE ', $Q, '%U%', $Q, ')', $N,
                'CREATE TABLE [', $attributeCapsule, '].[', $attributeName, '] (', $N,
                $T, $anchorIdentity, ' ', $anchorIdentityType, ' not null foreign key references [', $anchorCapsule, '].[', $anchorName, '](', $anchorIdentity, '),', $N,
                $knotOrDataDefinition,
                $historizationDefinition,
                $attributeMetadataDefinition,
                $T, 'primary key (', $N,
                $T, $T, $anchorIdentity, ' asc',
                $historizationKey,
                $T, ')', $N,
                ');', $N,
                'GO', $N, $N
                )"/>
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
                        <xsl:with-param name="timepoint"/>
                    </xsl:call-template>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="latestViewName" select="concat('l', $anchorName)"/>
            <xsl:variable name="anchorMetadataColumnReference">
            	<xsl:if test="$metadataUsage = 'true'">
            		<xsl:value-of select="concat(', ', $N, $T, '[', $anchorMnemonic, '].', $anchorMetadata)"/>
            	</xsl:if>
            </xsl:variable>
            <xsl:value-of select="concat(
            '------------------------------- [Latest Perspective] ---------------------------------', $N,
            '-- ', $anchorName, ' viewed as is (given by the latest available information)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $latestViewName, $Q, ' AND type LIKE ', $Q, '%V%', $Q, ')', $N,
            'DROP VIEW [', $anchorCapsule, '].[', $latestViewName, '];', $N,
            'GO', $N,
            'CREATE VIEW [', $anchorCapsule, '].[', $latestViewName, '] WITH SCHEMABINDING AS', $N,
            'SELECT', $N,
            $T, '[', $anchorMnemonic, '].', $anchorIdentity,
            $anchorMetadataColumnReference,
            $columnReferences, $N,
            'FROM', $N,
            $T, '[', $anchorCapsule, '].[', $anchorName, '] [', $anchorMnemonic, ']',
            $latestJoinConditions, ';', $N,
            'GO', $N, $N
            )"/>
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
            'CREATE TRIGGER [', $anchorCapsule, '].[', $insertTriggerName, '] ON ', $latestViewName, $N,
            'INSTEAD OF INSERT', $N,
            'AS', $N,
            'BEGIN', $N,
	        $T, 'SET NOCOUNT ON;', $N,
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
            'CREATE TRIGGER [', $anchorCapsule, '].[', $updateTriggerName, '] ON ', $latestViewName, $N,
            'INSTEAD OF UPDATE', $N,
            'AS', $N,
            'BEGIN', $N,
	        $T, 'SET NOCOUNT ON;', $N,
	        $updateStatements,
	        'END', $N,
	        'GO', $N, $N
            )"/>
            <xsl:variable name="point-in-timeJoinConditions">
                <xsl:for-each select="attribute">
                    <xsl:call-template name="joinCondition">
                        <xsl:with-param name="attribute" select="."/>
                        <xsl:with-param name="timepoint" select="'@timepoint'"/>
                    </xsl:call-template>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="point-in-timeFunctionName" select="concat('p', $anchorName)"/>
            <xsl:value-of select="concat(
            '---------------------------- [Point-in-Time Perspective] -----------------------------', $N,
            '-- ', $anchorName, ' viewed as was (at the given timepoint)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $point-in-timeFunctionName, $Q, ' AND type LIKE ', $Q, '%F%', $Q, ')', $N,
            'DROP FUNCTION [', $anchorCapsule, '].[', $point-in-timeFunctionName, '];', $N,
            'GO', $N,
            'CREATE FUNCTION [', $anchorCapsule, '].[', $point-in-timeFunctionName, '] (@timepoint datetime)', $N,
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
            <xsl:for-each select="attribute[@timeRange]">
                <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', @mnemonic)"/>
                <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', parent::*/@descriptor, '_', @descriptor)"/>
                <xsl:variable name="attributeCapsule" select="metadata/@capsule"/>
                <xsl:variable name="differenceFunctionName" select="concat('d', $attributeName)"/>
                <xsl:value-of select="concat(
                '------------------------------ [Difference Perspective] ------------------------------', $N,
                '-- ', $anchorName, ' viewed by differences in ', $attributeName, $N,
                '--------------------------------------------------------------------------------------', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $differenceFunctionName, $Q, ' AND type LIKE ', $Q, '%F%', $Q, ')', $N,
                'DROP FUNCTION [', $anchorCapsule, '].[', $differenceFunctionName, '];', $N,
                'GO', $N,
                'CREATE FUNCTION [', $anchorCapsule, '].[', $differenceFunctionName, '] (@intervalStart datetime, @intervalEnd datetime)', $N,
                'RETURNS TABLE AS RETURN', $N,
                'SELECT', $N,
                $T, 'timepoints.inspectedTimepoint,', $N,
                $T, '[', $anchorMnemonic, '].*', $N,
                'FROM (', $N,
                $T, 'SELECT DISTINCT', $N,
                $T, $T, $attributeMnemonic, '_', $historizationSuffix, ' AS inspectedTimepoint', $N,
                $T, 'FROM', $N,
                $T, $T, '[', $attributeCapsule, '].[', $attributeName, ']', $N,
                $T, 'WHERE', $N,
                $T, $T, $attributeMnemonic, '_', $historizationSuffix, ' BETWEEN @intervalStart AND @intervalEnd', $N,
                ') timepoints', $N,
                'CROSS APPLY', $N,
                $T, $point-in-timeFunctionName, '(timepoints.inspectedTimepoint) [', $anchorMnemonic, '];', $N,
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
                        $T, $T, $attributeMnemonic, '_', $historizationSuffix, ' AS inspectedTimepoint', $N,
                        $T, 'FROM', $N,
                        $T, $T, '[', $attributeCapsule, '].[', $attributeName, ']', $N,
                        $T, 'WHERE', $N,
                        $T, $T, $attributeMnemonic, '_', $historizationSuffix, ' BETWEEN @intervalStart AND @intervalEnd', $N
                        )"/>
                        <xsl:if test="not(position() = last())">
                            <xsl:value-of select="concat($T, 'UNION', $N)"/>
                        </xsl:if>
                    </xsl:for-each>
                </xsl:variable>
                <xsl:variable name="differenceFunctionName" select="concat('d', $anchorName)"/>
                <xsl:value-of select="concat(
                '------------------------------ [Difference Perspective] ------------------------------', $N,
                '-- ', $anchorName, ' viewed by differences in every historized attribute', $N,
                '--------------------------------------------------------------------------------------', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $differenceFunctionName, $Q, ' and type LIKE ', $Q, '%F%', $Q, ')', $N,
                'DROP FUNCTION [', $anchorCapsule, '].[', $differenceFunctionName, '];', $N,
                'GO', $N,
                'CREATE FUNCTION [', $anchorCapsule, '].[', $differenceFunctionName, '] (@intervalStart datetime, @intervalEnd datetime)', $N,
                'RETURNS TABLE AS RETURN', $N,
                'SELECT', $N,
                $T, 'timepoints.inspectedTimepoint,', $N,
                $T, '[', $anchorMnemonic, '].*', $N,
                'FROM (', $N,
                $unionOfTimepoints,
                ') timepoints', $N,
                'CROSS APPLY', $N,
                $T, '[', $anchorCapsule, '].[', $point-in-timeFunctionName, '](timepoints.inspectedTimepoint) [', $anchorMnemonic, '];', $N,
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
            <xsl:variable name="historizationDefinition">
                <xsl:if test="@timeRange">
                    <xsl:value-of select="concat($T, $tieName, '_', $historizationSuffix, ' ', @timeRange, ' not null,', $N)"/>
                </xsl:if>
            </xsl:variable>
            <xsl:variable name="historizationKey">
                <xsl:choose>
                    <xsl:when test="@timeRange">
                        <xsl:value-of select="concat(',', $N, $T, $T, $tieName, '_', $historizationSuffix, ' desc', $N)"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$N"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <xsl:variable name="uniqueConstraints">
                <xsl:if test="count(anchorRole[string(@identifier) = 'true']|knotRole[string(@identifier) = 'true']) = 0">
                    <xsl:for-each select="anchorRole[position() > 1]">
                        <xsl:value-of select="concat(',', $N, $T, 'unique (', $N, $T, $T, @type, '_', $identitySuffix, '_', @role, ' asc', $historizationKey, $T, ')')"/>
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
            <xsl:value-of select="concat(
            '------------------------------------- [Tie Table] ------------------------------------', $N,
            '-- ', $tieName, ' table (', count(anchorRole|knotRole), '-ary)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $tieName, $Q, ' and type LIKE ', $Q, '%U%', $Q, ')', $N,
            'CREATE TABLE [', $tieCapsule, '].[', $tieName, '] (', $N,
            $columnDefinitions,
            $historizationDefinition,
            $tieMetadataDefinition,
            $T, 'primary key (', $N,
            $primaryKeyColumns,
            $historizationKey,
            $T, ')',
            $uniqueConstraints, $N,
            ');', $N,
            'GO', $N, $N
            )"/>
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
                    <xsl:value-of select="concat(',', $N, $T, 'tie.', $tieName, '_', $historizationSuffix)"/>
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
            <xsl:variable name="latestWhereCondition">
                <xsl:if test="@timeRange">
                    <xsl:call-template name="whereCondition">
                        <xsl:with-param name="tie" select="."/>
                        <xsl:with-param name="tieName" select="$tieName"/>
                        <xsl:with-param name="type" select="'latest'"/>
                    </xsl:call-template>
                </xsl:if>
            </xsl:variable>
            <xsl:variable name="tieMetadataReference">
				<xsl:if test="$metadataUsage = 'true'">
					<xsl:value-of select="concat($T, 'tie.', $tieMetadata, ',', $N)"/>
				</xsl:if>
			</xsl:variable>
            <xsl:variable name="latestViewName" select="concat('l', $tieName)"/>
            <xsl:value-of select="concat(
            '--------------------------------- [Latest Perspective] -------------------------------', $N,
            '-- ', $tieName, ' viewed as is (given by the latest available information)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $latestViewName, $Q, ' and type LIKE ', $Q, '%V%', $Q, ')', $N,
            'DROP VIEW [', $tieCapsule, '].[', $latestViewName, '];', $N,
            'GO', $N,
            'CREATE VIEW [', $tieCapsule, '].[', $latestViewName, '] WITH SCHEMABINDING AS', $N,
            'SELECT', $N,
            $tieMetadataReference,
            $columnReferences,
            'FROM', $N,
            $T, '[', $tieCapsule, '].[', $tieName, '] tie',
            $joinConditions,
            $latestWhereCondition, ';', $N,
            'GO', $N, $N
            )"/>
            <xsl:variable name="point-in-timeWhereCondition">
                <xsl:if test="@timeRange">
                    <xsl:call-template name="whereCondition">
                        <xsl:with-param name="tie" select="."/>
                        <xsl:with-param name="tieName" select="$tieName"/>
                        <xsl:with-param name="type" select="'point-in-time'"/>
                    </xsl:call-template>
                </xsl:if>
            </xsl:variable>
            <xsl:variable name="point-in-timeFunctionName" select="concat('p', $tieName)"/>
            <xsl:value-of select="concat(
            '---------------------------- [Point-in-Time Perspective] -----------------------------', $N,
            '-- ', $tieName, ' viewed as was (at the given timepoint)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $point-in-timeFunctionName, $Q, ' and type LIKE ', $Q, '%F%', $Q, ')', $N,
            'DROP FUNCTION [', $tieCapsule, '].[', $point-in-timeFunctionName, '];', $N,
            'GO', $N,
            'CREATE FUNCTION [', $tieCapsule, '].[', $point-in-timeFunctionName, '] (@timepoint datetime)', $N,
            'RETURNS TABLE WITH SCHEMABINDING AS RETURN', $N,
            'SELECT', $N,
            $tieMetadataReference,
            $columnReferences,
            'FROM', $N,
            $T, '[', $tieCapsule, '].[', $tieName, '] tie',
            $joinConditions,
            $point-in-timeWhereCondition, ';', $N,
            'GO', $N, $N
            )"/>
            <xsl:variable name="differenceWhereCondition">
                <xsl:if test="@timeRange">
                    <xsl:call-template name="whereCondition">
                        <xsl:with-param name="tie" select="."/>
                        <xsl:with-param name="tieName" select="$tieName"/>
                        <xsl:with-param name="type" select="'difference'"/>
                    </xsl:call-template>
                </xsl:if>
            </xsl:variable>
            <xsl:variable name="differenceFunctionName" select="concat('d', $tieName)"/>
            <xsl:value-of select="concat(
            '------------------------------ [Difference Perspective] ------------------------------', $N,
            '-- ', $tieName, ' viewed by differences in the tie', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $differenceFunctionName, $Q, ' and type LIKE ', $Q, '%F%', $Q, ')', $N,
            'DROP FUNCTION [', $tieCapsule, '].[', $differenceFunctionName, '];', $N,
            'GO', $N,
            'CREATE FUNCTION [', $tieCapsule, '].[', $differenceFunctionName, '] (@intervalStart datetime, @intervalEnd datetime)', $N,
            'RETURNS TABLE WITH SCHEMABINDING AS RETURN', $N,
            'SELECT', $N,
            $tieMetadataReference,
            $columnReferences,
            'FROM', $N,
            $T, '[', $tieCapsule, '].[', $tieName, '] tie',
            $joinConditions,
            $differenceWhereCondition, ';', $N,
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
        $T,'CREATE TABLE [_Schema] (', $N,
	    $T,$T, '[version] int identity(1, 1) not null primary key,', $N,
	    $T,$T, '[activation] datetime not null,', $N,
	    $T,$T, '[schema] xml not null', $N,
        $T,');', $N,
        'GO', $N, $N,
        'INSERT INTO [_Schema] (', $N,
        $T, '[activation],', $N,
	    $T, '[schema]', $N,
        ')', $N,
        'SELECT', $N,
	    $T, 'GETDATE(),', $N,
	    $T, 'N', $Q, $schema, $Q, ';', $N,
        'GO', $N, $N,
        'IF EXISTS (SELECT * FROM sys.views WHERE name = ', $Q, '_Anchor', $Q, ')', $N,
        'DROP VIEW [_Anchor]', $N,
        'GO', $N, $N,
        'CREATE VIEW [_Anchor]', $N,
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
	    $T, '[_Schema] S', $N,
        'CROSS APPLY', $N,
	    $T, 'S.[schema].nodes(', $Q, '/schema/anchor', $Q, ') as Nodeset(anchor);', $N,
        'GO', $N, $N,
        'IF EXISTS (SELECT * FROM sys.views WHERE name = ', $Q, '_Knot', $Q, ')', $N,
        'DROP VIEW [_Knot]', $N,
        'GO', $N, $N,
        'CREATE VIEW [_Knot]', $N,
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
	    $T, '[_Schema] S', $N,
        'CROSS APPLY', $N,
	    $T, 'S.[schema].nodes(', $Q, '/schema/knot', $Q, ') as Nodeset(knot);', $N,
        'GO', $N, $N,
        'IF EXISTS (SELECT * FROM sys.views WHERE name = ', $Q, '_Attribute', $Q, ')', $N,
        'DROP VIEW [_Attribute]', $N,
        'GO', $N, $N,
        'CREATE VIEW [_Attribute]', $N,
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
	    $T, '[_Schema] S', $N,
        'CROSS APPLY', $N,
	    $T, 'S.[schema].nodes(', $Q, '/schema/anchor', $Q, ') as ParentNodeset(anchor)', $N,
        'OUTER APPLY', $N,
	    $T, 'ParentNodeset.anchor.nodes(', $Q, 'attribute', $Q, ') as Nodeset(attribute);', $N,
        'GO', $N, $N,
        'IF EXISTS (SELECT * FROM sys.views WHERE name = ', $Q, '_Tie', $Q, ')', $N,
        'DROP VIEW [_Tie]', $N,
        'GO', $N, $N,
        'CREATE VIEW [_Tie]', $N,
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
	    $T, '[_Schema] S', $N,
        'CROSS APPLY', $N,
	    $T, 'S.[schema].nodes(', $Q, '/schema/tie', $Q, ') as Nodeset(tie);', $N,
        'GO', $N, $N,
        'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, '_Evolution', $Q, ' and type LIKE ', $Q, '%F%', $Q, ')', $N,
        'DROP FUNCTION [_Evolution];', $N,
        'GO', $N, $N,
        'CREATE FUNCTION _Evolution (', $N,
	    $T, $T, '@timepoint AS datetime', $N,
        ')', $N,
        'RETURNS TABLE', $N,
        'RETURN', $N,
        'SELECT', $N,
	    $T, 'V.[version],', $N,
	    $T, 'COALESCE(S.[name], T.[name]) AS [name],', $N,
	    $T, 'COALESCE(V.[activation], T.[create_date]) AS [activation],', $N,
	    $T, 'CASE', $N,
		$T, $T, 'WHEN S.[name] is null THEN', $N,
		$T, $T, $T, 'CASE', $N,
		$T, $T, $T, $T, 'WHEN T.[create_date] > (', $N,
		$T, $T, $T, $T, $T, 'SELECT', $N,
		$T, $T, $T, $T, $T, $T, 'COALESCE(MAX([activation]), @timepoint)', $N,
		$T, $T, $T, $T, $T, 'FROM', $N,
		$T, $T, $T, $T, $T, $T, '[_Schema]', $N,
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
        $T, $T, '[_Schema]', $N,
        $T, 'WHERE', $N,
        $T, $T, '[activation] &lt;= @timepoint', $N,
        ') V', $N,
        'JOIN (', $N,
        $T, 'SELECT', $N,
        $T, $T, '[name],', $N,
        $T, $T, '[version]', $N,
        $T, 'FROM', $N,
        $T, $T, '[_Anchor] a', $N,
        $T, 'UNION ALL', $N,
        $T, 'SELECT', $N,
        $T, $T, '[name],', $N,
        $T, $T, '[version]', $N,
        $T, 'FROM', $N,
        $T, $T, '[_Knot] k', $N,
        $T, 'UNION ALL', $N,
        $T, 'SELECT', $N,
        $T, $T, '[name],', $N,
        $T, $T, '[version]', $N,
        $T, 'FROM', $N,
        $T, $T, '[_Attribute] b', $N,
        $T, 'UNION ALL', $N,
        $T, 'SELECT', $N,
        $T, $T, '[name],', $N,
        $T, $T, '[version]', $N,
        $T, 'FROM', $N,
        $T, $T, '[_Tie] t', $N,
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
        <xsl:param name="type"/>
        <xsl:variable name="tieCapsule" select="$tie/metadata/@capsule"/>
        <xsl:variable name="joinConditions">
            <xsl:for-each select="$tie/*[string(@identifier) = 'true']">
                <xsl:variable name="identity" select="concat(@type, '_', $identitySuffix, '_', @role)"/>
                <xsl:value-of select="concat($T, $T, $T, 'sub.', $identity, ' = tie.', $identity, $N)"/>
                <xsl:if test="not(position() = last())">
                    <xsl:value-of select="concat($T, $T, 'AND', $N)"/>
                </xsl:if>
            </xsl:for-each>
        </xsl:variable>
        <xsl:variable name="restriction">
            <xsl:choose>
                <xsl:when test="$type = 'point-in-time'">
                    <xsl:value-of select="concat($T, $T, 'AND', $N, $T, $T, $T, 'sub.', $tieName, '_', $historizationSuffix, ' &lt;= @timepoint', $N)"/>
                </xsl:when>
                <xsl:when test="$type = 'difference'">
                    <xsl:value-of select="concat($T, $T, 'AND', $N, $T, $T, $T, 'sub.', $tieName, '_', $historizationSuffix, ' BETWEEN @intervalStart AND @intervalEnd', $N)"/>
                </xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="operator">
            <xsl:choose>
                <xsl:when test="$type = 'difference'">
                    <xsl:text>IN</xsl:text>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:text>=</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="selection">
            <xsl:choose>
                <xsl:when test="$type = 'difference'">
                    <xsl:value-of select="concat($T, $T, $T, 'sub.', $tieName, '_', $historizationSuffix, $N)"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="concat($T, $T, $T, 'max(sub.', $tieName, '_', $historizationSuffix, ')', $N)"/>
                </xsl:otherwise>
            </xsl:choose>            
        </xsl:variable>
        <xsl:value-of select="concat(
        $N, 'WHERE', $N,
        $T, 'tie.', $tieName, '_', $historizationSuffix, ' ', $operator, ' (', $N,
        $T, $T, 'SELECT', $N,
        $selection,
        $T, $T, 'FROM', $N,
        $T, $T, $T, '[', $tieCapsule, '].[', $tieName, '] sub', $N,
        $T, $T, 'WHERE', $N,
        $joinConditions,
        $restriction,
        $T, ')'
        )"/>        
    </xsl:template>
    <xsl:template name="joinCondition">
        <xsl:param name="attribute"/>
        <xsl:param name="timepoint"/>
        <xsl:variable name="anchor" select="$attribute/parent::anchor"/>
        <xsl:variable name="anchorMnemonic" select="$anchor/@mnemonic"/>
        <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', $attribute/@mnemonic)"/>
        <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', $anchor/@descriptor, '_', $attribute/@descriptor)"/>
        <xsl:variable name="attributeCapsule" select="$attribute/metadata/@capsule"/>
        <xsl:variable name="anchorIdentity" select="concat($anchorMnemonic, '_', $identitySuffix)"/>
        <xsl:value-of select="concat($N, 'LEFT JOIN', $N, $T, '[', $attributeCapsule, '].[', $attributeName, '] [',  $attributeMnemonic, ']')"/>
        <xsl:value-of select="concat($N, 'ON', $N, $T, '[',  $attributeMnemonic, '].', $anchorIdentity, ' = [', $anchorMnemonic, '].', $anchorIdentity)"/>
        <xsl:if test="$attribute/@timeRange">
            <xsl:value-of select="concat($N, 'AND', $N, $T, '[', $attributeMnemonic, '].', $attributeMnemonic, '_', $historizationSuffix, ' = (')"/>
            <xsl:value-of select="concat($N, $T, $T, 'SELECT', $N, $T, $T, $T, 'max(sub.', $attributeMnemonic, '_', $historizationSuffix, ')')"/>
            <xsl:value-of select="concat($N, $T, $T, 'FROM', $N, $T, $T, $T, '[', $attributeCapsule, '].[', $attributeName, '] sub')"/>
            <xsl:value-of select="concat($N, $T, $T, 'WHERE', $N, $T, $T, $T, 'sub.', $anchorIdentity, ' = [', $anchorMnemonic, '].', $anchorIdentity)"/>
            <xsl:if test="normalize-space($timepoint)">
                <xsl:value-of select="concat($N, $T, $T, 'AND', $N, $T, $T, $T, 'sub.', $attributeMnemonic, '_', $historizationSuffix, ' &lt;= ', $timepoint)"/>
            </xsl:if>
            <xsl:value-of select="concat($N, $T, ')')"/>
        </xsl:if>
        <xsl:if test="key('knotLookup', $attribute/@knotRange)">
            <xsl:variable name="knotMnemonic" select="$attribute/@knotRange"/>
            <xsl:variable name="knotName" select="concat($knotMnemonic, '_', key('knotLookup', $attribute/@knotRange)/@descriptor)"/>
            <xsl:variable name="knotCapsule" select="key('knotLookup', $attribute/@knotRange)/metadata/@capsule"/>
            <xsl:variable name="knotIdentity" select="concat($knotMnemonic, '_', $identitySuffix)"/>
            <xsl:value-of select="concat($N, 'LEFT JOIN', $N, $T, '[', $knotCapsule, '].[', $knotName, '] [',  $knotMnemonic, ']')"/>
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
            <xsl:value-of select="concat(',', $N, $T, '[', $attributeMnemonic, '].', $attributeMnemonic, '_', $historizationSuffix)"/>
        </xsl:if>
        <xsl:if test="$metadataUsage = 'true'">
            <xsl:value-of select="concat(',', $N, $T, '[', $attributeMnemonic, '].', $attributeMetadata)"/>
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
                <xsl:value-of select="concat(', ', $N, $T, $T, $attributeMnemonic, '_', $historizationSuffix)"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeHistorizationValue">
            <xsl:if test="$attribute/@timeRange">
                <xsl:value-of select="concat(', ', $N, $T, $T, 'COALESCE(i.', $attributeMnemonic, '_', $historizationSuffix, ', getdate())')"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeMetadataColumn">
            <xsl:if test="$metadataUsage = 'true'">
                <xsl:value-of select="concat(', ', $N, $T, $T, $attributeMetadata)"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeMetadataInsert">
            <xsl:if test="$metadataUsage = 'true'">
                <xsl:value-of select="concat(', ', $N, $T, $T, 'COALESCE(i.', $attributeMetadata, ', i.', $anchorMetadata, ')')"/>
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
                $attributeHistorizationColumn, $N,
                $T, ')', $N,
                $T, 'SELECT', $N,
                $T, $T, 'COALESCE(i.', $anchorIdentity, ', a.', $anchorIdentity, '),', $N,
                $T, $T, 'k.', $knotIdentity,
                $attributeMetadataInsert,
                $attributeHistorizationValue, $N,
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
                $attributeHistorizationColumn, $N,
                $T, ')', $N,
                $T, 'SELECT', $N,
                $T, $T, 'COALESCE(i.', $anchorIdentity, ', a.', $anchorIdentity, '),', $N,
                $T, $T, 'i.', $attributeName, 
                $attributeMetadataInsert,
                $attributeHistorizationValue, $N,
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
        <xsl:variable name="historizationColumn" select="concat($attributeMnemonic, '_', $historizationSuffix)"/>
        <xsl:variable name="attributeHistorization">
            <xsl:if test="$attribute/@timeRange">
                <xsl:value-of select="concat(', ', $N, $T, $T, $historizationColumn)"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeHistorizationAliased">
            <xsl:if test="$attribute/@timeRange">
                <xsl:value-of select="concat(', ', $N, $T, $T, 'CASE WHEN UPDATE(', $historizationColumn, ') THEN i.', $historizationColumn, ' ELSE getdate() END')"/>
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
        <xsl:choose>
            <xsl:when test="$attribute/@knotRange">
                <xsl:variable name="knot" select="key('knotLookup', $attribute/@knotRange)"/>
                <xsl:variable name="knotMnemonic" select="$knot/@mnemonic"/>
                <xsl:variable name="knotName" select="concat($knotMnemonic, '_', $knot/@descriptor)"/>
                <xsl:variable name="knotIdentity" select="concat($knotMnemonic, '_', $identitySuffix)"/>
                <xsl:variable name="knotCapsule" select="$knot/metadata/@capsule"/>
                <xsl:value-of select="concat(
                $T, 'IF(UPDATE(', $knotName, '))', $N,
                $T, 'INSERT INTO [', $attributeCapsule, '].[', $attributeName, '](', $N,
                $T, $T, $anchorIdentity, ', ', $N,
                $T, $T, $knotIdentity,
                $attributeMetadataColumn,
                $attributeHistorization, $N,
                $T, ')', $N,
                $T, 'SELECT', $N,
                $T, $T, 'i.', $anchorIdentity, ', ', $N,
                $T, $T, 'k.', $knotIdentity,
                $attributeMetadataValue,
                $attributeHistorizationAliased, $N,
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
                $T, 'IF(UPDATE(', $attributeName, '))', $N,
                $T, 'INSERT INTO [', $attributeCapsule, '].[', $attributeName, '](', $N,
                $T, $T, $anchorIdentity, ', ', $N,
                $T, $T, $attributeName,
                $attributeMetadataColumn,
                $attributeHistorization, $N,
                $T, ')', $N,
                $T, 'SELECT', $N,
                $T, $T, 'i.', $anchorIdentity, ', ', $N,
                $T, $T, 'i.', $attributeName,
                $attributeMetadataValue,
                $attributeHistorizationAliased, $N,
                $T, 'FROM', $N,
                $T, $T, 'inserted i;', $N
                )"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
