# coding: utf-8

class ApplicationController < ActionController::Base

  before_filter :authorize, :except => :login

  #protect_from_forgery

private

  def authorize
    time_left = (Time.now - session[:visit_at]).to_i
    if time_left <= 20 * 60 and session[:user_id]
      #超时时间设置为20分钟
      session[:visit_at] = Time.now
    else
      session.clear
      respond_to do |format|
        format.html { redirect_to :action => 'login' }
        format.json { head 401 }
      end
    end
  end

end
