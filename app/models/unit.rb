# coding: utf-8
class Unit < ActiveRecord::Base
  validates :name :presence => true
  
end