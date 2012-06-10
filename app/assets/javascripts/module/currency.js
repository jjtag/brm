Ext.define('App.data.Currency', {
  extend: 'Ext.data.Model',
  fields: [{
    name: 'id',
    type: 'int'
  }, 'name', 'symbol', {
    name: 'rate',
    type: 'float'
  }],
  hasMany: {
    model: 'App.data.CurrencyRate',
    name: 'rates'
  }
});

Ext.define('App.data.CurrencyRate', {
  extend: 'Ext.data.Model',
  fields: [{
    name: 'id',
    type: 'int'
  }, {
    name: 'currency_id',
    type: 'int'
  }, {
    name: 'start_at',
    type: 'date'
  }, {
    name: 'rate',
    type: 'float'
  }],
  belongsTo: 'App.data.Currency'
});

Ext.define('App.module.Currency', {
	extend: 'App.Module',
	windowClass: 'App.Window',

  launcher: {
    name: 'currency',
    text: '货币汇率',
    iconCls: 'a-currency-icon',
    bigIconCls: 'a-currency-big-icon',
    tooltip: '货币汇率'
  },

  windowConfig: function() {
    var me = this;
    me.store = new Ext.data.Store({
      autoLoad: true,
      autoDestroy: true,
      //autoSync: true,
      model: 'App.data.Currency',
      proxy: {
        type: 'ajax',
        url: 'currency.json',
        reader: {
          type: 'json',
          root: 'data'
        }
      }
    });
    var editor = new App.Editor({
      width: 250,
      collapsible: false,
      columns: [{
        text: '名称',
        flex: 1,
        dataIndex: 'name',
        filterable: true
      }, {
        text: '符号',
        dataIndex: 'symbol',
        width: 60,
        align: 'center',
        filterable: true
      }, {
        text: '汇率',
        dataIndex: 'rate',
        width: 80,
        align: 'right'
        //filterable: true
      }],
      store: me.store,
      //selType: 'cellmodel',
      //editor: currencyEditor,
      //plugins: [currencyEditor],
      scope: me,

      filters: {
        filters: [{
          dataIndex: 'rate',
          menuItemCfgs: {decimalPrecision: 4}
        }]
      },

/*      getFilters: function() {
        //arguments.callee.$owner = this;
        //arguments.callee.$name = xx;
        var filters = this.callParent(arguments);
        filter.fields = {
          rate: {
            decimalPrecision: 4
          }
        };
        return filter;
      },*/
      
      doAdd: function() {
        Ext.Msg.alert('add');
      },
      
      doEdit: function(grid, rowIndex, colIndex) {
        Ext.Msg.alert('edit');
      },
      
      doDelete: function(grid, rowIndex, colIndex) {
        Ext.Msg.alert('delete');
      }
    });
    return {items: editor};
/*    , exchangeRateStore = new Ext.data.Store({
      autoDestroy: true,
      model: 'App.data.ExchangeRate',
      proxy: {
        type: 'ajax',
        url: 'currency/exchange_rate.json',
        reader: {
          type: 'json',
          root: 'data',
        }
      },
      sorters: [{
        property: 'start_at',
        direction: 'DESC'
      }]
    }), currencyEditor = new Ext.grid.plugin.CellEditing({
      clicksToMoveEditor: 1
    }), exchangeRateEditor = new Ext.grid.plugin.CellEditing({
      clicksToMoveEditor: 1
    }), exchangeRate = new App.Editor({
      columns: [{
        text: '日期',
        dataIndex: 'start_at',
        renderer: Ext.util.Format.dateRenderer('Y年m月d日'),
        width: 105,
        field: 'datefield'
      }, {
        text: '汇率',
        flex: 1,
        dataIndex: 'rate',
        align: 'right',
        field: {
          xtype: 'numberfield',
          decimalPrecision: 4,
          hideTrigger: true
        }
      }],
      store: exchangeRateStore,
      selType: 'cellmodel',
      editor: exchangeRateEditor,
      plugins: [exchangeRateEditor]
    });
    //currencyStore.load();*/
//    return {items: [grid]};
  },
  
  doAdd: function() {
    (new App.module.CurrencyEditor({manager: this.manager})).run();
  },
  
  doEdit: function(grid, rowIndex, colIndex) {
    (new App.module.CurrencyEditor({manager: this.manager})).run();
  },
  
  doRemove: function(grid, rowIndex, colIndex) {
    Ext.Msg.alert('delete');
  }
});

Ext.define('App.module.CurrencyEditor', {
  extend: 'App.Module',
  windowClass: 'App.Dialog',

  launcher: {
    text: '外币编辑',
    iconCls: 'a-currency-icon'
  },
  
  windowConfig: function() {
    return {
      width: 300,
      height: 300,
      modal: true
    };
  }
  
});