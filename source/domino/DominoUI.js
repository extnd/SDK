/**
 * @class Ext.nd.DominoUI
 *        <p>
 *        Here's an example showing the creation of a typical DominoUI:
 *        </p>
 * 
 * <pre><code>
  new Ext.nd.DominoUI({
      uiOutline: {
          outlineName: &quot;mainOL&quot;
      },
      uiView: {
          viewName: &quot;Requests&quot;,
          viewTitle: &quot;Requests&quot;
      }
  });
  </code></pre>
 * 
 * @cfg {Object} uiOutline A {@link Ext.nd.UIOutline} config object
 * @cfg {Object} uiView A {@link Ext.nd.UIView} config object
 * @constructor Create an integrated domino interface, with a view and an outline
 * @param {Object} config Configuration options
 * 
 */
Ext.nd.DominoUI = function(config) {

    // Set any config params passed in to override defaults
    Ext.apply(this, config);

    // init the DominoUI
    this.init();

    // load any links
    this.loadLink();

}; // end Ext.nd.DominoUI

Ext.nd.DominoUI.prototype = {
    uiView: {
        viewName: '',
        viewUrl: ''
    },
    uiOutline: {
        outlineName: '',
        outlineUrl: ''
    },
    viewOpeningTitle: 'Opening...',

    init: function() {
        // create the UI
        // creates outlinePanel, viewPanel, statusPanel
        this.createDominoUI();
    },

    // private
    createDominoUI: function() {
        
        // west/outline - be sure to include the defaults property
        // so that for each view opened, the target property defaults
        // will be applied
        
        var west = Ext.apply({
                region: 'west',
                id: 'xnd-outline-panel',
                xtype: 'xnd-uioutline',
                target: 'xnd-center-panel',
                viewTarget: 'xnd-grid-panel',
                collapsible: true,
                title: Ext.nd.Session.currentDatabase.title,
                split: true,
                width: 200
            }, this.uiOutline);
            
        
        // center/view area    
        var center = {
                region: 'center',
                id: 'xnd-center-panel',
                xtype: 'tabpanel',
                target: 'xnd-center-panel',
                defaults : {
                    target : 'xnd-center-panel',
                    border : true
                },
                enableTabScroll: true,
                activeTab: 0,
                items: [Ext.apply({
                        id: 'xnd-grid-panel',
                        layout: 'fit',
                        xtype: 'xnd-uiview',
                        target: 'xnd-center-panel',
                        closable: false
                    }, this.uiView)
                ]};
                
        this.viewport = new Ext.Viewport({
            layout: 'border',
            id: 'extnd-viewport',
            items: [west, center]
        });

        // include these since the alpha and beta 1x code
        // included these and some developers have custom
        // code that depends on these being defined
        
        this.outlinePanel = Ext.getCmp('xnd-outline-panel');
        this.view = Ext.getCmp('xnd-grid-panel');
        this.tabPanel = Ext.getCmp('xnd-center-panel');
    },

    // leave for backwards capability since this was included in beta 1x code
    loadLink: function() {

        // allow for link in
        var href = window.location.href;

        if (href.indexOf('?') > 0 || href.indexOf('!') > 0) {
            var qs = (href.indexOf('?') > 0) ? href.split('?')[1] : href.split('!')[1];
            var ps = Ext.urlDecode(qs);
            var link = ps['link'];
            var title = link;

            if (link) {
                var unid = (link.indexOf('?') > 0) ? href.split('?')[0] : link;
  
                Ext.nd.util.addIFrame({
                    target: this.tabPanel,
                    uiView: this.view,
                    url: link,
                    id: unid,
                    title: 'Opening...',
                    useIFrameTitle: true
                });
    
            } // eo if(link)
        } // eo if(href.indexOf...)
    } // eo loadLink
};
Ext.reg('xnd-dominoui', Ext.nd.DominoUI);