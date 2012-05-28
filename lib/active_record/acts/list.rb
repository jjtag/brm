module ActiveRecord
  module Acts
    module List
      def self.included(base)
        base.extend(ClassMethods)
      end
      
      module ClassMethods
        def acts_as_list(options = {})
          configuration = {
            :column => 'position',
            :scope => '1 = 1',
            :top_of_list => 1,
            :add_new_at => :bottom
          }
          configuration.update(options) if options.is_a?(Hash)
          configuration[:scope] = "#{configuration[:scope]}_id".intern if configuration[:scope].is_a?(Symbol) && configuration[:scope].to_s !~ /_id$/
          if configuration[:scope].is_a?(Symbol)
            scope_condition_method = %(
              def scope_condition
                self.class.send :sanitize_sql_hash_for_conditions, {:#{configuration[:scope].to_s} => send(:#{configuration[:scope].to_s})}
              end
            )
          elsif configuration[:scope].is_a?(Array)
            scope_condition_method = %(
              def scope_condition
                attrs = %w(#{configuration[:scope].join(" ")}).inject({}) do |memo, column|
                  memo[column.intern] = send column.intern
                  memo
                end
                self.class.send :sanitize_sql_hash_for_conditions, attrs
              end
            )
          else
            scope_condition_method = "def scope_condition() \"#{configuration[:scope]}\" end"
          end
          
          class_eval <<-EOV
            include ActiveRecord::Acts::List::InstanceMethods
            
            def acts_as_list_top
              #{configuration[:top_of_list]}.to_i
            end
            
            def acts_as_list_class
              ::#{self.name}
            end
            
            def position_column
              "#{configuration[:column]}"
            end
            
            #{scope_condition_method}
            
            after_destroy :decrement_positions_on_lower_items
            before_create :add_to_list_#{configuration[:add_new_at]}
          EOV
        end
      end
      
      module InstanceMethods
        def insert_at(position = acts_as_list_top)
          insert_at_postition(position)
        end
        
        def move_lower
          return unless lower_item
          acts_as_list_class.transaction do
            lower_item.decrement_position
            increment_position
          end
        end
        
        def move_higher
          return unless higher_item
          acts_as_list_class.transaction do
            higher_item.increment_position
            decrement_position
          end
        end
        
        def move_to_bottom
          return unless in_list?
          acts_as_list_class.transaction do
            decrement_positions_on_lower_items
            assume_bottom_position
          end
        end
        
        def move_to_top
          return unless in_list?
          acts_as_list_class.transaction do
            increment_positions_on_higher_items
            assume_top_position
          end
        end
        
        def remove_from_list
          if in_list?
            decrement_positions_on_lower_items
            update_attribute position_column, nil
          end
        end
        
        def increment_position
          return unless in_list?
          update_attribute position_column, send(position_column).to_i + 1
        end
        
        def decrement_position
          return unless in_list?
          update_attribute position_column, send(position_column).to_i - 1
        end
        
        def first?
          return false unless in_list?
          self.send(position_column) == acts_as_list_top
        end
        
        def last?
          return false unless in_list?
          self.send(position_column) == bottom_position_in_list
        end
        
        def higher_item
          return nil unless in_list?
          acts_as_list_class.where(["#{scope_condition} AND #{position_column} = ?", send(position_column).to_i - 1]).first
        end
        
        def lower_item
          return nil unless in_list?
          acts_as_list_class.where(["#{scope_condition} AND #{position_column} = ?", send(position_column).to_i + 1]).first
        end
        
        def in_list?
          !not_in_list?
        end
        
        def not_in_list?
          send(position_column).nil?
        end
        
        def default_position
          acts_as_list_class.columns_hash[position_column.to_s].default
        end
        
        def default_position?
          default_position == send(position_column)
        end
        
        private
        
        def add_to_list_top
          increment_positions_on_all_items
          self[position_column] = acts_as_list_top
        end
        
        def add_to_list_bottom
          if not_in_list? || default_position?
            self[position_column] = bottom_position_in_list.to_i + 1
          else
            increment_positions_on_lower_items self[position_column]
          end
        end
        
        def scope_condition
          "1"
        end
        
        def bottom_position_in_list(except = nil)
          item = bottom_item(except)
          item ? item.send(position_column) : acts_as_list_top - 1
        end
        
        def bottom_item(except = nil)
          conditions = scope_condition
          conditions = "#{conditions} AND #{self.class.primary_key} != #{except.id}" if except
          acts_as_list_class.unscoped.where(conditions).order("#{acts_as_list_class.table_name}.#{position_column} DESC").first
        end
        
        def assume_bottom_position
          update_attribute position_column, bottom_position_in_list(self).to_i + 1
        end
        
        def assume_top_position
          update_attribute position_column, acts_as_list_top
        end
        
        def decrement_positions_on_higher_items(position)
          acts_as_list_class.update_all "#{position_column} = #{position_column} - 1", "#{scope_condition} AND #{position_column} <= #{position}"
        end
        
        def decrement_positions_on_lower_items(position = nil)
          return unless in_list?
          position ||= send(position_column).to_i
          acts_as_list_class.update_all "#{position_column} = #{position_column} - 1", "#{scope_condition} AND #{position_column} > #{position}"
        end
        
        def increment_positions_on_higher_items
          return unless in_list?
          acts_as_list_class.update_all "#{position_column} = #{position_column} + 1", "#{scope_condition} AND #{position_column} < #{send(position_column).to_i}"
        end
        
        def increment_positions_on_lower_items(position)
          acts_as_list_class.update_all "#{position_column} = #{position_column} + 1", "#{scope_condition} AND #{position_column} >= #{position}"
        end
        
        def increment_positions_on_all_items
          acts_as_list_class.update_all "#{position_column} = #{position_column} + 1", "#{scope_condition}"
        end
        
        def shuffle_position_on_intermediate_items(old_position, new_position)
          return if old_position == new_position
          if old_position < new_position
            acts_as_list_class.update_all "#{position_column} = #{position_column} - 1", "#{scope_condition} AND #{position_column} > #{old_position} AND #{position_column} <= #{new_position}"
          else
            acts_as_list_class.update_all "#{position_column} = #{position_column} + 1", "#{scope_condition}  AND #{position_column} >= #{new_position} AND #{position_column} < #{old_position}"
          end
        end
        
        def insert_at_position(position)
          if in_list?
            old_position = send(position_column).to_i
            return if position == old_position
            shuffle_positions_on_intermediate_items old_position, position
          else
            increment_positions_on_lower_items position
          end
          self.update_attribute position_column, position
        end
      end
    end
  end
end