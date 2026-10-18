from flask import Blueprint, request, jsonify
from database import get_db_connection
import uuid
import datetime

reminder_bp = Blueprint('reminder_bp', __name__)

@reminder_bp.route('/api/reminders', methods=['GET'])
def get_reminders():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reminders ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    tasks = []
    for r in rows:
        tasks.append({
            'id': r['id'],
            'title': r['title'],
            'desc': r['description'],
            'category': r['category'],
            'dueText': r['due_text'],
            'dueDate': r['due_date'],
            'isUrgent': bool(r['is_urgent']),
            'completed': bool(r['is_completed']),
            'icon': r['icon']
        })

    return jsonify({'tasks': tasks})

@reminder_bp.route('/api/reminders', methods=['POST'])
def add_reminder():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Title is required'}), 400

    rem_id = 'task-' + uuid.uuid4().hex[:8]
    desc = data.get('desc') or data.get('description') or 'Scheduled through huzAI assistant.'
    category = data.get('category', 'General')
    due_text = data.get('dueText', 'Next week')
    due_date = data.get('dueDate', '2026-08-30')
    is_urgent = 1 if data.get('isUrgent') else 0
    icon = data.get('icon', 'notifications')
    now = datetime.datetime.utcnow().isoformat() + 'Z'

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO reminders (id, user_id, title, description, category, due_text, due_date, is_urgent, is_completed, icon, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        rem_id, 'usr_alex_101', title, desc, category,
        due_text, due_date, is_urgent, 0, icon, now
    ))

    cursor.execute('''
    INSERT INTO audit_logs (id, user_id, action, details, icon, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', ('act-' + uuid.uuid4().hex[:8], 'usr_alex_101', 'REMINDER_CREATED', f'Created reminder: {title}', 'notifications', 'Just now'))

    conn.commit()
    conn.close()

    return jsonify({
        'status': 'success',
        'task': {
            'id': rem_id,
            'title': title,
            'desc': desc,
            'category': category,
            'dueText': due_text,
            'dueDate': due_date,
            'isUrgent': bool(is_urgent),
            'completed': False,
            'icon': icon
        }
    }), 201

@reminder_bp.route('/api/reminders/<rem_id>/toggle', methods=['PUT'])
def toggle_reminder(rem_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reminders WHERE id = ?", (rem_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Reminder not found'}), 404

    new_status = 0 if row['is_completed'] else 1
    cursor.execute("UPDATE reminders SET is_completed = ? WHERE id = ?", (new_status, rem_id))
    
    if new_status == 1:
        cursor.execute('''
        INSERT INTO audit_logs (id, user_id, action, details, icon, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', ('act-' + uuid.uuid4().hex[:8], 'usr_alex_101', 'TASK_COMPLETED', f'Completed task: {row["title"]}', 'done_all', 'Just now'))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'completed': bool(new_status)})

@reminder_bp.route('/api/reminders/<rem_id>', methods=['DELETE'])
def delete_reminder(rem_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reminders WHERE id = ?", (rem_id,))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success', 'message': f'Reminder {rem_id} deleted.'})
