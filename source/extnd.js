// override is for a bug introduced with Ext 2.2.1 with tooltips
Ext.override(Ext.Button, {
    beforeDestroy: function(){
        if(this.rendered){
            var btnEl = this.el.child(this.buttonSelector);
            if(btnEl){
                if(typeof this.tooltip == 'object'){
                    Ext.QuickTips.unregister(btnEl);
                }
                btnEl.removeAllListeners();
            }
        }
        if(this.menu){
            Ext.destroy(this.menu);
        }
    }
});


Ext.namespace("Ext.nd", "Ext.nd.form", "Ext.nd.data", "Ext.nd.util");

Ext.nd.version = 'pre-release 2 - Beta 2';

Ext.nd.getBlankImageUrl = function() {
	return this.extndUrl + "resources/images/s.gif";
};

Ext.nd.init = function(config) {
	Ext.apply(this, config);
	Ext.BLANK_IMAGE_URL = this.getBlankImageUrl();
};

/**
 * @class Ext.nd.util.addIFrame
 * @cfg {String} documentLoadingWindowTitle The loading text to display as the document is loading. 
 * @cfg {String} documentUntitledWindowTitle The text to title text to display if the loaded document does not have a window title defined.
 * @cfg {Boolean} useDocumentWindowTitle If set to true then an attempt will be made to get and set the title to the document's window title.
 * @cfg {String/Componet} target Where the iframe should load
 * @singleton
 */
Ext.nd.util.addIFrame = function(config) {
   
	var target;
    var targetPanel = false; // if the target is an Ext container
	var targetDiv = false; // if the target is simply a div
    var panel = false; // the panel that will contain the iframe
	var iframe = false; // the iframe

    // first, determine the target
    // try and see if it is a component first
    target = (config.target.getXType) ? config.target : Ext.getCmp(config.target);
    // if it is not then see if it is an id or element in the dom
    target = (target && target.getXType) ? target : Ext.get(target);
            
	// if the add method exists then the 'target' is some kind of panel
	// otherwise, it might just be a div on the page
	if (target.add) {

		// ok, target is a panel so store a reference to it
		targetPanel = target;

		// checking to see if a panel with this component id (not dom id)
		// already exists in the 'target' panel
		// if it does already exist, we'lll just show that panel later in the code
        if (targetPanel.items) {
            panel = targetPanel.items.get(config.id);
        }

	} else {
		// the target passed in is not an Ext panel so it must be a div
		// so we will add the iframe directly to this div
		targetDiv = Ext.get(target);
	}
    
    // check for the panel that will have the iframe
    if (!panel) {

        // the id of the iframe
        var ifId = 'if-' + config.id;

        // our config options for the panel
        var panelConfig = Ext.apply({
            html: "<iframe id='" + ifId + "' src='" + config.url + "' frameBorder='0' width='100%' height='100%'/>",
            title : config.title || config.documentLoadingWindowTitle,
            layout : 'fit',
            id : config.id,
            closable : true
        }, config.targetDefaults);
                    


		// if target is a panel, add the iframe to the panel
		if (targetPanel) {

			// add the panel
			panel = targetPanel.add(panelConfig);

            // call doLayout so we can now see this
            if (targetPanel.doLayout) {
                targetPanel.doLayout();
            }

            // This is a hack to fix the memory issues that occur when opening and
            // closing stuff within iFrames
            targetPanel.on('beforeremove', function(container, panel) {
                var iFrame = Ext.DomQuery.selectNode('iframe',panel.body.dom);
                if (iFrame) {
                    if (iFrame.src) {
                        iFrame.src = "javascript:false";
                    }
                    Ext.removeNode(iFrame);    
                }
            })            
           
		} else {
            // target is not a panel so must be dealing with a div element
            // check to make sure it exists before adding
            if (targetDiv) {
                panel = new Ext.Panel(panelConfig);
            }
        }


        // now show the panel (not sure if this is needed)
        if (panel.show){
            panel.show();    
        }


        // this block sets the ownerCt attribute of the iframe to the panel 
        // and sets the panels title after the iframe loads
        // if there is an uiView property, it is set as well
        
        var dom = Ext.get(ifId).dom;
        var event = Ext.isIE ? 'onreadystatechange' : 'onload';
        dom[event] = (function() {
            var cd = this.contentWindow || window.frames[this.name];
            try {
                cd.ownerCt = panel;
                if (config.uiView) {
                    cd.uiView = config.uiView;
                }
                if (targetPanel) {
                    cd.target = targetPanel;
                }
            } catch (e) {
                // not doing anything if an error
                // an error usually means a x-domain security violation
            }
            
            // replace the panel's title with the the window title from the iframe
            // if the useDocumentWindowTitle is set to true
            if (config.useDocumentWindowTitle) {
                try {
                    var title = cd.document.title;
                    if (title != "") {
                        if (config.documentWindowTitleMaxLength != -1) {
                            panel.setTitle(Ext.util.Format.ellipsis(title, config.documentWindowTitleMaxLength));    
                        } else {
                            panel.setTitle(title);
                        }
                    
                    } else {
                        // there wasn't a title
                        if (panel.title != config.title && config.title != config.documentLoadingWindowTitle) {
                            panel.setTitle(config.documentUntitledWindowTitle); 
                        }
                    }

                } catch (e) {
                    // there was an error getting the iframe's title maybe
                    if (panel.title != config.title && panel.title != config.documentLoadingWindowTitle) {
                        panel.setTitle(config.documentUntitledWindowTitle); 
                    }
                }
            } // eo if (config.useDocumentWindowTitle)

        }).createDelegate(dom);


	} else { // we've already opened this panel
		if (panel.show) {
			panel.show();
		}
	}
}

Ext.nd.util.doLayoutAndShow = function(panel) {
	// all component's owner Ext.Container should have a doLayout 
    // but check just in case
	if (panel.ownerCt && panel.ownerCt.doLayout) {
		panel.ownerCt.doLayout();
	}
	// and if the component has a show method, 
    // call it so this newly added component is shown
	if (panel.show) {
		panel.show();
	}

}
