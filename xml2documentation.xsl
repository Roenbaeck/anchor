<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" indent="no"/>

	<xsl:key name="mnemonicToEntity" match="//*[@mnemonic]" use="@mnemonic"/>
	<xsl:variable name="historization" select="'H'"/>
	<xsl:template match="/schema">
		<html>
			<head>
				<title>Anchor Model</title>
				<style type="text/css">
					body {
					font-family: monospace;
					color: black;
					background: white;
					}
					table {
					border-collapse: collapse;
					border-spacing: 0 0;
					table-layout: fixed;
					}
					th {
					font-family: sans-serif;
					font-size: small;
					text-align: left;
					color: white;
					background: black;
					padding-left: 2px;
					}
					.header {
					font-family: sans-serif;
					font-size: small;
					text-align: center;
					color: white;
					background: black;
					font-weight: bold;
					}
					.knot {
					border: 1px solid #ff6666;
					padding-left: 2px;
					}
					.anchor {
					border: 1px solid #ff6666;
					background: #ff6666;
					padding-left: 2px;
					}
					.attribute {
					border: 1px solid #ff6666;
					padding-left: 2px;
					}
					.tie {
					border: 1px solid #c0c0c0;
					background: #c0c0c0;
					padding-left: 2px;
					}
					.anchorlight {
					background: #ffcccc;
					padding-left: 2px;
					}
					.even {
					background: #f0f0f0;
					padding-left: 2px;
					}
					.odd {
					background: white;
					padding-left: 2px;
					}
				</style>
			</head>
			<body>
                Automatically generated documentation not implemented yet.
                <!--
				<table width="1262" cellspacing="0" cellpadding="0">
					<tr>
						<td class="header" align="center" colspan="4">
							<xsl:value-of select="$model"/>
						</td>
					</tr>
					<tr>
						<td class="knot" align="center">
							<xsl:text>knot</xsl:text>
						</td>
						<td class="anchor" align="center">
							<xsl:text>anchor</xsl:text>
						</td>
						<td class="attribute" align="center">
							<xsl:text>attribute</xsl:text>
						</td>
						<td class="tie" align="center">
							<xsl:text>tie</xsl:text>
						</td>
					</tr>
				</table>
				<table width="1262" cellspacing="0" cellpadding="0">
					<tr>
						<th width="100">knots</th>
						<th width="70"/>
						<th width="530">name</th>
						<th width="170">value</th>
						<th width="170">identifier</th>
						<th width="210" colspan="6">relation</th>
					</tr>
					<xsl:for-each select="am:knot">
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
							<td class="knot">
								<xsl:value-of select="@mnemonic"/>
							</td>
							<td class="{$style}"/>
							<td class="{$style}">
								<xsl:value-of select="@mnemonic"/>
								<xsl:text>_</xsl:text>
								<b>
									<xsl:value-of select="@name"/>
								</b>
							</td>
							<td class="{$style}">
								<xsl:value-of select="@valueType"/>
							</td>
							<td class="{$style}">
								<xsl:value-of select="@idType"/>
							</td>
							<td/>
						</tr>
					</xsl:for-each>
					<tr>
						<th width="100">anchors/attrs.</th>
						<th width="70">historized</th>
						<th width="530">name</th>
						<th width="170">value</th>
						<th width="170">identifier</th>
						<th width="210" colspan="6">relation</th>
					</tr>
					<xsl:for-each select="am:anchor">
						<xsl:sort data-type="text" case-order="upper-first" order="ascending" select="@mnemonic"/>
						<tr>
							<td class="anchor">
								<xsl:value-of select="@mnemonic"/>
							</td>
							<td class="anchorlight"/>
							<td class="anchorlight">
								<xsl:value-of select="@mnemonic"/>
								<xsl:text>_</xsl:text>
								<b>
									<xsl:value-of select="@name"/>
								</b>
							</td>
							<td class="anchorlight"/>
							<td class="anchorlight">
								<xsl:value-of select="@idType"/>
							</td>
							<td/>
						</tr>
						<xsl:for-each select="am:attribute">
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
								<td class="attribute">
									<xsl:value-of select="@mnemonic"/>
								</td>
								<td class="{$style}" align="center">
									<xsl:choose>
										<xsl:when test="@historized = 'true'">
											<xsl:value-of select="$historization"/>
										</xsl:when>
										<xsl:otherwise>
										</xsl:otherwise>
									</xsl:choose>
								</td>
								<td class="{$style}">
									<xsl:value-of select="@mnemonic"/>
									<xsl:text>_</xsl:text>
									<b>
										<xsl:value-of select="@name"/>
									</b>
								</td>
								<td class="{$style}">
									<xsl:choose>
										<xsl:when test="am:relation">
											<i>
												<xsl:value-of select="key('mnemonicToEntity', am:relation/@reference)/@valueType"/>
											</i>
										</xsl:when>
										<xsl:otherwise>
											<xsl:value-of select="@valueType"/>
										</xsl:otherwise>
									</xsl:choose>
								</td>
								<td class="{$style}"/>
								<td class="anchor">
									<xsl:value-of select="ancestor::am:anchor/@mnemonic"/>
								</td>
								<xsl:if test="am:relation">
									<td class="knot">
										<xsl:value-of select="am:relation/@reference"/>
									</td>
								</xsl:if>
							</tr>
						</xsl:for-each>
					</xsl:for-each>
					<tr>
						<th width="100">ties</th>
						<th width="70">historized</th>
						<th width="870" colspan="3">name</th>
						<th width="210" colspan="6">relation</th>
					</tr>
					<xsl:for-each select="am:tie">
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
							<td class="tie">
								<xsl:value-of select="@mnemonic"/>
							</td>
							<td class="{$style}" align="center">
								<xsl:choose>
									<xsl:when test="@historized = 'true'">
										<xsl:value-of select="$historization"/>
									</xsl:when>
									<xsl:otherwise>
									</xsl:otherwise>
								</xsl:choose>
							</td>
							<td class="{$style}" colspan="3">
								<xsl:value-of select="@mnemonic"/>
								<xsl:text>_</xsl:text>
								<b>
									<xsl:value-of select="@name"/>
								</b>
							</td>
							<xsl:for-each select="am:relation">
								<xsl:variable name="entity" select="key('mnemonicToEntity', @reference)"/>
								<xsl:choose>
									<xsl:when test="$entity[local-name() = 'knot']">
										<td class="knot">
											<xsl:value-of select="$entity/@mnemonic"/>
										</td>
									</xsl:when>
									<xsl:when test="$entity[local-name() = 'anchor']">
										<td class="anchor">
											<xsl:value-of select="$entity/@mnemonic"/>
										</td>
									</xsl:when>
									<xsl:otherwise>
										<td class="none">
											<xsl:value-of select="$entity/@mnemonic"/>
										</td>
									</xsl:otherwise>
								</xsl:choose>
							</xsl:for-each>
						</tr>
					</xsl:for-each>
				</table>
				-->
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
