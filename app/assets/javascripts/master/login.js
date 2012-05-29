Ext.define('App.Login', {
  extend: 'Ext.window.Window',
  cls: 'a-login',
  border: false,
  width: 265,
  height: 151,
  buttonAlign: 'center',
  url: 'login',
  title: '用户登录',
  callback: Ext.emptyFn,

  initComponent: function() {
    var me = this;
//    me.modal = true;
    me.closable = false;
    me.resizable = false;
    
    me.form = new Ext.form.Panel({
      frame: true,
//      plain: true,
//      height: '100%',
      bodyStyle: 'padding-top: 6px',
      defaults: {
        labelAlign: 'right',
        labelWidth: 55,
        xtype: 'textfield',
        allowBlank: false,
        width: 215,
/*
        msgTarget: 'side',
        autoFitErrors: false,
        labelPad: 10
*/
      },
      items: [{
        cls: 'a-login-user',
        name: 'username',
        fieldLabel: '帐号',
        blankText: '帐号不能为空'
      }, {
        cls: 'a-login-key',
        inputType: 'password',
        name: 'password',
        fieldLabel: '密码',
        blankText: '密码不能为空'
      }, {
        xtype: 'checkboxfield',
        name: 'remember',
        fieldLabel: '&#160;',
        labelSeparator: '',
        boxLabel: '记住我的帐号'
      }]
    });
    me.username = me.form.items.getAt(0);
    me.password = me.form.items.getAt(1);
    me.remember = me.form.items.getAt(2);
    me.items = [me.form];
    me.buttons = [{
      text: '登录',
      iconCls: 'a-login-submit',
      handler: me.submit,
      scope: me
    }];

    me.cookie = Ext.create('Ext.state.CookieProvider');
    Ext.state.Manager.setProvider(me.cookie);
    me.callParent(arguments);
  },
  
  afterRender: function() {
    var me = this;
    me.remember.setValue(me.cookie.get('remember') === true);
    if (me.remember.checked) {
      me.username.setValue(me.cookie.get('username'));
    }
    me.callParent(arguments);
  },
  
  initEvents: function() {
    var me = this;
    me.callParent(arguments);
    me.keyNav = Ext.create('Ext.util.KeyNav', me.form.el, {
      scope: me,
      enter: me.submit
    });
  },

  submit: function() {
    var me = this, form = me.form.getForm();
    form.isValid() && form.doAction('submit', {
      url: me.url,
      waitTitle: '请稍候',
      waitMsg: '正在登录……',
      success: function(form, action) {
        me.cookie.set('remember', me.remember.checked);
        if (me.remember.checked) {
          me.cookie.set('username', me.username.value);
        } else {
          me.cookie.clear('username');
        }
        me.close();
        Ext.Function.defer(me.callback, 100);
      },
      failure: function(form, action) {
        Ext.Msg.alert('警告', action.result.msg, function() {
          me.password.setRawValue(null);
          me.password.focus();
        });
      }
    });
  }
});
