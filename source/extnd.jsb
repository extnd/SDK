<?xml version="1.0" encoding="utf-8"?>
<project path="" name="Ext.nd - Ext for Notes / Domino" author="Ext.nd Team" version="Alpha 2 Revision 2" copyright="$projectName $version&#xD;&#xA;Copyright(c) 2007, $author.&#xD;&#xA;&#xD;&#xA;http://www.extjs.com/license" output="$project\build" source="true" source-dir="$output\source" minify="true" min-dir="$output\build" doc="False" doc-dir="$output\docs" master="true" master-file="$output\yui-ext.js" zip="true" zip-file="$output\yuo-ext.$version.zip">
  <directory name="" />
  <file name="data\DominoPagingToolbar.js" path="data" />
  <file name="data\DominoViewStore.js" path="data" />
  <file name="data\DominoViewXmlReader.js" path="data" />
  <file name="domino\Document.js" path="domino" />
  <file name="domino\DominoUI.js" path="domino" />
  <file name="domino\Formula.js" path="domino" />
  <file name="domino\UIOutline.js" path="domino" />
  <file name="domino\UIView.js" path="domino" />
  <file name="domino\UIWorkspace.js" path="domino" />
  <file name="grid\DominoGrid.js" path="grid" />
  <file name="grid\DominoGridView.js" path="grid" />
  <file name="extnd.js" path="" />
  <target name="Extnd All" file="$output\extnd-all.js" debug="True" shorthand="False" shorthand-list="YAHOO.util.Dom.setStyle&#xD;&#xA;YAHOO.util.Dom.getStyle&#xD;&#xA;YAHOO.util.Dom.getRegion&#xD;&#xA;YAHOO.util.Dom.getViewportHeight&#xD;&#xA;YAHOO.util.Dom.getViewportWidth&#xD;&#xA;YAHOO.util.Dom.get&#xD;&#xA;YAHOO.util.Dom.getXY&#xD;&#xA;YAHOO.util.Dom.setXY&#xD;&#xA;YAHOO.util.CustomEvent&#xD;&#xA;YAHOO.util.Event.addListener&#xD;&#xA;YAHOO.util.Event.getEvent&#xD;&#xA;YAHOO.util.Event.getTarget&#xD;&#xA;YAHOO.util.Event.preventDefault&#xD;&#xA;YAHOO.util.Event.stopEvent&#xD;&#xA;YAHOO.util.Event.stopPropagation&#xD;&#xA;YAHOO.util.Event.stopEvent&#xD;&#xA;YAHOO.util.Anim&#xD;&#xA;YAHOO.util.Motion&#xD;&#xA;YAHOO.util.Connect.asyncRequest&#xD;&#xA;YAHOO.util.Connect.setForm&#xD;&#xA;YAHOO.util.Dom&#xD;&#xA;YAHOO.util.Event">
    <include name="extnd.js" />
    <include name="domino\Document.js" />
    <include name="grid\DominoGridView.js" />
    <include name="data\DominoPagingToolbar.js" />
    <include name="domino\DominoUI.js" />
    <include name="data\DominoViewStore.js" />
    <include name="data\DominoViewXmlReader.js" />
    <include name="domino\Formula.js" />
    <include name="domino\UIOutline.js" />
    <include name="domino\UIView.js" />
    <include name="domino\UIWorkspace.js" />
    <include name="grid\DominoGrid.js" />
    <include name="domino\Actionbar.js" />
    <include name="domino\Form.js" />
  </target>
  <file name="domino\Actionbar.js" path="domino" />
  <file name="domino\Form.js" path="domino" />
  <file name="widgets\ViewSuggest.js" path="widgets" />
</project>