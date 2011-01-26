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
    <xsl:param name="historizationSuffix">
        <xsl:text>ValidFrom</xsl:text>
    </xsl:param>
    <xsl:param name="identitySuffix">
        <xsl:text>ID</xsl:text>
    </xsl:param>
    <xsl:param name="sequenceSuffix">
        <xsl:text>SEQ</xsl:text>
    </xsl:param>

    <!-- "global" variables -->
    <xsl:variable name="N"><xsl:text>&#10;</xsl:text></xsl:variable>
    <xsl:variable name="T"><xsl:text>&#32;&#32;&#32;</xsl:text></xsl:variable>
    <xsl:variable name="Q"><xsl:text>'</xsl:text></xsl:variable>
    <xsl:variable name="D"><xsl:text>"</xsl:text></xsl:variable>

    <!-- match the schema (root element) and process the different elements using for-each loops -->
	<xsl:template match="/schema">
        <xsl:value-of select="concat('BEGIN', $N)"/>

		<!-- process all knots -->
		<xsl:for-each select="knot">
            <xsl:variable name="knotName" select="concat(@mnemonic, '_', @descriptor)"/>
            <xsl:variable name="knotMetadata" select="concat($metadataPrefix, '_', @mnemonic)"/>
            <xsl:variable name="knotIdentity" select="concat(@mnemonic, '_', $identitySuffix)"/>
            <xsl:variable name="knotIdentityType" select="@identity"/>
            <xsl:variable name="knotDataType" select="@dataRange"/>
            <xsl:value-of select="concat(
            '----------------------------------- [Knot Table] -------------------------------------', $N,
            '-- ', $knotName, ' table', $N,
            '--------------------------------------------------------------------------------------', $N,
            'EXECUTE IMMEDIATE ', $Q, $N,
            'CREATE TABLE ', $D, $knotName, $D, ' (', $N,
            $T, $D, $knotIdentity, $D, ' ', $knotIdentityType, ' not null,', $N,
            $T, $D, $knotName, $D, ' ', $knotDataType, ' not null unique,', $N,
            $T, $D, $knotMetadata, $D, ' ', $metadataType, ' not null,', $N,
            $T, 'CONSTRAINT ', $D, 'pk_', $knotName, $D, ' PRIMARY KEY(', $N,
            $T, $T, $D, $knotIdentity, $D, $N,
            $T, ')', $N,
            ') ORGANIZATION INDEX', $N,
            $Q, ';', $N, $N
            )"/>
		</xsl:for-each>

        <!-- process all anchors -->
        <xsl:for-each select="anchor">
            <xsl:variable name="anchorMnemonic" select="@mnemonic"/>
            <xsl:variable name="anchorName" select="concat(@mnemonic, '_', @descriptor)"/>
            <xsl:variable name="anchorMetadata" select="concat($metadataPrefix, '_', @mnemonic)"/>
            <xsl:variable name="anchorIdentity" select="concat(@mnemonic, '_', $identitySuffix)"/>
            <xsl:variable name="anchorSequence" select="concat(@mnemonic, '_', $sequenceSuffix)"/>
            <xsl:if test="string(identity/@generator) = 'true'">
                <xsl:value-of select="concat(
                '-------------------------------- [Anchor Sequence] -----------------------------------', $N,
                '-- ', $anchorSequence, ' sequence for generating identities', $N,
                '--------------------------------------------------------------------------------------', $N,
                'EXECUTE IMMEDIATE ', $Q, $N,
                'CREATE SEQUENCE ', $D, $anchorSequence, $D, $N,
                $T, 'MINVALUE 1', $N,
                $T, 'START WITH 1', $N,
                $T, 'INCREMENT BY 1', $N,
                $T, 'NOCACHE', $N,
                $Q, ';', $N, $N
                )"/>
            </xsl:if>
            <xsl:value-of select="concat(
            '---------------------------------- [Anchor Table] ------------------------------------', $N,
            '-- ', $anchorName, ' table (with ', count(attribute), ' attributes)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'EXECUTE IMMEDIATE ', $Q, $N,
            'CREATE TABLE ', $D, $anchorName, $D, ' (', $N,
            $T, $D, $anchorIdentity, $D, ' ', @identity, ' not null,', $N,
            $T, $D, $anchorMetadata, $D, ' ', $metadataType, ' not null,', $N,
            $T, 'CONSTRAINT ', $D, 'pk_', $anchorName, $D, ' PRIMARY KEY(', $N,
            $T, $T, $D, $anchorIdentity, $D, $N,
            $T, ')', $N,
            ') ORGANIZATION INDEX', $N,
            $Q, ';', $N, $N
            )"/>
            <xsl:if test="string(identity/@generator) = 'true'">
                <xsl:variable name="anchorKeyGenerator" select="concat('k', $anchorName)"/>
                <xsl:value-of select="concat(
                '----------------------- [Key Generation Stored Procedure] ----------------------------', $N,
                '-- ', $anchorName, ' surrogate key generation stored procedure', $N,
                '--------------------------------------------------------------------------------------', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $anchorKeyGenerator, $Q, ' AND type in (', $Q, 'P', $Q, ',', $Q, 'PC', $Q, '))', $N,
                'DROP PROCEDURE ', $anchorKeyGenerator, $N,
                'GO', $N,
                'CREATE PROCEDURE ', $anchorKeyGenerator, ' (', $N,
	            $T, '@requestedNumberOfIdentities bigint,', $N,
	            $T, '@', $anchorMetadata, ' ', $metadataType, $N,
	            ') AS', $N,
                'BEGIN', $N,
	            $T, 'WITH rowGenerator (rowNumber) AS (', $N,
		        $T, $T, 'SELECT', $N,
			    $T, $T, $T, '1', $N,
		        $T, $T, 'UNION ALL', $N,
		        $T, $T, 'SELECT', $N,
			    $T, $T, $T, 'rowNumber + 1', $N,
		        $T, $T, 'FROM', $N,
			    $T, $T, $T, 'rowGenerator', $N,
		        $T, $T, 'WHERE', $N,
			    $T, $T, $T, 'rowNumber &lt; @requestedNumberOfIdentities', $N,
	            $T, ')', $N,
	            $T, 'INSERT INTO ', $anchorName, '(', $anchorMetadata, ')', $N,
	            $T, 'OUTPUT', $N,
		        $T, $T, 'inserted.', $anchorIdentity, $N,
	            $T, 'SELECT', $N,
	            $T, $T, '@', $anchorMetadata, $N,
	            $T, 'FROM', $N,
		        $T, $T, 'rowGenerator', $N,
	            $T, 'OPTION (maxrecursion 0);', $N,
                'END', $N,
                'GO', $N, $N
                )"/>
            </xsl:if>
            <!-- process all attributes in the current anchor -->
            <xsl:for-each select="attribute">
                <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', @mnemonic)"/>
                <xsl:variable name="attributeMetadata" select="concat($metadataPrefix, '_', $attributeMnemonic)"/>
                <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', parent::*/@descriptor, '_', @descriptor)"/>
                <xsl:variable name="knotOrDataDefinition">
                    <xsl:choose>
                        <xsl:when test="key('knotLookup', @knotRange)">
                            <xsl:value-of select="concat($T, @knotRange, '_', $identitySuffix,' ', key('knotLookup', @knotRange)/@identity, ' not null foreign key references ', @knotRange, '_', key('knotLookup', @knotRange)/@descriptor, '(', @knotRange, '_', $identitySuffix,'),', $N)"/>
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
                'CREATE TABLE [', $attributeName, '] (', $N,
                $T, $anchorIdentity, ' ', parent::*/@identity, ' not null foreign key references ', $anchorName, '(', $anchorIdentity, '),', $N,
                $knotOrDataDefinition,
                $historizationDefinition,
                $T, $attributeMetadata, ' ', $metadataType, ' not null,', $N,
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
            <xsl:value-of select="concat(
            '------------------------------- [Latest Perspective] ---------------------------------', $N,
            '-- ', $anchorName, ' viewed as is (given by the latest available information)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $latestViewName, $Q, ' AND type LIKE ', $Q, '%V%', $Q, ')', $N,
            'DROP VIEW [', $latestViewName, '];', $N,
            'GO', $N,
            'CREATE VIEW [', $latestViewName, '] AS', $N,
            'SELECT', $N,
            $T, '[', $anchorMnemonic, '].', $anchorIdentity, ',', $N,
            $T, '[', $anchorMnemonic, '].', $anchorMetadata,
            $columnReferences, $N,
            'FROM', $N,
            $T, $anchorName, ' [', $anchorMnemonic, ']',
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
            <xsl:variable name="insertTriggerName" select="concat('t', $anchorName)"/>
            <xsl:value-of select="concat(
            '--------------------------------- [Insert Trigger] -----------------------------------', $N,
            '-- ', $anchorName, ' insert trigger on the latest perspective', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF EXISTS (SELECT * FROM sys.triggers WHERE name = ', $Q, $insertTriggerName, $Q, ')', $N,
            'DROP TRIGGER ', $insertTriggerName, $N,
            'GO', $N,
            'CREATE TRIGGER ', $insertTriggerName, ' ON ', $latestViewName, $N,
            'INSTEAD OF INSERT', $N,
            'AS', $N,
            'BEGIN', $N,
            $T, 'DECLARE @', $anchorMetadata, ' ', $metadataType, ';', $N,
	        $T, 'SELECT', $N,
	        $T, $T, '@', $anchorMetadata, ' = ', $anchorMetadata, $N,
	        $T, 'FROM', $N,
	        $T, $T, 'inserted;', $N,
            $T, 'DECLARE @', $anchorIdentity, ' ', @identity, ';', $N,
	        $T, 'SELECT', $N,
	        $T, $T, '@', $anchorIdentity, ' = ', $anchorIdentity, $N,
	        $T, 'FROM', $N,
	        $T, $T, 'inserted;', $N,
	        $T, 'IF(@', $anchorIdentity, ' is null)', $N,
	        $T, 'BEGIN', $N,
	        $T, $T, 'INSERT INTO ', $anchorName, '(', $N,
	        $T, $T, $T, $anchorMetadata, $N,
	        $T, $T, ')', $N,
	        $T, $T, 'VALUES (@', $anchorMetadata, ');', $N,
		    $T, $T, 'SELECT @', $anchorIdentity, ' = SCOPE_IDENTITY();', $N,
	        $T, 'END', $N,
	        $insertStatements,
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
            'DROP FUNCTION [', $point-in-timeFunctionName, '];', $N,
            'GO', $N,
            'CREATE FUNCTION [', $point-in-timeFunctionName, '] (@timepoint datetime)', $N,
            'RETURNS TABLE RETURN', $N,
            'SELECT', $N,
            $T, '[', $anchorMnemonic, '].', $anchorIdentity, ',', $N,
            $T, '[', $anchorMnemonic, '].', $anchorMetadata,
            $columnReferences, $N,
            'FROM', $N,
            $T, $anchorName, ' [', $anchorMnemonic, ']',
            $point-in-timeJoinConditions, ';', $N,
            'GO', $N, $N
            )"/>
            <xsl:for-each select="attribute[@timeRange]">
                <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', @mnemonic)"/>
                <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', parent::*/@descriptor, '_', @descriptor)"/>
                <xsl:variable name="differenceFunctionName" select="concat('d', $attributeName)"/>
                <xsl:value-of select="concat(
                '------------------------------ [Difference Perspective] ------------------------------', $N,
                '-- ', $anchorName, ' viewed by differences in ', $attributeName, $N,
                '--------------------------------------------------------------------------------------', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $differenceFunctionName, $Q, ' AND type LIKE ', $Q, '%F%', $Q, ')', $N,
                'DROP FUNCTION [', $differenceFunctionName, '];', $N,
                'GO', $N,
                'CREATE FUNCTION [', $differenceFunctionName, '] (@intervalStart datetime, @intervalEnd datetime)', $N,
                'RETURNS TABLE RETURN', $N,
                'SELECT', $N,
                $T, 'timepoints.inspectedTimepoint,', $N,
                $T, '[', $anchorMnemonic, '].*', $N,
                'FROM (', $N,
                $T, 'SELECT DISTINCT', $N,
                $T, $T, $attributeMnemonic, '_', $historizationSuffix, ' AS inspectedTimepoint', $N,
                $T, 'FROM', $N,
                $T, $T, $attributeName, $N,
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
                        <xsl:value-of select="concat(
                        $T, 'SELECT DISTINCT', $N,
                        $T, $T, $attributeMnemonic, '_', $historizationSuffix, ' AS inspectedTimepoint', $N,
                        $T, 'FROM', $N,
                        $T, $T, $attributeName, $N,
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
                'DROP FUNCTION [', $differenceFunctionName, '];', $N,
                'GO', $N,
                'CREATE FUNCTION [', $differenceFunctionName, '] (@intervalStart datetime, @intervalEnd datetime)', $N,
                'RETURNS TABLE RETURN', $N,
                'SELECT', $N,
                $T, 'timepoints.inspectedTimepoint,', $N,
                $T, '[', $anchorMnemonic, '].*', $N,
                'FROM (', $N,
                $unionOfTimepoints,
                ') timepoints', $N,
                'CROSS APPLY', $N,
                $T, $point-in-timeFunctionName, '(timepoints.inspectedTimepoint) [', $anchorMnemonic, '];', $N,
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
                    <xsl:value-of select="concat($T, @type, '_', $identitySuffix, '_', @role, ' ', $identityType, ' not null foreign key references ', $referent, '(', @type, '_', $identitySuffix, '),', $N)"/>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="primaryKeyColumns">
                <xsl:for-each select="anchorRole[string(@identifier) = 'true']|knotRole[string(@identifier) = 'true']">
                    <xsl:value-of select="concat($T, $T, @type, '_', $identitySuffix, '_', @role, ' asc')"/>
                    <xsl:if test="not(position() = last())">
                        <xsl:value-of select="concat(',', $N)"/>
                    </xsl:if>
                </xsl:for-each>
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
            <xsl:value-of select="concat(
            '------------------------------------- [Tie Table] ------------------------------------', $N,
            '-- ', $tieName, ' table (', count(anchorRole|knotRole), '-ary)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $tieName, $Q, ' and type LIKE ', $Q, '%U%', $Q, ')', $N,
            'CREATE TABLE [', $tieName, '] (', $N,
            $columnDefinitions,
            $historizationDefinition,
            $T, $tieMetadata, ' ', $metadataType, ' not null,', $N,
            $T, 'primary key (', $N,
            $primaryKeyColumns,
            $historizationKey,
            $T, ')', $N,
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
                    <xsl:value-of select="concat(
                    $N, 'LEFT JOIN', $N,
                    $T, @type, '_', key('knotLookup', @type)/@descriptor, ' [', @type, ']', $N,
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
            <xsl:variable name="latestViewName" select="concat('l', $tieName)"/>
            <xsl:value-of select="concat(
            '--------------------------------- [Latest Perspective] -------------------------------', $N,
            '-- ', $tieName, ' viewed as is (given by the latest available information)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $latestViewName, $Q, ' and type LIKE ', $Q, '%V%', $Q, ')', $N,
            'DROP VIEW [', $latestViewName, '];', $N,
            'GO', $N,
            'CREATE VIEW [', $latestViewName, '] AS', $N,
            'SELECT', $N,
            $T, $tieMetadata, ',', $N,
            $columnReferences,
            'FROM', $N,
            $T, $tieName, ' tie',
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
            'DROP FUNCTION [', $point-in-timeFunctionName, '];', $N,
            'GO', $N,
            'CREATE FUNCTION [', $point-in-timeFunctionName, '] (@timepoint datetime)', $N,
            'RETURNS TABLE RETURN', $N,
            'SELECT', $N,
            $T, $tieMetadata, ',', $N,
            $columnReferences,
            'FROM', $N,
            $T, $tieName, ' tie',
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
            'DROP FUNCTION [', $differenceFunctionName, '];', $N,
            'GO', $N,
            'CREATE FUNCTION [', $differenceFunctionName, '] (@intervalStart datetime, @intervalEnd datetime)', $N,
            'RETURNS TABLE RETURN', $N,
            'SELECT', $N,
            $T, $tieMetadata, ',', $N,
            $columnReferences,
            'FROM', $N,
            $T, $tieName, ' tie',
            $joinConditions,
            $differenceWhereCondition, ';', $N,
            'GO', $N, $N
            )"/>
        </xsl:for-each>
        <xsl:value-of select="concat(
        'EXCEPTION WHEN OTHERS THEN NULL;', $N,
        'END;', $N, $N
        )"/>
    </xsl:template>
    <xsl:template name="whereCondition">
        <xsl:param name="tie"/>
        <xsl:param name="tieName"/>
        <xsl:param name="type"/>
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
        $T, $T, $T, $tieName, ' sub', $N,
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
        <xsl:variable name="anchorIdentity" select="concat($anchorMnemonic, '_', $identitySuffix)"/>
        <xsl:value-of select="concat($N, 'LEFT JOIN', $N, $T, $attributeName, ' [',  $attributeMnemonic, ']')"/>
        <xsl:value-of select="concat($N, 'ON', $N, $T, '[',  $attributeMnemonic, '].', $anchorIdentity, ' = [', $anchorMnemonic, '].', $anchorIdentity)"/>
        <xsl:if test="$attribute/@timeRange">
            <xsl:value-of select="concat($N, 'AND', $N, $T, '[', $attributeMnemonic, '].', $attributeMnemonic, '_', $historizationSuffix, ' = (')"/>
            <xsl:value-of select="concat($N, $T, $T, 'SELECT', $N, $T, $T, $T, 'max(sub.', $attributeMnemonic, '_', $historizationSuffix, ')')"/>
            <xsl:value-of select="concat($N, $T, $T, 'FROM', $N, $T, $T, $T, $attributeName, ' sub')"/>
            <xsl:value-of select="concat($N, $T, $T, 'WHERE', $N, $T, $T, $T, 'sub.', $anchorIdentity, ' = [', $anchorMnemonic, '].', $anchorIdentity)"/>
            <xsl:if test="normalize-space($timepoint)">
                <xsl:value-of select="concat($N, $T, $T, 'AND', $N, $T, $T, $T, 'sub.', $attributeMnemonic, '_', $historizationSuffix, ' &lt;= ', $timepoint)"/>
            </xsl:if>
            <xsl:value-of select="concat($N, $T, ')')"/>
        </xsl:if>
        <xsl:if test="key('knotLookup', $attribute/@knotRange)">
            <xsl:variable name="knotMnemonic" select="$attribute/@knotRange"/>
            <xsl:variable name="knotName" select="concat($knotMnemonic, '_', key('knotLookup', $attribute/@knotRange)/@descriptor)"/>
            <xsl:variable name="knotIdentity" select="concat($knotMnemonic, '_', $identitySuffix)"/>
            <xsl:value-of select="concat($N, 'LEFT JOIN', $N, $T, $knotName, ' [',  $knotMnemonic, ']')"/>
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
                <xsl:value-of select="concat(',', $N, $T, '[', $knotMnemonic, '].', $knotIdentity, ',', $N)"/>
                <xsl:value-of select="concat($T, '[', $knotMnemonic, '].', $knotName, ',', $N)"/>
                <xsl:value-of select="concat($T, '[', $knotMnemonic, '].', $knotMetadata)"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="concat(',', $N, $T, '[', $attributeMnemonic, '].', $attributeName)"/>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="@timeRange">
            <xsl:value-of select="concat(',', $N, $T, '[', $attributeMnemonic, '].', $attributeMnemonic, '_', $historizationSuffix)"/>
        </xsl:if>
        <xsl:value-of select="concat(',', $N, $T, '[', $attributeMnemonic, '].', $attributeMetadata)"/>
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
        <xsl:variable name="attributeHistorization">
            <xsl:if test="$attribute/@timeRange">
                <xsl:value-of select="concat(', ', $N, $T, $T, $attributeMnemonic, '_', $historizationSuffix, $N)"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="attributeHistorizationCondition">
            <xsl:if test="$attribute/@timeRange">
                <xsl:value-of select="concat($N, 'AND', $T, $T, $attributeMnemonic, '_', $historizationSuffix, ' is not null')"/>
            </xsl:if>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$attribute/@knotRange">
                <xsl:variable name="knot" select="key('knotLookup', $attribute/@knotRange)"/>
                <xsl:variable name="knotMnemonic" select="$knot/@mnemonic"/>
                <xsl:variable name="knotName" select="concat($knotMnemonic, '_', $knot/@descriptor)"/>
                <xsl:variable name="knotIdentity" select="concat($knotMnemonic, '_', $identitySuffix)"/>
                <xsl:value-of select="concat(
                $T, 'INSERT INTO ', $attributeName, '(', $N,
                $T, $T, $anchorIdentity, ', ', $N,
                $T, $T, $knotIdentity, ', ', $N,
                $T, $T, $attributeMetadata,
                $attributeHistorization, $N,
                $T, ')', $N,
                $T, 'SELECT', $N,
                $T, $T, '@', $anchorIdentity, ',', $N,
                $T, $T, 'k.', $knotIdentity, ',', $N,
                $T, $T, 'COALESCE(', $attributeMetadata, ', @', $anchorMetadata, ')',
                $attributeHistorization, $N,
                $T, 'FROM', $N,
                $T, $T, 'inserted i', $N,
                $T, 'JOIN', $N,
                $T, $T, $knotName, ' k', $N,
                $T, 'ON', $N,
                $T, $T, 'k.', $knotName, ' = i.', $knotName, $N,
                $T, 'WHERE', $N,
                $T, $T, 'i.', $knotName, ' is not null', $N,
                $T, 'AND', $N,
                $T, $T, 'COALESCE(', $attributeMetadata, ', @', $anchorMetadata, ') is not null',
                $attributeHistorizationCondition, ';', $N
                )"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="concat(
                $T, 'INSERT INTO ', $attributeName, '(', $N,
                $T, $T, $anchorIdentity, ', ', $N,
                $T, $T, $attributeName, ', ', $N,
                $T, $T, $attributeMetadata,
                $attributeHistorization, $N,
                $T, ')', $N,
                $T, 'SELECT', $N,
                $T, $T, '@', $anchorIdentity, ', ', $N,
                $T, $T, $attributeName, ',', $N,
                $T, $T, 'COALESCE(', $attributeMetadata, ', @', $anchorMetadata, ')',
                $attributeHistorization, $N,
                $T, 'FROM', $N,
                $T, $T, 'inserted', $N,
                $T, 'WHERE', $N,
                $T, $T, $attributeName, ' is not null', $N,
                $T, 'AND', $N,
                $T, $T, 'COALESCE(', $attributeMetadata, ', @', $anchorMetadata, ') is not null',
                $attributeHistorizationCondition, ';', $N
                )"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
