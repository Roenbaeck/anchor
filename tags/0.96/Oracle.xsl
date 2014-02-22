<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text" indent="no"/>

    <!-- lookup hash tables -->
    <xsl:key name="knotLookup" match="//knot[@mnemonic]" use="@mnemonic"/>
    <xsl:key name="anchorLookup" match="//anchor[@mnemonic]" use="@mnemonic"/>

    <!-- parameters controlling the output -->
    <xsl:param name="metadataPrefix">
        <xsl:text>MD</xsl:text>
    </xsl:param>
    <xsl:param name="metadataType">
        <xsl:text>integer</xsl:text>
    </xsl:param>
    <xsl:param name="historizationSuffix">
        <xsl:text>VF</xsl:text>
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
        <xsl:value-of select="concat('-- log in as the user/schema owner!',$N,'DECLARE OBJECT_EXISTS INTEGER;',$N,$N,'BEGIN', $N, $N)"/>

        <!-- process all knots -->
	<xsl:for-each select="knot">
		    <xsl:variable name="knotMnemonic" select="@mnemonic"/>
            <xsl:variable name="knotName" select="concat(@mnemonic, '_', @descriptor)"/>
            <xsl:variable name="knotMetadata" select="concat($metadataPrefix, '_', @mnemonic)"/>
            <xsl:variable name="knotIdentity" select="concat(@mnemonic, '_', $identitySuffix)"/>
            <xsl:variable name="knotIdentityType" select="@identity"/>
            <xsl:variable name="knotSequence" select="concat(@mnemonic, '_', $sequenceSuffix)"/>
            <xsl:variable name="knotDataType" select="@dataRange"/>
            <xsl:if test="string(identity/@generator) = 'true'">
                <xsl:value-of select="concat(

                '-------------------------------- [Knot Sequence] -----------------------------------', $N,

                '-- ', $knotSequence, ' sequence for generating identities', $N,

                '--------------------------------------------------------------------------------------', $N,
                'SELECT COUNT(*) INTO OBJECT_EXISTS FROM USER_SEQUENCES WHERE SEQUENCE_NAME=upper(', $Q, $knotSequence, $Q, ');',  $N,
                'IF OBJECT_EXISTS = 0 THEN', $N,
                $T, 'EXECUTE IMMEDIATE ', $Q, $N,
                $T, 'CREATE SEQUENCE ', $knotSequence, $N,
                $T, $T, 'MINVALUE 1', $N,
                $T, $T, 'START WITH 1', $N,
                $T, $T, 'INCREMENT BY 1', $N,
                $T, $T, 'NOCACHE', $N,
                $T, $Q, ';', $N, 'END IF;', $N
                )"/>
            </xsl:if>
            <xsl:value-of select="concat(
            '----------------------------------- [Knot Table] -------------------------------------', $N,
            '-- ', $knotName, ' table', $N,
            '--------------------------------------------------------------------------------------', $N,
            'SELECT COUNT(*) INTO OBJECT_EXISTS FROM USER_TABLES WHERE TABLE_NAME=upper(', $Q, $knotName, $Q, ');',  $N,
            'IF OBJECT_EXISTS = 0 THEN', $N,
            $T, 'EXECUTE IMMEDIATE ', $Q, $N,
            $T, 'CREATE TABLE ', $knotName, ' (', $N,
            $T, $T, $knotIdentity, ' ', $knotIdentityType, ' not null,', $N,
            $T, $T, $knotName, ' ', $knotDataType, ' not null unique,', $N,
            $T, $T, $knotMetadata, ' ', $metadataType, ' not null,', $N,
            $T, $T, 'CONSTRAINT ', 'pk_', $knotMnemonic, ' PRIMARY KEY(', $N,
            $T, $T, $T, $knotIdentity, $N,
            $T, $T, ')', $N,
            $T, ') ORGANIZATION INDEX', $N,
            $T, $Q, ';', $N, 'END IF;', $N, $N
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
                'SELECT COUNT(*) INTO OBJECT_EXISTS FROM USER_SEQUENCES WHERE SEQUENCE_NAME=upper(', $Q, $anchorSequence, $Q, ');',  $N,
                'IF OBJECT_EXISTS = 0 THEN', $N,
                $T, 'EXECUTE IMMEDIATE ', $Q, $N,
                $T, 'CREATE SEQUENCE ', $anchorSequence, $N,
                $T, $T, 'MINVALUE 1', $N,
                $T, $T, 'START WITH 1', $N,
                $T, $T, 'INCREMENT BY 1', $N,
                $T, $T, 'NOCACHE', $N,
                $T, $Q, ';', $N, 'END IF;', $N
                )"/>
            </xsl:if>
            <xsl:value-of select="concat(
            '---------------------------------- [Anchor Table] ------------------------------------', $N,
            '-- ', $anchorName, ' table (with ', count(attribute), ' attributes)', $N,
            '--------------------------------------------------------------------------------------', $N,
            'SELECT COUNT(*) INTO OBJECT_EXISTS FROM USER_TABLES WHERE TABLE_NAME=upper(', $Q, $anchorName, $Q, ');',  $N,
            'IF OBJECT_EXISTS = 0 THEN', $N,
            $T, 'EXECUTE IMMEDIATE ', $Q, $N,
            $T, 'CREATE TABLE ', $anchorName, ' (', $N,
            $T, $T, $anchorIdentity, ' ', @identity, ' not null,', $N,
            $T, $T, $anchorMetadata, ' ', $metadataType, ' not null,', $N,
            $T, $T, 'CONSTRAINT ', 'pk_', $anchorMnemonic, ' PRIMARY KEY(', $N,
            $T, $T, $T, $anchorIdentity, $N,
            $T, $T, ')', $N,
            $T, ') ORGANIZATION INDEX', $N,
            $T, $Q, ';', $N, 'END IF;', $N
            )"/>
            <!-- process all attributes in the current anchor -->
            <xsl:for-each select="attribute">
                <xsl:variable name="attributeMnemonic" select="concat($anchorMnemonic, '_', @mnemonic)"/>
                <xsl:variable name="attributeMetadata" select="concat($metadataPrefix, '_', $attributeMnemonic)"/>
                <xsl:variable name="attributeName" select="concat($attributeMnemonic, '_', parent::*/@descriptor, '_', @descriptor)"/>
                <xsl:variable name="knotOrDataDefinition">
                    <xsl:choose>
                        <xsl:when test="key('knotLookup', @knotRange)">
                            <xsl:value-of select="concat($T, @knotRange, '_', $identitySuffix, ' ', key('knotLookup', @knotRange)/@identity, ' not null,', $N,
                            $T, $T, 'CONSTRAINT ', 'fk_', @knotRange, '_', $identitySuffix, ' FOREIGN KEY(' , $anchorIdentity, ') REFERENCES ', @knotRange, '_', key('knotLookup', @knotRange)/@descriptor, '(', @knotRange, '_', $identitySuffix,'),', $N)"/>
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
                            <xsl:value-of select="concat( ',', $N, $T, $T, $T, $attributeMnemonic, '_', $historizationSuffix, $N)"/>
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
		        'SELECT COUNT(*) INTO OBJECT_EXISTS FROM USER_TABLES WHERE TABLE_NAME=upper(', $Q, $attributeName, $Q, ');',  $N,
                'IF OBJECT_EXISTS = 0 THEN', $N,
                $T, 'EXECUTE IMMEDIATE ', $Q, $N,
                $T, 'CREATE TABLE ', $attributeName, ' (', $N,
                $T, $T, $anchorIdentity, ' ', parent::*/@identity, ' not null,', $N,
                $T, $T, 'CONSTRAINT ', 'fk_', $attributeMnemonic, ' FOREIGN KEY(' , $anchorIdentity, ') REFERENCES ', $anchorName, '(', $anchorIdentity, '),', $N,
                $T, $knotOrDataDefinition,
                $T, $historizationDefinition,
                $T, $attributeMetadata, ' ', $metadataType, ' not null,', $N,
                $T, $T, 'CONSTRAINT ', 'pk_', $attributeMnemonic, ' PRIMARY KEY(', $N,
                $T, $T, $T, $anchorIdentity, $historizationKey,
                $T, $T, ')', $N,
            	$T, ') ORGANIZATION INDEX', $N,
            	$T, $Q, ';', $N, 'END IF;', $N
                )"/>
            </xsl:for-each>
        </xsl:for-each>
        
        <!-- process all ties -->
        <xsl:for-each select="tie">
            <xsl:variable name="tieMnemonic">
                <xsl:for-each select="anchorRole|knotRole">
                    <xsl:value-of select="@type"/>
                    <xsl:if test="not(position() = last())">
                        <xsl:text>_</xsl:text>
                    </xsl:if>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="tieName">
                <xsl:for-each select="anchorRole|knotRole">
                    <xsl:value-of select="concat(@type, '_', @role)"/>
                    <xsl:if test="not(position() = last())">
                        <xsl:text>_</xsl:text>
                    </xsl:if>
                </xsl:for-each>
            </xsl:variable>            
            <xsl:variable name="tieMetadata" select="concat($metadataPrefix, '_', $tieMnemonic)"/>
            <xsl:variable name="columnDefinitions">
                <xsl:for-each select="anchorRole|knotRole">
                    <xsl:variable name="identityType" select="concat(key('anchorLookup', @type)/@identity, key('knotLookup', @type)/@identity)"/>
                    <xsl:variable name="referent" select="concat(@type, '_', key('anchorLookup', @type)/@descriptor, key('knotLookup', @type)/@descriptor)"/>
                    <xsl:value-of select="concat($T, $T, @type, '_', $identitySuffix, '_', @role, ' ', $identityType, ' not null,', $N,
                                                 $T, $T, 'CONSTRAINT ', 'fk_', $tieMnemonic, '_', @type, '_', $identitySuffix, '_', @role, ' FOREIGN KEY(' , @type, '_', $identitySuffix, '_', @role, ') REFERENCES ', $referent, '(', @type, '_', $identitySuffix,  '),', $N)"/>                    
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="primaryKeyColumns">
                <xsl:for-each select="anchorRole[string(@identifier) = 'true']|knotRole[string(@identifier) = 'true']">
                    <xsl:value-of select="concat($T, $T, $T, @type, '_', $identitySuffix, '_', @role)"/>
                    <xsl:if test="not(position() = last())">
                        <xsl:value-of select="concat(',', $N)"/>
                    </xsl:if>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="historizationDefinition">
                <xsl:if test="@timeRange">
                    <xsl:value-of select="concat($T, $T, $tieName, '_', $historizationSuffix, ' ', @timeRange, ' not null,', $N)"/>
                </xsl:if>
            </xsl:variable>
            <xsl:variable name="historizationKey">
                <xsl:choose>
                    <xsl:when test="@timeRange">
                        <xsl:value-of select="concat(',', $N, $T, $T, $T, $tieName, '_', $historizationSuffix, $N)"/>
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
            'SELECT COUNT(*) INTO OBJECT_EXISTS FROM USER_TABLES WHERE TABLE_NAME=upper(', $Q, $tieName, $Q, ');',  $N,
            'IF OBJECT_EXISTS = 0 THEN', $N,
            $T, 'EXECUTE IMMEDIATE ', $Q, $N,
            $T, 'CREATE TABLE ', $tieName, ' (', $N,            
            $columnDefinitions,
            $historizationDefinition,
            $T, $T, $tieMetadata, ' ', $metadataType, ' not null,', $N,
            $T, $T, 'CONSTRAINT ', 'pk_', $tieMnemonic, ' PRIMARY KEY(', $N,
            $primaryKeyColumns,
            $historizationKey,            
            $T, $T, ')', $N,
            $T, ') ORGANIZATION INDEX', $N,
            $T, $Q, ';', $N, 'END IF;', $N
            )"/>            



        </xsl:for-each>
            
        <xsl:value-of select="concat(

        'END;', $N, '/', $N, $N
        )"/>
    </xsl:template>
</xsl:stylesheet>
