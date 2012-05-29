Ext.define('App.data.Currency', {
  extend: 'Ext.data.Model',
  fields: ['name']
});

Ext.define('App.Currency', {
  extend: 'App.Module',
  config: {
    name: 'currency',
    text: '外币管理',
    iconCls: '',
    largeIconCls: 'shortcut-icon',
    tooltip: ''
  },

  windowClass: 'App.Window',
  windowConfig: {
    west: {
      collapsible: false,
      title: '外币列表',
      xtype: 'grid',
      tbar: {
        items: [{
          text: '新增',
          iconCls: 'add-icon',
          handler: function() {
            Ext.Msg.alert('add click');
          }
        }, '-', {
          text: '删除',
          iconCls: 'del-icon',
          handler: function() {
            Ext.Msg.alert('del click');
          }
        }]
      },
      columns: [{
        text: '名称',
        flex: 1,
        dataIndex: 'name',
        editor: {
          allowBlank: false
        }
      }],
      store: new Ext.data.ArrayStore({
        model: 'App.data.Currency',
        data: [['美元'], ['欧元'], ['港币']]
      })
    },
    center: {
      xtype: 'grid',
      tbar: {
        items: [{
          text: 'Add'
        }, {
          text: 'Delete'
        }]
      },
      columns: [{text: 'world'}],
      store: new Ext.data.ArrayStore()
    }
  },

  init: function() {
    var me = this;
    me.callParent(arguments);
    me.windowConfig.title = me.windowConfig.title || me.config.text;
    editor = new Ext.grid.plugin.RowEditing({
      clicksToMoveEditor: 1,
      autoCancel: false
    });
    me.windowConfig.west.plugins = [editor];
  }
});