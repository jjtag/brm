Ext.define('App.Window', {
  extend: 'Ext.window.Window',
  
  layout: 'fit',
  width: 480,
  height: 320
/*  bodyPadding: true,
    
  border: true,
  frame: true,
  bodyBorder: 0,
  plain: false,
*/
/*  
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

    me.callParent(arguments);
  }
*/
});
