Ext.data.JsonP.Ext_nd({"parentMixins":[],"extends":null,"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/extnd.html#Ext-nd' target='_blank'>extnd.js</a></div></pre><div class='doc-contents'><p><a href=\"#!/api/Ext.nd\" rel=\"Ext.nd\" class=\"docClass\">Ext.nd</a> core utilities and functions.</p>\n\n<p><a href=\"#!/api/Ext.nd\" rel=\"Ext.nd\" class=\"docClass\">Ext.nd</a> is used in IBM Lotus Domino applications and the code is usually written in the 'HTML Head Content' and the\n'JS Header' sections of a Domino Page or Form.</p>\n\n<p>Below is an example of what the 'HTHML Head Content' looks like in the main.html page of the Tasks.nsf database:</p>\n\n<pre><code>    ﻿thisWebDbName := @WebDbName;\n    extUrl := @GetProfileField(\"Ext.nd.Profile\";\"extUrl\";@ServerName);\n    extndUrl := @GetProfileField(\"Ext.nd.Profile\";\"extndUrl\";@ServerName);\n    mode := @If(@UrlQueryString(\"debug\") = \"true\"; \"-debug\"; \"\");\n    unid := @If(@IsNewDoc;\"\";@Text(@DocumentUniqueID));\n    editMode := @If(@IsDocBeingEdited;\"true\";\"false\");\n\n\n    \"&lt;!-- Ext JS library --&gt;\" + @NewLine +\n    \"&lt;script type='text/javascript' src='\" + extUrl + \"adapter/ext/ext-base.js'&gt;&lt;/script&gt;\" + @NewLine +\n    \"&lt;script type='text/javascript' src='\" + extUrl + \"ext-all\" + mode + \".js'&gt;&lt;/script&gt;\" + @NewLine +\n\n    \"&lt;!-- <a href=\"#!/api/Ext.nd\" rel=\"Ext.nd\" class=\"docClass\">Ext.nd</a> JS library --&gt;\" + @NewLine +\n    \"&lt;script type='text/javascript' src='\" + extndUrl + \"extnd-all\" + mode + \".js'&gt;&lt;/script&gt;\" + @NewLine +\n    \"&lt;script type='text/javascript' src='\" + extndUrl + \"Session.js?OpenAgent&amp;db=\" + thisWebDbName + \"'&gt;&lt;/script&gt;\" + @NewLine +\n    \"&lt;script type='text/javascript' src='\" + extndUrl + \"UIDocument.js?OpenAgent&amp;db=\" + thisWebDbName + \"&amp;unid=\" + unid + \"&amp;editmode=\" + editMode + \"'&gt;&lt;/script&gt;\" + @NewLine +\n\n    \"&lt;!-- App JS code --&gt;\" + @NewLine +\n    \"&lt;script type='text/javascript' src='/\" + thisWebDbName + \"/overrides.js'&gt;&lt;/script&gt;\" + @NewLine +\n    \"&lt;script type='text/javascript' src='/\" + thisWebDbName + \"/taskHandler.js'&gt;&lt;/script&gt;\" + @NewLine +\n\n\n    \"&lt;link rel='stylesheet' type='text/css' href='\" + extUrl + \"resources/css/ext-all.css' /&gt;\" + @NewLine +\n    \"&lt;link rel='stylesheet' type='text/css' href='\" + extndUrl + \"resources/css/domino.css' /&gt;\"\n</code></pre>\n\n<p>And this is what is in the JS Header:</p>\n\n<pre><code>    ﻿var ExtndTasks = function() {\n\n        return {\n            init : function(){\n                this.ui = new <a href=\"#!/api/Ext.nd.DominoUI\" rel=\"Ext.nd.DominoUI\" class=\"docClass\">Ext.nd.DominoUI</a>({\n                    uiOutline : {\n                        outlineName: 'mainOL',\n                        viewDefaults : {\n                            emptyText: 'No Tasks Found',\n                            stripeRows : true\n                        }\n                    },\n                    uiView : {\n                        viewName: 'Tasks\\\\All',\n                        stripeRows : true,\n                        listeners : {\n                            'open' : function(uiview) {\n                                alert('view has been opened');\n                            },\n                            'beforeaddtofolder' : function(uiview, target) {\n                                if (target == \"Low\") {\n                                    alert('you can not drag documents from the Tasks All view into the Low folder');\n                                    return false;\n                                }\n                            },\n                            'beforeopendocument' : function(uiview) {\n                                var doc = uiview.getSelectedDocument();\n                                if (doc.data.Status == 'Complete') {\n                                    alert('Sorry, completed documents cannot be opened from this view.');\n                                    return false;\n                                }\n                            }\n                        }\n                    }\n                });\n            } // init\n        } // return\n\n    }();\n\n    ﻿if (typeof Ext == 'undefined') {\n\n        var href = location.href;\n        var locNSF = href.lastIndexOf(\".nsf\");\n        location.href = href.substring(0, locNSF) + \".nsf/Ext.nd.Profile?OpenForm\";\n\n    } else {\n\n        Ext.onReady(ExtndTasks.init, ExtndTasks, true);\n\n    }\n</code></pre>\n\n<p>The <a href=\"#!/api/Ext.nd.DominoUI\" rel=\"Ext.nd.DominoUI\" class=\"docClass\">Ext.nd.DominoUI</a> class is a class that creates a UI very similar to a typical Lotus Notes application and in many\ncases is a good starting point when web-enabling your Lotus Notes applications.  However, keep in mind that the various\nwidgets can be used in any type of layout you wish so do not limit yourself to always just using the <a href=\"#!/api/Ext.nd.DominoUI\" rel=\"Ext.nd.DominoUI\" class=\"docClass\">Ext.nd.DominoUI</a>\n\"convenience\" class to build your UIs.  Think out of the box!</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-ACCESS_LEVELS' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd'>Ext.nd</span><br/><a href='source/Session.html#Ext-nd-property-ACCESS_LEVELS' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd-property-ACCESS_LEVELS' class='name not-expandable'>ACCESS_LEVELS</a><span> : Object</span></div><div class='description'><div class='short'><p>The valid access levels to a NotesDatabase</p>\n</div><div class='long'><p>The valid access levels to a NotesDatabase</p>\n</div></div></div><div id='property-version' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd'>Ext.nd</span><br/><a href='source/extnd.html#Ext-nd-property-version' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd-property-version' class='name not-expandable'>version</a><span> : Object</span></div><div class='description'><div class='short'><p>The version of Extnd</p>\n</div><div class='long'><p>The version of Extnd</p>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-getBlankImageUrl' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd'>Ext.nd</span><br/><a href='source/extnd.html#Ext-nd-method-getBlankImageUrl' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd-method-getBlankImageUrl' class='name expandable'>getBlankImageUrl</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>calculates the Ext.BLANK_IMAGE_URL based on the extndUrl property ...</div><div class='long'><p>calculates the Ext.BLANK_IMAGE_URL based on the extndUrl property</p>\n</div></div></div><div id='method-init' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.nd'>Ext.nd</span><br/><a href='source/extnd.html#Ext-nd-method-init' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.nd-method-init' class='name expandable'>init</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>applies any configs and sets the Ext.BLANK_IMAGE_URL. ...</div><div class='long'><p>applies any configs and sets the Ext.BLANK_IMAGE_URL.  This is done automatically for you if you make a call\nto the Session.js agent</p>\n</div></div></div></div></div></div></div>","meta":{},"linenr":1,"inheritable":null,"singleton":true,"html_meta":{},"subclasses":[],"mixins":[],"aliases":{},"members":{"cfg":[],"property":[{"meta":{},"owner":"Ext.nd","name":"ACCESS_LEVELS","id":"property-ACCESS_LEVELS","tagname":"property"},{"meta":{},"owner":"Ext.nd","name":"version","id":"property-version","tagname":"property"}],"css_mixin":[],"method":[{"meta":{},"owner":"Ext.nd","name":"getBlankImageUrl","id":"method-getBlankImageUrl","tagname":"method"},{"meta":{},"owner":"Ext.nd","name":"init","id":"method-init","tagname":"method"}],"event":[],"css_var":[]},"alternateClassNames":[],"override":null,"component":false,"statics":{"cfg":[],"property":[],"css_mixin":[],"method":[],"event":[],"css_var":[]},"inheritdoc":null,"private":null,"superclasses":[],"files":[{"href":"extnd.html#Ext-nd","filename":"extnd.js"}],"name":"Ext.nd","uses":[],"mixedInto":[],"id":"class-Ext.nd","tagname":"class","requires":[],"enum":null});