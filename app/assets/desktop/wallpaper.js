Ext.define('Ext.ux.desktop.Wallpaper', {
  extend: 'Ext.Component',
  alias: 'widget.wallpaper',
  cls: 'ux-wallpaper',
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
        me.el.removeCls('ux-wallpaper-tiled');
        Ext.fly(imgEl).setStyle({
          width: '100%',
          height: '100%'
        }).show();
      } else {
        Ext.fly(imgEl).hide();
        background = 'url(' + wallpaper + ')';
        me.el.addCls('ux-wallpaper-tited');
      }
      me.el.setStyle({
        backgroundImage: background || ''
      });
    }
    return me;
  }
});
