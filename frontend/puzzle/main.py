from flask import Blueprint, render_template, request, redirect, url_for, send_from_directory
import json

main_bp = Blueprint('main', __name__)


puzzles = [
   {'image': "/static/images/test2.png"},
   {'image': "/static/images/library.png"}
]


@main_bp.route('/socket.io')
def socketIO():

   return send_from_directory("./node-modules/socket.io")




@main_bp.route('/single_play')
def single_play():
   return render_template('singleplay.html', puzzles=list(map(lambda x: {"json": json.dumps(x), **x}, puzzles)))

@main_bp.route('/multi_play/<room>')
def multi_play(room):
   return render_template('multiplay.html', puzzles=list(map(lambda x: {"json": json.dumps(x), **x}, puzzles)))


@main_bp.route('/multi_play')
def multi_play2():
   return render_template('multiplay.html', puzzles=list(map(lambda x: {"json": json.dumps(x), **x}, puzzles)))
