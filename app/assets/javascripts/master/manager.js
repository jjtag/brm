Ext.define('App.Manager', {
  mixins: {
    observable: 'Ext.util.Observable'
  },
  isReady: false,
  useQuickTips: true,

  constructor: function(config) {
    var me = this;
    me.addEvents('ready', 'beforeunload');
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
      module.manager = me;
      items.push(module);
    });
    me.modules = items;
    
    items = [];
    Ext.each(me.shortcuts, function(shortcut) {
      if (Ext.isString(shortcut)) {
        module = me.getModule(shortcut);
        shortcut = Ext.apply({
          module: module
        }, module && module.launcher);
      }
      items.push(shortcut);
    });
    me.shortcuts = items;
    
    me.menus = me.initItems(me.menus);
    me.sides = me.initItems(me.sides);
    me.tools = me.initItems(me.tools);
    
    me.desktop = new App.Desktop(me);
    me.viewport = new Ext.container.Viewport({
      layout: 'fit',
      items: [me.desktop]
    });
    Ext.EventManager.on(window, 'beforeunload', me.onUnload, me);
    me.isReady = true;
    me.fireEvent('ready', me);
  },

  initItems: function(items) {
    var me = this, objs = [];
    Ext.each(items, function(item) {
      var module = null;
      if (Ext.isString(item)) {
        module = me.getModule(item);
        module && (item = {});
      } else if (Ext.isString(item.module)) {
        module = me.getModule(item.module);
      }
      if (module) {
        item.module = module;
        item = Ext.applyIf(Ext.apply(item, module.launcher), {
          handler: function() {
            module.run();
          }
        });
      }
      item.textAlign = 'left';
      if (item.menu && item.menu.items && item.menu.items.length) {
        Ext.apply(item, {
          handler: Ext.emptyFn,
          hideOnClick: false
        });
        item.menu.items = me.initItems(item.menu.items);
      }
      objs.push(item);
    });
    return objs;
  },

/*
  loadModule: function(module) {
    module = this.getModule(module);
    module && module.run();
  },
*/
  
  getModule: function(name) {
    var found = null;
    Ext.each(this.modules, function(module) {
      if (module.$className == name) {
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
