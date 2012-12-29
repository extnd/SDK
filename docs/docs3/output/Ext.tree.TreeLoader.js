Ext.data.JsonP.Ext_tree_TreeLoader({"parentMixins":[],"extends":"Ext.util.Observable","html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'><a href='#!/api/Ext.util.Observable' rel='Ext.util.Observable' class='docClass'>Ext.util.Observable</a><div class='subclass '><strong>Ext.tree.TreeLoader</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/TreeLoader.html#Ext-tree-TreeLoader' target='_blank'>TreeLoader.js</a></div></pre><div class='doc-contents'><p>A TreeLoader provides for lazy loading of an <a href=\"#!/api/Ext.tree.TreeNode\" rel=\"Ext.tree.TreeNode\" class=\"docClass\">Ext.tree.TreeNode</a>'s child\nnodes from a specified URL. The response must be a JavaScript Array definition\nwhose elements are node definition objects. e.g.:</p>\n\n<pre><code>    [{\n        id: 1,\n        text: 'A leaf Node',\n        leaf: true\n    },{\n        id: 2,\n        text: 'A folder Node',\n        children: [{\n            id: 3,\n            text: 'A child Node',\n            leaf: true\n        }]\n   }]\n</code></pre>\n\n\n<br><br>\n\n\n<p>A server request is sent, and child nodes are loaded only when a node is expanded.\nThe loading node's id is passed to the server under the parameter name \"node\" to\nenable the server to produce the correct child nodes.</p>\n\n<br><br>\n\n\n<p>To pass extra parameters, an event handler may be attached to the \"beforeload\"\nevent, and the parameters specified in the TreeLoader's baseParams property:</p>\n\n<pre><code>    myTreeLoader.on(\"beforeload\", function(treeLoader, node) {\n        this.baseParams.category = node.attributes.category;\n    }, this);\n</code></pre>\n\n\n<p>This would pass an HTTP parameter called \"category\" to the server containing\nthe value of the Node's \"category\" attribute.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-baseAttrs' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-cfg-baseAttrs' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-cfg-baseAttrs' class='name expandable'>baseAttrs</a><span> : Object</span></div><div class='description'><div class='short'>(optional) An object containing attributes to be added to all nodes\ncreated by this loader. ...</div><div class='long'><p>(optional) An object containing attributes to be added to all nodes\ncreated by this loader. If the attributes sent by the server have an attribute in this object,\nthey take priority.</p>\n</div></div></div><div id='cfg-baseParams' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-cfg-baseParams' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-cfg-baseParams' class='name not-expandable'>baseParams</a><span> : Object</span></div><div class='description'><div class='short'><p>(optional) An object containing properties which\nspecify HTTP parameters to be passed to each request for child nodes.</p>\n</div><div class='long'><p>(optional) An object containing properties which\nspecify HTTP parameters to be passed to each request for child nodes.</p>\n</div></div></div><div id='cfg-clearOnLoad' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-cfg-clearOnLoad' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-cfg-clearOnLoad' class='name expandable'>clearOnLoad</a><span> : Boolean</span></div><div class='description'><div class='short'>(optional) Default to true. ...</div><div class='long'><p>(optional) Default to true. Remove previously existing\nchild nodes before loading.</p>\n<p>Defaults to: <code>true</code></p></div></div></div><div id='cfg-dataUrl' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-cfg-dataUrl' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-cfg-dataUrl' class='name expandable'>dataUrl</a><span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span></div><div class='description'><div class='short'>The URL from which to request a Json string which\nspecifies an array of node definition objects representing the chil...</div><div class='long'><p>The URL from which to request a Json string which\nspecifies an array of node definition objects representing the child nodes\nto be loaded.</p>\n</div></div></div><div id='cfg-directFn' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-cfg-directFn' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-cfg-directFn' class='name not-expandable'>directFn</a><span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a></span></div><div class='description'><div class='short'><p>Function to call when executing a request.</p>\n</div><div class='long'><p>Function to call when executing a request.</p>\n</div></div></div><div id='cfg-nodeParameter' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-cfg-nodeParameter' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-cfg-nodeParameter' class='name expandable'>nodeParameter</a><span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span></div><div class='description'><div class='short'>The name of the parameter sent to the server which contains\nthe identifier of the node. ...</div><div class='long'><p>The name of the parameter sent to the server which contains\nthe identifier of the node. Defaults to <tt>'node'</tt>.</p>\n<p>Defaults to: <code>'node'</code></p></div></div></div><div id='cfg-paramOrder' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-cfg-paramOrder' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-cfg-paramOrder' class='name expandable'>paramOrder</a><span> : Array/<a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span></div><div class='description'><div class='short'>Defaults to undefined. ...</div><div class='long'><p>Defaults to <tt>undefined</tt>. Only used when using directFn.\nSpecifies the params in the order in which they must be passed to the server-side Direct method\nas either (1) an Array of String values, or (2) a String of params delimited by either whitespace,\ncomma, or pipe. For example,\nany of the following would be acceptable:</p>\n\n<pre><code>nodeParameter: 'node',\nparamOrder: ['param1','param2','param3']\nparamOrder: 'node param1 param2 param3'\nparamOrder: 'param1,node,param2,param3'\nparamOrder: 'param1|param2|param|node'\n     </code></pre>\n\n</div></div></div><div id='cfg-paramsAsHash' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-cfg-paramsAsHash' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-cfg-paramsAsHash' class='name expandable'>paramsAsHash</a><span> : Boolean</span></div><div class='description'><div class='short'>Only used when using directFn. ...</div><div class='long'><p>Only used when using directFn.\nSend parameters as a collection of named arguments (defaults to <tt>false</tt>). Providing a\n<tt><a href=\"#!/api/Ext.tree.TreeLoader-cfg-paramOrder\" rel=\"Ext.tree.TreeLoader-cfg-paramOrder\" class=\"docClass\">paramOrder</a></tt> nullifies this configuration.</p>\n<p>Defaults to: <code>false</code></p></div></div></div><div id='cfg-preloadChildren' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-cfg-preloadChildren' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-cfg-preloadChildren' class='name not-expandable'>preloadChildren</a><span> : Boolean</span></div><div class='description'><div class='short'><p>If set to true, the loader recursively loads \"children\" attributes when doing the first load on nodes.</p>\n</div><div class='long'><p>If set to true, the loader recursively loads \"children\" attributes when doing the first load on nodes.</p>\n</div></div></div><div id='cfg-requestMethod' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-cfg-requestMethod' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-cfg-requestMethod' class='name not-expandable'>requestMethod</a><span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span></div><div class='description'><div class='short'><p>The HTTP request method for loading data (defaults to the value of Ext.Ajax.method).</p>\n</div><div class='long'><p>The HTTP request method for loading data (defaults to the value of Ext.Ajax.method).</p>\n</div></div></div><div id='cfg-uiProviders' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-cfg-uiProviders' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-cfg-uiProviders' class='name expandable'>uiProviders</a><span> : Object</span></div><div class='description'><div class='short'>(optional) An object containing properties which\nspecify custom Ext.tree.TreeNodeUI implementations. ...</div><div class='long'><p>(optional) An object containing properties which\nspecify custom <a href=\"#!/api/Ext.tree.TreeNodeUI\" rel=\"Ext.tree.TreeNodeUI\" class=\"docClass\">Ext.tree.TreeNodeUI</a> implementations. If the optional\n<i>uiProvider</i> attribute of a returned child node is a string rather\nthan a reference to a TreeNodeUI implementation, then that string value\nis used as a property name in the uiProviders object.</p>\n<p>Defaults to: <code>{}</code></p></div></div></div><div id='cfg-url' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-cfg-url' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-cfg-url' class='name not-expandable'>url</a><span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span></div><div class='description'><div class='short'><p>Equivalent to <a href=\"#!/api/Ext.tree.TreeLoader-cfg-dataUrl\" rel=\"Ext.tree.TreeLoader-cfg-dataUrl\" class=\"docClass\">dataUrl</a>.</p>\n</div><div class='long'><p>Equivalent to <a href=\"#!/api/Ext.tree.TreeLoader-cfg-dataUrl\" rel=\"Ext.tree.TreeLoader-cfg-dataUrl\" class=\"docClass\">dataUrl</a>.</p>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-constructor' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-method-constructor' target='_blank' class='view-source'>view source</a></div><strong class='new-keyword'>new</strong><a href='#!/api/Ext.tree.TreeLoader-method-constructor' class='name expandable'>Ext.tree.TreeLoader</a>( <span class='pre'>config</span> ) : <a href=\"#!/api/Ext.tree.TreeLoader\" rel=\"Ext.tree.TreeLoader\" class=\"docClass\">Ext.tree.TreeLoader</a></div><div class='description'><div class='short'>Creates a new Treeloader. ...</div><div class='long'><p>Creates a new Treeloader.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>config</span> : Object<div class='sub-desc'><p>A config object containing config properties.</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Ext.tree.TreeLoader\" rel=\"Ext.tree.TreeLoader\" class=\"docClass\">Ext.tree.TreeLoader</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-createNode' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-method-createNode' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-method-createNode' class='name expandable'>createNode</a>( <span class='pre'>attr</span> )</div><div class='description'><div class='short'>Override this function for custom TreeNode node implementation, or to\nmodify the attributes at creation time. ...</div><div class='long'><p>Override this function for custom TreeNode node implementation, or to\nmodify the attributes at creation time.</p>\n\n\n<p>Example:</p>\n\n<pre><code>new <a href=\"#!/api/Ext.tree.TreePanel\" rel=\"Ext.tree.TreePanel\" class=\"docClass\">Ext.tree.TreePanel</a>({\n    ...\n    loader: new <a href=\"#!/api/Ext.tree.TreeLoader\" rel=\"Ext.tree.TreeLoader\" class=\"docClass\">Ext.tree.TreeLoader</a>({\n        url: 'dataUrl',\n        createNode: function(attr) {\n//          Allow consolidation consignments to have\n//          consignments dropped into them.\n            if (attr.isConsolidation) {\n                attr.iconCls = 'x-consol',\n                attr.allowDrop = true;\n            }\n            return Ext.tree.TreeLoader.prototype.createNode.call(this, attr);\n        }\n    }),\n    ...\n});\n</code></pre>\n\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>attr</span> : Object<div class='sub-desc'><p>{Object} The attributes from which to create the new node.</p>\n</div></li></ul></div></div></div><div id='method-enableBubble' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.util.Observable' rel='Ext.util.Observable' class='defined-in docClass'>Ext.util.Observable</a><br/><a href='source/Observable-more.html#Ext-util-Observable-method-enableBubble' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.util.Observable-method-enableBubble' class='name expandable'>enableBubble</a>( <span class='pre'>events</span> )</div><div class='description'><div class='short'>Enables events fired by this Observable to bubble up an owner hierarchy by calling\nthis.getBubbleTarget() if present. ...</div><div class='long'><p>Enables events fired by this Observable to bubble up an owner hierarchy by calling\n<code>this.getBubbleTarget()</code> if present. There is no implementation in the Observable base class.</p>\n\n\n<p>This is commonly used by Ext.Components to bubble events to owner Containers. See Ext.Component.getBubbleTarget. The default\nimplementation in <a href=\"#!/api/Ext.Component\" rel=\"Ext.Component\" class=\"docClass\">Ext.Component</a> returns the Component's immediate owner. But if a known target is required, this can be overridden to\naccess the required target more quickly.</p>\n\n\n<p>Example:</p>\n\n\n<pre><code>Ext.override(<a href=\"#!/api/Ext.form.Field\" rel=\"Ext.form.Field\" class=\"docClass\">Ext.form.Field</a>, {\n    //  Add functionality to Field&#39;s initComponent to enable the change event to bubble\n    initComponent : Ext.form.Field.prototype.initComponent.createSequence(function() {\n        this.enableBubble('change');\n    }),\n\n    //  We know that we want Field&#39;s events to bubble directly to the FormPanel.\n    getBubbleTarget : function() {\n        if (!this.formPanel) {\n            this.formPanel = this.findParentByType('form');\n        }\n        return this.formPanel;\n    }\n});\n\nvar myForm = new Ext.formPanel({\n    title: 'User Details',\n    items: [{\n        ...\n    }],\n    listeners: {\n        change: function() {\n            // Title goes red if form has been modified.\n            myForm.header.setStyle('color', 'red');\n        }\n    }\n});\n</code></pre>\n\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>events</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/Array<div class='sub-desc'><p>The event name to bubble, or an Array of event names.</p>\n</div></li></ul></div></div></div><div id='method-load' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-method-load' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-method-load' class='name expandable'>load</a>( <span class='pre'>node, callback, scope</span> )</div><div class='description'><div class='short'>Load an Ext.tree.TreeNode from the URL specified in the constructor. ...</div><div class='long'><p>Load an <a href=\"#!/api/Ext.tree.TreeNode\" rel=\"Ext.tree.TreeNode\" class=\"docClass\">Ext.tree.TreeNode</a> from the URL specified in the constructor.\nThis is called automatically when a node is expanded, but may be used to reload\na node (or append new children if the <a href=\"#!/api/Ext.tree.TreeLoader-cfg-clearOnLoad\" rel=\"Ext.tree.TreeLoader-cfg-clearOnLoad\" class=\"docClass\">clearOnLoad</a> option is false.)</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>node</span> : <a href=\"#!/api/Ext.tree.TreeNode\" rel=\"Ext.tree.TreeNode\" class=\"docClass\">Ext.tree.TreeNode</a><div class='sub-desc'>\n</div></li><li><span class='pre'>callback</span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a><div class='sub-desc'><p>Function to call after the node has been loaded. The\nfunction is passed the TreeNode which was requested to be loaded.</p>\n</div></li><li><span class='pre'>scope</span> : Object<div class='sub-desc'><p>The scope (<code>this</code> reference) in which the callback is executed.\ndefaults to the loaded TreeNode.</p>\n</div></li></ul></div></div></div><div id='method-relayEvents' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.util.Observable' rel='Ext.util.Observable' class='defined-in docClass'>Ext.util.Observable</a><br/><a href='source/Observable-more.html#Ext-util-Observable-method-relayEvents' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.util.Observable-method-relayEvents' class='name expandable'>relayEvents</a>( <span class='pre'>o, events</span> )</div><div class='description'><div class='short'>Relays selected events from the specified Observable as if the events were fired by this. ...</div><div class='long'><p>Relays selected events from the specified Observable as if the events were fired by <tt><b>this</b></tt>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>o</span> : Object<div class='sub-desc'><p>The Observable whose events this object is to relay.</p>\n</div></li><li><span class='pre'>events</span> : Array<div class='sub-desc'><p>Array of event names to relay.</p>\n</div></li></ul></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-event'>Events</h3><div class='subsection'><div id='event-beforeload' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-event-beforeload' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-event-beforeload' class='name expandable'>beforeload</a>( <span class='pre'>This, node, callback</span> )</div><div class='description'><div class='short'>Fires before a network request is made to retrieve the Json text which specifies a node's children. ...</div><div class='long'><p>Fires before a network request is made to retrieve the Json text which specifies a node's children.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>This</span> : Object<div class='sub-desc'><p>TreeLoader object.</p>\n</div></li><li><span class='pre'>node</span> : Object<div class='sub-desc'><p>The <a href=\"#!/api/Ext.tree.TreeNode\" rel=\"Ext.tree.TreeNode\" class=\"docClass\">Ext.tree.TreeNode</a> object being loaded.</p>\n</div></li><li><span class='pre'>callback</span> : Object<div class='sub-desc'><p>The callback function specified in the <a href=\"#!/api/Ext.tree.TreeLoader-method-load\" rel=\"Ext.tree.TreeLoader-method-load\" class=\"docClass\">load</a> call.</p>\n</div></li></ul></div></div></div><div id='event-load' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-event-load' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-event-load' class='name expandable'>load</a>( <span class='pre'>This, node, response</span> )</div><div class='description'><div class='short'>Fires when the node has been successfuly loaded. ...</div><div class='long'><p>Fires when the node has been successfuly loaded.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>This</span> : Object<div class='sub-desc'><p>TreeLoader object.</p>\n</div></li><li><span class='pre'>node</span> : Object<div class='sub-desc'><p>The <a href=\"#!/api/Ext.tree.TreeNode\" rel=\"Ext.tree.TreeNode\" class=\"docClass\">Ext.tree.TreeNode</a> object being loaded.</p>\n</div></li><li><span class='pre'>response</span> : Object<div class='sub-desc'><p>The response object containing the data from the server.</p>\n</div></li></ul></div></div></div><div id='event-loadexception' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.tree.TreeLoader'>Ext.tree.TreeLoader</span><br/><a href='source/TreeLoader.html#Ext-tree-TreeLoader-event-loadexception' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.tree.TreeLoader-event-loadexception' class='name expandable'>loadexception</a>( <span class='pre'>This, node, response</span> )</div><div class='description'><div class='short'>Fires if the network request failed. ...</div><div class='long'><p>Fires if the network request failed.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>This</span> : Object<div class='sub-desc'><p>TreeLoader object.</p>\n</div></li><li><span class='pre'>node</span> : Object<div class='sub-desc'><p>The <a href=\"#!/api/Ext.tree.TreeNode\" rel=\"Ext.tree.TreeNode\" class=\"docClass\">Ext.tree.TreeNode</a> object being loaded.</p>\n</div></li><li><span class='pre'>response</span> : Object<div class='sub-desc'><p>The response object containing the data from the server.</p>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{},"linenr":7,"inheritable":null,"singleton":false,"html_meta":{},"subclasses":[],"mixins":[],"aliases":{},"members":{"cfg":[{"meta":{},"owner":"Ext.tree.TreeLoader","name":"baseAttrs","id":"cfg-baseAttrs","tagname":"cfg"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"baseParams","id":"cfg-baseParams","tagname":"cfg"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"clearOnLoad","id":"cfg-clearOnLoad","tagname":"cfg"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"dataUrl","id":"cfg-dataUrl","tagname":"cfg"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"directFn","id":"cfg-directFn","tagname":"cfg"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"nodeParameter","id":"cfg-nodeParameter","tagname":"cfg"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"paramOrder","id":"cfg-paramOrder","tagname":"cfg"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"paramsAsHash","id":"cfg-paramsAsHash","tagname":"cfg"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"preloadChildren","id":"cfg-preloadChildren","tagname":"cfg"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"requestMethod","id":"cfg-requestMethod","tagname":"cfg"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"uiProviders","id":"cfg-uiProviders","tagname":"cfg"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"url","id":"cfg-url","tagname":"cfg"}],"property":[],"css_mixin":[],"method":[{"meta":{},"owner":"Ext.tree.TreeLoader","name":"constructor","id":"method-constructor","tagname":"method"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"createNode","id":"method-createNode","tagname":"method"},{"meta":{},"owner":"Ext.util.Observable","name":"enableBubble","id":"method-enableBubble","tagname":"method"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"load","id":"method-load","tagname":"method"},{"meta":{},"owner":"Ext.util.Observable","name":"relayEvents","id":"method-relayEvents","tagname":"method"}],"event":[{"meta":{},"owner":"Ext.tree.TreeLoader","name":"beforeload","id":"event-beforeload","tagname":"event"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"load","id":"event-load","tagname":"event"},{"meta":{},"owner":"Ext.tree.TreeLoader","name":"loadexception","id":"event-loadexception","tagname":"event"}],"css_var":[]},"alternateClassNames":[],"override":null,"component":false,"statics":{"cfg":[],"property":[],"css_mixin":[],"method":[],"event":[],"css_var":[]},"inheritdoc":null,"private":null,"superclasses":["Ext.util.Observable"],"files":[{"href":"TreeLoader.html#Ext-tree-TreeLoader","filename":"TreeLoader.js"}],"name":"Ext.tree.TreeLoader","uses":[],"mixedInto":[],"id":"class-Ext.tree.TreeLoader","tagname":"class","requires":[],"enum":null});