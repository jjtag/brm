# coding: utf-8
class CreateUsers < ActiveRecord::Migration
  def change
    
    #用户表
    create_table :users do |t|
      t.string :name, :null => false
      t.string :salt, :null => false
      t.string :code, :null => false
      t.text :note
#      t.timestamps
    end
    
    # 用户角色多连表
    create_table :user_roles, {:id => false} do |t|
      t.references :user, :null => false
      t.references :role, :null => false
    end
    add_index :user_roles, :user_id
    add_index :user_roles, :role_id

  end
end