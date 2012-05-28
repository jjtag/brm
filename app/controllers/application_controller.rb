# coding: utf-8

class ApplicationController < ActionController::Base

  before_filter :authorize, :except => :login

  #protect_from_forgery

private

  def authorize
    unless session[:user_id]
      respond_to do |format|
        format.html { redirect_to :action => 'login' }
        format.json { head 401 }
      end
    end
  end

end
