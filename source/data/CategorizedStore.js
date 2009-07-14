Ext.nd.data.CategorizedStore = function(config){
    Ext.nd.data.CategorizedStore.superclass.constructor.call(this, config);
    
    this.addEvents('categoryload');
};

Ext.extend(Ext.nd.data.CategorizedStore, Ext.nd.data.ViewStore, {
    loadCategory: function(position, options){
        var rec = this.findRecordByPosition(position);
        if (!rec.isCategory || rec.childrenRendered) {
            return;
        }
        // TODO: need to add multiExpandCount
        this.proxy.doRequest(
        	'read', // action 
        	null, // record
            {
                start: position,
                expand: position,
                count: 60
            }, // params
            this.reader, // reader
            this.loadCategoryRecords, // callback
            this, // scope
            Ext.apply({
                rec: rec
            }, options) // options
        );
    },
    
    loadCategoryRecords: function(o, options, success){
        if (!o || success === false || !options) {
            if (success !== false) {
                this.fireEvent("categoryload", this, [], options);
            }
            if (options.callback) {
                options.callback.call(options.scope || this, [], options, false);
            }
            return;
        }
        
        var r = o.records;
        var recs = [];
        if (options.rec) {
            for (var i = 0, len = r.length; i < len; i++) {
                var childMatch = options.rec.position + '.';
                if (r[i].position.match(childMatch)) {
                    recs.push(r[i]);
                    //          r[i].parent = options.rec.position; // Set parent = to position which is also the id
                }
            }
            
            options.rec.children = recs;
            options.rec.childrenRendered = true;
            this.fireEvent("datachanged", this);
        }
        this.fireEvent("categoryload", this, r, options);
        if (options.callback) {
            options.callback.call(options.scope || this, r, options, true);
        }
    },
    
    findRecordByPosition: function(position){
        var pos = position.split('.');
        var rec = this.getAt(pos[0] - 1);
        pos.shift();
        if (pos.length > 0) {
            for (var i = 0; i < pos.length; i++) {
                pos[i]--;
            }
            var bleh = 'rec.children[' + pos.join('].children[') + ']';
            //      console.log(bleh);
            rec = eval(bleh);
            //      console.log([bleh, rec]);
        }
        return rec;
    },
    
    findRecordByIndex: function(index){
        // console.log(['frbi', this.flatRecords()]);  
        var records = this.flatRecords();
        return records[index];
    },
    
    
    
    flatRecords: function(){
        var recs = [];
        for (var i = 0; i < this.data.length; i++) {
            recs = recs.concat(this.findChildren(this.data.items[i]));
        }
        return recs;
    },
    
    findChildren: function(rec){
        var buf = [rec];
        if (rec && rec.children) {
            for (var i = 0; i < rec.children.length; i++) {
                buf = buf.concat(this.findChildren(rec.children[i]));
            }
        }
        return buf;
    },
    
    
    getCount: function(){
        var ttl = 0;
        for (var i = 0; i < this.data.length; i++) {
            ttl += this.countChildRecords(this.data.items[i]);
        }
        return ttl;
    },
    
    countChildRecords: function(rec){
        if (rec && rec.children) {
            var ttl = 1;
            for (var i = 0; i < rec.children.length; i++) {
                ttl += this.countChildRecords(rec.children[i]);
            }
            return ttl;
        }
        else {
            return 1;
        }
    }
});
