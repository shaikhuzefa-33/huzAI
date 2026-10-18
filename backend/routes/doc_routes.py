from flask import Blueprint, request, jsonify
from database import get_db_connection
import uuid
import datetime

doc_bp = Blueprint('doc_bp', __name__)

@doc_bp.route('/api/docs', methods=['GET'])
def get_documents():
    category = request.args.get('category', 'All').strip()
    search = request.args.get('search', '').strip().lower()

    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM documents WHERE 1=1"
    params = []

    if category and category != 'All':
        query += " AND LOWER(category) = ?"
        params.append(category.lower())

    if search:
        query += " AND (LOWER(title) LIKE ? OR LOWER(category) LIKE ? OR LOWER(doc_number) LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    documents = []
    for r in rows:
        documents.append({
            'id': r['id'],
            'title': r['title'],
            'category': r['category'],
            'status': r['status'],
            'statusType': r['status_type'],
            'docNumber': r['doc_number'],
            'issueDate': r['issue_date'],
            'expiryDate': r['expiry_date'],
            'stateRegion': r['state_region'],
            'aiSummary': r['ai_summary'],
            'icon': r['icon'],
            'previewImage': r['preview_image']
        })

    return jsonify({'documents': documents})

@doc_bp.route('/api/docs/<doc_id>', methods=['GET'])
def get_document(doc_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    r = cursor.fetchone()
    conn.close()

    if not r:
        return jsonify({'error': 'Document not found'}), 404

    return jsonify({
        'document': {
            'id': r['id'],
            'title': r['title'],
            'category': r['category'],
            'status': r['status'],
            'statusType': r['status_type'],
            'docNumber': r['doc_number'],
            'issueDate': r['issue_date'],
            'expiryDate': r['expiry_date'],
            'stateRegion': r['state_region'],
            'aiSummary': r['ai_summary'],
            'icon': r['icon'],
            'previewImage': r['preview_image']
        }
    })

@doc_bp.route('/api/docs', methods=['POST'])
def add_document():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Document title is required'}), 400

    doc_id = 'doc-' + uuid.uuid4().hex[:8]
    category = data.get('category', 'Identity')
    status = data.get('status', 'Active')
    status_type = data.get('statusType', 'active')
    doc_number = data.get('docNumber', f'DOC-{uuid.uuid4().hex[:6].upper()}')
    issue_date = data.get('issueDate', 'Today')
    expiry_date = data.get('expiryDate', 'Lifetime')
    state_region = data.get('stateRegion', 'Verified State')
    ai_summary = data.get('aiSummary', 'Verified and secured document stored in huzAI encrypted vault.')
    icon = data.get('icon', 'description')
    preview_image = data.get('previewImage', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBF-Nu02rKkvve9eTcndG1YxXNGNlo9POFohFRsCp1OLgOCtAmqUGGayDLUaaag9np4aV9Bq8fP7cjXNBw_7rJenTRq2G7QkCxQGrvAKC_0VsZ-e6IiEipyRLb0cC-HGcApBan49QXxBsuLXfTXlKg4wIeKdHsBWGn0nLzFBo-FGxXbr92jU0ol1EWHDHYzL5YEUiqrD6jOCzIk6xc8AcimhUUviZqL2pplddob4odMn-Y8Ztspie8nVw')
    now = datetime.datetime.utcnow().isoformat() + 'Z'

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO documents (id, user_id, title, category, status, status_type, doc_number, issue_date, expiry_date, state_region, ai_summary, icon, preview_image, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        doc_id, 'usr_alex_101', title, category, status, status_type,
        doc_number, issue_date, expiry_date, state_region, ai_summary,
        icon, preview_image, now
    ))

    # Audit log
    cursor.execute('''
    INSERT INTO audit_logs (id, user_id, action, details, icon, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', ('act-' + uuid.uuid4().hex[:8], 'usr_alex_101', 'DOCUMENT_UPLOAD', f'Uploaded "{title}"', 'description', 'Just now'))

    conn.commit()
    conn.close()

    return jsonify({
        'status': 'success',
        'document': {
            'id': doc_id,
            'title': title,
            'category': category,
            'status': status,
            'statusType': status_type,
            'docNumber': doc_number,
            'issueDate': issue_date,
            'expiryDate': expiry_date,
            'stateRegion': state_region,
            'aiSummary': ai_summary,
            'icon': icon,
            'previewImage': preview_image
        }
    }), 201

@doc_bp.route('/api/docs/<doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT title FROM documents WHERE id = ?", (doc_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        return jsonify({'error': 'Document not found'}), 404

    cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    cursor.execute('''
    INSERT INTO audit_logs (id, user_id, action, details, icon, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', ('act-' + uuid.uuid4().hex[:8], 'usr_alex_101', 'DOCUMENT_DELETED', f'Deleted document "{row["title"]}"', 'delete', 'Just now'))
    
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'message': f'Document {doc_id} deleted.'})
