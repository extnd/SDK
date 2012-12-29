Ext.data.JsonP.Ext_nd_UIDocument({"parentMixins":[],"extends":null,"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/UIDocument.html#Ext-nd-UIDocument' target='_blank'>UIDocument.js</a></div></pre><div class='doc-contents'><p>Converts fields and actionbars of a Domino form/page into Ext equivalents</p>\n\n<p>Simple example:</p>\n\n<pre><code>    var uidoc = new <a href=\"#!/api/Ext.nd.UIDocument\" rel=\"Ext.nd.UIDocument\" class=\"docClass\">Ext.nd.UIDocument</a>();\n    uidoc.render('myDiv'); // to render to a specified div\n</code></pre>\n\n<p>More complex example:</p>\n\n<pre><code>    var uidoc = new <a href=\"#!/api/Ext.nd.UIDocument\" rel=\"Ext.nd.UIDocument\" class=\"docClass\">Ext.nd.UIDocument</a>({\n        showActionbar : false,\n        convertFields : false\n    });\n    new <a href=\"#!/api/Ext.Viewport\" rel=\"Ext.Viewport\" class=\"docClass\">Ext.Viewport</a>({\n        layout: 'fit',\n        items: uidoc\n    });\n</code></pre>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-applyDominoKeywordRefresh' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-cfg-applyDominoKeywordRefresh' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-cfg-applyDominoKeywordRefresh' class='name expandable'>applyDominoKeywordRefresh</a><span> : boolean</span></div><div class='description'><div class='short'>Determines whether to apply the postback onchange event that Domino sends for Keyword fields set to \"Refresh fields o...</div><div class='long'><p>Determines whether to apply the postback onchange event that Domino sends for Keyword fields set to \"Refresh fields on keyword change\".</p>\n<p>Defaults to: <code>true</code></p></div></div></div><div id='cfg-convertFields' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-cfg-convertFields' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-cfg-convertFields' class='name expandable'>convertFields</a><span> : boolean</span></div><div class='description'><div class='short'>Determines whether to convert form fields to Ext fields. ...</div><div class='long'><p>Determines whether to convert form fields to Ext fields.</p>\n<p>Defaults to: <code>true</code></p></div></div></div><div id='cfg-createActionsFrom' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-cfg-createActionsFrom' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-cfg-createActionsFrom' class='name expandable'>createActionsFrom</a><span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">string</a></span></div><div class='description'><div class='short'>Set to 'document' if you want to create the actionbar from the actions domino sends after it evaluates hide-when form...</div><div class='long'><p>Set to 'document' if you want to create the actionbar from the actions domino sends after it evaluates hide-when formulas.  Set to 'dxl' if you want to create the actionbar from what is defined in Designer.</p>\n<p>Defaults to: <code>'dxl'</code></p></div></div></div><div id='cfg-defaultFieldWidth' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-cfg-defaultFieldWidth' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-cfg-defaultFieldWidth' class='name expandable'>defaultFieldWidth</a><span> : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">number</a></span></div><div class='description'><div class='short'>The default width to use when a calculated width cannot be determined. ...</div><div class='long'><p>The default width to use when a calculated width cannot be determined.</p>\n<p>Defaults to: <code>120</code></p></div></div></div><div id='cfg-showActionbar' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-cfg-showActionbar' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-cfg-showActionbar' class='name expandable'>showActionbar</a><span> : boolean</span></div><div class='description'><div class='short'>Whether or not to read in the form/page DXL behind the scences and build an Ext.Toolbar from domino actions. ...</div><div class='long'><p>Whether or not to read in the form/page DXL behind the scences and build an <a href=\"#!/api/Ext.Toolbar\" rel=\"Ext.Toolbar\" class=\"docClass\">Ext.Toolbar</a> from domino actions.</p>\n<p>Defaults to: <code>true</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-constructor' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-method-constructor' target='_blank' class='view-source'>view source</a></div><strong class='new-keyword'>new</strong><a href='#!/api/Ext.nd.UIDocument-method-constructor' class='name expandable'>Ext.nd.UIDocument</a>( <span class='pre'></span> ) : <a href=\"#!/api/Ext.nd.UIDocument\" rel=\"Ext.nd.UIDocument\" class=\"docClass\">Ext.nd.UIDocument</a></div><div class='description'><div class='short'>Creates a new UIDocument/Form component ...</div><div class='long'><p>Creates a new UIDocument/Form component</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Ext.nd.UIDocument\" rel=\"Ext.nd.UIDocument\" class=\"docClass\">Ext.nd.UIDocument</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_doClick' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-method-_doClick' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-method-_doClick' class='name expandable'>_doClick</a>( <span class='pre'>v, o, t, h</span> )</div><div class='description'><div class='short'>We take over Domino's generated _doClick method so that we can\nchange the hash reference by prepending xnd-goto which...</div><div class='long'><p>We take over Domino's generated _doClick method so that we can\nchange the hash reference by prepending xnd-goto which will fix some IE layout issues</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>v</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>o</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>t</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>h</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-close' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-method-close' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-method-close' class='name expandable'>close</a>( <span class='pre'>unid</span> )</div><div class='description'><div class='short'>Closes the UIDocument ...</div><div class='long'><p>Closes the UIDocument</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>unid</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-createForm' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-method-createForm' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-method-createForm' class='name expandable'>createForm</a>( <span class='pre'></span> )<strong class='private signature' >private</strong></div><div class='description'><div class='short'>overriding the FormPanels createForm method with our own\nso we can reuse the domino generated form ...</div><div class='long'><p>overriding the FormPanels createForm method with our own\nso we can reuse the domino generated form</p>\n</div></div></div><div id='method-doConvertFieldsCB' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-method-doConvertFieldsCB' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-method-doConvertFieldsCB' class='name expandable'>doConvertFieldsCB</a>( <span class='pre'>response, options</span> )<strong class='private signature' >private</strong></div><div class='description'><div class='short'>called only when convertFields is set to true\nand processes the response from the dxl export\nof field info ...</div><div class='long'><p>called only when convertFields is set to true\nand processes the response from the dxl export\nof field info</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>response</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>options</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-edit' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-method-edit' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-method-edit' class='name expandable'>edit</a>( <span class='pre'>config</span> )</div><div class='description'><div class='short'>Opens the UIDocument into Edit mode ...</div><div class='long'><p>Opens the UIDocument into Edit mode</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>config</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-render' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-method-render' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-method-render' class='name expandable'>render</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Renders the UIDocument in the div with an id that matches the argument passed or,\nin order to support users coming fr...</div><div class='long'><p>Renders the UIDocument in the div with an id that matches the argument passed or,\nin order to support users coming from older versions of <a href=\"#!/api/Ext.nd\" rel=\"Ext.nd\" class=\"docClass\">Ext.nd</a> where you did\nnot have to specify 'where' to render to, we will render to\nan <a href=\"#!/api/Ext.Viewport\" rel=\"Ext.Viewport\" class=\"docClass\">Ext.Viewport</a> like previous versions did when the render method\nis called without any arguments</p>\n</div></div></div><div id='method-save' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-method-save' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-method-save' class='name expandable'>save</a>( <span class='pre'>config</span> )</div><div class='description'><div class='short'>Saves the UIDocument ...</div><div class='long'><p>Saves the UIDocument</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>config</span> : Boolean/Object<div class='sub-desc'><p>Can either be a boolean or an object.  If a boolean, it specifies whether the UIDocument should be closed after the save</p>\n<ul><li><span class='pre'>success</span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a><div class='sub-desc'><p>Success callback handler</p>\n</div></li><li><span class='pre'>failure</span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a><div class='sub-desc'><p>Failure callback handler</p>\n</div></li><li><span class='pre'>scope</span> : Object<div class='sub-desc'><p>The scope to run the callback handlers under</p>\n</div></li></ul></div></li></ul></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-event'>Events</h3><div class='subsection'><div id='event-beforeclose' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-event-beforeclose' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-event-beforeclose' class='name expandable'>beforeclose</a>( <span class='pre'>this</span> )</div><div class='description'><div class='short'>Fires just before the current document is closed (equivalent to the NotesUIDocument QueryClose event). ...</div><div class='long'><p>Fires just before the current document is closed (equivalent to the NotesUIDocument QueryClose event).</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>this</span> : <a href=\"#!/api/Ext.nd.UIDocument\" rel=\"Ext.nd.UIDocument\" class=\"docClass\">Ext.nd.UIDocument</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='event-beforemodechange' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-event-beforemodechange' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-event-beforemodechange' class='name expandable'>beforemodechange</a>( <span class='pre'>this</span> )</div><div class='description'><div class='short'>Fires just before the current document changes modes (from Read to Edit mode, or from Edit to Read mode) (equivalent ...</div><div class='long'><p>Fires just before the current document changes modes (from Read to Edit mode, or from Edit to Read mode) (equivalent to the NotesUIDocument QueryModeChange event).</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>this</span> : <a href=\"#!/api/Ext.nd.UIDocument\" rel=\"Ext.nd.UIDocument\" class=\"docClass\">Ext.nd.UIDocument</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='event-beforeopen' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-event-beforeopen' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-event-beforeopen' class='name expandable'>beforeopen</a>( <span class='pre'>this</span> )</div><div class='description'><div class='short'>(TODO: Not yet implemented) Fires just before the current document is opened (equivalent to the NotesUIDocument Query...</div><div class='long'><p>(TODO: Not yet implemented) Fires just before the current document is opened (equivalent to the NotesUIDocument QueryOpen event).</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>this</span> : <a href=\"#!/api/Ext.nd.UIDocument\" rel=\"Ext.nd.UIDocument\" class=\"docClass\">Ext.nd.UIDocument</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='event-beforesave' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-event-beforesave' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-event-beforesave' class='name expandable'>beforesave</a>( <span class='pre'>this</span> )</div><div class='description'><div class='short'>Fires just before the current document is saved (equivalent to NotesUIDocument QuerySave) ...</div><div class='long'><p>Fires just before the current document is saved (equivalent to NotesUIDocument QuerySave)</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>this</span> : <a href=\"#!/api/Ext.nd.UIDocument\" rel=\"Ext.nd.UIDocument\" class=\"docClass\">Ext.nd.UIDocument</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='event-open' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd.UIDocument'>Ext.nd.UIDocument</span><br/><a href='source/UIDocument.html#Ext-nd-UIDocument-event-open' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd.UIDocument-event-open' class='name expandable'>open</a>( <span class='pre'>this</span> )</div><div class='description'><div class='short'>Fires just after the current document is opened (equivalent to NotesUIDocument PostOpen and OnLoad events.) ...</div><div class='long'><p>Fires just after the current document is opened (equivalent to NotesUIDocument PostOpen and OnLoad events.)</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>this</span> : <a href=\"#!/api/Ext.nd.UIDocument\" rel=\"Ext.nd.UIDocument\" class=\"docClass\">Ext.nd.UIDocument</a><div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{},"linenr":1,"inheritable":null,"singleton":false,"html_meta":{},"subclasses":[],"mixins":[],"aliases":{},"members":{"cfg":[{"meta":{},"owner":"Ext.nd.UIDocument","name":"applyDominoKeywordRefresh","id":"cfg-applyDominoKeywordRefresh","tagname":"cfg"},{"meta":{},"owner":"Ext.nd.UIDocument","name":"convertFields","id":"cfg-convertFields","tagname":"cfg"},{"meta":{},"owner":"Ext.nd.UIDocument","name":"createActionsFrom","id":"cfg-createActionsFrom","tagname":"cfg"},{"meta":{},"owner":"Ext.nd.UIDocument","name":"defaultFieldWidth","id":"cfg-defaultFieldWidth","tagname":"cfg"},{"meta":{},"owner":"Ext.nd.UIDocument","name":"showActionbar","id":"cfg-showActionbar","tagname":"cfg"}],"property":[],"css_mixin":[],"method":[{"meta":{},"owner":"Ext.nd.UIDocument","name":"constructor","id":"method-constructor","tagname":"method"},{"meta":{},"owner":"Ext.nd.UIDocument","name":"_doClick","id":"method-_doClick","tagname":"method"},{"meta":{},"owner":"Ext.nd.UIDocument","name":"close","id":"method-close","tagname":"method"},{"meta":{"private":true},"owner":"Ext.nd.UIDocument","name":"createForm","id":"method-createForm","tagname":"method"},{"meta":{"private":true},"owner":"Ext.nd.UIDocument","name":"doConvertFieldsCB","id":"method-doConvertFieldsCB","tagname":"method"},{"meta":{},"owner":"Ext.nd.UIDocument","name":"edit","id":"method-edit","tagname":"method"},{"meta":{},"owner":"Ext.nd.UIDocument","name":"render","id":"method-render","tagname":"method"},{"meta":{},"owner":"Ext.nd.UIDocument","name":"save","id":"method-save","tagname":"method"}],"event":[{"meta":{},"owner":"Ext.nd.UIDocument","name":"beforeclose","id":"event-beforeclose","tagname":"event"},{"meta":{},"owner":"Ext.nd.UIDocument","name":"beforemodechange","id":"event-beforemodechange","tagname":"event"},{"meta":{},"owner":"Ext.nd.UIDocument","name":"beforeopen","id":"event-beforeopen","tagname":"event"},{"meta":{},"owner":"Ext.nd.UIDocument","name":"beforesave","id":"event-beforesave","tagname":"event"},{"meta":{},"owner":"Ext.nd.UIDocument","name":"open","id":"event-open","tagname":"event"}],"css_var":[]},"alternateClassNames":[],"override":null,"component":false,"statics":{"cfg":[],"property":[],"css_mixin":[],"method":[],"event":[],"css_var":[]},"inheritdoc":null,"private":null,"superclasses":[],"files":[{"href":"UIDocument.html#Ext-nd-UIDocument","filename":"UIDocument.js"}],"name":"Ext.nd.UIDocument","uses":[],"mixedInto":[],"id":"class-Ext.nd.UIDocument","tagname":"class","requires":[],"enum":null});