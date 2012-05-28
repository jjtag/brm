class CreateCoins < ActiveRecord::Migration
  def change
    create_table :coins do |t|
      t.string :name, :null => false
      t.text :note
#      t.timestamps
    end

    create_table :rates do |t|
      t.references :coin, :null => false
      t.datetime :from_at, :null => false
      t.decimal :rate, :null => false
      t.text :note
#      t.timestamps
    end
  end
end
