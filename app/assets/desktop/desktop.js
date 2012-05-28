/*Ext.define('Ext.ux.desktop.Fit', {
  extend: 'Ext.layout.container.AbstractFit',
  
  onLayout: function() {
    var me = this;
    me.callParent(arguments);
    var size = me.getLayoutTargetSize();
    me.owner.items.each(function(item) {
      me.setItemBox(item, size);
    });
  },
  
  getTargetBox: function() {
    return this.getLayoutTargetSize();
  },
  
  setItemBox: function(item, box) {
    if (item && box.height > 0) {
      if (item.layoutManagerWidth == 2) {
        box.width = undefined;
      }
      if (item.layoutManagerHeight == 2) {
        box.height = undefined;
      }
      item.getEl().position('absolute', null, 0, 0);
      this.setItemSize(item, box.width, box.height);
    }
  }
});*/

Ext.define('Ext.ux.desktop.Shortcut', {
  extend: 'Ext.data.Model',
  fields: [
    'name',
    'text',
    'tooltip',
    'iconCls',
    'module'
  ]
});

Ext.define('Ext.ux.desktop.Desktop', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.desktop',
  app: null,
  lastActiveWindow: null,
  border: false,
  layout: 'fit',
  xTickSize: 1,
  yTickSize: 1,
  activeWindowCls: 'ux-desktop-active-win',
  inactiveWindowCls: 'ux-desktop-inactive-win',
  shortcutItemSelector: 'div.ux-desktop-shortcut',
  shortcutTpl: [
    '<tpl for=".">',
      '<div class="ux-desktop-shortcut" id="{name}-shortcut">',
        '<div class="ux-desktop-shortcut-icon {iconCls}">',
          '<img src="', Ext.BLANK_IMAGE_URL, '" title="{tooltip}">',
        '</div>',
        '<span class="ux-desktop-shortcut-text">{text}</span>',
      '</div>',
    '</tpl>',
    '<div class="x-clear"></div>'
  ],
  tileText: 'Tile',
  cascadeText: 'Cascade',
  
  initComponent: function() {
    var me = this;
    //me.setLayout(new Ext.ux.desktop.Fit());
    me.taskbar = me.bbar = new Ext.ux.desktop.Taskbar({
      app: me.app
    });
    me.windows = new Ext.util.MixedCollection();
    var menu = Ext.apply({
      items: []
    }, me.app.desktopMenu);
    if (menu.items.length) {
      menu.items.push('-');
    }
    menu.items.push({
      text: me.tileText,
      handler: me.tileWindows,
      scope: me,
      minWindows: 1
    }, {
      text: me.cascadeText,
      handler: me.cascadeWindow,
      scope: me,
      minWindows: 1
    });
    me.menu = new Ext.menu.Menu(menu);
    me.items = [{
      xtype: 'wallpaper',
      id: me.id + '_wallpaper'
    }, {
      xtype: 'dataview',
      overItemCls: 'x-view-over',
      trackOver: true,
      itemSelector: me.shortcutItemSelector,
      store: new Ext.data.Store({
        model: 'Ext.ux.desktop.Shortcut',
        data: me.app.shortcuts
      }),
      tpl: new Ext.XTemplate(me.shortcutTpl),
      listeners: {
        itemclick: me.onShortcutItemClick,
        scope: me
      }
    }];
    me.callParent(arguments);
  },
  
  afterRender: function() {
    var me = this;
    me.callParent(arguments);
    me.el.on('contextmenu', me.onDesktopMenu, me);
  },
  
  onDesktopMenu: function(e) {
    var me = this, menu = me.menu;
    e.stopEvent();
    if (!menu.rendered) {
      menu.on('beforeshow', me.onDesktopMenuBeforeShow, me);
    }
    menu.showAt(e.getXY());
    menu.doConstrain();
  },
  
  onDesktopMenuBeforeShow: function(menu) {
    var count = this.windows.getCount();
    menu.items.each(function(item) {
      item.setDisabled(count < (item.minWindows || 0));
    });
  },
  
  onShortcutItemClick: function(view, record) {
    this.app.loadModule(record.data.module);
  },
  
  onWindowClose: function(win) {
    var me = this;
    me.windows.remove(win);
    me.taskbar.removeTaskButton(win.taskButton);
    me.updateActiveWindow();
  },
  
  createWindow: function(config, cls) {
    config = Ext.applyIf(config || {}, {
      stateful: false,
      isWindow: true,
      constrainHeader: true,
      minimizable: true,
      maximizable: true
    });
    cls = cls || Ext.window.Window;
    var me = this, win = me.add(new cls(config));
    me.windows.add(win);
    win.taskButton = me.taskbar.addTaskButton(win);
    win.animateTarget = win.taskButton.el;
    win.on({
      activate: me.updateActiveWindow,
      beforeshow: me.updateActiveWindow,
      deactivate: me.updateActiveWindow,
      minimize: me.minimizeWindow,
      destroy: me.onWindowClose,
      scope: me
    });
    win.on({
      afterrender: function() {
        win.dd.xTickSize = me.xTickSize;
        win.dd.yTickSize = me.yTickSize;
        if (win.resizer) {
          win.resizer.widthIncrement = me.xTickSize;
          win.resizer.heightIncrement = me.yTickSize;
        }
      },
      single: true
    });
    win.doClose = function() {
      win.doClose = Ext.emptyFn;
      win.el.disableShadow();
      win.el.fadeOut({
        listeners: {
          afteranimate: function() {
            win.destroy();
          }
        }
      });
    };
    return win;
  },
  
  tileWindow: function() {
    var me = this, availWidth = me.body.getWidth(true);
    var x = me.xTickSize, y = me.yTickSize, n = y;
    me.windows.each(function(win) {
      if (win.isVisible() && !win.maximized) {
        var w = win.el.getWidth();
        if (x > me.xTickSize && x + w > availWidth) {
          x = me.xTickSize;
          y = n;
        }
        win.setPosition(x, y);
        x += w + me.xTickSize;
        n = Math.max(n, y + win.el.getHeight() + me.yTickSize);
      }
    });
  },
  
  cascadeWindows: function() {
    var x = 0, y = 0;
    this.getZIndexManager().eachBottomUp(function(component) {
      if (component.isWindow && component.isVisible() && !component.maximized) {
        component.setPosition(x, y);
        x += 20;
        y += 20;
      }
    });
  },
  
  restoreWindow: function(win) {
    if (win.isVisible()) {
      win.restore();
      win.toFront();
    } else {
      win.show();
    }
  },
  
  minimizeWindow: function(win) {
    win.minimized = true;
    win.hide();
  },
  
  getWindow: function(id) {
    return this.windows.get(id);
  },
  
  getZIndexManager: function() {
    var windows = this.windows;
    return windows.getCount() && windows.getAt(0).zIndexManager || null;
  },
  
  getActiveWindow: function() {
    var z = this.getZIndexManager(), found = null;
    if (z) {
      z.eachTopDown(function(component) {
        if (component.isWindow && !component.hidden) {
          found = component;
        }
        return !found
      });
    }
    return found;
  },
  
  updateActiveWindow: function() {
    var me = this, last = me.lastActiveWindow, activeWindow = me.getActiveWindow();
    if (last) {
      if (last.el.dom) {
        last.addCls(me.inactiveWindowCls);
        last.removeCls(me.activeWindowCls);
      }
      last.active = false;
    }
    me.lastActiveWindow = activeWindow;
    if (activeWindow) {
      activeWindow.addCls(me.activeWindowCls);
      activeWindow.removeCls(me.inactiveWindowCls);
      activeWindow.minimized = false;
      activeWindow.active = true;
    }
    me.taskbar.setActiveButton(activeWindow && activeWindow.taskButton);
  }
});
