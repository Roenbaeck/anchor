<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text"/>
    <xsl:template match="/model">
        <xsl:for-each select="anchor">
            <xsl:text>Found node: </xsl:text>
            <xsl:value-of select="local-name(.)"/>
            <xsl:text> with mnemonic: </xsl:text>
            <xsl:value-of select="@mnemonic"/>
        </xsl:for-each>
    </xsl:template>
</xsl:stylesheet>