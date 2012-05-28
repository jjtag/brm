class Coin < Active::Base
  has_many :rates
  validates :name, :presence => true, :uniqueness => true
end

class Rate < ActiveRecord::Base
  belongs_to :coin
  validates_presence_of :start, :rate
  #validates :rate > 0
end