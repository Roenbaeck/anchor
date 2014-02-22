<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" indent="no"/>

    <!-- lookup hash tables -->
    <xsl:key name="knotLookup" match="//knot[@mnemonic]" use="@mnemonic"/>
    <xsl:key name="anchorLookup" match="//anchor[@mnemonic]" use="@mnemonic"/>
    <xsl:template match="/schema">
        <table class="legend">
            <tr>
                <td class="knot">
                    <xsl:text>knot</xsl:text>
                </td>
                <td class="anchor">
                    <xsl:text>anchor</xsl:text>
                </td>
                <td class="attribute">
                    <xsl:text>attribute</xsl:text>
                </td>
                <td class="tie">
                    <xsl:text>tie</xsl:text>
                </td>
            </tr>
        </table>
        <table>
            <tr>
                <th class="capsule">capsule</th>
                <th class="mnemonic">mnemonic</th>
                <th class="descriptor">descriptor</th>
                <th class="identity">identity</th>
                <th class="dataRange">dataRange</th>
                <th class="timeRange"/>
                <th class="knotRange"/>
                <th class="generator">generator</th>
            </tr>
            <xsl:for-each select="knot">
                <xsl:sort data-type="text" case-order="upper-first" order="ascending" select="metadata[1]/@capsule"/>
                <xsl:sort data-type="text" case-order="upper-first" order="ascending" select="@mnemonic"/>
                <xsl:variable name="n" select="position()"/>
                <xsl:variable name="style">
                    <xsl:choose>
                        <xsl:when test="$n mod 2 = 0">
                            <xsl:text>even</xsl:text>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:text>odd</xsl:text>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:comment>
                    <xsl:value-of select="$n"/>
                </xsl:comment>
                <tr>
                    <td class="knot capsule">
                        <xsl:value-of select="metadata[1]/@capsule"/>
                    </td>
                    <td class="knot">
                        <a name="{@mnemonic}">
                            <xsl:value-of select="@mnemonic"/>
                        </a>
                    </td>
                    <td class="{$style}">
                        <b>
                            <xsl:value-of select="@descriptor"/>
                        </b>
                    </td>
                    <td class="{$style}">
                        <xsl:value-of select="@identity"/>
                    </td>
                    <td class="{$style}" colspan="3">
                        <xsl:value-of select="@dataRange"/>
                    </td>
                    <td class="{$style}">
                        <xsl:if test="metadata[1]/@generator = 'true'">
                            <xsl:text>•</xsl:text>
                        </xsl:if>
                    </td>
                </tr>
            </xsl:for-each>
            <tr>
                <th class="capsule">capsule</th>
                <th class="mnemonic">mnemonic</th>
                <th class="descriptor">descriptor</th>
                <th class="identity">identity</th>
                <th class="dataRange">dataRange</th>
                <th class="timeRange">timeRange</th>
                <th class="knotRange">knotRange</th>
                <th class="generator">generator</th>
            </tr>
            <xsl:for-each select="anchor">
                <xsl:sort data-type="text" case-order="upper-first" order="ascending" select="@mnemonic"/>
                <xsl:variable name="identity" select="@identity"/>
                <tr>
                    <td class="anchorlight capsule">
                        <xsl:value-of select="metadata[1]/@capsule"/>
                    </td>
                    <td class="anchor">
                        <a name="{@mnemonic}">
                            <xsl:value-of select="@mnemonic"/>
                        </a>
                    </td>
                    <td class="anchorlight">
                        <b>
                            <xsl:value-of select="@descriptor"/>
                        </b>
                    </td>
                    <td class="anchorlight" colspan="4">
                        <xsl:value-of select="$identity"/>
                    </td>
                    <td class="anchorlight generator">
                        <xsl:if test="metadata[1]/@generator = 'true'">
                            <xsl:text>•</xsl:text>
                        </xsl:if>
                    </td>
                </tr>
                <xsl:for-each select="attribute">
                    <xsl:sort data-type="text" case-order="upper-first" order="ascending" select="@mnemonic"/>
                    <xsl:variable name="n" select="position()"/>
                    <xsl:variable name="style">
                        <xsl:choose>
                            <xsl:when test="$n mod 2 = 0">
                                <xsl:text>even</xsl:text>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:text>odd</xsl:text>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:variable>
                    <xsl:comment>
                        <xsl:value-of select="$n"/>
                    </xsl:comment>
                    <tr>
                        <td class="attribute capsule">
                            <xsl:value-of select="metadata[1]/@capsule"/>
                        </td>
                        <td class="attribute">
                            <xsl:value-of select="@mnemonic"/>
                        </td>
                        <td class="{$style}">
                            <b>
                                <xsl:value-of select="@descriptor"/>
                            </b>
                        </td>
                        <td class="{$style}"/>
                        <xsl:choose>
                            <xsl:when test="@knotRange">
                                <td class="derived {$style}">
                                    <xsl:value-of select="key('knotLookup', @knotRange)/@dataRange"/>
                                </td>
                            </xsl:when>
                            <xsl:otherwise>
                                <td class="{$style}">
                                    <xsl:value-of select="@dataRange"/>
                                </td>
                            </xsl:otherwise>
                        </xsl:choose>
                        <td class="{$style}">
                            <xsl:value-of select="@timeRange"/>
                        </td>
                        <td class="{$style}">
                            <a href="#{@knotRange}">
                                <xsl:value-of select="@knotRange"/>
                            </a>
                        </td>
                        <td class="{$style}"/>
                    </tr>
                </xsl:for-each>
            </xsl:for-each>
        </table>
        <table>
            <tr>
                <th class="capsule">capsule (id)</th>
                <th class="role">tie/role</th>
                <th class="type">type</th>
                <th class="timeRange">timeRange</th>
                <th class="filler"/>
            </tr>
            <xsl:for-each select="tie">
                <xsl:sort data-type="text" case-order="upper-first" order="ascending" select="concat(*[1]/@type, '_', *[1]/@role, '_', *[2]/@type, '_', *[2]/@role)"/>
                <xsl:variable name="tieName">
                    <xsl:for-each select="anchorRole|knotRole">
                        <xsl:value-of select="concat(@type, '_', @role)"/>
                        <xsl:if test="not(position() = last())">
                            <xsl:text>_</xsl:text>
                        </xsl:if>
                    </xsl:for-each>
                </xsl:variable>
                <tr>
                    <td class="tie capsule">
                        <xsl:value-of select="metadata[1]/@capsule"/>
                    </td>
                    <td class="tie" colspan="2">
                        <b><xsl:value-of select="$tieName"/></b>
                    </td>
                    <td class="tie" colspan="2">
                        <xsl:if test="@timeRange">
                            <xsl:value-of select="@timeRange"/>
                        </xsl:if>
                    </td>
                </tr>
                <xsl:for-each select="anchorRole|knotRole">
                    <xsl:variable name="n" select="position()"/>
                    <xsl:variable name="style">
                        <xsl:choose>
                            <xsl:when test="$n mod 2 = 0">
                                <xsl:text>even</xsl:text>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:text>odd</xsl:text>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:variable>
                    <xsl:comment>
                        <xsl:value-of select="$n"/>
                    </xsl:comment>
                    <tr>
                        <td class="{$style} identifier">
                            <xsl:if test="@identifier = 'true'">
                                <xsl:text>•</xsl:text>
                            </xsl:if>
                        </td>
                        <td class="{$style}">
                            <xsl:value-of select="@role"/>
                        </td>
                        <td class="{$style}">
                            <a href="#{@type}">
                                <xsl:value-of select="@type"/>
                            </a>
                        </td>
                        <td class="{$style}" colspan="2"/>
                    </tr>
                </xsl:for-each>
            </xsl:for-each>
        </table>
    </xsl:template>
</xsl:stylesheet>
