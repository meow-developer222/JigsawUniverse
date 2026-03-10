from flask import Flask
from .main import main_bp

def create_app():
    app = Flask(__name__, static_folder='static')
    app.register_blueprint(main_bp)
    return app
