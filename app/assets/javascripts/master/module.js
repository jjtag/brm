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

  run: function(modal) {
    var me = this, desktop = me.manager.desktop, win = desktop.getWindow(me.id);
    if (!win) {
      var config = Ext.isFunction(me.windowConfig) ? me.windowConfig() : me.windowConfig || {};
      Ext.applyIf(config, {
        title: me.launcher.text,
        iconCls: me.launcher.iconCls
      });
      win = desktop.createWindow(config, me.windowClass);
    }
    desktop.restoreWindow(win);
  }
});
