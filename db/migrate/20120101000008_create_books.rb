# encoding: uft-8
class CreateBooks < ActiveRecord::Migration
  def change
    create_table :books do |t|
      t.string :type, :null => false, :comment => '单据类型'
      t.boolean :take, :null => false, :default => false, :comment => '单据方向'
      t.references :coin, :null => false, :comment => '币种'
      t.references :book, :comment => '引用'
      t.datetime :from_at, :comment => '开始日期'
      t.datetime :to_at, :comment => '结束日期'
      t.decimal :amount, :comment => '金额'
      t.text :note, :comment => '摘要'
      t.text :data, :comment => '附加数据'
#      t.timestamps
    end
  end
end
