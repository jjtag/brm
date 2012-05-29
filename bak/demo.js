Ext.define('App.Demo', {
  extend: 'App.Module',
  
  config: {
    name: 'demo',
    text: '模块演示',
    largeIconCls: 'shortcut-icon',
    tooltip: '模块演示'
  },

  windowClass: 'App.Editor',

  windowConfig: {
    title: 'Demo',
    width: 640,
    height: 480,
    items: [{
      xtype: 'combobox',
      fieldLabel: '币种',
      name: 'coin_of',
      store: new Ext.data.Store({
        model: 'App.data.Coin',
        data: []
      })
    }, {
      xtype: 'datefield',
      fieldLabel: '日期',
      name: 'from_at'
    }, {
      xtype: 'numberfield',
      hideTrigger: true,
      fieldLabel: '金额',
      name: 'amount'
    }]
/*
    items: [{
      xtype: 'form',
      bodyPadding: 5,
      items: [{
        xtype: 'textfield',
        fieldLabel: 'Label1',
        name: 'label1'
      }, {
        xtype: 'datefield',
        fieldLabel: 'Date',
        name: 'date1'
      }]
    }]
*/
  }
  
});