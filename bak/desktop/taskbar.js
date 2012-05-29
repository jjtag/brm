Ext.define('Ext.ux.desktop.Taskbar', {
  extend: 'Ext.toolbar.Toolbar',
  app: null,
  cls: 'ux-taskbar',
  
  startText: 'Start',
  restoreText: 'Restore',
  minimizeText: 'Minimize',
  maximizeText: 'Maximize',
  closeText: 'Close',
  
  initComponent: function() {
    var me = this;
    me.startMenu = new Ext.ux.desktop.StartMenu({
      app: me.app
    });
    me.windowMenu = new Ext.menu.Menu({
      defaultAlign: 'br-tr',
      items: [{
        text: me.restoreText,
        handler: me.onWindowMenuRestore,
        scope: me
      }, {
        text: me.maximizeText,
        handler: me.onWindowMenuMinimize,
        scope: me
      }, {
        text: me.minimizeText,
        handler: me.onWindowMenuMaximize,
        scope: me
      }, {
        text: me.closeText,
        handler: me.onWindowMenuClose,
        scope: me
      }],
      listeners: {
        beforeshow: me.onWindowMenuBeforeShow,
        hide: me.onWindowMenuHide,
        scope: me
      }
    });
    me.taskSwitch = new Ext.toolbar.Toolbar({
      flex: 1,
      cls: 'ux-desktop-task-switch',
      layout: {
        overflowHandler: 'Scroller'
      }
    });
    me.items = [{
      xtype: 'button',
      cls: 'ux-start-button',
      iconCls: 'ux-start-button-icon',
      menu: me.startMenu,
      menuAlign: 'bl-tl',
      text: me.startText
    }, me.taskSwitch];
    me.callParent(arguments);
  },
  
  afterLayout: function() {
    var me = this;
    me.callParent(arguments);
    me.taskSwitch.el.on('contextmenu', me.onTaskSwitchContextMenu, me);
  },
  
  onTaskSwitchContextMenu: function(e) {
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
  
  onWindowMenuHide: function(menu) {
    menu.win = null;
  },
  
  onWindowMenuRestore: function() {
    var me = this;
    me.app.desktop.restoreWindow(me.windowMenu.win);
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
    return this.taskSwitch.getChildByElement(el) || null;
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
    var me = this, config = {
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
    }, button = me.taskSwitch.add(config);
    button.toggle(true);
    return button;
  },
  
  removeTaskButton: function(button) {
    var me = this, found = false;
    me.taskSwitch.items.each(function(item) {
      if (item == button) {
        found = true;
        me.taskSwitch.remove(item);
      }
      return !found
    });
    return found;
  },
  
  setActiveButton: function(button) {
    if (button) {
      button.toggle(true);
    } else {
      this.taskSwitch.items.each(function(item) {
        if (item.isButton) {
          item.toggle(false);
        }
      });
    }
  }
});
