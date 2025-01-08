from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    app.config.from_mapping(
        SECRET_KEY='dev',
        SQLALCHEMY_DATABASE_URI='mysql+pymysql://root:YtOtY00f=>tr@localhost/tankspread',
        SQLALCHEMY_TRACK_MODIFICATIONS=False
    )

    db.init_app(app)

    import auth
    app.register_blueprint(auth.bp)

    import dashboard
    app.register_blueprint(dashboard.bp)

    import principals
    app.register_blueprint(principals.bp)


    with app.app_context():
        db.create_all()
    
    return app
