Ext.define('Ext.ux.grid.FiltersFeature', {
  extend: 'Ext.grid.feature.Feature',
  alias: 'feature.filters',
  uses: ['Ext.ux.grid.menu.ListMenu', 'Ext.ux.grid.menu.RangeMenu', 'Ext.ux.grid.filter.BooleanFilter', 'Ext.ux.grid.filter.DateFilter', 'Ext.ux.grid.filter.ListFilter', 'Ext.ux.grid.filter.NumericFilter', 'Ext.ux.grid.filter.StringFilter'],
  autoReload: true,
  filterCls: 'ux-filtered-column',
  local: false,
  menuFilterText: 'Filters',
  paramPrefix: 'filter',
  showMenu: true,
  stateId: undefined,
  updateBuffer: 500,
  hasFeatureEvent: false,
  constructor: function(config) {
    var me = this;
    config = config || {};
    Ext.apply(me, config);
    me.deferredUpdate = Ext.create('Ext.util.DelayedTask', me.reload, me);
    me.filters = me.createFiltersCollection();
    me.filterConfigs = config.filters;
  },
  attachEvents: function() {
    var me = this,
    view = me.view,
    headerCt = view.headerCt,
    grid = me.getGridPanel();
    me.bindStore(view.getStore(), true);
    headerCt.on('menucreate', me.onMenuCreate, me);
    view.on('refresh', me.onRefresh, me);
    grid.on({
      scope: me,
      beforestaterestore: me.applyState,
      beforestatesave: me.saveState,
      beforedestroy: me.destroy
    });
    grid.filters = me;
    grid.addEvents('filterupdate');
  },
  createFiltersCollection: function() {
    return Ext.create('Ext.util.MixedCollection', false,
    function(o) {
      return o ? o.dataIndex: null;
    });
  },
  createFilters: function() {
    var me = this,
    hadFilters = me.filters.getCount(),
    grid = me.getGridPanel(),
    filters = me.createFiltersCollection(),
    model = grid.store.model,
    fields = model.prototype.fields,
    field,
    filter,
    state;
    if (hadFilters) {
      state = {};
      me.saveState(null, state);
    }
    function add(dataIndex, config, filterable) {
      if (dataIndex && (filterable || config)) {
        field = fields.get(dataIndex);
        filter = {
          dataIndex: dataIndex,
          type: (field && field.type && field.type.type) || 'auto'
        };
        if (Ext.isObject(config)) {
          Ext.apply(filter, config);
        }
        filters.replace(filter);
      }
    }
    Ext.Array.each(me.filterConfigs,
    function(filterConfig) {
      add(filterConfig.dataIndex, filterConfig);
    });
    Ext.Array.each(grid.columns,
    function(column) {
      if (column.filterable === false) {
        filters.removeAtKey(column.dataIndex);
      } else {
        add(column.dataIndex, column.filter, column.filterable);
      }
    });
    me.removeAll();
    if (filters.items) {
      me.initializeFilters(filters.items);
    }
    if (hadFilters) {
      me.applyState(null, state);
    }
  },
  initializeFilters: function(filters) {
    var me = this,
    filtersLength = filters.length,
    i, filter, FilterClass;
    for (i = 0; i < filtersLength; i++) {
      filter = filters[i];
      if (filter) {
        FilterClass = me.getFilterClass(filter.type);
        filter = filter.menu ? filter: new FilterClass(filter);
        me.filters.add(filter);
        Ext.util.Observable.capture(filter, this.onStateChange, this);
      }
    }
  },
  onMenuCreate: function(headerCt, menu) {
    var me = this;
    me.createFilters();
    menu.on('beforeshow', me.onMenuBeforeShow, me);
  },
  onMenuBeforeShow: function(menu) {
    var me = this,
    menuItem, filter;
    if (me.showMenu) {
      menuItem = me.menuItem;
      if (!menuItem || menuItem.isDestroyed) {
        me.createMenuItem(menu);
        menuItem = me.menuItem;
      }
      filter = me.getMenuFilter();
      if (filter) {
        menuItem.setMenu(filter.menu, false);
        menuItem.setChecked(filter.active);
        menuItem.setDisabled(filter.disabled === true);
      }
      menuItem.setVisible( !! filter);
      this.sep.setVisible( !! filter);
    }
  },
  createMenuItem: function(menu) {
    var me = this;
    me.sep = menu.add('-');
    me.menuItem = menu.add({
      checked: false,
      itemId: 'filters',
      text: me.menuFilterText,
      listeners: {
        scope: me,
        checkchange: me.onCheckChange,
        beforecheckchange: me.onBeforeCheck
      }
    });
  },
  getGridPanel: function() {
    return this.view.up('gridpanel');
  },
  applyState: function(grid, state) {
    var me = this,
    key, filter;
    me.applyingState = true;
    me.clearFilters();
    if (state.filters) {
      for (key in state.filters) {
        if (state.filters.hasOwnProperty(key)) {
          filter = me.filters.get(key);
          if (filter) {
            filter.setValue(state.filters[key]);
            filter.setActive(true);
          }
        }
      }
    }
    me.deferredUpdate.cancel();
    if (me.local) {
      me.reload();
    }
    delete me.applyingState;
    delete state.filters;
  },
  saveState: function(grid, state) {
    var filters = {};
    this.filters.each(function(filter) {
      if (filter.active) {
        filters[filter.dataIndex] = filter.getValue();
      }
    });
    return (state.filters = filters);
  },
  destroy: function() {
    var me = this;
    Ext.destroyMembers(me, 'menuItem', 'sep');
    me.removeAll();
    me.clearListeners();
  },
  removeAll: function() {
    if (this.filters) {
      Ext.destroy.apply(Ext, this.filters.items);
      this.filters.clear();
    }
  },
  bindStore: function(store) {
    var me = this;
    if (me.store && me.storeListeners) {
      me.store.un(me.storeListeners);
    }
    if (store) {
      me.storeListeners = {
        scope: me
      };
      if (me.local) {
        me.storeListeners.load = me.onLoad;
      } else {
        me.storeListeners['before' + (store.buffered ? 'prefetch': 'load')] = me.onBeforeLoad;
      }
      store.on(me.storeListeners);
    } else {
      delete me.storeListeners;
    }
    me.store = store;
  },
  getMenuFilter: function() {
    var header = this.view.headerCt.getMenu().activeHeader;
    return header ? this.filters.get(header.dataIndex) : null;
  },
  onCheckChange: function(item, value) {
    this.getMenuFilter().setActive(value);
  },
  onBeforeCheck: function(check, value) {
    return ! value || this.getMenuFilter().isActivatable();
  },
  onStateChange: function(event, filter) {
    if (event !== 'serialize') {
      var me = this,
      grid = me.getGridPanel();
      if (filter == me.getMenuFilter()) {
        me.menuItem.setChecked(filter.active, false);
      }
      if ((me.autoReload || me.local) && !me.applyingState) {
        me.deferredUpdate.delay(me.updateBuffer);
      }
      me.updateColumnHeadings();
      if (!me.applyingState) {
        grid.saveState();
      }
      grid.fireEvent('filterupdate', me, filter);
    }
  },
  onBeforeLoad: function(store, options) {
    options.params = options.params || {};
    this.cleanParams(options.params);
    var params = this.buildQuery(this.getFilterData());
    Ext.apply(options.params, params);
  },
  onLoad: function(store) {
    store.filterBy(this.getRecordFilter());
  },
  onRefresh: function() {
    this.updateColumnHeadings();
  },
  updateColumnHeadings: function() {
    var me = this,
    headerCt = me.view.headerCt;
    if (headerCt) {
      headerCt.items.each(function(header) {
        var filter = me.getFilter(header.dataIndex);
        header[filter && filter.active ? 'addCls': 'removeCls'](me.filterCls);
      });
    }
  },
  reload: function() {
    var me = this,
    store = me.view.getStore();
    if (me.local) {
      store.clearFilter(true);
      store.filterBy(me.getRecordFilter());
      store.sort();
    } else {
      me.deferredUpdate.cancel();
      if (store.buffered) {
        store.pageMap.clear();
      }
      store.loadPage(1);
    }
  },
  getRecordFilter: function() {
    var f = [],
    len,
    i;
    this.filters.each(function(filter) {
      if (filter.active) {
        f.push(filter);
      }
    });
    len = f.length;
    return function(record) {
      for (i = 0; i < len; i++) {
        if (!f[i].validateRecord(record)) {
          return false;
        }
      }
      return true;
    };
  },
  addFilter: function(config) {
    var me = this,
    columns = me.getGridPanel().columns,
    i,
    columnsLength,
    column,
    filtersLength,
    filter;
    for (i = 0, columnsLength = columns.length; i < columnsLength; i++) {
      column = columns[i];
      if (column.dataIndex === config.dataIndex) {
        column.filter = config;
      }
    }
    if (me.view.headerCt.menu) {
      me.createFilters();
    } else {
      me.view.headerCt.getMenu();
    }
    for (i = 0, filtersLength = me.filters.items.length; i < filtersLength; i++) {
      filter = me.filters.items[i];
      if (filter.dataIndex === config.dataIndex) {
        return filter;
      }
    }
  },
  addFilters: function(filters) {
    if (filters) {
      var me = this,
      i, filtersLength;
      for (i = 0, filtersLength = filters.length; i < filtersLength; i++) {
        me.addFilter(filters[i]);
      }
    }
  },
  getFilter: function(dataIndex) {
    return this.filters.get(dataIndex);
  },
  clearFilters: function() {
    this.filters.each(function(filter) {
      filter.setActive(false);
    });
  },
  getFilterData: function() {
    var filters = [],
    i,
    len;
    this.filters.each(function(f) {
      if (f.active) {
        var d = [].concat(f.serialize());
        for (i = 0, len = d.length; i < len; i++) {
          filters.push({
            field: f.dataIndex,
            data: d[i]
          });
        }
      }
    });
    return filters;
  },
  buildQuery: function(filters) {
    var p = {},
    i, f, root, dataPrefix, key, tmp, len = filters.length;
    if (!this.encode) {
      for (i = 0; i < len; i++) {
        f = filters[i];
        root = [this.paramPrefix, '[', i, ']'].join('');
        p[root + '[field]'] = f.field;
        dataPrefix = root + '[data]';
        for (key in f.data) {
          p[[dataPrefix, '[', key, ']'].join('')] = f.data[key];
        }
      }
    } else {
      tmp = [];
      for (i = 0; i < len; i++) {
        f = filters[i];
        tmp.push(Ext.apply({},
        {
          field: f.field
        },
        f.data));
      }
      if (tmp.length > 0) {
        p[this.paramPrefix] = Ext.JSON.encode(tmp);
      }
    }
    return p;
  },
  cleanParams: function(p) {
    if (this.encode) {
      delete p[this.paramPrefix];
    } else {
      var regex, key;
      regex = new RegExp('^' + this.paramPrefix + '\[[0-9]+\]');
      for (key in p) {
        if (regex.test(key)) {
          delete p[key];
        }
      }
    }
  },
  getFilterClass: function(type) {
    switch (type) {
    case 'auto':
      type = 'string';
      break;
    case 'int':
    case 'float':
      type = 'numeric';
      break;
    case 'bool':
      type = 'boolean';
      break;
    }
    return Ext.ClassManager.getByAlias('gridfilter.' + type);
  }
});
Ext.define('Ext.ux.grid.filter.Filter', {
  extend: 'Ext.util.Observable',
  active: false,
  dataIndex: null,
  menu: null,
  updateBuffer: 500,
  constructor: function(config) {
    Ext.apply(this, config);
    this.addEvents('activate', 'deactivate', 'serialize', 'update');
    Ext.ux.grid.filter.Filter.superclass.constructor.call(this);
    this.menu = this.createMenu(config);
    this.init(config);
    if (config && config.value) {
      this.setValue(config.value);
      this.setActive(config.active !== false, true);
      delete config.value;
    }
  },
  destroy: function() {
    if (this.menu) {
      this.menu.destroy();
    }
    this.clearListeners();
  },
  init: Ext.emptyFn,
  createMenu: function(config) {
    return Ext.create('Ext.menu.Menu', config);
  },
  getValue: Ext.emptyFn,
  setValue: Ext.emptyFn,
  isActivatable: function() {
    return true;
  },
  getSerialArgs: Ext.emptyFn,
  validateRecord: function() {
    return true;
  },
  serialize: function() {
    var args = this.getSerialArgs();
    this.fireEvent('serialize', args, this);
    return args;
  },
  fireUpdate: function() {
    if (this.active) {
      this.fireEvent('update', this);
    }
    this.setActive(this.isActivatable());
  },
  setActive: function(active, suppressEvent) {
    if (this.active != active) {
      this.active = active;
      if (suppressEvent !== true) {
        this.fireEvent(active ? 'activate': 'deactivate', this);
      }
    }
  }
});
Ext.define('Ext.ux.grid.filter.BooleanFilter', {
  extend: 'Ext.ux.grid.filter.Filter',
  alias: 'gridfilter.boolean',
  defaultValue: false,
  yesText: 'Yes',
  noText: 'No',
  init: function(config) {
    var gId = Ext.id();
    this.options = [Ext.create('Ext.menu.CheckItem', {
      text: this.yesText,
      group: gId,
      checked: this.defaultValue === true
    }), Ext.create('Ext.menu.CheckItem', {
      text: this.noText,
      group: gId,
      checked: this.defaultValue === false
    })];
    this.menu.add(this.options[0], this.options[1]);
    for (var i = 0; i < this.options.length; i++) {
      this.options[i].on('click', this.fireUpdate, this);
      this.options[i].on('checkchange', this.fireUpdate, this);
    }
  },
  getValue: function() {
    return this.options[0].checked;
  },
  setValue: function(value) {
    this.options[value ? 0 : 1].setChecked(true);
  },
  getSerialArgs: function() {
    var args = {
      type: 'boolean',
      value: this.getValue()
    };
    return args;
  },
  validateRecord: function(record) {
    return record.get(this.dataIndex) == this.getValue();
  }
});
Ext.define('Ext.ux.grid.filter.DateFilter', {
  extend: 'Ext.ux.grid.filter.Filter',
  alias: 'gridfilter.date',
  uses: ['Ext.picker.Date', 'Ext.menu.Menu'],
  afterText: 'After',
  beforeText: 'Before',
  compareMap: {
    before: 'lt',
    after: 'gt',
    on: 'eq'
  },
  dateFormat: 'm/d/Y',
  menuItems: ['before', 'after', '-', 'on'],
  menuItemCfgs: {
    selectOnFocus: true,
    width: 125
  },
  onText: 'On',
  pickerOpts: {},
  init: function(config) {
    var me = this,
    pickerCfg, i, len, item, cfg;
    pickerCfg = Ext.apply(me.pickerOpts, {
      xtype: 'datepicker',
      minDate: me.minDate,
      maxDate: me.maxDate,
      format: me.dateFormat,
      listeners: {
        scope: me,
        select: me.onMenuSelect
      }
    });
    me.fields = {};
    for (i = 0, len = me.menuItems.length; i < len; i++) {
      item = me.menuItems[i];
      if (item !== '-') {
        cfg = {
          itemId: 'range-' + item,
          text: me[item + 'Text'],
          menu: Ext.create('Ext.menu.Menu', {
            items: [Ext.apply(pickerCfg, {
              itemId: item
            })]
          }),
          listeners: {
            scope: me,
            checkchange: me.onCheckChange
          }
        };
        item = me.fields[item] = Ext.create('Ext.menu.CheckItem', cfg);
      }
      me.menu.add(item);
    }
  },
  onCheckChange: function() {
    this.setActive(this.isActivatable());
    this.fireEvent('update', this);
  },
  onInputKeyUp: function(field, e) {
    var k = e.getKey();
    if (k == e.RETURN && field.isValid()) {
      e.stopEvent();
      this.menu.hide();
    }
  },
  onMenuSelect: function(picker, date) {
    var fields = this.fields,
    field = this.fields[picker.itemId];
    field.setChecked(true);
    if (field == fields.on) {
      fields.before.setChecked(false, true);
      fields.after.setChecked(false, true);
    } else {
      fields.on.setChecked(false, true);
      if (field == fields.after && this.getFieldValue('before') < date) {
        fields.before.setChecked(false, true);
      } else if (field == fields.before && this.getFieldValue('after') > date) {
        fields.after.setChecked(false, true);
      }
    }
    this.fireEvent('update', this);
    picker.up('menu').hide();
  },
  getValue: function() {
    var key, result = {};
    for (key in this.fields) {
      if (this.fields[key].checked) {
        result[key] = this.getFieldValue(key);
      }
    }
    return result;
  },
  setValue: function(value, preserve) {
    var key;
    for (key in this.fields) {
      if (value[key]) {
        this.getPicker(key).setValue(value[key]);
        this.fields[key].setChecked(true);
      } else if (!preserve) {
        this.fields[key].setChecked(false);
      }
    }
    this.fireEvent('update', this);
  },
  isActivatable: function() {
    var key;
    for (key in this.fields) {
      if (this.fields[key].checked) {
        return true;
      }
    }
    return false;
  },
  getSerialArgs: function() {
    var args = [];
    for (var key in this.fields) {
      if (this.fields[key].checked) {
        args.push({
          type: 'date',
          comparison: this.compareMap[key],
          value: Ext.Date.format(this.getFieldValue(key), this.dateFormat)
        });
      }
    }
    return args;
  },
  getFieldValue: function(item) {
    return this.getPicker(item).getValue();
  },
  getPicker: function(item) {
    return this.fields[item].menu.items.first();
  },
  validateRecord: function(record) {
    var key, pickerValue, val = record.get(this.dataIndex),
    clearTime = Ext.Date.clearTime;
    if (!Ext.isDate(val)) {
      return false;
    }
    val = clearTime(val, true).getTime();
    for (key in this.fields) {
      if (this.fields[key].checked) {
        pickerValue = clearTime(this.getFieldValue(key), true).getTime();
        if (key == 'before' && pickerValue <= val) {
          return false;
        }
        if (key == 'after' && pickerValue >= val) {
          return false;
        }
        if (key == 'on' && pickerValue != val) {
          return false;
        }
      }
    }
    return true;
  }
});
Ext.define('Ext.ux.grid.filter.ListFilter', {
  extend: 'Ext.ux.grid.filter.Filter',
  alias: 'gridfilter.list',
  phpMode: false,
  init: function(config) {
    this.dt = Ext.create('Ext.util.DelayedTask', this.fireUpdate, this);
  },
  createMenu: function(config) {
    var menu = Ext.create('Ext.ux.grid.menu.ListMenu', config);
    menu.on('checkchange', this.onCheckChange, this);
    return menu;
  },
  getValue: function() {
    return this.menu.getSelected();
  },
  setValue: function(value) {
    this.menu.setSelected(value);
    this.fireEvent('update', this);
  },
  isActivatable: function() {
    return this.getValue().length > 0;
  },
  getSerialArgs: function() {
    return {
      type: 'list',
      value: this.phpMode ? this.getValue().join(',') : this.getValue()
    };
  },
  onCheckChange: function() {
    this.dt.delay(this.updateBuffer);
  },
  validateRecord: function(record) {
    var valuesArray = this.getValue();
    return Ext.Array.indexOf(valuesArray, record.get(this.dataIndex)) > -1;
  }
});
Ext.define('Ext.ux.grid.filter.NumericFilter', {
  extend: 'Ext.ux.grid.filter.Filter',
  alias: 'gridfilter.numeric',
  uses: ['Ext.form.field.Number'],
  createMenu: function(config) {
    var me = this,
    menu;
    menu = Ext.create('Ext.ux.grid.menu.RangeMenu', config);
    menu.on('update', me.fireUpdate, me);
    return menu;
  },
  getValue: function() {
    return this.menu.getValue();
  },
  setValue: function(value) {
    this.menu.setValue(value);
  },
  isActivatable: function() {
    var values = this.getValue(),
    key;
    for (key in values) {
      if (values[key] !== undefined) {
        return true;
      }
    }
    return false;
  },
  getSerialArgs: function() {
    var key, args = [],
    values = this.menu.getValue();
    for (key in values) {
      args.push({
        type: 'numeric',
        comparison: key,
        value: values[key]
      });
    }
    return args;
  },
  validateRecord: function(record) {
    var val = record.get(this.dataIndex),
    values = this.getValue(),
    isNumber = Ext.isNumber;
    if (isNumber(values.eq) && val != values.eq) {
      return false;
    }
    if (isNumber(values.lt) && val >= values.lt) {
      return false;
    }
    if (isNumber(values.gt) && val <= values.gt) {
      return false;
    }
    return true;
  }
});
Ext.define('Ext.ux.grid.filter.StringFilter', {
  extend: 'Ext.ux.grid.filter.Filter',
  alias: 'gridfilter.string',
  iconCls: 'ux-gridfilter-text-icon',
  emptyText: 'Enter Filter Text...',
  selectOnFocus: true,
  width: 125,
  init: function(config) {
    Ext.applyIf(config, {
      enableKeyEvents: true,
      iconCls: this.iconCls,
      hideLabel: true,
      listeners: {
        scope: this,
        keyup: this.onInputKeyUp,
        el: {
          click: function(e) {
            e.stopPropagation();
          }
        }
      }
    });
    this.inputItem = Ext.create('Ext.form.field.Text', config);
    this.menu.add(this.inputItem);
    this.updateTask = Ext.create('Ext.util.DelayedTask', this.fireUpdate, this);
  },
  getValue: function() {
    return this.inputItem.getValue();
  },
  setValue: function(value) {
    this.inputItem.setValue(value);
    this.fireEvent('update', this);
  },
  isActivatable: function() {
    return this.inputItem.getValue().length > 0;
  },
  getSerialArgs: function() {
    return {
      type: 'string',
      value: this.getValue()
    };
  },
  validateRecord: function(record) {
    var val = record.get(this.dataIndex);
    if (typeof val != 'string') {
      return (this.getValue().length === 0);
    }
    return val.toLowerCase().indexOf(this.getValue().toLowerCase()) > -1;
  },
  onInputKeyUp: function(field, e) {
    var k = e.getKey();
    if (k == e.RETURN && field.isValid()) {
      e.stopEvent();
      this.menu.hide();
      return;
    }
    this.updateTask.delay(this.updateBuffer);
  }
});
Ext.define('Ext.ux.grid.menu.ListMenu', {
  extend: 'Ext.menu.Menu',
  labelField: 'text',
  loadingText: 'Loading...',
  loadOnShow: true,
  single: false,
  constructor: function(cfg) {
    var me = this,
    options, i, len, value;
    me.selected = [];
    me.addEvents('checkchange');
    me.callParent([cfg = cfg || {}]);
    if (!cfg.store && cfg.options) {
      options = [];
      for (i = 0, len = cfg.options.length; i < len; i++) {
        value = cfg.options[i];
        switch (Ext.type(value)) {
        case 'array':
          options.push(value);
          break;
        case 'object':
          options.push([value.id, value[me.labelField]]);
          break;
        case 'string':
          options.push([value, value]);
          break;
        }
      }
      me.store = Ext.create('Ext.data.ArrayStore', {
        fields: ['id', me.labelField],
        data: options,
        listeners: {
          load: me.onLoad,
          scope: me
        }
      });
      me.loaded = true;
      me.autoStore = true;
    } else {
      me.add({
        text: me.loadingText,
        iconCls: 'loading-indicator'
      });
      me.store.on('load', me.onLoad, me);
    }
  },
  destroy: function() {
    var me = this,
    store = me.store;
    if (store) {
      if (me.autoStore) {
        store.destroyStore();
      } else {
        store.un('unload', me.onLoad, me);
      }
    }
    me.callParent();
  },
  show: function() {
    if (this.loadOnShow && !this.loaded && !this.store.loading) {
      this.store.load();
    }
    this.callParent();
  },
  onLoad: function(store, records) {
    var me = this,
    gid, itemValue, i, len, listeners = {
      checkchange: me.checkChange,
      scope: me
    };
    Ext.suspendLayouts();
    me.removeAll(true);
    gid = me.single ? Ext.id() : null;
    for (i = 0, len = records.length; i < len; i++) {
      itemValue = records[i].get('id');
      me.add(Ext.create('Ext.menu.CheckItem', {
        text: records[i].get(me.labelField),
        group: gid,
        checked: Ext.Array.contains(me.selected, itemValue),
        hideOnClick: false,
        value: itemValue,
        listeners: listeners
      }));
    }
    me.loaded = true;
    Ext.resumeLayouts(true);
    me.fireEvent('load', me, records);
  },
  getSelected: function() {
    return this.selected;
  },
  setSelected: function(value) {
    value = this.selected = [].concat(value);
    if (this.loaded) {
      this.items.each(function(item) {
        item.setChecked(false, true);
        for (var i = 0, len = value.length; i < len; i++) {
          if (item.value == value[i]) {
            item.setChecked(true, true);
          }
        }
      },
      this);
    }
  },
  checkChange: function(item, checked) {
    var value = [];
    this.items.each(function(item) {
      if (item.checked) {
        value.push(item.value);
      }
    },
    this);
    this.selected = value;
    this.fireEvent('checkchange', item, checked);
  }
});
Ext.define('Ext.ux.grid.menu.RangeMenu', {
  extend: 'Ext.menu.Menu',
  fieldCls: 'Ext.form.field.Number',
  iconCls: {
    gt: 'ux-rangemenu-gt',
    lt: 'ux-rangemenu-lt',
    eq: 'ux-rangemenu-eq'
  },
  fieldLabels: {
    gt: 'Greater Than',
    lt: 'Less Than',
    eq: 'Equal To'
  },
  menuItemCfgs: {
    emptyText: 'Enter Number...',
    selectOnFocus: false,
    width: 155
  },
  menuItems: ['lt', 'gt', '-', 'eq'],
  constructor: function(config) {
    var me = this,
    fields, fieldCfg, i, len, item, cfg, Cls;
    me.callParent(arguments);
    fields = me.fields = me.fields || {};
    fieldCfg = me.fieldCfg = me.fieldCfg || {};
    me.addEvents('update');
    me.updateTask = Ext.create('Ext.util.DelayedTask', me.fireUpdate, me);
    for (i = 0, len = me.menuItems.length; i < len; i++) {
      item = me.menuItems[i];
      if (item !== '-') {
        cfg = {
          itemId: 'range-' + item,
          enableKeyEvents: true,
          hideLabel: false,
          fieldLabel: me.iconTpl.apply({
            cls: me.iconCls[item] || 'no-icon',
            text: me.fieldLabels[item] || '',
            src: Ext.BLANK_IMAGE_URL
          }),
          labelSeparator: '',
          labelWidth: 29,
          labelStyle: 'position: relative;',
          listeners: {
            scope: me,
            change: me.onInputChange,
            keyup: me.onInputKeyUp,
            el: {
              click: function(e) {
                e.stopPropagation();
              }
            }
          },
          activate: Ext.emptyFn,
          deactivate: Ext.emptyFn
        };
        Ext.apply(cfg, Ext.applyIf(fields[item] || {},
        fieldCfg[item]), me.menuItemCfgs);
        Cls = cfg.fieldCls || me.fieldCls;
        item = fields[item] = Ext.create(Cls, cfg);
      }
      me.add(item);
    }
  },
  fireUpdate: function() {
    this.fireEvent('update', this);
  },
  getValue: function() {
    var result = {},
    key, field;
    for (key in this.fields) {
      field = this.fields[key];
      if (field.isValid() && field.getValue() !== null) {
        result[key] = field.getValue();
      }
    }
    return result;
  },
  setValue: function(data) {
    var me = this,
    key, field;
    for (key in me.fields) {
      field = me.fields[key];
      field.suspendEvents();
      field.setValue(key in data ? data[key] : '');
      field.resumeEvents();
    }
    me.fireEvent('update', me);
  },
  onInputKeyUp: function(field, e) {
    if (e.getKey() === e.RETURN && field.isValid()) {
      e.stopEvent();
      this.hide();
    }
  },
  onInputChange: function(field) {
    var me = this,
    fields = me.fields,
    eq = fields.eq,
    gt = fields.gt,
    lt = fields.lt;
    if (field == eq) {
      if (gt) {
        gt.setValue(null);
      }
      if (lt) {
        lt.setValue(null);
      }
    } else {
      eq.setValue(null);
    }
    this.updateTask.delay(this.updateBuffer);
  }
},
function() {
  this.prototype.iconTpl = Ext.create('Ext.XTemplate', '<img src="{src}" alt="{text}" class="' + Ext.baseCSSPrefix + 'menu-item-icon ux-rangemenu-icon {cls}" />');
});