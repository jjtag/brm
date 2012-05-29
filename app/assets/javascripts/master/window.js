Ext.define('App.Window', {
  extend: 'Ext.window.Window',
  
  layout: 'border',
  width: 480,
  height: 320,
//  bodyPadding: true,
    
//  border: true,
//  frame: true,
//  bodyBorder: 0,
//  plain: false,
  
  
  initComponent: function() {
    var me = this;

    me.west.region = 'west';
    Ext.applyIf(me.west, {
      width: 200,
      minWidth: 100,
      maxWidth: 400,
      split: true,
      collapsible: true,
      animCollapse: true
    });

    me.center.region = 'center';
      
    me.items = [me.west, me.center];

    delete me.west;
    delete me.center;
/*        xtype: 'grid',
        columns: [{text: 'world'}],
        store: new Ext.data.ArrayStore()*/
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
