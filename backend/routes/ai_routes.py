from flask import Blueprint, request, jsonify
from database import get_db_connection
import uuid
import datetime

ai_bp = Blueprint('ai_bp', __name__)

@ai_bp.route('/api/ai/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    session_id = data.get('sessionId', 'sess_default')

    if not message:
        return jsonify({'error': 'Message cannot be empty'}), 400

    query = message.lower()
    user_id = 'usr_alex_101'
    now = datetime.datetime.utcnow().isoformat() + 'Z'

    response_payload = {
        'reply': '',
        'hasStepCard': False,
        'stepCardData': None,
        'hasReminderCard': False,
        'reminderData': None,
        'hasDocSummaryCard': False,
        'docSummaryData': None,
        'followUpText': ''
    }

    # Intent 1: Certificate / Government Guide Query
    if any(k in query for k in ['certificate', 'government', 'apply for', 'official']):
        response_payload['reply'] = 'Applying for a standard government certificate (such as a birth certificate or residency proof) can usually be done online through the central citizen portal. Here is the streamlined process:'
        response_payload['hasStepCard'] = True
        response_payload['stepCardData'] = {
            'title': 'Application Process',
            'steps': [
                {'num': 1, 'title': 'Verify Identity', 'desc': 'Log in using your verified Digital ID or secure authenticator app.'},
                {'num': 2, 'title': 'Select Document Type', 'desc': 'Navigate to "Certificates" and select the specific document required.'},
                {'num': 3, 'title': 'Pay Processing Fee', 'desc': 'Complete the secure transaction (usually $15-$30 depending on the document).'}
            ]
        }
        response_payload['followUpText'] = 'Would you like me to prepare the initial form draft using your profile details, or do you need me to set a reminder to do this later?'

    # Intent 2: Reminder Query
    elif any(k in query for k in ['reminder', 'insurance', 'renew', 'schedule']):
        task_name = 'Insurance renewal' if 'insurance' in query else 'Scheduled task review'
        response_payload['reply'] = 'I can help schedule that for you right away. Please review and confirm the reminder details below:'
        response_payload['hasReminderCard'] = True
        response_payload['reminderData'] = {
            'task': task_name,
            'date': '20 September 2027',
            'targetDate': '2027-09-20'
        }

    # Intent 3: Document Summary Query
    elif any(k in query for k in ['summarize', 'document', 'mail', 'tax']):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents ORDER BY created_at ASC LIMIT 1")
        doc = cursor.fetchone()
        conn.close()

        doc_dict = dict(doc) if doc else {
            'id': 'doc-1', 'title': 'Driving Licence', 'category': 'Identity',
            'docNumber': 'DL-9876-5432-10', 'expiryDate': '20 Sep 2027'
        }

        response_payload['reply'] = f"Here is a summary of your key document ({doc_dict['title']}):"
        response_payload['hasDocSummaryCard'] = True
        response_payload['docSummaryData'] = {
            'id': doc_dict['id'],
            'title': doc_dict['title'],
            'category': doc_dict['category'],
            'docNumber': doc_dict.get('doc_number') or doc_dict.get('docNumber'),
            'expiryDate': doc_dict.get('expiry_date') or doc_dict.get('expiryDate')
        }
        response_payload['followUpText'] = f"Category: {doc_dict['category']} • Expiry: {doc_dict.get('expiry_date') or doc_dict.get('expiryDate')}. Would you like me to set an alert before this expires?"

    # Intent 4: Healthcare
    elif any(k in query for k in ['doctor', 'health', 'hospital', 'medicine']):
        response_payload['reply'] = 'I found Dr. Smith (Primary Care Physician) in your verified records. Your last recorded checkup was 11 months ago.'
        response_payload['hasStepCard'] = True
        response_payload['stepCardData'] = {
            'title': 'Healthcare Next Steps',
            'steps': [
                {'num': 1, 'title': 'Annual Checkup Booking', 'desc': 'Schedule your routine wellness exam at Valley Medical.'},
                {'num': 2, 'title': 'Prescription Sync', 'desc': 'Verify your daily medications are refilled for the upcoming month.'}
            ]
        }
        response_payload['followUpText'] = 'Shall I prepare an appointment request or create a calendar reminder?'

    # Fallback
    else:
        response_payload['reply'] = f'I have analyzed your query: "{message}". Your encrypted vault and life assistant services are fully active. How else may I assist you with your documents, reminders, or government processes today?'

    # Persist Chat in DB
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO chat_messages (id, user_id, session_id, sender, text, card_data, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        'msg-' + uuid.uuid4().hex[:8], user_id, session_id, 'user', message, None, now
    ))
    cursor.execute('''
    INSERT INTO chat_messages (id, user_id, session_id, sender, text, card_data, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        'msg-' + uuid.uuid4().hex[:8], user_id, session_id, 'ai', response_payload['reply'], None, now
    ))
    conn.commit()
    conn.close()

    return jsonify(response_payload)
