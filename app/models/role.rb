class Role < ActiveRecord::Base
  has_many :users, :through => :user_roles
  has_many :menus, :through => :menu_roles
  # attr_accessible :title, :body
  validates :name, :presence => true
end
