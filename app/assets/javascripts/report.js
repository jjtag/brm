Ext.define('App.Report', {
  extend: 'Ext.window.Window',
  
  layout: 'border',
//  bodyPadding: true,
    
//  border: true,
//  frame: true,
//  bodyBorder: 0,
//  plain: false,
  
  
  initComponent: function() {
    var me = this;
    me.items = [{
      region: 'west',
      width: 200,
      minWidth: 150,
      maxWidth: 400,
      split: true,
      collapsible: true,
      animCollapse: true,
      title: '报表参数'
    }, {
      region: 'center',
      items: [{
        region: 'north',
        minHeight: 30,
        html: 'north zone'
      }, {
        region: 'center',
        xtype: 'grid',
        columns: [{text: 'world'}],
        store: new Ext.data.ArrayStore()
      }]
    }];
    /*  items: [{
        region: 'north',
        height: 100,
        html: 'North Panel'
      }, {
        region: 'west',
        width: 150,
        title: 'search setting'
      }, {
        region: 'south',
        height: 100,
        html: 'South Panel'
      }, {
        region: 'east',
        width: 100,
        html: 'East Panel'
      }, {
        region: 'center',
        html: 'Center Panel'
      }]
    }];*/
    me.callParent(arguments);
  }

});