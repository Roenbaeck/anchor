<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text" indent="no"/>

    <!-- lookup hash tables -->
	<xsl:key name="mnemonicToEntity" match="//*[@mnemonic]" use="@mnemonic"/>
    <xsl:key name="knotLookup" match="//knot[@mnemonic]" use="@mnemonic"/>
    <xsl:key name="anchorLookup" match="//anchor[@mnemonic]" use="@mnemonic"/>

    <!-- parameters controlling the output -->
    <xsl:param name="metadata">
        <xsl:text>_metadata int not null</xsl:text>
    </xsl:param>
    <xsl:param name="historizationSuffix">
        <xsl:text>ValidFrom</xsl:text>
    </xsl:param>
    <xsl:param name="identitySuffix">
        <xsl:text>ID</xsl:text>
    </xsl:param>

    <!-- "global" variables -->
    <xsl:variable name="N"><xsl:text>&#10;</xsl:text></xsl:variable>
    <xsl:variable name="T"><xsl:text>&#32;&#32;&#32;</xsl:text></xsl:variable>
    <xsl:variable name="Q"><xsl:text>'</xsl:text></xsl:variable>
    <xsl:variable name="metadataDefinition">
        <xsl:if test="normalize-space($metadata)">
            <xsl:value-of select="concat($T, $metadata, ',', $N)"/>
        </xsl:if>
    </xsl:variable>

    <!-- match the schema (root element) and process the different elements using for-each loops -->
	<xsl:template match="/schema">

		<!-- process all knots -->
		<xsl:for-each select="knot">
            <xsl:variable name="knotName" select="concat(@mnemonic, '_', @descriptor)"/>
            <xsl:variable name="knotIdentity" select="concat(@mnemonic, '_', $identitySuffix)"/>
            <xsl:variable name="knotIdentityType" select="@identity"/>
            <xsl:variable name="knotDataType" select="@dataRange"/>
            <xsl:value-of select="concat(
            '----------------------------------- [Knot Table] -------------------------------------', $N,
            '-- ', $knotName, ' table', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $knotName, $Q, ' and type LIKE ', $Q, '%U%', $Q, ')', $N,
            'CREATE TABLE [', $knotName, '] (', $N,
            $T, $knotIdentity, ' ', $knotIdentityType, ' not null,', $N,
            $T, $knotName, ' ', $knotDataType, ' not null unique,', $N,
            $metadataDefinition,
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
            <xsl:variable name="anchorIdentity" select="concat(@mnemonic, '_', $identitySuffix)"/>
            <xsl:value-of select="concat(
            '---------------------------------- [Anchor Table] ------------------------------------', $N,
            '-- ', $anchorName, ' table (with ', count(attribute), ' attributes)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $anchorName, $Q, ' and type LIKE ', $Q, '%U%', $Q, ')', $N,
            'CREATE TABLE [', $anchorName, '] (', $N,
            $T, $anchorIdentity, ' ', @identity, ' not null,', $N,
            $metadataDefinition,
            $T, 'primary key (', $N,
            $T, $T, $anchorIdentity, ' asc', $N,
            $T, ')', $N,
            ');', $N,
            'GO', $N, $N
            )"/>
            <!-- process all attributes in the current anchor -->
            <xsl:for-each select="attribute">
                <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', @mnemonic)"/>
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
                'IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $attributeName, $Q, ' and type LIKE ', $Q, '%U%', $Q, ')', $N,
                'CREATE TABLE [', $attributeName, '] (', $N,
                $T, $anchorIdentity, ' ', parent::*/@identity, ' not null foreign key references ', $anchorName, '(', $anchorIdentity, '),', $N,
                $knotOrDataDefinition,
                $historizationDefinition,
                $metadataDefinition,
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
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $latestViewName, $Q, ' and type LIKE ', $Q, '%V%', $Q, ')', $N,
            'DROP VIEW [', $latestViewName, '];', $N,
            'GO', $N,
            'CREATE VIEW [', $latestViewName, '] AS', $N,
            'SELECT', $N,
            $T, '[', $anchorMnemonic, '].', $anchorIdentity,
            $columnReferences, $N,
            'FROM', $N,
            $T, $anchorName, ' [', $anchorMnemonic, ']',
            $latestJoinConditions, ';', $N,
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
            'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $point-in-timeFunctionName, $Q, ' and type LIKE ', $Q, '%F%', $Q, ')', $N,
            'DROP FUNCTION [', $point-in-timeFunctionName, '];', $N,
            'GO', $N,
            'CREATE FUNCTION [', $point-in-timeFunctionName, '] (@timepoint datetime)', $N,
            'RETURNS TABLE RETURN', $N,
            'SELECT', $N,
            $T, '[', $anchorMnemonic, '].', $anchorIdentity,
            $columnReferences, $N,
            'FROM', $N,
            $T, $anchorName, ' [', $anchorMnemonic, ']',
            $point-in-timeJoinConditions, ';', $N,
            'GO', $N, $N
            )"/>
            <xsl:for-each select="attribute[@timeRange]">
                <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', @mnemonic)"/>
                <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', parent::*/@descriptor, '_', @descriptor)"/>
                <xsl:variable name="differenceFunction" select="concat('d', $attributeName)"/>
                <xsl:value-of select="concat(
                '------------------------------ [Difference Perspective] ------------------------------', $N,
                '-- ', $anchorName, ' viewed by differences in ', $attributeName, $N,
                '--------------------------------------------------------------------------------------', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $differenceFunction, $Q, ' and type LIKE ', $Q, '%F%', $Q, ')', $N,
                'DROP FUNCTION [', $differenceFunction, '];', $N,
                'GO', $N,
                'CREATE FUNCTION [', $differenceFunction, '] (@intervalStart datetime, @intervalEnd datetime)', $N,
                'RETURNS TABLE RETURN', $N,
                'SELECT', $N,
                $T, 'timepoints.inspectedTimepoint,', $N,
                $T, '[', $anchorMnemonic, '].*', $N,
                'FROM (', $N,
                $T, 'SELECT DISTINCT', $N,
                $T, $T, $attributeMnemonic, '_', $historizationSuffix, ' as inspectedTimepoint', $N,
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
                        $T, $T, $attributeMnemonic, '_', $historizationSuffix, ' as inspectedTimepoint', $N,
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
                <xsl:variable name="differenceFunction" select="concat('d', $anchorName)"/>
                <xsl:value-of select="concat(
                '------------------------------ [Difference Perspective] ------------------------------', $N,
                '-- ', $anchorName, ' viewed by differences in every historized attribute', $N,
                '--------------------------------------------------------------------------------------', $N,
                'IF EXISTS (SELECT * FROM sys.objects WHERE name = ', $Q, $differenceFunction, $Q, ' and type LIKE ', $Q, '%F%', $Q, ')', $N,
                'DROP FUNCTION [', $differenceFunction, '];', $N,
                'GO', $N,
                'CREATE FUNCTION [', $differenceFunction, '] (@intervalStart datetime, @intervalEnd datetime)', $N,
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
            <xsl:variable name="columnDefinitions">
                <xsl:for-each select="anchorRole|knotRole">
                    <xsl:variable name="identityType" select="concat(key('anchorLookup', @type)/@identity, key('knotLookup', @type)/@identity)"/>
                    <xsl:value-of select="concat($T, @type, '_', $identitySuffix, ' ', $identityType, ' not null,', $N)"/>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="primaryKeyColumns">
                <xsl:for-each select="anchorRole[string(@identifier) = 'true']|knotRole[string(@identifier) = 'true']">
                    <xsl:value-of select="concat($T, $T, @type, '_', $identitySuffix, ' asc')"/>
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
            $T, 'primary key (', $N,
            $primaryKeyColumns,
            $historizationKey,
            $T, ')', $N,
            ')', $N,
            'GO', $N, $N
            )"/>
        </xsl:for-each>
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
        <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', $anchor/@descriptor, '_', $attribute/@descriptor)"/>
        <xsl:choose>
            <xsl:when test="key('knotLookup', @knotRange)">
                <xsl:variable name="knotMnemonic" select="$attribute/@knotRange"/>
                <xsl:variable name="knotName" select="concat($knotMnemonic, '_', key('knotLookup', $attribute/@knotRange)/@descriptor)"/>
                <xsl:variable name="knotIdentity" select="concat($knotMnemonic, '_', $identitySuffix)"/>
                <xsl:value-of select="concat(',', $N, $T, '[', $knotMnemonic, '].', $knotIdentity, ',', $N)"/>
                <xsl:value-of select="concat($T, '[', $knotMnemonic, '].', $knotName)"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="concat(',', $N, $T, '[', $attributeMnemonic, '].', $attributeName)"/>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="@timeRange">
            <xsl:value-of select="concat(',', $N, $T, '[', $attributeMnemonic, '].', $attributeMnemonic, '_', $historizationSuffix)"/>
        </xsl:if>
    </xsl:template>
    
    <xsl:template name="theOldStuff">

		<!-- process all ties -->

		<xsl:for-each select="tie">
			<xsl:text>IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = '</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>_</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>' and type LIKE '%U%')&#10;</xsl:text>
			<xsl:text>CREATE TABLE [</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>_</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>] ( &#10;&#9;</xsl:text>
			<xsl:for-each select="relation">
				<xsl:value-of select="key('mnemonicToEntity', @reference)/@mnemonic"/>
				<xsl:text>_ID</xsl:text>
				<xsl:variable name="currentReference" select="@reference"/>
				<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
					<xsl:text>_</xsl:text>
					<xsl:value-of select="@ordinal"/>
				</xsl:if>
				<xsl:text>&#32;</xsl:text>
				<xsl:value-of select="key('mnemonicToEntity', @reference)/@idType"/>
				<xsl:text> not null, &#10;&#9;</xsl:text>
			</xsl:for-each>
			<xsl:if test="@historized = 'true'">
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>_FromDate </xsl:text>
				<xsl:value-of select="'datetime'"/>
				<xsl:text> not null, &#10;&#9;</xsl:text>
			</xsl:if>
			<xsl:value-of select="$metadata"/>
			<xsl:text>, &#10;&#9;PRIMARY KEY (</xsl:text>
			<xsl:for-each select="relation[@primary = 'true']">
				<xsl:value-of select="key('mnemonicToEntity', @reference)/@mnemonic"/>
				<xsl:text>_ID</xsl:text>
				<xsl:variable name="currentReference" select="@reference"/>
				<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
					<xsl:text>_</xsl:text>
					<xsl:value-of select="@ordinal"/>
				</xsl:if>
				<xsl:text> asc</xsl:text>
				<xsl:if test="not(position() = last())">
					<xsl:text>, </xsl:text>
				</xsl:if>
			</xsl:for-each>
			<xsl:if test="@historized = 'true'">
				<xsl:text>, </xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>_FromDate desc</xsl:text>
			</xsl:if>
			<xsl:text>) &#10;);&#10;GO&#10;</xsl:text>

			<!-- create the latest view -->

			<xsl:text>IF EXISTS (SELECT * FROM sys.objects WHERE name = 'l</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>_</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>' and type LIKE '%V%')&#10;</xsl:text>
			<xsl:text>DROP VIEW [l</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>_</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>]; &#10;GO&#10;</xsl:text>
			<xsl:text>CREATE VIEW [l</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>_</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>] AS &#10;SELECT &#10;&#9;</xsl:text>
			<xsl:for-each select="relation">
				<xsl:choose>
					<xsl:when test="key('mnemonicToEntity', @reference)[local-name() = 'knot']">
						<xsl:text>[</xsl:text>
						<xsl:value-of select="key('mnemonicToEntity', @reference)/@mnemonic"/>
						<xsl:variable name="currentReference" select="@reference"/>
						<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
							<xsl:value-of select="@ordinal"/>
						</xsl:if>
						<xsl:text>].</xsl:text>
						<xsl:value-of select="key('mnemonicToEntity', @reference)/@mnemonic"/>
						<xsl:text>_</xsl:text>
						<xsl:value-of select="key('mnemonicToEntity', @reference)/@name"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text>[</xsl:text>
						<xsl:value-of select="parent::tie/@mnemonic"/>
						<xsl:text>].</xsl:text>
						<xsl:value-of select="key('mnemonicToEntity', @reference)/@mnemonic"/>
						<xsl:text>_ID</xsl:text>
					</xsl:otherwise>
				</xsl:choose>
				<xsl:variable name="currentReference" select="@reference"/>
				<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
					<xsl:text>_</xsl:text>
					<xsl:value-of select="@ordinal"/>
				</xsl:if>
				<xsl:if test="not(position() = last())">
					<xsl:text>, &#10;&#9;</xsl:text>
				</xsl:if>
			</xsl:for-each>
			<xsl:if test="@historized = 'true'">
				<xsl:text>, &#10;&#9;[</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>].</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>_FromDate</xsl:text>
			</xsl:if>
			<xsl:text>&#10;FROM &#10;&#9;</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>_</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>&#32;[</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>]</xsl:text>
			<xsl:variable name="tieMnemonic" select="@mnemonic"/>
			<xsl:for-each select="relation">
				<xsl:variable name="knot" select="key('mnemonicToEntity', @reference)[local-name() = 'knot']"/>
				<xsl:if test="$knot">					
					<xsl:text>&#10;LEFT JOIN &#10;&#9;</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:text>_</xsl:text>
					<xsl:value-of select="$knot/@name"/>
					<xsl:text>&#32;[</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:variable name="currentReference" select="@reference"/>
					<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
						<xsl:value-of select="@ordinal"/>
					</xsl:if>
					<xsl:text>]&#10;ON &#10;&#9;[</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
						<xsl:value-of select="@ordinal"/>
					</xsl:if>
					<xsl:text>].</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:text>_ID = [</xsl:text>
					<xsl:value-of select="$tieMnemonic"/>
					<xsl:text>].</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:text>_ID</xsl:text>
					<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
						<xsl:text>_</xsl:text>
						<xsl:value-of select="@ordinal"/>
					</xsl:if>
				</xsl:if>
			</xsl:for-each>
			<xsl:if test="@historized = 'true'">
				<xsl:text>&#10;WHERE &#10;&#9;[</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>].</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>_FromDate = (&#10;&#9;&#9;SELECT &#10;&#9;&#9;&#9;max(</xsl:text>
				<xsl:text>sub.</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>_FromDate) &#10;&#9;&#9;FROM &#10;&#9;&#9;&#9;</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>_</xsl:text>
				<xsl:value-of select="@name"/>
				<xsl:text> sub &#10;&#9;&#9;WHERE </xsl:text>
				<xsl:for-each select="relation[@primary = 'true']">
					<xsl:text>&#10;&#9;&#9;&#9;sub.</xsl:text>
					<xsl:value-of select="@reference"/>
					<xsl:text>_ID</xsl:text>
					<xsl:variable name="currentReference" select="@reference"/>
					<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
						<xsl:text>_</xsl:text>
						<xsl:value-of select="@ordinal"/>
					</xsl:if>
					<xsl:text> = [</xsl:text>
					<xsl:value-of select="parent::tie/@mnemonic"/>
					<xsl:text>].</xsl:text>
					<xsl:value-of select="@reference"/>
					<xsl:text>_ID</xsl:text>
					<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
						<xsl:text>_</xsl:text>
						<xsl:value-of select="@ordinal"/>
					</xsl:if>
					<xsl:if test="not(position() = last())">
						<xsl:text>&#10;&#9;&#9;AND </xsl:text>
					</xsl:if>
				</xsl:for-each>
				<xsl:text>&#10;&#9;)</xsl:text>
			</xsl:if>
			<xsl:text>;&#10;GO&#10;</xsl:text>

			<!-- create the point-in-time function -->

			<xsl:text>IF EXISTS (SELECT * FROM sys.objects WHERE name = 'p</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>_</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>' and type LIKE '%F%')&#10;</xsl:text>
			<xsl:text>DROP FUNCTION [p</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>_</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>]; &#10;GO&#10;</xsl:text>
			<xsl:text>CREATE FUNCTION [p</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>_</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>] (@timepoint </xsl:text>
			<xsl:value-of select="'datetime'"/>
			<xsl:text>) &#10;RETURNS TABLE RETURN &#10;SELECT &#10;&#9;</xsl:text>
			<xsl:for-each select="relation">
				<xsl:choose>
					<xsl:when test="key('mnemonicToEntity', @reference)[local-name() = 'knot']">
						<xsl:text>[</xsl:text>
						<xsl:value-of select="key('mnemonicToEntity', @reference)/@mnemonic"/>
						<xsl:variable name="currentReference" select="@reference"/>
						<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
							<xsl:value-of select="@ordinal"/>
						</xsl:if>
						<xsl:text>].</xsl:text>
						<xsl:value-of select="key('mnemonicToEntity', @reference)/@mnemonic"/>
						<xsl:text>_</xsl:text>
						<xsl:value-of select="key('mnemonicToEntity', @reference)/@name"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text>[</xsl:text>
						<xsl:value-of select="parent::tie/@mnemonic"/>
						<xsl:text>].</xsl:text>
						<xsl:value-of select="key('mnemonicToEntity', @reference)/@mnemonic"/>
						<xsl:text>_ID</xsl:text>
					</xsl:otherwise>
				</xsl:choose>
				<xsl:variable name="currentReference" select="@reference"/>
				<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
					<xsl:text>_</xsl:text>
					<xsl:value-of select="@ordinal"/>
				</xsl:if>
				<xsl:if test="not(position() = last())">
					<xsl:text>, &#10;&#9;</xsl:text>
				</xsl:if>
			</xsl:for-each>
			<xsl:if test="@historized = 'true'">
				<xsl:text>, &#10;&#9;[</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>].</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>_FromDate</xsl:text>
			</xsl:if>
			<xsl:text>&#10;FROM &#10;&#9;</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>_</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>&#32;[</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>]</xsl:text>
			<xsl:for-each select="relation">
				<xsl:variable name="knot" select="key('mnemonicToEntity', @reference)[local-name() = 'knot']"/>
				<xsl:if test="$knot">
					<xsl:text>&#10;LEFT JOIN &#10;&#9;</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:text>_</xsl:text>
					<xsl:value-of select="$knot/@name"/>
					<xsl:text>&#32;[</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:variable name="currentReference" select="@reference"/>
					<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
						<xsl:value-of select="@ordinal"/>
					</xsl:if>
					<xsl:text>]&#10;ON &#10;&#9;[</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
						<xsl:value-of select="@ordinal"/>
					</xsl:if>
					<xsl:text>].</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:text>_ID = [</xsl:text>
					<xsl:value-of select="$tieMnemonic"/>
					<xsl:text>].</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:text>_ID</xsl:text>
					<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
						<xsl:text>_</xsl:text>
						<xsl:value-of select="@ordinal"/>
					</xsl:if>
				</xsl:if>
			</xsl:for-each>
			<xsl:if test="@historized = 'true'">
				<xsl:text>&#10;WHERE &#10;&#9;[</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>].</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>_FromDate = (&#10;&#9;&#9;SELECT &#10;&#9;&#9;&#9;max(</xsl:text>
				<xsl:text>sub.</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>_FromDate) &#10;&#9;&#9;FROM &#10;&#9;&#9;&#9;</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>_</xsl:text>
				<xsl:value-of select="@name"/>
				<xsl:text> sub &#10;&#9;&#9;WHERE </xsl:text>
				<xsl:for-each select="relation[@primary = 'true']">
					<xsl:text>&#10;&#9;&#9;&#9;sub.</xsl:text>
					<xsl:value-of select="@reference"/>
					<xsl:text>_ID</xsl:text>
					<xsl:variable name="currentReference" select="@reference"/>
					<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
						<xsl:text>_</xsl:text>
						<xsl:value-of select="@ordinal"/>
					</xsl:if>
					<xsl:text> = [</xsl:text>
					<xsl:value-of select="parent::tie/@mnemonic"/>
					<xsl:text>].</xsl:text>
					<xsl:value-of select="@reference"/>
					<xsl:text>_ID</xsl:text>
					<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
						<xsl:text>_</xsl:text>
						<xsl:value-of select="@ordinal"/>
					</xsl:if>
					<xsl:if test="not(position() = last())">
						<xsl:text>&#10;&#9;&#9;AND </xsl:text>
					</xsl:if>
				</xsl:for-each>
				<xsl:text>&#10;&#9;&#9;AND &#10;&#9;&#9;&#9;sub.</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>_FromDate &lt;= @timepoint</xsl:text>
				<xsl:text>&#10;&#9;)</xsl:text>
			</xsl:if>
			<xsl:choose>
				<xsl:when test="relation[not(@primary = 'true')] and @historized = 'true'">
					<xsl:text>&#10;AND &#10;&#9;</xsl:text>
				</xsl:when>
				<xsl:when test="relation[not(@primary = 'true')] and not(@historized = 'true')">
					<xsl:text>&#10;WHERE &#10;&#9;</xsl:text>
				</xsl:when>
			</xsl:choose>
			<xsl:for-each select="relation[not(@primary = 'true')]">
				<xsl:choose>
					<xsl:when test="key('mnemonicToEntity', @reference)[local-name() = 'knot']">
						<xsl:text>[</xsl:text>
						<xsl:value-of select="@reference"/>
						<xsl:variable name="currentReference" select="@reference"/>
						<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
							<xsl:value-of select="@ordinal"/>
						</xsl:if>
						<xsl:text>].</xsl:text>
						<xsl:value-of select="@reference"/>
						<xsl:text>_</xsl:text>
						<xsl:value-of select="key('mnemonicToEntity', @reference)/@name"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text>[</xsl:text>
						<xsl:value-of select="$tieMnemonic"/>
						<xsl:text>].</xsl:text>
						<xsl:value-of select="@reference"/>
						<xsl:text>_ID</xsl:text>
						<xsl:variable name="currentReference" select="@reference"/>
						<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
							<xsl:text>_</xsl:text>
							<xsl:value-of select="@ordinal"/>
						</xsl:if>
					</xsl:otherwise>
				</xsl:choose>
				<xsl:text> is not null</xsl:text>
				<xsl:if test="not(position() = last())">
					<xsl:text>&#10;OR &#10;&#9;</xsl:text>
				</xsl:if>
			</xsl:for-each>
			<xsl:text>;&#10;GO&#10;</xsl:text>

			<!-- create the difference function -->

			<xsl:text>IF EXISTS (SELECT * FROM sys.objects WHERE name = 'd</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>_</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>' and type LIKE '%F%')&#10;</xsl:text>
			<xsl:text>DROP FUNCTION [d</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>_</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>]; &#10;GO&#10;</xsl:text>
			<xsl:text>CREATE FUNCTION [d</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>_</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>] (@intervalStart </xsl:text>
			<xsl:value-of select="'datetime'"/>
			<xsl:text>, @intervalEnd </xsl:text>
			<xsl:value-of select="'datetime'"/>
			<xsl:text>) &#10;RETURNS TABLE RETURN &#10;SELECT &#10;&#9;</xsl:text>
			<xsl:choose>
				<xsl:when test="@historized = 'true'">
					<xsl:text>[</xsl:text>
					<xsl:value-of select="@mnemonic"/>
					<xsl:text>].</xsl:text>
					<xsl:value-of select="@mnemonic"/>
					<xsl:text>_FromDate as _inspectedDate, &#10;&#9;</xsl:text>
				</xsl:when>
				<xsl:otherwise>
					<xsl:text>NULL as _inspectedDate, &#10;&#9;</xsl:text>
				</xsl:otherwise>
			</xsl:choose>
			<xsl:for-each select="relation">
				<xsl:choose>
					<xsl:when test="key('mnemonicToEntity', @reference)[local-name() = 'knot']">
						<xsl:text>[</xsl:text>
						<xsl:value-of select="key('mnemonicToEntity', @reference)/@mnemonic"/>
						<xsl:variable name="currentReference" select="@reference"/>
						<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
							<xsl:value-of select="@ordinal"/>
						</xsl:if>
						<xsl:text>].</xsl:text>
						<xsl:value-of select="key('mnemonicToEntity', @reference)/@mnemonic"/>
						<xsl:text>_</xsl:text>
						<xsl:value-of select="key('mnemonicToEntity', @reference)/@name"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text>[</xsl:text>
						<xsl:value-of select="parent::tie/@mnemonic"/>
						<xsl:text>].</xsl:text>
						<xsl:value-of select="key('mnemonicToEntity', @reference)/@mnemonic"/>
						<xsl:text>_ID</xsl:text>
					</xsl:otherwise>
				</xsl:choose>
				<xsl:variable name="currentReference" select="@reference"/>
				<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
					<xsl:text>_</xsl:text>
					<xsl:value-of select="@ordinal"/>
				</xsl:if>
				<xsl:if test="not(position() = last())">
					<xsl:text>, &#10;&#9;</xsl:text>
				</xsl:if>
			</xsl:for-each>
			<xsl:if test="@historized = 'true'">
				<xsl:text>, &#10;&#9;[</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>].</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>_FromDate</xsl:text>
			</xsl:if>
			<xsl:text>&#10;FROM &#10;&#9;</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>_</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>&#32;[</xsl:text>
			<xsl:value-of select="@mnemonic"/>
			<xsl:text>]</xsl:text>
			<xsl:for-each select="relation">
				<xsl:variable name="knot" select="key('mnemonicToEntity', @reference)[local-name() = 'knot']"/>
				<xsl:if test="$knot">
					<xsl:text>&#10;LEFT JOIN &#10;&#9;</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:text>_</xsl:text>
					<xsl:value-of select="$knot/@name"/>
					<xsl:text>&#32;[</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:variable name="currentReference" select="@reference"/>
					<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
						<xsl:value-of select="@ordinal"/>
					</xsl:if>
					<xsl:text>]&#10;ON &#10;&#9;[</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
						<xsl:value-of select="@ordinal"/>
					</xsl:if>
					<xsl:text>].</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:text>_ID = [</xsl:text>
					<xsl:value-of select="$tieMnemonic"/>
					<xsl:text>].</xsl:text>
					<xsl:value-of select="$knot/@mnemonic"/>
					<xsl:text>_ID</xsl:text>
					<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
						<xsl:text>_</xsl:text>
						<xsl:value-of select="@ordinal"/>
					</xsl:if>
				</xsl:if>
			</xsl:for-each>
			<xsl:if test="@historized = 'true'">
				<xsl:text>&#10;WHERE &#10;&#9;[</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>].</xsl:text>
				<xsl:value-of select="@mnemonic"/>
				<xsl:text>_FromDate between @intervalStart and @intervalEnd</xsl:text>
			</xsl:if>
			<xsl:choose>
				<xsl:when test="relation[not(@primary = 'true')] and @historized = 'true'">
					<xsl:text>&#10;AND &#10;&#9;</xsl:text>
				</xsl:when>
				<xsl:when test="relation[not(@primary = 'true')] and not(@historized = 'true')">
					<xsl:text>&#10;WHERE &#10;&#9;</xsl:text>
				</xsl:when>
			</xsl:choose>
			<xsl:for-each select="relation[not(@primary = 'true')]">
				<xsl:choose>
					<xsl:when test="key('mnemonicToEntity', @reference)[local-name() = 'knot']">
						<xsl:text>[</xsl:text>
						<xsl:value-of select="@reference"/>
						<xsl:variable name="currentReference" select="@reference"/>
						<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
							<xsl:value-of select="@ordinal"/>
						</xsl:if>
						<xsl:text>].</xsl:text>
						<xsl:value-of select="@reference"/>
						<xsl:text>_</xsl:text>
						<xsl:value-of select="key('mnemonicToEntity', @reference)/@name"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text>[</xsl:text>
						<xsl:value-of select="$tieMnemonic"/>
						<xsl:text>].</xsl:text>
						<xsl:value-of select="@reference"/>
						<xsl:text>_ID</xsl:text>
						<xsl:variable name="currentReference" select="@reference"/>
						<xsl:if test="count(../relation[@reference = $currentReference]) > 1">
							<xsl:text>_</xsl:text>
							<xsl:value-of select="@ordinal"/>
						</xsl:if>
					</xsl:otherwise>
				</xsl:choose>
				<xsl:text> is not null</xsl:text>
				<xsl:if test="not(position() = last())">
					<xsl:text>&#10;OR &#10;&#9;</xsl:text>
				</xsl:if>
			</xsl:for-each>
			<xsl:text>;&#10;GO&#10;</xsl:text>
		</xsl:for-each>
	</xsl:template>
</xsl:stylesheet>
