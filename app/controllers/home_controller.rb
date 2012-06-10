# coding: utf-8

class HomeController < ApplicationController

  skip_before_filter :authorize, :only => :index
  
  def index
  end
  
  def login
    user = User.authenticate params[:username], params[:password]
    respond_to do |format|
      if user
        session[:visit_at] = Time.now
        session[:user_id] = user.id
        format.html
        format.json { render :json => {:success => true} }
      else
        format.html
        format.json { render :json => {:success => false, :msg => nil} }
      end
    end
  end

  def logout
    session.clear
    respond_to do |format|
      format.html
      format.json { render :json => {:success => true} }
    end
  end
  
  def start
    respond_to do |format|
      format.html
      format.json { render :json => {
        :user => '管理员',
        :modules => ['App.module.Pie', 'App.module.Chart', 'App.module.Chart1', 'App.module.Customer', 'App.module.Currency'],
        :menus => [{
          :text => '基础数据',
          :menu => {
            :items => [{
              :text => '成员架构'
            }, 'App.module.Customer', 'App.module.Currency']
          }
        }, {
          :text => '凭证票据',
          :menu => {
            :items => [{
              :text => '常规类',
              :menu => {
                :items => [{
                  :text => '进帐单'
                }, {
                  :text => '转出单'
                }]
              }
            }, {
              :text => '票据类',
              :menu => {
                :items => [{
                  :text => '承兑收入'
                }, {
                  :text => '承兑背书'
                }, {
                  :text => '承兑贴现'
                }, '-', {
                  :text => '收到信用证'
                }, {
                  :text => '信用证发货'
                }, {
                  :text => '开信用证'
                }]
              }
            }, {
              :text => '借贷类',
              :menu => {
                :items => [{
                  :text => '银行贷款'
                }, {
                  :text => '本金还贷'
                }, {
                  :text => '贷款付息'
                }]
              }
            }]
          }
        }, {
          :text => '业务操作',
          :menu => {
            :items => [{
              :text => '资金申请'
            }, {
              :text => '资金审批'
            }]
          }
        }, {
          :text => '帐簿报表',
          :menu => {
            :items => [{
              :text => '科目余额表'
            }, {
              :text => '资金统计表'
            }, {
              :text => '现金日记帐'
            }, {
              :text => '银行日记帐'
            }]
          }
        }, {
          :text => '票据报表',
          :menu => {
            :items => [{
              :text => '应收票据'
            }, {
              :text => '应付票据'
            }]
          }
        }, {
          :text => '借贷报表',
          :menu => {
            :items => [{
              :text => '借款统计表'
            }, {
              :text => '贷款统计表'
            }]
          }
        }, {
          :text => '系统管理'
        }],
        :sides => ['App.module.Currency'],
        :tools => ['->', 'App.Logout'],
        :shortcuts => ['App.module.Pie', 'App.module.Chart', 'App.module.Chart1', 'App.module.Customer', 'App.module.Currency']
      }}
    end
  end

end