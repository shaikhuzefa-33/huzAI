from flask import Blueprint, jsonify
from database import get_db_connection
import json

govt_bp = Blueprint('govt_bp', __name__)

@govt_bp.route('/api/govt/categories', methods=['GET'])
def get_categories():
    categories = [
        {'id': 'cat-identity', 'title': 'Identity', 'icon': 'badge', 'desc': 'National IDs, Passports & Voter cards'},
        {'id': 'cat-certificates', 'title': 'Certificates', 'icon': 'license', 'desc': 'Income, Birth & Residency certificates'},
        {'id': 'cat-education', 'title': 'Education', 'icon': 'school', 'desc': 'Degrees, Transcripts & Verifications'},
        {'id': 'cat-transport', 'title': 'Transport', 'icon': 'directions_car', 'desc': 'Driving licenses & Vehicle permits'},
        {'id': 'cat-benefits', 'title': 'Benefits', 'icon': 'attach_money', 'desc': 'Senior pension, utility rebates & subsidies'},
        {'id': 'cat-applications', 'title': 'Applications', 'icon': 'edit_document', 'desc': 'General citizen application forms'}
    ]
    return jsonify({'categories': categories})

@govt_bp.route('/api/govt/services', methods=['GET'])
def get_popular_services():
    services = [
        {
            'id': 'srv-passport',
            'title': 'Renew Passport',
            'icon': 'downloading',
            'description': 'Step-by-step guide to renewing your standard adult passport online or via mail.',
            'category': 'Identity'
        },
        {
            'id': 'srv-healthcare',
            'title': 'Healthcare Registration',
            'icon': 'local_hospital',
            'description': 'Learn how to register for public healthcare services and find local providers.',
            'category': 'Benefits'
        },
        {
            'id': 'srv-tax',
            'title': 'Property Taxes',
            'icon': 'home_work',
            'description': 'Understand your local property tax assessments, deadlines, and payment methods.',
            'category': 'Finance'
        }
    ]
    return jsonify({'services': services})

@govt_bp.route('/api/govt/process/<service_id>', methods=['GET'])
def get_process_guide(service_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM govt_services WHERE id = ?", (service_id,))
    row = cursor.fetchone()
    
    if not row:
        # Fallback to default income certificate guide
        cursor.execute("SELECT * FROM govt_services LIMIT 1")
        row = cursor.fetchone()
    
    conn.close()

    if not row:
        return jsonify({'error': 'Guide not found'}), 404

    return jsonify({
        'guide': {
            'id': row['id'],
            'title': row['title'],
            'category': row['category'],
            'description': row['description'],
            'eligibility': json.loads(row['eligibility']),
            'requiredDocuments': json.loads(row['required_documents']),
            'processSteps': json.loads(row['process_steps']),
            'feeInfo': row['fee_info'],
            'officialUrl': row['official_url']
        }
    })
