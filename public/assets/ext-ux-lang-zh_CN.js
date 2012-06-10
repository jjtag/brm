Ext.onReady(function() {
  Ext.define('Ext.locale.zh_CN.ux.grid.filter.BooleanFilter', {
    override: 'Ext.ux.grid.filter.BooleanFilter',
    yesText: '是',
    noText: '否'
  });

  Ext.define('Ext.locale.zh_CN.ux.grid.filter.StringFilter', {
    override: 'Ext.ux.grid.filter.StringFilter',
    emptyText: '请输入筛选内容...'
  });

  Ext.define('Ext.locale.zh_CN.ux.grid.filter.DateFilter', {
    override: 'Ext.ux.grid.filter.DateFilter',
    afterText: '之后',
    beforeText: '之前',
    dateFormat: 'Y年m月d日',
    onText: '在'
  });

  Ext.define('Ext.locale.zh_CN.ux.grid.menu.ListMenu', {
    override: 'Ext.ux.grid.menu.ListMenu',
    labelField: '内容',
    loadingText: '读取中...'
  });

  Ext.define('Ext.locale.zh_CN.ux.grid.menu.RangeMenu', {
    override: 'Ext.ux.grid.menu.RangeMenu',
    fieldLabels: {
      gt: '大于',
      lt: '小于',
      eq: '等于'
    }
  });

  if (Ext.ux.grid.menu.RangeMenu) {
    Ext.ux.grid.menu.RangeMenu.prototype.menuItemCfgs.emptyText = '请输入数字...';
  }
});