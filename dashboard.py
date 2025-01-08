from flask import (
    Blueprint, redirect, render_template, url_for, jsonify, current_app, g, request, session
)

from auth import login_required
from models import db, Tank, Job, ImportTank, DepotTank, ExportTank
from datetime import datetime

bp = Blueprint('dashboard', __name__)

@bp.route('/', methods=['GET', 'POST'])
@login_required
def index():

    return render_template('main/index.html')


# @bp.route('/tank', methods=['GET', 'POST'])
# def genTank():
#     job = Job()

#     tank1 = Tank.query.filter_by(id=7).first()
#     tank2 = Tank.query.filter_by(id=8).first()

#     job.tanks.append(tank1)
#     job.tanks.append(tank2)

#     db.session.add(job)
#     db.session.commit()

    




