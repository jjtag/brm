Ext.define('App.Module', {
  mixins: {
    observable: 'Ext.util.Observable'
  },

//  manager: null,
//  id: null,
//  windowConfig: null,
//  windowClass: null,

  constructor: function(config) {
    var me = this;
    me.mixins.observable.constructor.call(me, config);
    me.init();
  },

  init: Ext.emptyFn,

  run: function() {
    var me = this, desktop = me.manager.desktop, win = desktop.getWindow(me.id);
    if (!win) {
      me.windowConfig = Ext.apply(me.windowConfig || {}, {
        id: me.id
      });
      win = desktop.createWindow(me.windowConfig, me.windowClass);
    }
    desktop.restoreWindow(win);
  }
});