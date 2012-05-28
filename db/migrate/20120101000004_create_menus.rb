class CreateMenus < ActiveRecord::Migration
  def change
    create_table :menus do |t|
      t.string :name, :null => false
      t.text :note
      t.integer :parent_id, :null => false, :default => 0
#      t.timestamps
    end

    create_table :menu_roles, {:id => false} do |t|
      t.references :menu, :null => false
      t.references :role, :null => false
    end
    add_index :menu_roles, :menu_id
    add_index :menu_roles, :role_id

  end
end
