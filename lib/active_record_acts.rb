module ActiveRecord
  module Acts
    autoload :Tree, 'active_record/acts/tree'
    autoload :List, 'active_record/acts/list'
    autoload :NestedSet, 'active_record/acts/nested_set'
  end
end
ActiveRecord::Base.send :include, ActiveRecord::Acts::Tree
ActiveRecord::Base.send :include, ActiveRecord::Acts::List
ActiveRecord::Base.send :include, ActiveRecord::Acts::NestedSet