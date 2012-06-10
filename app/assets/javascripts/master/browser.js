Ext.define('App.Browser', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.browser',
	
	refreshText: '刷新',
	filterText: '筛选',
	loadMask: true,

	initComponent: function() {
		var me = this, buttons = me.getButtons(), userButtons = me.buttons || [];
		if (me.prependButtons) {
			buttons = userButtons.concat(buttons);
		} else {
			buttons = buttons.concat(userButtons);
		}
		delete me.buttons;
		me.tbar = Ext.apply(me.tbar || {}, {items: buttons});
		me.columns.unshift({xtype: 'rownumberer'});
		me.bbar = Ext.applyIf(me.bbar || {}, {
			displayInfo: true
		});
		Ext.apply(me.bbar, {
			xtype: 'pagingtoolbar',
			store: me.store
		});
		me.features = me.features || [];
		me.filters = me.filters || {};
		Ext.applyIf(me.filters, {
			local: true,
			menuFilterText: me.filterText
		});
		me.filters.ftype = 'filters';
		me.features.push(me.filters);
		delete me.filters;
		me.callParent(arguments);
	},
	
	onStoreLoad: function() {
		var me = this;
		me.refreshBtn.enable();
		me.callParent(arguments);
	},
	
	getButtons: function() {
		var me = this;
		me.refreshBtn = me.refreshBtn || (new Ext.button.Button({
			tooltip: me.refreshText,
			overflowText: me.refreshText,
			iconCls: Ext.baseCSSPrefix + 'tbar-loading',
			disabled: true,
			handler: me.doRefresh,
			scope: me.scope || me
		}));
		return [me.refreshBtn];
	},
	
/*	getFilters: function() {
		alert('getFilter');
		return {
			local: true,
			menuFilterText: this.filterText
		};
	},
*/
	doRefresh: function() {
		var me = this, current = me.store.currentPage;
		me.store.loadPage(current);
	}
});