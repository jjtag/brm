Ext.define('App.Editor', {
	extend: 'App.Browser',
  alias: 'widget.editor',
	
	actionText: '操作',
	addText: '新增',
	editText: '编辑',
	deleteText: '删除',

	initComponent: function() {
		var me = this;
		me.columns.push({
			xtype: 'actioncolumn',
			menuText: null,
      text: me.actionText,
			align: 'center',
      width: 60,
      sortable: false,
			scope: me.scope,
      items: [{
        iconCls: 'a-edit-icon',
        tooltip: me.editText,
        handler: me.doEdit
      }, {
        iconCls: 'a-delete-icon',
        tooltip: me.deleteText,
        handler: me.doDelete
      }]
		});
		me.callParent(arguments);
	},

	getButtons: function() {
		var me = this, buttons = me.callParent(arguments);
		buttons.length && buttons.push('-');
		me.addBtn = new Ext.button.Button({
			tooltip: me.addText,
			overflowText: me.addText,
			iconCls: 'a-add-icon',
			disabled: true,
			handler: me.doAdd,
			scope: me.scope || me
		});
		buttons.push(me.addBtn);
		return buttons;
	},
	
	onStoreLoad: function() {
		var me = this;
		me.addBtn.enable();
		me.callParent(arguments);
	},

	doAdd: Ext.emptyFn,
	doEdit: Ext.emptyFn,
	doDelete: Ext.emptyFn
/*	
	addRecord: function() {
		var me = this;
		if (me.editor) {
			me.editor.cancelEdit();
		}
		me.store.add(new me.store.model());
	},
	
	removeRecord: function() {
		var me = this, selection = me.getView().getSelectionModel().getSelection()[0];
		if (selection) {
			me.store.remove(selection);
		}
	},

	storeLoad: Ext.emptyFn,

	onStoreLoad: function(store, records, successful) {
		this.addBtn.setDisabled(successful !== true);
		this.storeLoad(arguments);
	},
	
	selectionChange: Ext.emptyFn,

	onSelectionChange: function(model, records) {
		this.removeBtn.setDisabled(records.length == 0);
		this.doSelectionChange(arguments);
	}*/
});