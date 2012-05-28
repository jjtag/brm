Ext.define('Ext.ux.desktop.StartDock', {
  extend: 'Ext.layout.component.AbstractDock',

  calculateDockBoxes: function() {
    this.callParent(arguments);
    var owner = this.owner, info = this.info, size = info.size;
    var bodyBox = info.bodyBox, boxes = info.boxes, ln = boxes.length;
    var dock, i;
    for (i = 0; i < ln; i++) {
      dock = boxes[i];
      if (dock.type == 'top' || dock.type == 'bottom') {
        dock.width += size.width - bodyBox.width;
        dock.item.setCalculatedSize(dock.width - dock.item.el.getMargin('lr'), undefined, owner);
      }
    }
  }
});

Ext.define('Ext.ux.desktop.StartMenu', {
  extend: 'Ext.panel.Panel',
  ariaRole: 'menu',
  cls: 'x-menu ux-start-menu',
  defaultAlign: 'bl-tl',
  title: '',
  floating: true,
  shadow: true,
  width: 300,
  app: null,
  
  initComponent: function() {
    var me = this;
    me.setComponentLayout(new Ext.ux.desktop.StartDock());
    me.menu = new Ext.menu.Menu(Ext.apply({
      cls: 'ux-start-menu-body',
      border: false,
      floating: false,
      listeners: {
        click: me.onMenuItemClick,
        scope: me
      }
    }, me.app.startMenu));
    me.menu.layout.align = 'stretch';
    me.items = me.menu;
    
    me.sidebar = me.rbar = Ext.apply({
      cls: 'ux-start-menu-sidebar',
      width: 100
    }, me.app.startSidebar);
    
    me.toolbar = me.bbar = Ext.apply({
      cls: 'ux-start-menu-toolbar'
    }, me.app.startToolbar);
    
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
  
  addSidebarItem: function() {
    var bar = this.sidebar;
    bar.add.apply(bar, arguments);
  },
  
  addToolbarItem: function() {
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
  
  onMenuItemClick: function(menu, item) {
    this.app.loadModule(item.module);
  },
  
  onToolButtonClick: function(button) {
    this.app.loadModule(button.module);
  }
});
