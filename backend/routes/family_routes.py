from flask import Blueprint, request, jsonify
from database import get_db_connection
import uuid
import datetime

family_bp = Blueprint('family_bp', __name__)

@family_bp.route('/api/family', methods=['GET'])
def get_family():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM family_members ORDER BY created_at ASC")
    rows = cursor.fetchall()
    conn.close()

    members = []
    for r in rows:
        members.append({
            'id': r['id'],
            'name': r['name'],
            'relation': r['relation'],
            'email': r['email'],
            'status': r['status'],
            'avatar': r['avatar'],
            'permissions': {
                'documents': bool(r['perm_documents']),
                'reminders': bool(r['perm_reminders']),
                'sensitive': bool(r['perm_sensitive'])
            }
        })

    return jsonify({'family': members})

@family_bp.route('/api/family/invite', methods=['POST'])
def invite_family():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'Member name is required'}), 400

    member_id = 'fam-' + uuid.uuid4().hex[:8]
    relation = data.get('relation', 'Family')
    email = data.get('email', f"{name.lower().replace(' ', '.')}@example.com")
    avatar = data.get('avatar', 'https://lh3.googleusercontent.com/aida-public/AB6AXuClOcxsR_bwSKNSzEhe_5gcKbA1oOrKWk7DvyZhRRZWp3nWiBg6S0JMAnmRec8Ht0c0EojDnwjIRCKeAuSSI01HPewevYqCYYai9dGgln59MEuuwq5yzULnn5IbcKQO3WEHRKrYY5tg1rF5QKCk2BWT3IRyWZbKZmWZcQbzNuAn5sEIUU8ib4ctlfiDJqBMKtjoeRllGsArS24-yRC9UJj7h-kmeFv396LWycvbQlWAFfVnK9BpTCAH2A')
    now = datetime.datetime.utcnow().isoformat() + 'Z'

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO family_members (id, primary_user_id, name, relation, email, status, avatar, perm_documents, perm_reminders, perm_sensitive, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        member_id, 'usr_alex_101', name, relation, email, 'Invited', avatar, 1, 0, 0, now
    ))

    cursor.execute('''
    INSERT INTO audit_logs (id, user_id, action, details, icon, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', ('act-' + uuid.uuid4().hex[:8], 'usr_alex_101', 'FAMILY_INVITED', f'Invited family member: {name}', 'person_add', 'Just now'))

    conn.commit()
    conn.close()

    return jsonify({
        'status': 'success',
        'member': {
            'id': member_id,
            'name': name,
            'relation': relation,
            'email': email,
            'status': 'Invited',
            'avatar': avatar,
            'permissions': {'documents': True, 'reminders': False, 'sensitive': False}
        }
    }), 201

@family_bp.route('/api/family/<member_id>/permissions', methods=['PUT'])
def update_permissions(member_id):
    data = request.get_json() or {}
    perms = data.get('permissions', {})

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM family_members WHERE id = ?", (member_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Family member not found'}), 404

    cursor.execute('''
    UPDATE family_members
    SET perm_documents = ?, perm_reminders = ?, perm_sensitive = ?
    WHERE id = ?
    ''', (
        1 if perms.get('documents') else 0,
        1 if perms.get('reminders') else 0,
        1 if perms.get('sensitive') else 0,
        member_id
    ))

    cursor.execute('''
    INSERT INTO audit_logs (id, user_id, action, details, icon, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', ('act-' + uuid.uuid4().hex[:8], 'usr_alex_101', 'FAMILY_PERMS_UPDATED', f'Updated permissions for {row["name"]}', 'family_restroom', 'Just now'))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'message': 'Permissions updated.'})

@family_bp.route('/api/family/<member_id>', methods=['DELETE'])
def revoke_member(member_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM family_members WHERE id = ?", (member_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Member not found'}), 404

    cursor.execute("DELETE FROM family_members WHERE id = ?", (member_id,))
    cursor.execute('''
    INSERT INTO audit_logs (id, user_id, action, details, icon, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', ('act-' + uuid.uuid4().hex[:8], 'usr_alex_101', 'FAMILY_REVOKED', f'Revoked access for {row["name"]}', 'person_remove', 'Just now'))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'message': f'Access revoked for {row["name"]}.'})
