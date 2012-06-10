Ext.define('App.data.Customer', {
	extend: 'Ext.data.Model',
	fields: [{
		name: 'id',
		type: 'int'
	}, 'name', 'contact', 'phone', 'fax', 'postcode', 'address', 'note']
});

Ext.define('App.data.CustomerAccount', {
	extend: 'Ext.data.Model',
	fields: [{
		name: 'id',
		type: 'int'
	}, {
		name: 'customer_id',
		type: 'int'
	}, 'bank', 'account']
});

Ext.define('App.module.Customer', {
	extend: 'App.Module',
	windowClass: 'App.Window',
	
	launcher: {
		name: 'customer',
		text: '客户资料',
		iconCls: 'a-customer-icon',
		bigIconCls: 'a-customer-big-icon',
		tooltip: '客户资料'
	},
	
	windowConfig: function() {
		var me = this;
		me.store = new Ext.data.Store({
			autoLoad: true,
			autoDestroy: true,
			model: 'App.data.Customer',
			proxy: {
				type: 'ajax',
				url: 'customer.json',
				reader: {
					type: 'json',
					root: 'data'
				}
			}
		});
		var editor = new App.Editor({
			columns: [{
				text: '名称',
				flex: 1,
				dataIndex: 'name',
				filterable: true
			}, {
				text: '联系人',
				dataIndex: 'contact',
				width: 50,
				filterable: true
			}, {
				text: '电话',
				dataIndex: 'phone',
				width: 100,
				filterable: true
			}, {
				text: '传真',
				dataIndex: 'fax',
				width: 100,
				filterable: true
			}, {
				text: '邮编',
				dataIndex: 'postcode',
				width: 55,
				filterable: true
			}],
			plugins: [{
				ptype: 'rowexpander',
				rowBodyTpl: [
					'<p>&nbsp;<b>地址:</b>&nbsp;{address}</p>',
					'<p>&nbsp;<b>备注:</b>&nbsp;{note}</p>'
				]
			}],
			store: me.store,
			scope: me
		});
		return {
			width: 640,
			height: 480,
			items: [editor]
		};
	}
});