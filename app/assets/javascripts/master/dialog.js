Ext.define('App.Dialog', {
  extend: 'Ext.window.Window',

  layout: 'fit',

  initComponent: function() {
    var me = this;
    me.maximizable = false;
/*
    me.form = new Ext.form.Panel({
      bodyPadding: true,
      items: me.items
    });

    me.items = [me.form];
    me.buttons = [{
      text: '保存',
      handler: me.onSaveClick
    }];*/
    me.callParent(arguments);
  },

/*  onSaveClick: function() {
    var me = this, form = me.form.getForm();
    form.isValid() && form.doAction('submit', {
      url: me.url,
      waitTitle: '',
      waitMsg: '',
      success: function(form, action) {
        
      },
      failure: function(form, action) {
        
      }
    });
  }
*/
});
