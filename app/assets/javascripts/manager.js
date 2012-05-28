Ext.define('App.Manager', {
  mixins: {
    observable: 'Ext.util.Observable'
  },
  isReady: false,
  useQuickTips: true,
  modules: ['App.Demo', 'App.Demo1'],
  menus: [{
    module: 'App.Demo'
  }, {
    module: 'App.Demo1',
  }, {
    text: 'Menu2',
  }, {
    text: 'Menu2',
  }, {
    text: 'Menu2',
  }, {
    text: 'Menu2',
  }, {
    text: 'Menu2',
  }, {
    text: 'Menu2',
  }, {
    text: 'Menu3'
  }],
  sides: [{
    module: 'App.Demo'
  }, {
    iconCls: 'add',
    text: 'Side2'
  }, {
    iconCls: 'add',
    text: 'Side3'
  }],
  tools: ['->', {
    module: 'App.Logout'
  }],
  shortcuts: ['App.Demo', 'App.Demo1', 'App.Logout'],
  
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
        }, module && module.config);
      }
      items.push(shortcut);
    });
    me.shortcuts = items;
    
    me.initItems(me.menus);
    me.initItems(me.sides);
    me.initItems(me.tools);
    
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
    var me = this;
    Ext.each(items, function(item) {
      if (item.module) {
        var module = me.getModule(item.module);
        item = Ext.applyIf(Ext.applyIf(item, module && module.config), {
          handler: function() {
            module.run();
          }
        });
        item.items && me.initItems(item.items);
      }
    });
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