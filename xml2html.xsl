<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" indent="no"/>
    <xsl:template match="node()">
        <xsl:param name="indent" select="''"/>
        <span class="tabs">
            <xsl:value-of select="$indent"/>
        </span>
        <span class="brackets">
            <xsl:text>&lt;</xsl:text>
        </span>
        <span class="elements">
            <xsl:value-of select="local-name(.)"/>
        </span>
        <xsl:for-each select="@*">
            <xsl:text> </xsl:text>
            <span class="attributes">
                <xsl:value-of select="local-name(.)"/>
            </span>
            <span class="brackets">
                <xsl:text>="</xsl:text>
            </span>
            <span class="values">
                <xsl:value-of select="."/>
            </span>
            <span class="brackets">
                <xsl:text>"</xsl:text>
            </span>
        </xsl:for-each>
        <xsl:choose>
            <xsl:when test="node()">
                <span class="brackets">
                    <xsl:text>&gt;</xsl:text><br/>
                </span>
                <xsl:apply-templates select="node()">
                    <xsl:with-param name="indent" select="concat($indent, 'TAB')"/>
                </xsl:apply-templates>
                <span class="tabs">
                    <xsl:value-of select="$indent"/>
                </span>
                <span class="brackets">
                    <xsl:text>&lt;/</xsl:text>
                </span>
                <span class="elements">
                    <xsl:value-of select="local-name(.)"/>
                </span>
                <span class="brackets">
                    <xsl:text>&gt;</xsl:text><br/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <span class="brackets">
                    <xsl:text> /&gt;</xsl:text><br/>
                </span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
