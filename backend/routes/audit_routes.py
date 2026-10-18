from flask import Blueprint, jsonify
from database import get_db_connection

audit_bp = Blueprint('audit_bp', __name__)

@audit_bp.route('/api/audit/logs', methods=['GET'])
def get_audit_logs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY rowid DESC LIMIT 30")
    rows = cursor.fetchall()
    conn.close()

    logs = []
    for r in rows:
        logs.append({
            'id': r['id'],
            'action': r['action'],
            'details': r['details'],
            'icon': r['icon'],
            'timestamp': r['timestamp']
        })

    return jsonify({'logs': logs})
