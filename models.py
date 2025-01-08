from app import db
from datetime import datetime
from sqlalchemy import Enum
from enum import Enum as pEnum
import pycountry

COUNTRIES = [country.name for country in pycountry.countries]

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    firstname = db.Column(db.String(50), nullable=False, default="")
    lastname = db.Column(db.String(100), nullable=False, default="")
    phone = db.Column(db.String(100), nullable=False, default="")
    principal = db.Column(db.Integer, db.ForeignKey('principals.id'), nullable=False)
    firstLogin = db.Column(db.Boolean, nullable=False, default=True)

    lastUpdated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Contact(db.Model):
    __tablename__ = 'contacts'

    id = db.Column(db.Integer, primary_key=True)
    principal = db.Column(db.Integer, db.ForeignKey('principals.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    position = db.Column(db.String(100), nullable=True, default="")
    email = db.Column(db.String(100), nullable=True, default="")
    phone = db.Column(db.String(100), nullable=True, default="")

    def to_dict(self):
        return { 
            "id": self.id,
            "principal": self.principal,
            "name": self.name,
            "position": self.position,
            "email": self.email,
            "phone": self.phone
        }

class Principal(db.Model):
    __tablename__ = 'principals'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    originCountry = db.Column(Enum(*COUNTRIES, name='country_enum'), nullable=False)
    activeShipments = db.Column(db.Integer, nullable=False, default=0)
    tier = db.Column(db.String(3), nullable=False, default=5)

    agencyAgreement = db.Column(db.Boolean, nullable=False, default=False)
    importFee = db.Column(db.Float, nullable=False, default=0)
    importFeeCurrency = db.Column(db.Integer, nullable=False, default=0)
    exportFeeTNL = db.Column(db.Float, nullable=False, default=0)
    exportFeeTNLCurrency = db.Column(db.Integer, nullable=False, default=0)
    exportFeeAGT = db.Column(db.Float, nullable=False, default=0)
    exportFeeAGTCurrency = db.Column(db.Integer, nullable=False, default=0)
    mtRepoFee = db.Column(db.Float, nullable=False, default=0)
    mtRepoFeeCurrency = db.Column(db.Integer, nullable=False, default=0)
    demurrageCommission = db.Column(db.Float, nullable=False, default=0)

    notes = db.Column(db.Text, nullable=True)

    isHidden = db.Column(db.Boolean, nullable=False, default=False)
    isArchived = db.Column(db.Boolean, nullable=False, default=False) 

    lastUpdated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "originCountry": self.originCountry,
            "activeShipments": self.activeShipments,
            "tier": self.tier,
            "agencyAgreement": self.agencyAgreement,
            "importFee": self.importFee,
            "importFeeCurrency": self.importFeeCurrency,
            "exportFeeTNL": self.exportFeeTNL,
            "exportFeeTNLCurrency": self.exportFeeTNLCurrency,
            "exportFeeAGT": self.exportFeeAGT,
            "exportFeeAGTCurrency": self.exportFeeAGTCurrency,
            "mtRepoFee": self.mtRepoFee,
            "mtRepoFeeCurrency": self.mtRepoFeeCurrency,
            "demurrageCommission": self.demurrageCommission,
            "notes": self.notes,
            "isHidden": self.isHidden,
            "isArchived": self.isArchived,
            "lastUpdated": self.lastUpdated.isoformat() if self.lastUpdated else None  # Convert datetime to string
        }

class Depot(db.Model):
    __tablename__ = 'depots'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)

    lastUpdated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DepotStatus(pEnum):
    TBC = "To Be Confirmed"
    ES = "Empty Storage Only"
    AW = "Awaiting Wash"
    AR = "Awaiting Repairs"
    TBS = "To Be Surveyed"
    CC = "Surveyed / Awaiting Clean Cert"
    POA = "Pending Owners Approval"
    AV = "Available"

class ShipmentStatus(pEnum):
    unclean = "E-Unclean"
    clean = "E-Clean"
    loaded = "Loaden"


# Best way to connect up each tank to be able to have an import, depot and export stage is to have 3 tables, and link all of them up with foreign keys

