Ext.onReady(function request() {
  Ext.Ajax.request({
    url: 'start.json',
//    method: 'POST',
    success: function(response) {
      var manager = new App.Manager(Ext.decode(response.responseText));
      manager.modules.push(new App.Logout({
        url: 'logout.json',
        callback: function() {
          window.location.reload();
        }
      }));
    },
    failure: function(response) {
      new App.Login({
        url: 'login.json',
        callback: request
      }).show();
    }
  });
});
