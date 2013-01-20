Ext.data.JsonP.Ext_Version({"parentMixins":[],"extends":null,"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/Version.html#Ext-Version' target='_blank'>Version.js</a></div></pre><div class='doc-contents'><p>A utility class that wrap around a string version number and provide convenient\nmethod to perform comparison. See also: <a href=\"#!/api/Ext.Version-static-method-compare\" rel=\"Ext.Version-static-method-compare\" class=\"docClass\">compare</a>. Example:</p>\n\n<pre><code>var version = new <a href=\"#!/api/Ext.Version\" rel=\"Ext.Version\" class=\"docClass\">Ext.Version</a>('1.0.2beta');\nconsole.log(\"Version is \" + version); // Version is 1.0.2beta\n\nconsole.log(version.getMajor()); // 1\nconsole.log(version.getMinor()); // 0\nconsole.log(version.getPatch()); // 2\nconsole.log(version.getBuild()); // 0\nconsole.log(version.getRelease()); // beta\n\nconsole.log(version.isGreaterThan('1.0.1')); // True\nconsole.log(version.isGreaterThan('1.0.2alpha')); // True\nconsole.log(version.isGreaterThan('1.0.2RC')); // False\nconsole.log(version.isGreaterThan('1.0.2')); // False\nconsole.log(version.isLessThan('1.0.2')); // True\n\nconsole.log(version.match(1.0)); // True\nconsole.log(version.match('1.0.2')); // True\n</code></pre>\n</div><div class='members'><div class='members-section'><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div class='definedBy'>Defined By</div><h4 class='members-subtitle'>Instance Methods</h3><div id='method-constructor' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-constructor' target='_blank' class='view-source'>view source</a></div><strong class='new-keyword'>new</strong><a href='#!/api/Ext.Version-method-constructor' class='name expandable'>Ext.Version</a>( <span class='pre'>version</span> ) : <a href=\"#!/api/Ext.Version\" rel=\"Ext.Version\" class=\"docClass\">Ext.Version</a></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>version</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><div class='sub-desc'><p>The version number in the following standard format:</p>\n\n<pre><code>major[.minor[.patch[.build[release]]]]\n</code></pre>\n\n<p>Examples:</p>\n\n<pre><code>1.0\n1.2.3beta\n1.2.3.4RC\n</code></pre>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Ext.Version\" rel=\"Ext.Version\" class=\"docClass\">Ext.Version</a></span><div class='sub-desc'><p>this</p>\n</div></li></ul></div></div></div><div id='method-equals' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-equals' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-equals' class='name expandable'>equals</a>( <span class='pre'>target</span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></div><div class='description'><div class='short'>Returns whether this version equals to the supplied argument ...</div><div class='long'><p>Returns whether this version equals to the supplied argument</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>target</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><div class='sub-desc'><p>The version to compare with</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'><p>True if this version equals to the target, false otherwise</p>\n</div></li></ul></div></div></div><div id='method-getBuild' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-getBuild' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-getBuild' class='name expandable'>getBuild</a>( <span class='pre'></span> ) : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></div><div class='description'><div class='short'>Returns the build component value ...</div><div class='long'><p>Returns the build component value</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></span><div class='sub-desc'><p>build</p>\n</div></li></ul></div></div></div><div id='method-getMajor' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-getMajor' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-getMajor' class='name expandable'>getMajor</a>( <span class='pre'></span> ) : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></div><div class='description'><div class='short'>Returns the major component value ...</div><div class='long'><p>Returns the major component value</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></span><div class='sub-desc'><p>major</p>\n</div></li></ul></div></div></div><div id='method-getMinor' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-getMinor' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-getMinor' class='name expandable'>getMinor</a>( <span class='pre'></span> ) : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></div><div class='description'><div class='short'>Returns the minor component value ...</div><div class='long'><p>Returns the minor component value</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></span><div class='sub-desc'><p>minor</p>\n</div></li></ul></div></div></div><div id='method-getPatch' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-getPatch' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-getPatch' class='name expandable'>getPatch</a>( <span class='pre'></span> ) : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></div><div class='description'><div class='short'>Returns the patch component value ...</div><div class='long'><p>Returns the patch component value</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></span><div class='sub-desc'><p>patch</p>\n</div></li></ul></div></div></div><div id='method-getRelease' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-getRelease' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-getRelease' class='name expandable'>getRelease</a>( <span class='pre'></span> ) : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></div><div class='description'><div class='short'>Returns the release component value ...</div><div class='long'><p>Returns the release component value</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></span><div class='sub-desc'><p>release</p>\n</div></li></ul></div></div></div><div id='method-getShortVersion' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-getShortVersion' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-getShortVersion' class='name expandable'>getShortVersion</a>( <span class='pre'></span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></div><div class='description'><div class='short'>Returns shortVersion version without dots and release ...</div><div class='long'><p>Returns shortVersion version without dots and release</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-gt' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-gt' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-gt' class='name expandable'>gt</a>( <span class='pre'>target</span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></div><div class='description'><div class='short'>Convenient alias to isGreaterThan ...</div><div class='long'><p>Convenient alias to <a href=\"#!/api/Ext.Version-method-isGreaterThan\" rel=\"Ext.Version-method-isGreaterThan\" class=\"docClass\">isGreaterThan</a></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>target</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-gtEq' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-gtEq' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-gtEq' class='name expandable'>gtEq</a>( <span class='pre'>target</span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></div><div class='description'><div class='short'>Convenient alias to isGreaterThanOrEqual ...</div><div class='long'><p>Convenient alias to <a href=\"#!/api/Ext.Version-method-isGreaterThanOrEqual\" rel=\"Ext.Version-method-isGreaterThanOrEqual\" class=\"docClass\">isGreaterThanOrEqual</a></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>target</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-isGreaterThan' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-isGreaterThan' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-isGreaterThan' class='name expandable'>isGreaterThan</a>( <span class='pre'>target</span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></div><div class='description'><div class='short'>Returns whether this version if greater than the supplied argument ...</div><div class='long'><p>Returns whether this version if greater than the supplied argument</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>target</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><div class='sub-desc'><p>The version to compare with</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'><p>True if this version if greater than the target, false otherwise</p>\n</div></li></ul></div></div></div><div id='method-isGreaterThanOrEqual' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-isGreaterThanOrEqual' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-isGreaterThanOrEqual' class='name expandable'>isGreaterThanOrEqual</a>( <span class='pre'>target</span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></div><div class='description'><div class='short'>Returns whether this version if greater than or equal to the supplied argument ...</div><div class='long'><p>Returns whether this version if greater than or equal to the supplied argument</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>target</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><div class='sub-desc'><p>The version to compare with</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'><p>True if this version if greater than or equal to the target, false otherwise</p>\n</div></li></ul></div></div></div><div id='method-isLessThan' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-isLessThan' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-isLessThan' class='name expandable'>isLessThan</a>( <span class='pre'>target</span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></div><div class='description'><div class='short'>Returns whether this version if smaller than the supplied argument ...</div><div class='long'><p>Returns whether this version if smaller than the supplied argument</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>target</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><div class='sub-desc'><p>The version to compare with</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'><p>True if this version if smaller than the target, false otherwise</p>\n</div></li></ul></div></div></div><div id='method-isLessThanOrEqual' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-isLessThanOrEqual' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-isLessThanOrEqual' class='name expandable'>isLessThanOrEqual</a>( <span class='pre'>target</span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></div><div class='description'><div class='short'>Returns whether this version if less than or equal to the supplied argument ...</div><div class='long'><p>Returns whether this version if less than or equal to the supplied argument</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>target</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><div class='sub-desc'><p>The version to compare with</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'><p>True if this version if less than or equal to the target, false otherwise</p>\n</div></li></ul></div></div></div><div id='method-lt' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-lt' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-lt' class='name expandable'>lt</a>( <span class='pre'>target</span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></div><div class='description'><div class='short'>Convenient alias to isLessThan ...</div><div class='long'><p>Convenient alias to <a href=\"#!/api/Ext.Version-method-isLessThan\" rel=\"Ext.Version-method-isLessThan\" class=\"docClass\">isLessThan</a></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>target</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-ltEq' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-ltEq' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-ltEq' class='name expandable'>ltEq</a>( <span class='pre'>target</span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></div><div class='description'><div class='short'>Convenient alias to isLessThanOrEqual ...</div><div class='long'><p>Convenient alias to <a href=\"#!/api/Ext.Version-method-isLessThanOrEqual\" rel=\"Ext.Version-method-isLessThanOrEqual\" class=\"docClass\">isLessThanOrEqual</a></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>target</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-match' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-match' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-match' class='name expandable'>match</a>( <span class='pre'>target</span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></div><div class='description'><div class='short'>Returns whether this version matches the supplied argument. ...</div><div class='long'><p>Returns whether this version matches the supplied argument. Example:</p>\n\n<pre><code>var version = new <a href=\"#!/api/Ext.Version\" rel=\"Ext.Version\" class=\"docClass\">Ext.Version</a>('1.0.2beta');\nconsole.log(version.match(1)); // True\nconsole.log(version.match(1.0)); // True\nconsole.log(version.match('1.0.2')); // True\nconsole.log(version.match('1.0.2RC')); // False\n</code></pre>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>target</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><div class='sub-desc'><p>The version to compare with</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'><p>True if this version matches the target, false otherwise</p>\n</div></li></ul></div></div></div><div id='method-toArray' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-toArray' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-toArray' class='name expandable'>toArray</a>( <span class='pre'></span> ) : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a>[]</div><div class='description'><div class='short'>Returns this format: [major, minor, patch, build, release]. ...</div><div class='long'><p>Returns this format: [major, minor, patch, build, release]. Useful for comparison</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a>[]</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-toString' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-toString' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-toString' class='name expandable'>toString</a>( <span class='pre'></span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><strong class='private signature' >private</strong></div><div class='description'><div class='short'>Override the native toString method ...</div><div class='long'><p>Override the native toString method</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'><p>version</p>\n</div></li></ul></div></div></div><div id='method-valueOf' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-method-valueOf' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-method-valueOf' class='name expandable'>valueOf</a>( <span class='pre'></span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><strong class='private signature' >private</strong></div><div class='description'><div class='short'>Override the native valueOf method ...</div><div class='long'><p>Override the native valueOf method</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'><p>version</p>\n</div></li></ul></div></div></div></div><div class='subsection'><div class='definedBy'>Defined By</div><h4 class='members-subtitle'>Static Methods</h3><div id='static-method-compare' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-static-method-compare' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-static-method-compare' class='name expandable'>compare</a>( <span class='pre'>current, target</span> ) : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><strong class='static signature' >static</strong></div><div class='description'><div class='short'>Compare 2 specified versions, starting from left to right. ...</div><div class='long'><p>Compare 2 specified versions, starting from left to right. If a part contains special version strings,\nthey are handled in the following order:\n'dev' &lt; 'alpha' = 'a' &lt; 'beta' = 'b' &lt; 'RC' = 'rc' &lt; '#' &lt; 'pl' = 'p' &lt; 'anything else'</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>current</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The current version to compare to</p>\n</div></li><li><span class='pre'>target</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The target version to compare to</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></span><div class='sub-desc'><p>Returns -1 if the current version is smaller than the target version, 1 if greater, and 0 if they're equivalent</p>\n</div></li></ul></div></div></div><div id='static-method-getComponentValue' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Version'>Ext.Version</span><br/><a href='source/Version.html#Ext-Version-static-method-getComponentValue' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Version-static-method-getComponentValue' class='name expandable'>getComponentValue</a>( <span class='pre'>value</span> ) : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><strong class='static signature' >static</strong></div><div class='description'><div class='short'>Converts a version component to a comparable value ...</div><div class='long'><p>Converts a version component to a comparable value</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'><p>The value to convert</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{"author":["Jacky Nguyen <jacky@sencha.com>"],"docauthor":["Jacky Nguyen <jacky@sencha.com>"]},"linenr":4,"inheritable":null,"singleton":false,"html_meta":{"author":null,"docauthor":null},"subclasses":[],"mixins":[],"aliases":{},"members":{"cfg":[],"property":[],"css_mixin":[],"method":[{"meta":{},"owner":"Ext.Version","name":"constructor","id":"method-constructor","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"equals","id":"method-equals","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"getBuild","id":"method-getBuild","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"getMajor","id":"method-getMajor","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"getMinor","id":"method-getMinor","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"getPatch","id":"method-getPatch","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"getRelease","id":"method-getRelease","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"getShortVersion","id":"method-getShortVersion","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"gt","id":"method-gt","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"gtEq","id":"method-gtEq","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"isGreaterThan","id":"method-isGreaterThan","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"isGreaterThanOrEqual","id":"method-isGreaterThanOrEqual","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"isLessThan","id":"method-isLessThan","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"isLessThanOrEqual","id":"method-isLessThanOrEqual","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"lt","id":"method-lt","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"ltEq","id":"method-ltEq","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"match","id":"method-match","tagname":"method"},{"meta":{},"owner":"Ext.Version","name":"toArray","id":"method-toArray","tagname":"method"},{"meta":{"private":true},"owner":"Ext.Version","name":"toString","id":"method-toString","tagname":"method"},{"meta":{"private":true},"owner":"Ext.Version","name":"valueOf","id":"method-valueOf","tagname":"method"}],"event":[],"css_var":[]},"alternateClassNames":[],"override":null,"component":false,"statics":{"cfg":[],"property":[],"css_mixin":[],"method":[{"meta":{"static":true},"owner":"Ext.Version","name":"compare","id":"static-method-compare","tagname":"method"},{"meta":{"static":true},"owner":"Ext.Version","name":"getComponentValue","id":"static-method-getComponentValue","tagname":"method"}],"event":[],"css_var":[]},"inheritdoc":null,"private":null,"superclasses":[],"files":[{"href":"Version.html#Ext-Version","filename":"Version.js"}],"name":"Ext.Version","uses":[],"mixedInto":[],"id":"class-Ext.Version","tagname":"class","requires":[],"enum":null});