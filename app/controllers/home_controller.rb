class HomeController < ApplicationController
  
  skip_before_filter :authorize, :only => :index
  
  def index
  end
  
  def login
    user = User.authenticate params[:username], params[:password]
    respond_to do |format|
      if user
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
      format.json { render :json => nil }
    end
  end

end