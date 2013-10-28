/**
 *  Here's an example showing the creation of a typical Extnd.Viewport:
          Ext.create('Extnd.Viewport', {
              uiOutline: {
                  outlineName: &quot;mainOL&quot;
              },
              uiView: {
                  viewName: &quot;Requests&quot;,
                  viewTitle: &quot;Requests&quot;
              }
          });

 *
 * @cfg {Object} uiOutline A {@link Extnd.UIOutline} config object
 * @cfg {Object} uiView A {@link Extnd.UIView} config object
 * @constructor Create an integrated domino interface, with a view and an outline
 * @param {Object} config Configuration options
 *
 */
Ext.define('Extnd.container.Viewport', {

    extend  : 'Ext.container.Viewport',

    alias: [
        'widget.xnd-viewport',
        'widget.xnd-dominoui'
    ],

    alternateClassName: [
        'Extnd.Viewport',
        'Ext.nd.DominoUI'
    ],

    requires: [
        'Extnd.grid.Panel',
        'Extnd.tree.Panel',
        'Ext.tab.Panel',
        'Ext.layout.container.Border'

    ],


    layout: 'border',

    initComponent: function () {
        var me = this;

        Ext.apply(me, {
            items: me.getItemsCfg()
        });

        me.callParent(arguments);

    },


    viewOpeningTitle: 'Opening...',

    // private
    getItemsCfg: function () {
        var west,
            center;

        // west/outline - be sure to include the defaults property
        // so that for each view opened, the target property defaults
        // will be applied

        west = Ext.apply({
            id          : 'xnd-outline-panel',
            xtype       : 'xnd-uioutline',
            region      : 'west',
            //title       : Ext.nd.Session.currentDatabase.title,
            title       : 'current Db Title',
            collapsible : true,
            split       : true,
            width       : 200,
            minSize     : 150,
            maxSize     : 400,
            target      : 'xnd-center-panel',
            viewTarget  : 'xnd-grid-panel'
        }, this.uiOutline);


        // center/view area
        center = {
            region      : 'center',
            id          : 'xnd-center-panel',
            xtype       : 'tabpanel',
            target      : 'xnd-center-panel',
            defaults : {
                target : 'xnd-center-panel',
                border : true
            },
            enableTabScroll : true,
            activeTab       : 0,
            items: [Ext.apply({
                id      : 'xnd-grid-panel',
                layout  : 'fit',
                xtype   : 'xnd-uiview',
                target  : 'xnd-center-panel',
                closable: false
            }, this.uiView)]
        };

        // include these since the alpha and beta 1x code
        // included these and some developers have custom
        // code that depends on these being defined

//        this.outlinePanel = Ext.getCmp('xnd-outline-panel');
//        this.view = Ext.getCmp('xnd-grid-panel');
//        this.tabPanel = Ext.getCmp('xnd-center-panel');

        return [west, center];

    },

    // leave for backwards capability since this was included in beta 1x code
    loadLink: function () {
        var href = window.location.href,
            qs,
            ps,
            link,
            title,
            unid;

        if (href.indexOf('?') > 0 || href.indexOf('!') > 0) {
            qs = (href.indexOf('?') > 0) ? href.split('?')[1] : href.split('!')[1];
            ps = Ext.urlDecode(qs);
            link = ps.link;
            title = link;

            if (link) {
                unid = (link.indexOf('?') > 0) ? href.split('?')[0] : link;

                Extnd.util.addIFrame({
                    target  : this.tabPanel,
                    uiView  : this.view,
                    url     : link,
                    id      : unid,
                    title   : 'Opening...',
                    useIFrameTitle: true
                });

            }
        }
    }

});
