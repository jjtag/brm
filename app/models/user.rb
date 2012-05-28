class User < ActiveRecord::Base
  has_many :roles, :through => :user_roles
  # attr_accessible :title, :body
  validates_presence_of :name, :salt, :code
  validates :name, :uniqueness => true

  def self.authenticate(username, password)
    user = find_by_name(username)
    user && user.code == encrypt(password, user.salt) ? user : nil
  end
  
private
  
  def self.encrypt(password, salt)
    Digest::SHA256.hexdigest(password + salt)
  end

end

class UserRole < ActiveRecord::Base
  belongs_to :user
  belongs_to :role
end