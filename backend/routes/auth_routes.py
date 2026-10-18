from flask import Blueprint, request, jsonify
from database import get_db_connection
import uuid
import datetime

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
    user = cursor.fetchone()

    if not user:
        # Fallback / Demo auto-register
        user_id = 'usr_' + uuid.uuid4().hex[:8]
        name = email.split('@')[0].capitalize()
        now = datetime.datetime.utcnow().isoformat() + 'Z'
        cursor.execute('''
        INSERT INTO users (id, name, email, password_hash, tier, joined_year, avatar, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, name, email, password or 'password123', 'Premium Tier', '2023',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDBM-vceRD2yAS6pyM5L0old-5lZdH6eBnyu7kO7JDpShHQIEBpRFSVr3h1RLK3Kyy5R-BwqYT408QYMXc-UKgolj0nWjoUW5nNVEcz4fMxvA1xOBGEoE3mdUQYTMGEja7Q7jH9BrGc7b_YIHmeVUGl5ucI4KU1g-kqynveT-fQVNSSOCvjyPTsi9OZKJiOXbxATiFhrYTejOw-g_VXplqi2YovzQ6Nzmd7nfuCOuxWKVPathd6dMG6Aw',
            now
        ))
        conn.commit()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()

    conn.close()
    
    user_dict = dict(user)
    user_dict.pop('password_hash', None)
    return jsonify({
        'status': 'success',
        'token': 'huzai_token_' + user['id'],
        'user': user_dict
    })

@auth_bp.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    name = data.get('name', '').strip() or 'Alex Vance'
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip() or 'password123'

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'An account with this email already exists.'}), 409

    user_id = 'usr_' + uuid.uuid4().hex[:8]
    now = datetime.datetime.utcnow().isoformat() + 'Z'
    cursor.execute('''
    INSERT INTO users (id, name, email, password_hash, tier, joined_year, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        user_id, name, email, password, 'Premium Tier', '2023',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDBM-vceRD2yAS6pyM5L0old-5lZdH6eBnyu7kO7JDpShHQIEBpRFSVr3h1RLK3Kyy5R-BwqYT408QYMXc-UKgolj0nWjoUW5nNVEcz4fMxvA1xOBGEoE3mdUQYTMGEja7Q7jH9BrGc7b_YIHmeVUGl5ucI4KU1g-kqynveT-fQVNSSOCvjyPTsi9OZKJiOXbxATiFhrYTejOw-g_VXplqi2YovzQ6Nzmd7nfuCOuxWKVPathd6dMG6Aw',
        now
    ))
    cursor.execute('''
    INSERT OR REPLACE INTO preferences (user_id, theme, language, proactive_suggestions, voice_output, high_contrast)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (user_id, 'dark', 'English (US)', 1, 0, 0))
    
    conn.commit()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    user_dict = dict(user)
    user_dict.pop('password_hash', None)
    return jsonify({
        'status': 'success',
        'token': 'huzai_token_' + user['id'],
        'user': user_dict
    }), 201

@auth_bp.route('/api/auth/me', methods=['GET'])
def get_current_user():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users ORDER BY created_at ASC LIMIT 1")
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    user_dict = dict(user)
    user_dict.pop('password_hash', None)
    return jsonify({'user': user_dict})
