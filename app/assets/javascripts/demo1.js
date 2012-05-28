Ext.define('App.Demo1', {
  extend: 'App.Module',
  
  config: {
    name: 'demo',
    text: '模块演示一',
    tooltip: '模块演示一'
  },

  windowClass: 'App.Report',

  windowConfig: {
    title: 'Demo1',
    width: 640,
    height: 480,
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