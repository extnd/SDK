<?xml version='1.0' encoding='UTF-8'?>
<xsl:stylesheet xmlns:xsl='http://www.w3.org/1999/XSL/Transform'
	xmlns:dxl='http://www.lotus.com/dxl' xmlns='http://www.lotus.com/dxl'
	exclude-result-prefixes="dxl" version='1.0'>

	<xsl:output method='xml' />

	<xsl:template match='/'>
		<xsl:apply-templates />
	</xsl:template>

	<!-- template just for the form -->
	<xsl:template match="dxl:form">

		<!-- Copy the current form node -->
		<xsl:copy>

			<!-- get all attributes of the form node -->
			<xsl:apply-templates select="@*" />

			<!-- now get the actions -->
			<xsl:apply-templates select='//dxl:actionbar' />

			<!--
				and fields that we wrap in our own fields node since each field is
				spread out in the rich text of the form
			-->
			<fields>
				<xsl:apply-templates select='//dxl:field' />
			</fields>
		</xsl:copy>

	</xsl:template>

	<!-- identity template to get all nodes and attributes -->
	<xsl:template match="node()|@*">
		<!-- Copy the current node -->
		<xsl:copy>
			<!-- Including any attributes it has and any child nodes -->
			<xsl:apply-templates select="@*|node()" />
		</xsl:copy>
	</xsl:template>


	<!--
		template to strip out all lotuscript since we can't process that code
		in a browser anyway
	-->
	<xsl:template match="dxl:lotusscript">
	</xsl:template>

	<!--
		template to strip out all keyword formulas since the server already
		evaluated them and sent them in the form's html
	-->
	<xsl:template match="dxl:keywords/dxl:formula">
	</xsl:template>

	<!--
		template to strip out default value formulas since the server already
		evaluated them and sent them in the form's html
	-->
	<xsl:template match="dxl:code[@event='defaultvalue']">
	</xsl:template>

	<!--
		template to strip out hidewhen formulas since this will need to be
		done serverside
	-->
	<xsl:template match="dxl:code[@event='hidewhen']">
	</xsl:template>


</xsl:stylesheet>