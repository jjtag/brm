Ext.define('App.Demo', {
  extend: 'App.Module',
  
  config: {
    name: 'demo',
    text: '模块演示',
    tooltip: '模块演示'
  },

  windowClass: 'App.Editor',

  windowConfig: {
    title: 'Demo',
    width: 640,
    height: 480,
    items: [{
      xtype: 'textfield',
      fieldLabel: 'Label1',
      name: 'label1'
    }, {
      xtype: 'datefield',
      fieldLabel: 'Date',
      name: 'date1'
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