from flask import (
    Blueprint, redirect, render_template, url_for, jsonify, current_app, g, request, session
)

from auth import login_required
from models import db, Principal, Contact, Tank, Job, ImportTank, DepotTank, ExportTank
from datetime import datetime
import pycountry

COUNTRIES = [country.name for country in pycountry.countries]

bp = Blueprint('principals', __name__)

@bp.route('/principals', methods=['GET', 'POST'])
@login_required
def index():

    principals = Principal.query.all()

    principals_dict = [principal.to_dict() for principal in principals]

    return render_template('main/principals.html',
                           principals=jsonify(principals_dict).json,
                           countries=COUNTRIES
                           )


@bp.route('/get-principal-details/<int:principal_id>', methods=['GET'])
def get_principal_details(principal_id):
    # Find the principal by ID

    principal = Principal.query.filter_by(id=principal_id).first()

    contacts = Contact.query.filter_by(principal=principal_id).all()
    contacts_dict = [contact.to_dict() for contact in contacts]
    
    if principal:
        if contacts_dict:
            print(contacts_dict)
            return jsonify({"principal": principal.to_dict(), "contacts": contacts_dict})
        return jsonify({"principal": principal.to_dict()})    
    else:
        return jsonify({"error": "Principal not found"}), 404
    

@bp.route('/add_principal', methods=['POST'])
@login_required
def add_principal():
    data = request.get_json()

    # Extract and convert data
    def to_boolean(value):
        return value.lower() in ['true', 'on', '1'] if isinstance(value, str) else bool(value)

    def to_float(value):
        try:
            return float(value)
        except (ValueError, TypeError):
            return 0.0  # Default to 0.0 if invalid

    def to_integer(value):
        try:
            return int(value)
        except (ValueError, TypeError):
            return 0  # Default to 0 if invalid

    name = data.get("name")
    ocountry = data.get("ocountry")
    tier = data.get("tier")
    agreement = to_boolean(data.get("agreement"))
    impfee = to_float(data.get("impfee"))
    impfeeCurrency = to_integer(data.get("impfeeCurrency"))
    expfeeTNL = to_float(data.get("expfeeTNL"))
    expfeeTNLCurrency = to_integer(data.get("expfeeTNLCurrency"))
    expfeeAGT = to_float(data.get("expfeeAGT"))
    expfeeAGTCurrency = to_integer(data.get("expfeeAGTCurrency"))
    mtRepoFee = to_float(data.get("mtRepoFee"))
    mtRepoFeeCurrency = to_integer(data.get("mtRepoFeeCurrency"))
    demurrage = to_float(data.get("demurrage"))
    notes = data.get("notes")
    isHidden = to_boolean(data.get("isHidden"))
    isArchived = to_boolean(data.get("isArchived"))

    print(data.get("isArchived"))

    # Validate required fields
    if not name or not ocountry:
        return jsonify({"error": "'name' and 'ocountry' are required fields."}), 400

    # Create a new Principal object
    new_principal = Principal(
        name=name,
        originCountry=ocountry,
        tier=tier,
        agencyAgreement=agreement,
        importFee=impfee,
        importFeeCurrency=impfeeCurrency,
        exportFeeTNL=expfeeTNL,
        exportFeeTNLCurrency=expfeeTNLCurrency,
        exportFeeAGT=expfeeAGT,
        exportFeeAGTCurrency=expfeeAGTCurrency,
        mtRepoFee=mtRepoFee,
        mtRepoFeeCurrency=mtRepoFeeCurrency,
        demurrageCommission=demurrage,
        notes=notes,
        isHidden=isHidden,
        isArchived=isArchived
    )

    # Add to the session and commit
    try:
        db.session.add(new_principal)
        db.session.commit()
        return jsonify({"message": "Principal added successfully.", "principal": new_principal.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred while adding the principal.", "details": str(e)}), 500

    


@bp.route('/save_principal', methods=['POST'])
@login_required
def save_principal():
    data = request.get_json()

    # Extract fields from the request JSON
    id = data.get("id")
    tier = data.get("tier")
    agreement = data.get("agreement")
    impfee = data.get("impfee")
    impfeeCurrency = data.get("impfeeCurrency")
    expfeeTNL = data.get("expfeeTNL")
    expfeeTNLCurrency = data.get("expfeeTNLCurrency")
    expfeeAGT = data.get("expfeeAGT")
    expfeeAGTCurrency = data.get("expfeeAGTCurrency")
    mtRepo = data.get("mtRepo")
    mtRepoCurrency = data.get("mtRepoCurrency")
    demComm = data.get("demComm")
    notes = data.get("notes")
    isHidden = data.get("isHidden")
    isArchived = data.get("isArchived")
    contacts = data.get("contacts")

    fixedAgreement = 0

    # Fetch the Principal record from the database
    principal = Principal.query.filter_by(id=id).first()

    if not principal:
        return jsonify({"error": "Principal not found"}), 404

    # Update the Principal fields
    if tier is not None:
        principal.tier = tier
    if agreement is not None:
        if agreement == "true":
            fixedAgreement = 1
        elif agreement == "false":
            fixedAgreement = 0
        principal.agencyAgreement = fixedAgreement
    if impfee is not None:
        principal.importFee = impfee
    if impfeeCurrency is not None:
        principal.importFeeCurrency = impfeeCurrency
    if expfeeTNL is not None:
        principal.exportFeeTNL = expfeeTNL
    if expfeeTNLCurrency is not None:
        principal.exportFeeTNLCurrency = expfeeTNLCurrency
    if expfeeAGT is not None:
        principal.exportFeeAGT = expfeeAGT
    if expfeeAGTCurrency is not None:
        principal.exportFeeAGTCurrency = expfeeAGTCurrency
    if mtRepo is not None:
        principal.mtRepoFee = mtRepo
    if mtRepoCurrency is not None:
        principal.mtRepoFeeCurrency = mtRepoCurrency
    if demComm is not None:
        principal.demurrageCommission = demComm
    if notes is not None:
        principal.notes = notes
    if isHidden is not None:
        principal.isHidden = isHidden
    if isArchived is not None:
        principal.isArchived = isArchived    

    # Save changes to the database
    db.session.commit()

    if contacts:
        for contact in contacts:
            if 'new' in contact and contact['new']:
                addContact(contact['principal'], contact['name'], contact['position'], contact['phone'], contact['email'])
            elif 'deleted' in contact and contact['deleted']:
                deleteContact(contact['id'])

    return jsonify({"message": "Principal saved successfully!"}), 200

def addContact(pid, name, pos, phone, email):
    # Create a new Contact instance
    contact = Contact(
        principal=pid,
        name=name,
        position=pos,
        phone=phone,
        email=email
    )

    # Add to the database session and commit
    db.session.add(contact)
    db.session.commit()

def deleteContact(cid):
    print('deleting contact', cid)

    Contact.query.filter_by(id=cid).delete()
    db.session.commit()

@bp.route('/get_principals', methods=['GET'])
@login_required
def get_principals():
    principals = Principal.query.all()

    principals_dict = [principal.to_dict() for principal in principals]

    print(principals_dict)

    return jsonify(principals_dict)
