# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Emanuel', :city => cities.first)

admin = User.new(:name => 'admin')
admin.slat = admin.object_id.to_s
admin.code = User.encrypt('admin', admin.slat)
admin.save