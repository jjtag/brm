module ActiveRecord
  module Acts
    module NestedSet
      def self.included(base)
        base.extend(ClassMethods)
      end
      
      module ClassMethods
        def acts_as_nested_set(options = {})
          configuration = {
            :parent_column => 'parent_id',
            :left_column => 'lft',
            :right_column => 'rgt',
            :scope => '1 = 1'
          }
          configuration.update(options) if options.is_a?(Hash)
          configuration[:scope] = "#{configuration[:scope]}_id".intern if configuration[:scope].is_a?(Symbol) && configuration[:scope].to_s !~ /_id$/
          if configuration[:scope].is_a?(Symbol)
            scope_condition_method = %(
              def scope_condition
                if #{configuration[:scope].to_s}.nil?
                  "#{configuration[:scope].to_s} IS NULL"
                else
                  "#{configuration[:scope].to_s} = \#{#{configuration[:scope].to_s}}"
                end
              end
            )
          else
            scope_condition_method = %(
              def scope_condition
                "#{configuration[:scope]}"
              end
            )
          end
          
          class_eval <<-EOV
            include ActiveRecord::Acts::NestedSet::InstanceMethods
            #{scope_condition_method}
            def left_col_name
              "#{configuration[:left_column]}"
            end
            def right_col_name
              "#{configuration[:right_column]}"
            end
            def parent_column
              "#{configuration[:parent_column]}"
            end
          EOV
        end
      end
      
      module InstanceMethods
        def root?
          parent_id = self[parent_column]
          (parent_id == 0 || parent_id.nil?) && (self[left_col_name] == 1) && (self[right_col_name] > self[left_col_name])
        end
        
        def child?
          parent_id = self[parent_column]
          !(parent_id == 0 || parent_id.nil?) && (self[left_col_name] > 1) && (self[right_col_name] > self[left_col_name])
        end
        
        def unknown?
          !root? && !child?
        end
        
        def add_child(child)
          reload
          child.reload
          if child.root?
            raise "Adding sub-tree isn't currently supported"
          else
            if self[left_col_name] == nil || self[right_col_name] == nil
              self[left_col_name] = 1
              self[right_col_name] = 4
              return nil unless save
              child[parent_column] = id
              child[left_col_name] = 2
              child[right_col_name] = 3
              return child.save
            else
              child[parent_column] = id
              right_bound = self[right_col_name]
              child[left_col_name] = right_bound
              child[right_col_name] = right_bound + 1
              self[right_col_name] += 2
              self.class.base_class.transaction do
                self.class.base_class.update_all("#{left_col_name} = #{left_col_name} + 2", "#{scope_condition} AND #{left_col_name} >= #{rght_bound}")
                self.class.base_class.update_all("#{right_col_name} = #{right_col_name} + 2", "#{scope_condition} AND #{right_col_name} >= #{right_bound}")
                save
                child.save
              end
            end
          end
        end

        def children_count
          return (self[right_col_name] - self[left_col_name] - 1) / 2
        end
        
        def full_set
          self.class.base_class.where(["#{scope_condition} AND (#{left_col_name} BETWEEN ? AND ?)", self[left_col_name], self[right_col_name]]).all
          #.all(:conditions => "#{scope_condition} AND (#{left_col_name} BETWEEN #{self[left_col_name]} AND #{self[right_col_name]})")
        end
        
        def all_children
          self.class.base_class.where(["#{scope_condition} AND #{left_col_name} > ? AND #{right_col_name} < ?", self[left_col_name], self[right_col_name]]).all
          #.all(:conditions => "#{scope_condition} AND #{left_col_name} > #{self[left_col_name]} AND #{right_col_name} < #{self[right_col_name]}")
        end
        
        def direct_children
          self.class.base_class.where(["#{scope_condition} AND #{parent_column} = ?", id]).all
          #.all(:conditions => "#{scope_condition} AND #{parent_column} = #{id}")
        end
        
        def before_destroy
          return if self[right_col_name].nil? || self[left_col_name].nil?
          dif = self[right_col_name] - self[left_col_name] + 1
          self.class.base_class.transaction do
            self.class.base_class.delete_all(["#{scope_condition} AND #{left_col_name} > ? AND #{right_col_name} < ?", self[left_col_name], self[right_col_name]])
            self.class.base_class.update_all(["#{left_col_name} = #{left_col_name} - ?", dif], ["#{scope_condition} AND #{left_col_name} >= ?", self[right_col_name]])
            self.class.base_class.update_all(["#{right_col_name} = #{right_col_name} - ?", dif], ["#{scope_condition}  AND #{right_col_name} >= ?", self[right_col_name]])
          end
        end
      end
    end
  end
end