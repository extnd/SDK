
/**
 * @class Ext.nd.data.DominoViewStore
 * @extends Ext.data.Store
 * A specialized version of {@link Ext.data.Store} to deal with oddities from
 * reading a Domino view via ?ReadViewEntries.  Use for widgets such as the
 * {@link Ext.grid.GridPanel}, or the {@link Ext.form.ComboBox}.
 * @constructor
 * Creates a new Store
 * @param {Object} config A config object containing the objects needed for the Store to access data,
 * and read the data into Records.
 */
Ext.nd.data.DominoViewStore = function(config){
    Ext.nd.data.DominoViewStore.superclass.constructor.call(this, config);
};

Ext.extend(Ext.nd.data.DominoViewStore, Ext.data.Store, {
    /**
     * Loads the Record cache from the configured Proxy using the configured Reader.
     * <p>
     * This version is specifically geared towards Domino Views
     * @param {Object} options An object containing properties which control loading options:
     * <pre><code>
     params {Object} An object containing properties to pass as HTTP parameters to a remote data source.
     callback {Function} A function to be called after the Records have been loaded. The callback is
     passed the following arguments:
     r : Ext.data.Record[]
     options: Options object from the load call
     success: Boolean success indicator
     scope {Object} Scope with which to call the callback (defaults to the Store object)
     append {Boolean} indicator to append loaded records rather than replace the current cache.
     * </code></pre>
     */
    load: function(options){
        options = options ||
        {};
        if (this.fireEvent("beforeload", this, options) !== false) {
            this.storeOptions(options);
            
            // do some baseParams cleanup
            if (options.params.expand || options.params.expandView) {
                if (this.baseParams.collapse) {
                    delete this.baseParams.collapse;
                }
                if (this.baseParams.collapseView) {
                    delete this.baseParams.collapseView;
                }
            }
            if (options.params.collapse || options.params.collapseView) {
                if (this.baseParams.expand) {
                    delete this.baseParams.expand;
                }
                if (this.baseParams.expandView) {
                    delete this.baseParams.expandView;
                }
            }
            
            // now merge the baseParams and passed in params
            var p = Ext.apply(this.baseParams, options.params ||
            {});
            
            
            if (this.sortInfo && this.remoteSort) {
                var pn = this.paramNames;
                
                // domino does not have separate params for sort and dir
                // instead, domino combines them into one of two choices
                // resortascending=colNbr
                // resortdescending=colNbr
                
                //p[pn["sort"]] = this.sortInfo.field;
                var sortColumn = this.sortInfo.mapping; // to support older domino versions we will use colnumber (however, this will probably cause DND column reordering to break when sorting)
                // get the config info for this column
                var colConfig = this.reader.meta.columnConfig[sortColumn];
                if (colConfig.resortviewunid != "") {
                    return; // the grid should have handled the request to change view
                }
                
                //p[pn["dir"]] = this.sortInfo.direction;
                var sortDir = this.sortInfo.direction;
                
                // TODO: need to refactor this section into it's own method       
                if (sortDir == "ASC") {
                    if (typeof p.resortascending != 'undefined') {
                        if (p.resortascending != sortColumn) { // changing to a new sort column, so reset
                            p.resortascending = sortColumn;
                            if (p.start) {
                                delete p.start;
                                delete p.startkey;
                            }
                            delete p.resortdescending;
                        } else {
                            if (p.start) {
                                delete p.startkey; // delete startkey once we have a start param
                            }
                        }
                        // else part of - p.resortascending
                    } else {
                        p.resortascending = sortColumn;
                        delete p.start;
                        delete p.startkey;
                        delete p.resortdescending;
                    }
                    
                    // else part of - sortDir == "ASC"
                } else {
                    if (typeof p.resortdescending != 'undefined') {
                        if (p.resortdescending != sortColumn) { // changing to a new sort column so reset
                            p.resortdescending = sortColumn;
                            if (p.start) {
                                delete p.start;
                                delete p.startkey;
                            }
                            delete p.resortdescending;
                        } else {
                            if (p.start) {
                                delete p.startkey; // delete startkey once we have a start param
                            }
                        }
                        // else part of p.resortdescending
                    } else {
                        p.resortdescending = sortColumn;
                        delete p.start;
                        delete p.startkey;
                        delete p.resortascending;
                    }
                }
            }
            
            this.proxy.doRequest('load', null, p, this.reader, null, this.loadRecords, this, options);
        }
    },
    
    /**
     * Sort the Records.
     * Added mapping for Domino Views
     * @param {String} fieldName The name of the field to sort by.
     * @param {String} dir (optional) The sort order, "ASC" or "DESC" (defaults to "ASC")
     */
    sort: function(fieldName, dir){
        var f = this.fields.get(fieldName);
        if (!f) {
            return false;
        }
        if (!dir) {
            if (this.sortInfo && this.sortInfo.field == f.name) { // toggle sort dir
                dir = (this.sortToggle[f.name] || "ASC").toggle("ASC", "DESC");
            } else {
                dir = f.sortDir;
            }
        }
        
        this.sortToggle[f.name] = dir;
        //this.sortInfo = {field: f.name, direction: dir};
        this.sortInfo = {
            field: f.name,
            direction: dir,
            mapping: f.mapping
        };
        if (!this.remoteSort) {
            this.applySort();
            this.fireEvent("datachanged", this);
        } else {
            this.load(this.lastOptions);
        }
    },
    
    // private (need to override since our data is buried in a property named data)
    sortData : function(f, direction){
        direction = direction || 'ASC';
        var st = this.fields.get(f).sortType;
        var fn = function(r1, r2){
            //var v1 = st(r1.data[f]), v2 = st(r2.data[f]);
            // our override version with the extra .data[0] property
            var v1 = st(r1.data[f].data[0]), v2 = st(r2.data[f].data[0]);
            return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
        };
        this.data.sort(direction, fn);
        if(this.snapshot && this.snapshot != this.data){
            this.snapshot.sort(direction, fn);
        }
    }
});
