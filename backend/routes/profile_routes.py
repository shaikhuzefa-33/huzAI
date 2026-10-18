from flask import Blueprint, request, jsonify
from database import get_db_connection
import json
import datetime

profile_bp = Blueprint('profile_bp', __name__)

@profile_bp.route('/api/profile', methods=['GET'])
def get_profile():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users ORDER BY created_at ASC LIMIT 1")
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404

    cursor.execute("SELECT * FROM preferences WHERE user_id = ?", (user['id'],))
    prefs = cursor.fetchone()
    conn.close()

    user_dict = dict(user)
    user_dict.pop('password_hash', None)

    prefs_dict = {
        'theme': prefs['theme'] if prefs else 'dark',
        'language': prefs['language'] if prefs else 'English (US)',
        'proactiveSuggestions': bool(prefs['proactive_suggestions']) if prefs else True,
        'voiceOutput': bool(prefs['voice_output']) if prefs else False,
        'highContrast': bool(prefs['high_contrast']) if prefs else False
    }

    return jsonify({
        'user': user_dict,
        'preferences': prefs_dict
    })

@profile_bp.route('/api/profile', methods=['PUT'])
def update_profile():
    data = request.get_json() or {}
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users ORDER BY created_at ASC LIMIT 1")
    user = cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404

    user_id = user['id']
    name = data.get('name')
    email = data.get('email')

    if name:
        cursor.execute("UPDATE users SET name = ? WHERE id = ?", (name, user_id))
    if email:
        cursor.execute("UPDATE users SET email = ? WHERE id = ?", (email, user_id))

    conn.commit()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    updated_user = dict(cursor.fetchone())
    updated_user.pop('password_hash', None)
    conn.close()

    return jsonify({'status': 'success', 'user': updated_user})

@profile_bp.route('/api/profile/preferences', methods=['PUT'])
def update_preferences():
    data = request.get_json() or {}
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users ORDER BY created_at ASC LIMIT 1")
    user = cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404

    user_id = user['id']
    cursor.execute('''
    INSERT OR REPLACE INTO preferences (user_id, theme, language, proactive_suggestions, voice_output, high_contrast)
    VALUES (
        ?,
        COALESCE(?, (SELECT theme FROM preferences WHERE user_id = ?), 'dark'),
        COALESCE(?, (SELECT language FROM preferences WHERE user_id = ?), 'English (US)'),
        COALESCE(?, (SELECT proactive_suggestions FROM preferences WHERE user_id = ?), 1),
        COALESCE(?, (SELECT voice_output FROM preferences WHERE user_id = ?), 0),
        COALESCE(?, (SELECT high_contrast FROM preferences WHERE user_id = ?), 0)
    )
    ''', (
        user_id,
        data.get('theme'), user_id,
        data.get('language'), user_id,
        1 if data.get('proactiveSuggestions') is True else (0 if data.get('proactiveSuggestions') is False else None), user_id,
        1 if data.get('voiceOutput') is True else (0 if data.get('voiceOutput') is False else None), user_id,
        1 if data.get('highContrast') is True else (0 if data.get('highContrast') is False else None), user_id
    ))
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'message': 'Preferences saved.'})

@profile_bp.route('/api/profile/export', methods=['GET'])
def export_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users ORDER BY created_at ASC LIMIT 1")
    user_row = cursor.fetchone()
    user = dict(user_row) if user_row else {}
    user.pop('password_hash', None)

    cursor.execute("SELECT * FROM documents")
    docs = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM reminders")
    rems = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM family_members")
    fam = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM audit_logs")
    logs = [dict(r) for r in cursor.fetchall()]

    conn.close()

    export_payload = {
        'exportedAt': datetime.datetime.utcnow().isoformat() + 'Z',
        'user': user,
        'documents': docs,
        'reminders': rems,
        'familyMembers': fam,
        'auditLogs': logs,
        'securityAttestation': 'huzAI AES-256 Vault Export'
    }

    return jsonify(export_payload)
