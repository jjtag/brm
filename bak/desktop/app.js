Ext.define('Ext.ux.desktop.App', {
  mixins: {
    observable: 'Ext.util.Observable',
  },
  isReady: false,
  useQuickTips: true,
  modules: null,
  shortcuts: null,
  desktopMenu: null,
  startMenu: null,
  startSidebar: null,
  startToolbar: null,

  constructor: function(config) {
    var me = this;
    me.addEvents(
      'ready',
      'beforeunload'
    );
    me.mixins.observable.constructor.call(me, config);
    if (Ext.isReady) {
      Ext.Function.defer(me.init, 10, me);
    } else {
      Ext.onReady(me.init, me);
    }
  },
  
  init: function() {
    var me = this;
    if (me.useQuickTips) {
      Ext.QuickTips.init();
    }

    var items = [];
    Ext.each(me.modules, function(module) {
      if (Ext.isString(module)) {
        module = Ext.create(module);
      }
      module.app = me;
      items.push(module);
    });

    items = [];
    Ext.each(me.shortcuts, function(shortcut) {
      if (Ext.isString(shortcut)) {
        module = me.getModule(shortcut);
        shortcut = Ext.apply({
          module: shortcut
        }, module && module.prop);
      }
      items.push(shortcut);
    });
    me.shortcuts = items;
    
    me.initItemConfig(me.startMenu && me.startMenu.items);
    me.initItemConfig(me.startSidebar && me.startSidebar.items);
    me.initItemConfig(me.startToolbar && me.startToolbar.items);
    
    me.desktop = new Ext.ux.desktop.Desktop({
      app: me
    });
    me.viewport = new Ext.container.Viewport({
      layout: 'fit',
      items: [me.desktop]
    });
    Ext.EventManager.on(window, 'beforeunload', me.onUnload, me);
    me.isReady = true;
    me.fireEvent('ready', me);
  },
  
  initItemsConfig: function(items) {
    var me = this;
    Ext.each(items, function(item) {
      if (item.module) {
        var module = me.getModule(item.module);
        item = Ext.applyIf(Ext.applyIf(item, module && module.prop), {
          handler: function() {
            module.run();
          }
        });
        me.initItemsConfig(item.items);
      }
    });
  },
  
  loadModule: function(module) {
    module = this.getModule(module);
    module && module.run();
  },
  
  getModule: function(name) {
    var found = null;
    Ext.each(this.modules, function(module) {
      if (module.id == name) {
        found = module;
      }
      return !found;
    });
    return found;
  },
  
  onReady: function(fn, scope) {
    var me = this;
    if (me.isReady) {
      fn.call(scope, me);
    } else {
      me.on({
        ready: fn,
        scope: scope,
        single: true
      });
    }
  },
  
  onUnload: function(e) {
    var me = this;
    if (me.fireEvent('beforeunload', me) === false) {
      e.stopEvent();
    }
  }
});
