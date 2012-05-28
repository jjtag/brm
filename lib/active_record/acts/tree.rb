module ActiveRecord
  module Acts
    module Tree
      def self.included(base)
        #base.send(:include, InstanceMethods)
        base.extend(ClassMethods)
      end
    
      module ClassMethods
        def acts_as_tree(options = {})
          configuration = {
            :foreign_key => 'parent_id',
            :order => nil,
            :counter_cache => nil,
            :dependent => :destroy
          }
          configuration.update(options) if options.is_a?(Hash)
          
          belongs_to :parent, :class_name => name, :foreign_key => configuration[:foreign_key], :counter_cache => configuration[:counter_cache]#, :inverse_of => :children
          has_many :children, :class_name => name, :foreign_key => configuration[:foreign_key], :order => configuration[:order], :dependent => configuration[:dependent]#, :inverse_of => :parent

          class_eval <<-EOV
            include ActiveRecord::Acts::Tree::InstanceMethods
            after_update :update_parents_counter_cache

            class << self
              def roots
                roots_relation.all
              end
            
              def root
                roots_relation.first
              end
            
              private
              def roots_relation
                where("#{configuration[:foreign_key]} IS NULL").order(%Q{#{configuration.fetch :order, "nil"}})
              end
            end
          EOV
        end
      end
      
      module InstanceMethods

        def ancestors
          node, nodes = self, []
          nodes << node = node.parent while node.parent
        end
        
        def root?
          parent == nil
        end
        
        def leaf?
          children.length == 0
        end
        
        def root
          node = self
          node = node.parent while node.parent
          node
        end
        
        def siblings
          self_and_siblings - [self]
        end
        
        def self_and_siblings
          parent ? parent.children : self.class.roots
        end

        def self_and_children
          [self] + children
        end
        
        private

        def update_parents_counter_cache
          if self.respond_to?(:children_count) && parent_id_changed?
            self.class.decrement_counter :children_count, parent_id_was
            self.class.increment_counter :children_count, parent_id
          end
        end
      end
    end
  end
end

ActiveRecord::Base.send :include, ActiveRecord::Acts::Tree