from flask import Blueprint, render_template, request, redirect, url_for


main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
   return render_template('puzzle.html')


@main_bp.route('/net/<roomID>')
def net(roomID):
   return render_template('index.html', roomID=roomID)
