Ext.nd.CategorizedView = Ext.extend(Ext.grid.GridView, {
    initTemplates: function() {
        Ext.nd.CategorizedView.superclass.initTemplates.call(this);
        this.state = {};
        this.selections = [];
        
        if (!this.startGroup) {
            this.startGroup = new Ext.XTemplate(
                '<div id="{position}" class="xnd-category {cls}">',
                '<div id="{position}-hd" class="xnd-category-hd" style="{cstyle}"><div>{row}</div></div>', 
                '<div id="{position}-bd" class="xnd-category-body" style="{style}">'
            );
        }
        this.startGroup.compile();
        this.endGroup = '</div></div>';
        this.templates.row =  new Ext.Template(
            '<div id="{position}" class="x-grid3-row {alt}" style="{tstyle}"><table class="x-grid3-row-table" border="0" cellspacing="0" cellpadding="0" style="{tstyle}">',
            '<tbody><tr>{cells}</tr>',
            (this.enableRowBody ? '<tr class="x-grid3-row-body-tr" style="{bodyStyle}"><td colspan="{cols}" class="x-grid3-body-cell" tabIndex="0" hidefocus="on"><div class="x-grid3-row-body">{body}</div></td></tr>' : ''),
            '</tbody></table></div>'
        );
    },
    
    renderUI: function() {
        Ext.nd.CategorizedView.superclass.renderUI.call(this);
        this.mainBody.on('mousedown', this.interceptMouse, this);
    },
    
    toggleCategory: function(group, expanded) {
        group = Ext.getDom(group);
        var gel = Ext.fly(group);
        expanded = expanded !== undefined ? expanded : gel.hasClass('xnd-category-collapsed');
        
        
        this.state[gel.dom.id] = expanded;
        
        if (expanded) {
            this.grid.getStore().loadCategory(gel.dom.id);
            gel.removeClass('xnd-category-collapsed');
        } else {
            gel.addClass('xnd-category-collapsed');
        }
    },
    
    interceptMouse: function(e) {
        var hd = e.getTarget('.xnd-category-hd', this.mainBody);
        if (hd) {
            e.stopEvent();
            this.toggleCategory(hd.parentNode);
            var sm = this.grid.getSelectionModel();
            sm.clearSelections();
        } else {
            // TODO: this is a bad hack to force selection, need to write a real
            // selection model extension that handles this all properly
            var row = e.getTarget('div.x-grid3-row');
            if (row) {
                var store = this.grid.getStore();
                var rec = store.findRecordByPosition(row.id);
                var sm = this.grid.getSelectionModel();
                sm.clearSelections();
                for (var i = 0, len = this.selections.length;i < len;i++) {
                    var tmpRow = this.selections[i];
                    this.fly(tmpRow).removeClass('x-grid3-row-selected');
                    delete tmpRow;
                }
                sm.selections.add(rec);                
                this.selections.push(row);
                
                this.fly(row).radioClass("x-grid3-row-selected");
            }
        }
    },
    
    doRender: function(cs, rs, ds, startRow, colCount, stripe) {
        if (rs.length < 1) {
            return '';
        }
        
        var cstyle = 'width:' + this.getTotalWidth() + ';';
        
        var buf = [];
        for (var i = 0, len = rs.length; i < len; i++) {
            var rowIndex = startRow + i;
            var r = rs[i];
            if (r.isCategory) {
                // if state is defined use it, however state is in terms of expanded
                // so negate it, otherwise use the default.
                var isCollapsed = typeof this.state[r.position] !== 'undefined' ? !this.state[r.position] : true;
                var gcls = isCollapsed ? 'xnd-category-collapsed' : '';
                var row = this.oldRender(cs, [r], ds, rowIndex, colCount, stripe);
                buf.push(this.startGroup.apply({
                    position: r.position,
                    row: row,
                    cls: gcls,
                    //          style: 'padding-left:'+(r.depth*17)+'px;',
                    cstyle: cstyle
                }));
                if (r.children) {
                    buf.push(this.doRender(cs, r.children, ds, rowIndex, colCount, stripe));
                }
                buf.push(this.endGroup);
            } else {
                buf.push(this.oldRender(cs, [r], ds, startRow, colCount, stripe));
            }
        }
        return buf.join('');
    },
    
    oldRender: function(cs, rs, ds, startRow, colCount, stripe) {
        var ts = this.templates, ct = ts.cell, rt = ts.row, last = colCount - 1;
        var tstyle = 'width:' + this.getTotalWidth() + ';';
        // buffers
        var buf = [], cb, c, p = {}, rp = {
            tstyle: tstyle
        }, r;
        for (var j = 0, len = rs.length; j < len; j++) {
            r = rs[j];
            cb = [];
            var rowIndex = (j + startRow);
            for (var i = 0; i < colCount; i++) {
                c = cs[i];
                p.id = c.id;
                p.css = i == 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');
                if (r.isCategory && (r.depth - 1) == i) {
                    p.css += 'xnd-category-cell';
                }
                p.attr = p.cellAttr = "";
                p.value = c.renderer(r.data[c.name], p, r, rowIndex, i, ds);
                p.style = c.style;
                if (p.value == undefined || p.value === "") p.value = "&#160;";
                if (r.dirty && typeof r.modified[c.name] !== 'undefined') {
                    p.css += ' x-grid3-dirty-cell';
                }
                cb[cb.length] = ct.apply(p);
            }
            var alt = [];
            if (stripe && ((rowIndex + 1) % 2 == 0)) {
                alt[0] = "x-grid3-row-alt";
            }
            if (r.dirty) {
                alt[1] = " x-grid3-dirty-row";
            }
            rp.cols = colCount;
            if (this.getRowClass) {
                alt[2] = this.getRowClass(r, rowIndex, rp, ds);
            }
            rp.position = r.position;
            rp.alt = alt.join(" ");
            rp.cells = cb.join("");
            buf[buf.length] = rt.apply(rp);
        }
        return buf.join("");
    },
    focusRow: function() {
    },
    
    // private
    getRows: function() {
        if (this.hasRows()) {
            var rows = Ext.query('div.x-grid3-row', this.mainBody.dom);
            return rows || [];
        }
    },
    
    onRowSelect: function(row) {
        //    console.log(['onRowSelect',row]);
        this.addRowClass(row, "x-grid3-row-selected");
    }
});
