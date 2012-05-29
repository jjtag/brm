Ext.define('Ext.ux.desktop.Module', {
  mixins: {
    observable: 'Ext.util.Observable'
  },
  
  constructor: function(config) {
    var me = this;
    me.mixins.observable.constructor.call(me, config);
    me.init();
  },
  
  run: function() {
    var me = this, desktop = me.app.desktop, win = desktop.getWindow(me.id);
    if (!win) {
      me.windowConfig = Ext.apply(me.windowConfig || {}, {
        id: me.id
      });
      win = desktop.createWindow(me.windowConfig, me.windowClass);
    }
    desktop.restoreWindow(win);
  },
  
  init: Ext.emptyFn
});