tank_job_association = db.Table(
    'tank_job_association',
    db.Column('tank_id', db.Integer, db.ForeignKey('tanks.id'), primary_key=True),
    db.Column('job_id', db.Integer, db.ForeignKey('jobs.id'), primary_key=True)
)

# base class
class Tank(db.Model):
    __tablename__ = 'tanks'

    id = db.Column(db.Integer, primary_key=True)
    tankNumber = db.Column(db.String(255), unique=True, nullable=False, default="")
    tankOwner = db.Column(db.Integer, db.ForeignKey('principals.id'), nullable=False)

    jobs = db.relationship(
        'Job',
        secondary=tank_job_association,
        back_populates='tanks'
    )

class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True)

    lastUpdated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tanks = db.relationship(
        'Tank',
        secondary=tank_job_association,
        back_populates='jobs'
    )

class ImportTank(db.Model):
    __tablename__ = 'import_tanks'

    id = db.Column(db.Integer, primary_key=True)

    tankId = db.Column(db.Integer, db.ForeignKey('tanks.id'), nullable=False)
    jobId = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    
    hblNumber = db.Column(db.String(255), unique=True, nullable=False, default="")
    product = db.Column(db.Text, nullable=False, default="")

    consignor = db.Column(db.String(255), nullable=False, default="")
    consignee = db.Column(db.String(255), nullable=False, default="")
    carrier = db.Column(db.String(255), nullable=False, default="")

    vessel = db.Column(db.String(255), nullable=False, default="")
    voyage = db.Column(db.String(10), nullable=False, default="")

    pol = db.Column(db.String(10), nullable=False, default="")
    pod = db.Column(db.String(10), nullable=False, default="")
    finalDestination = db.Column(db.String(255), nullable=False, default="")

    freeDays = db.Column(db.Integer, nullable=False, default=0)
    dailyRate = db.Column(db.Integer, nullable=False, default=0)

    etd = db.Column(db.DateTime, nullable=True)
    eta = db.Column(db.DateTime, nullable=True)
    ata = db.Column(db.DateTime, nullable=True)

    lastUpdated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DepotTank(db.Model):
    __tablename__ = 'depot_tanks'

    id = db.Column(db.Integer, primary_key=True)

    tankId = db.Column(db.Integer, db.ForeignKey('tanks.id'), nullable=False)
    jobId = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)

    depot = db.Column(db.Integer, db.ForeignKey('depots.id'), nullable=False)
    dateIn = db.Column(db.DateTime, nullable=True)
    depotOut = db.Column(db.DateTime, nullable=True)

    depotStatus = db.Column(Enum(DepotStatus), default=DepotStatus.TBC, nullable=False)

    lastUpdated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ExportTank(db.Model):
    __tablename__ = 'export_tanks'

    id = db.Column(db.Integer, primary_key=True)

    tankId = db.Column(db.Integer, db.ForeignKey('tanks.id'), nullable=False)
    jobId = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)

    hblNumber = db.Column(db.String(255), unique=True, nullable=False, default="")
    product = db.Column(db.String(255), nullable=False, default="")

    consignor = db.Column(db.String(255), nullable=False, default="")
    consignee = db.Column(db.String(255), nullable=False, default="")
    carrier = db.Column(db.String(255), nullable=False, default="")

    vessel = db.Column(db.String(255), nullable=False, default="")
    voyage = db.Column(db.String(10), nullable=False, default="")

    pol = db.Column(db.String(10), nullable=False, default="")
    pod = db.Column(db.String(10), nullable=False, default="")
    finalDestination = db.Column(db.String(255), nullable=False, default="")

    freeDays = db.Column(db.Integer, default=0, nullable=False)
    dailyRate = db.Column(db.Integer, default=0, nullable=False)

    etd = db.Column(db.DateTime, nullable=True)
    eta = db.Column(db.DateTime, nullable=True)
    loadDate = db.Column(db.DateTime, nullable=True)
    loadPoint = db.Column(db.String(10), nullable=False, default="")

    lastUpdated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)