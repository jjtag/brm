Ext.define('App.Logout', {
  extend: 'App.Module',

  url: 'logout',

  launcher: {
    text: '注销',
    iconCls: 'a-logout-icon',
    tooltip: '注销当前用户'
  },
  
  run: function() {
    var me = this;
    Ext.Msg.confirm('提示', '确认要注销当前用户？', function(button) {
      if (button == 'yes') {
        Ext.Ajax.request({
          url: me.url,
//          method: 'POST',
          callback: me.callback
        });
      }
    }, me);
  }
});
