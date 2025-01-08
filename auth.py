from flask import (
    Blueprint, g, redirect, render_template, url_for, request, session, flash
)
import functools
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Principal

bp = Blueprint('auth', __name__)

def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))
        return view(**kwargs)
    return wrapped_view

@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = User.query.get(user_id)


@bp.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        error = None

        user = User.query.filter_by(username=username).first()

        if user is None:
            error = 'Incorrect username.'
        elif not check_password_hash(user.password, password):
            error = 'Incorrect password.'
        
        if error is None:
            session.clear()
            session['user_id'] = user.id

            if user.firstLogin == 1:
                print(0)
                return redirect(url_for('auth.firstlogin'))
            elif user.firstLogin == 0:
                print(1)
                return redirect(url_for('dashboard.index'))
            else:
                return render_template('auth/login.html')
    
        flash(error, 'danger')        
    return render_template('auth/login.html')

@bp.route('/first-login', methods=['GET','POST'])
@login_required
def firstlogin():
    if request.method == 'POST':
        oldpassword = request.form.get('oldpassword')
        newpassword = request.form.get('newpassword')
        repeatpassword = request.form.get('repeatpassword')
        error = None

        user = User.query.get(session['user_id'])

        if not check_password_hash(user.password, oldpassword):
            error = 'Old password incorrect'
        elif check_password_hash(user.password, newpassword):
            error = 'New password cannot be the same as old password'
        elif not newpassword == repeatpassword:
            error = 'New passwords do not match'
        
        if error is None:
            # Hash the new password
            hashed_password = generate_password_hash(newpassword)
            # Update the user's password
            user.password = hashed_password
            user.firstLogin = False  # Assuming firstlogin is no longer True after the reset
            try:
                db.session.commit()
                flash('Password updated successfully!', 'success')
                return redirect(url_for('dashboard.index'))
            except Exception as e:
                db.session.rollback()
                error = 'An error occurred while updating the password. Please try again.'
                print(e)
        
        # If there's an error, render the form again
        flash(error, 'danger')
    return render_template('auth/first_login.html')

@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('dashboard.index'))

