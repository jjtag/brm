Ext.define('App.data.Shortcut', {
  extend: 'Ext.data.Model',
  fields: ['name', 'text', 'tooltip', 'largeIconCls', 'module']
});

Ext.define('App.Desktop', {
  extend: 'Ext.panel.Panel',
  xTickSize: 1,
  yTickSize: 1,
  activeWindow: null,

  activeWindowCls: 'a-desktop-active-win',
  inactiveWindowCls: 'a-desktop-inactive-win',
  shortcutItemSelector: 'div.a-desktop-shortcut',
  html: '&#160;',
  shortcutTpl: [
    '<tpl for=".">',
      '<div class="a-desktop-shortcut">',
        '<div class="a-desktop-shortcut-icon {largeIconCls}">',
          '<img src="', Ext.BLANK_IMAGE_URL, '" title="{tooltip}">',
        '</div>',
        '<span class="a-desktop-shortcut-text">{text}</span>',
      '</div>',
    '</tpl>',
    '<div class="x-clear"></div>'
  ],
  
  constructor: function(manager, config) {
    var me = this;
    me.manager = manager;
    me.callParent(config);
  },

  initComponent: function() {
    var me = this;
    me.layout = 'fit';
    me.border = false;
    me.windows = new Ext.util.MixedCollection();
    me.taskbar = me.bbar = me.createTaskbar();
    me.menu = new Ext.menu.Menu({
      items: [{
        text: '平铺',
        handler: me.tileWindows,
        scope: me,
        minWindows: 1
      }, {
        text: '层叠',
        handler: me.cascadeWindows,
        scope: me,
        minWindows: 1
      }]
    });
    me.items = [me.createWallpaper(), {
      xtype: 'dataview',
      overItemCls: 'x-view-over',
      trackOver: true,
      itemSelector: me.shortcutItemSelector,
      store: new Ext.data.Store({
        model: 'App.data.Shortcut',
        data: me.manager.shortcuts
      }),
      style: {
        position: 'absolute'
      },
      x: 0,
      y: 0,
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
    record.data.module.run();
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
    cls = cls || 'Ext.window.Window';
    var me = this, win = me.add(Ext.create(cls, config));
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
      boxready: function() {
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
  
  tileWindows: function() {
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
      win.toFront(true);
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
        return !found;
      });
    }
    return found;
  },

  updateActiveWindow: function() {
    var me = this, last = me.activeWindow, activeWindow = me.getActiveWindow();
    if (last) {
      if (last.el.dom) {
        last.addCls(me.inactiveWindowCls);
        last.removeCls(me.activeWindowCls);
      }
      last.active = false;
    }
    me.activeWindow = activeWindow;
    if (activeWindow) {
      activeWindow.addCls(me.activeWindowCls);
      activeWindow.removeCls(me.inactiveWindowCls);
      activeWindow.minimized = false;
      activeWindow.active = true;
    }
    me.taskbar.setActiveButton(activeWindow && activeWindow.taskButton);
  },
  
  createTaskbar: function() {
    var desktop = this, clazz = Ext.extend(Ext.toolbar.Toolbar, {
      cls: 'a-desktop-taskbar',

      initComponent: function() {
        var me = this;
        me.windowMenu = new Ext.menu.Menu({
          defaultAlign: 'br-tr',
          items: [{
            text: '还原',
            handler: me.onWindowMenuRestore,
            scope: me
          }, {
            text: '最大化',
            handler: me.onWindowMenuMaximize,
            scope: me
          }, {
            text: '最小化',
            handler: me.onWindowMenuMinimize,
            scope: me
          }, {
            text: '关闭',
            handler: me.onWindowMenuClose,
            scope: me
          }],
          listeners: {
            beforeshow: me.onWindowMenuBeforeShow,
            hide: me.onWindowMenuHide,
            scope: me
          }
        });
        me.tasks = new Ext.toolbar.Toolbar({
          flex: 1,
          cls: 'a-desktop-tasks',
          layout: {
            overflowHandler: 'Scroller'
          }
        });
        me.items = [{
          xtype: 'button',
          cls: 'a-desktop-start',
          iconCls: 'a-desktop-start-icon',
          menu: desktop.createStartMenu(),
          menuAlign: 'bl-tl',
          text: '开始'
        }, me.tasks];
        me.callParent(arguments);
      },
    
      afterLayout: function() {
        var me = this;
        me.callParent(arguments);
        me.tasks.el.on('contextmenu', me.onTaskContextMenu, me);
      },
    
      onTaskContextMenu: function(e) {
        var me = this, target = e.getTarget(), button = me.getTaskButtonFromEl(target);
        if (button) {
          e.stopEvent();
          me.windowMenu.win = button.win;
          me.windowMenu.showBy(target);
        }
      },
    
      onWindowMenuBeforeShow: function(menu) {
        var items = menu.items.items, win = menu.win;
        items[0].setDisabled(win.maximized !== true && win.hidden !== true);
        items[1].setDisabled(win.minimized === true);
        items[2].setDisabled(win.maximized === true || win.hidden === true);
      },
    
      onWindowMenuHide: function() {
        menu.win = null;
      },
    
      onWindowMenuRestore: function() {
        desktop.restoreWindow(this.windowMenu.win);
      },
    
      onWindowMenuMinimize: function() {
        this.windowMenu.win.minimize();
      },
    
      onWindowMenuMaximize: function() {
        this.windowMenu.win.maximize();
      },
    
      onWindowMenuClose: function() {
        this.windowMenu.win.close();
      },
    
      getTaskButtonFromEl: function(el) {
        return this.tasks.getChildByElement(el) || null;
      },
    
      onTaskButtonClick: function(button) {
        var win = button.win;
        if (win.minimized || win.hidden) {
          win.show();
        } else if (win.active) {
          win.minimize();
        } else {
          win.toFront();
        }
      },
    
      addTaskButton: function(win) {
        var me = this;
        return me.tasks.add({
          iconCls: win.iconCls,
          enableToggle: true,
          toggleGroup: 'all',
          width: 140,
          text: Ext.util.Format.ellipsis(win.title, 20),
          listeners: {
            click: me.onTaskButtonClick,
            scope: me
          },
          win: win
        }).toggle(true);
      },
      
      removeTaskButton: function(button) {
        var me = this, found = false;
        me.tasks.items.each(function(item) {
          if (item == button) {
            found = true;
            me.tasks.remove(item);
          }
          return !found;
        });
        return found;
      },
      
      setActiveButton: function(button) {
        if (button) {
          button.toggle(true);
        } else {
          this.tasks.items.each(function(item) {
            item.isButton && item.toggle(false);
          });
        }
      }
    });
    return new clazz(arguments);
  },

  createStartMenu: function() {
    var desktop = this, clazz = Ext.extend(Ext.panel.Panel, {
      ariaRole: 'menu',
      cls: 'x-menu a-desktop-start-menu',
      defaultAlign: 'bl-tl',
      title: '',
      floating: true,
      shadow: true,
      width: 300,

      initComponent: function() {
        var me = this
        me.setComponentLayout(desktop.createStartDock());
        me.menu = new Ext.menu.Menu({
          cls: 'a-desktop-start-menu-body',
          border: false,
          floating: false,
          items: desktop.manager.menus
        });
        me.menu.layout.align = 'stretch';
        me.items = me.menu;
        me.sidebar = me.rbar = {
          cls: 'a-desktop-start-menu-sidebar',
          width: 100,
          items: desktop.manager.sides
        };

        me.toolbar = me.bbar = {
          xtype: 'toolbar',
          cls: 'a-desktop-start-menu-toolbar',
          items: desktop.manager.tools
        };
        me.callParent(arguments);
        Ext.menu.Manager.register(me);
        me.on('deactivate', function() {
          me.hide();
        }, me);
      },
    
      addMenuItem: function() {
        var menu = this.menu;
        menu.add.apply(menu, arguments);
      },
    
      addSideItem: function() {
        var bar = this.sidebar;
        bar.add.apply(bar, arguments);
      },
    
      addToolItem: function() {
        var bar = this.toolbar;
        bar.add.apply(bar, arguments);
      },
    
      showBy: function(component, pos, off) {
        var me = this;
        if (me.floating && component) {
          me.layout.autoSize = true;
          me.show();
          component = component.el || component;
          pos = me.el.getAlignToXY(component, pos || me.defaultAlign, off);
          if (me.floatParent) {
            var region = me.floatParent.getTargetEl().getViewRegion();
            pos[0] -= region.x;
            pos[1] -= region.y;
          }
          me.showAt(pos);
          me.doConstrain();
        }
        return me;
      },
    });
    return new clazz(arguments);
  },

  createStartDock: function() {
    var clazz = Ext.extend(Ext.layout.component.AbstractDock, {
      calculateDockBoxes: function() {
        this.callParent(arguments);
        var owner = this.owner, info = this.info, size = info.size;
        var bodyBox = info.bodyBox, boxes = info.boxes, ln = boxes.length;
        var dock, i;
        for (i = 0; i < ln; i++) {
          dock = boxes[i];
          if (dock.type == 'top' || dock.type == 'bottom') {
            dock.width += size.width - bodyBox.width;
            dock.item.setCalclatedSize(dock.width - dock.item.el.getMargin('lr'), undefined, owner);
          }
        }
      }
    });
    return new clazz(arguments);
  },

  createWallpaper: function() {
    var clazz = Ext.extend(Ext.Component, {
      cls: 'a-desktop-wallpaper',
      html: '<img src="' + Ext.BLANK_IMAGE_URL + '">',
      stretch: false,
      wallpaper: null,
    
      afterRender: function() {
        var me = this;
        me.callParent(arguments);
        me.setWallpaper(me.wallpaper, me.stretch);
      },
    
      setWallpaper: function(wallpaper, stretch) {
        var me = this;
        me.stretch = stretch !== false;
        me.wallpaper = wallpaper;
        if (me.rendered) {
          var imgEl = me.el.dom.firstChild, background;
          if (!wallpaper || wallpaper == Ext.BLANK_IMAGE_URL) {
            Ext.fly(imgEl).hide();
          } else if (me.stretch) {
            imgEl.src = wallpaper;
            me.el.removeCls('a-desktop-wallpaper-tiled');
            Ext.fly(imgEl).setStyle({
              width: '100%',
              height: '100%'
            }).show();
          } else {
            Ext.fly(imgEl).hide();
            background = 'url(' + wallpaper + ')';
            me.el.addCls('a-desktop-wallpaper-tited');
          }
          me.el.setStyle({
            backgroundImage: background || ''
          });
        }
        return me;
      }
    });
    return new clazz(arguments);
  }
});
