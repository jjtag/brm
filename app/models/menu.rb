require 'active_record/acts/tree'

class Menu < ActiveRecord::Base
  has_many :roles, :through => :user_roles
  #has_many :children, :class_name => :Menu, :foreign_key => :parent_id
  #belongs_to :parent, :class_name => :Menu
  validates_presence_of :name
  #attr_accessible :body, :title
  acts_as_tree
  #
end

class MenuRole < ActiveRecord::Base
  belongs_to :menu
  belongs_to :role
end