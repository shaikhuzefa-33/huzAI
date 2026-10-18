import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'huzai.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        tier TEXT DEFAULT 'Premium Tier',
        joined_year TEXT DEFAULT '2023',
        avatar TEXT,
        created_at TEXT NOT NULL
    )
    ''')

    # 2. Documents Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL,
        status_type TEXT NOT NULL,
        doc_number TEXT NOT NULL,
        issue_date TEXT,
        expiry_date TEXT,
        state_region TEXT,
        ai_summary TEXT,
        icon TEXT DEFAULT 'description',
        preview_image TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    ''')

    # 3. Reminders Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'General',
        due_text TEXT NOT NULL,
        due_date TEXT,
        is_urgent INTEGER DEFAULT 0,
        is_completed INTEGER DEFAULT 0,
        icon TEXT DEFAULT 'notifications',
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    ''')

    # 4. Family Members Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS family_members (
        id TEXT PRIMARY KEY,
        primary_user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        relation TEXT NOT NULL,
        email TEXT NOT NULL,
        status TEXT NOT NULL,
        avatar TEXT,
        perm_documents INTEGER DEFAULT 1,
        perm_reminders INTEGER DEFAULT 1,
        perm_sensitive INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY(primary_user_id) REFERENCES users(id)
    )
    ''')

    # 5. User Preferences Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS preferences (
        user_id TEXT PRIMARY KEY,
        theme TEXT DEFAULT 'dark',
        language TEXT DEFAULT 'English (US)',
        proactive_suggestions INTEGER DEFAULT 1,
        voice_output INTEGER DEFAULT 0,
        high_contrast INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    ''')

    # 6. Audit Logs Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        icon TEXT DEFAULT 'info',
        timestamp TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    ''')

    # 7. Chat Messages Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        text TEXT NOT NULL,
        card_data TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    ''')

    # 8. Government Services Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS govt_services (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        eligibility TEXT NOT NULL,
        required_documents TEXT NOT NULL,
        process_steps TEXT NOT NULL,
        fee_info TEXT NOT NULL,
        official_url TEXT NOT NULL
    )
    ''')

    conn.commit()
    seed_initial_data(conn)
    conn.close()

def seed_initial_data(conn):
    cursor = conn.cursor()

    # Seed Default User
    cursor.execute("SELECT id FROM users WHERE id = 'usr_alex_101'")
    if not cursor.fetchone():
        cursor.execute('''
        INSERT INTO users (id, name, email, password_hash, tier, joined_year, avatar, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'usr_alex_101',
            'Alex Vance',
            'alex.vance@example.com',
            'password123',
            'Premium Tier',
            '2023',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDBM-vceRD2yAS6pyM5L0old-5lZdH6eBnyu7kO7JDpShHQIEBpRFSVr3h1RLK3Kyy5R-BwqYT408QYMXc-UKgolj0nWjoUW5nNVEcz4fMxvA1xOBGEoE3mdUQYTMGEja7Q7jH9BrGc7b_YIHmeVUGl5ucI4KU1g-kqynveT-fQVNSSOCvjyPTsi9OZKJiOXbxATiFhrYTejOw-g_VXplqi2YovzQ6Nzmd7nfuCOuxWKVPathd6dMG6Aw',
            '2026-08-01T00:00:00Z'
        ))

        # Seed Preferences
        cursor.execute('''
        INSERT OR REPLACE INTO preferences (user_id, theme, language, proactive_suggestions, voice_output, high_contrast)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', ('usr_alex_101', 'dark', 'English (US)', 1, 0, 0))

        # Seed Documents
        docs = [
            (
                'doc-1',
                'usr_alex_101',
                'Driving Licence',
                'Identity',
                'Active',
                'active',
                'DL-9876-5432-10',
                '21 Sep 2017',
                '20 Sep 2027',
                'California',
                'This document is a valid driving licence and expires on 20 September 2027.',
                'id_card',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBF-Nu02rKkvve9eTcndG1YxXNGNlo9POFohFRsCp1OLgOCtAmqUGGayDLUaaag9np4aV9Bq8fP7cjXNBw_7rJenTRq2G7QkCxQGrvAKC_0VsZ-e6IiEipyRLb0cC-HGcApBan49QXxBsuLXfTXlKg4wIeKdHsBWGn0nLzFBo-FGxXbr92jU0ol1EWHDHYzL5YEUiqrD6jOCzIk6xc8AcimhUUviZqL2pplddob4odMn-Y8Ztspie8nVw',
                '2026-08-01T10:00:00Z'
            ),
            (
                'doc-2',
                'usr_alex_101',
                "Bachelor's Degree",
                'Education',
                'Verified',
                'verified',
                'UNIV-2018-88412',
                '15 Jun 2018',
                'Lifetime',
                'National University',
                'Bachelor of Science degree in Information Systems, officially authenticated.',
                'school',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBF-Nu02rKkvve9eTcndG1YxXNGNlo9POFohFRsCp1OLgOCtAmqUGGayDLUaaag9np4aV9Bq8fP7cjXNBw_7rJenTRq2G7QkCxQGrvAKC_0VsZ-e6IiEipyRLb0cC-HGcApBan49QXxBsuLXfTXlKg4wIeKdHsBWGn0nLzFBo-FGxXbr92jU0ol1EWHDHYzL5YEUiqrD6jOCzIk6xc8AcimhUUviZqL2pplddob4odMn-Y8Ztspie8nVw',
                '2026-08-01T10:00:00Z'
            ),
            (
                'doc-3',
                'usr_alex_101',
                'Vehicle Registration',
                'Vehicle',
                'Expiring Soon',
                'expiring',
                'VR-CA-2022-7719',
                '05 Nov 2022',
                '05 Nov 2023',
                'California DMV',
                'Vehicle registration renewal window is open. Action is required before penalty period.',
                'directions_car',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBF-Nu02rKkvve9eTcndG1YxXNGNlo9POFohFRsCp1OLgOCtAmqUGGayDLUaaag9np4aV9Bq8fP7cjXNBw_7rJenTRq2G7QkCxQGrvAKC_0VsZ-e6IiEipyRLb0cC-HGcApBan49QXxBsuLXfTXlKg4wIeKdHsBWGn0nLzFBo-FGxXbr92jU0ol1EWHDHYzL5YEUiqrD6jOCzIk6xc8AcimhUUviZqL2pplddob4odMn-Y8Ztspie8nVw',
                '2026-08-01T10:00:00Z'
            ),
            (
                'doc-4',
                'usr_alex_101',
                'Old Tax Return',
                'Financial',
                'Archived',
                'archived',
                'IRS-1040-2020-09',
                '15 Apr 2021',
                '2020 Tax Year',
                'Federal / IRS',
                'Historical federal tax filing with verified refund confirmation.',
                'account_balance_wallet',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBF-Nu02rKkvve9eTcndG1YxXNGNlo9POFohFRsCp1OLgOCtAmqUGGayDLUaaag9np4aV9Bq8fP7cjXNBw_7rJenTRq2G7QkCxQGrvAKC_0VsZ-e6IiEipyRLb0cC-HGcApBan49QXxBsuLXfTXlKg4wIeKdHsBWGn0nLzFBo-FGxXbr92jU0ol1EWHDHYzL5YEUiqrD6jOCzIk6xc8AcimhUUviZqL2pplddob4odMn-Y8Ztspie8nVw',
                '2026-08-01T10:00:00Z'
            )
        ]
        cursor.executemany('''
        INSERT INTO documents (id, user_id, title, category, status, status_type, doc_number, issue_date, expiry_date, state_region, ai_summary, icon, preview_image, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', docs)

        # Seed Reminders
        rems = [
            ('task-1', 'usr_alex_101', 'Insurance renewal', 'Health insurance policy expires in 3 days. Action required.', 'Insurance', 'Urgent', '2026-08-20', 1, 0, 'health_and_safety', '2026-08-17T09:00:00Z'),
            ('task-2', 'usr_alex_101', 'Document expiry', "Driver's license renewal window opens soon.", 'Identity', 'Next week', '2026-08-24', 0, 0, 'id_card', '2026-08-17T09:00:00Z'),
            ('task-3', 'usr_alex_101', 'Bill payment', 'Quarterly property tax payment due.', 'Finance', 'In 14 days', '2026-08-31', 0, 0, 'receipt_long', '2026-08-17T09:00:00Z'),
            ('task-4', 'usr_alex_101', 'Appointment', 'Annual checkup with Dr. Smith scheduled.', 'Healthcare', 'In 3 weeks', '2026-09-07', 0, 0, 'calendar_month', '2026-08-17T09:00:00Z')
        ]
        cursor.executemany('''
        INSERT INTO reminders (id, user_id, title, description, category, due_text, due_date, is_urgent, is_completed, icon, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', rems)

        # Seed Family Members
        family = [
            (
                'fam-1',
                'usr_alex_101',
                'Sarah Jenkins',
                'Daughter',
                'sarah.jenkins@example.com',
                'Connected',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCVBIk7zWOrQq-CYXw8O7cfL6t3VdyBpxGV7xI2WtIPNnLRMXhgZXw_LXm3Ko2QtZOj5iY4dGacCbT6JpBgEUwmPef58XC5Xq3NcDOzh6TFcqVlNiewF_irrirGyc1UN4fmv6Hrs9lRJSJHTQgUcUxdaBUubBEHchIPKbciKQT1zvGJLeKo2O8JGjQevkA5gIFxgXl8BubGNAazKeMj5nODtnmzFa6J8YUwhhJoMtlkTvUgjO7vLdkTVg',
                1, 1, 0,
                '2026-08-01T00:00:00Z'
            ),
            (
                'fam-2',
                'usr_alex_101',
                'Michael Jenkins',
                'Son',
                'michael.jenkins@example.com',
                'Invited',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuClOcxsR_bwSKNSzEhe_5gcKbA1oOrKWk7DvyZhRRZWp3nWiBg6S0JMAnmRec8Ht0c0EojDnwjIRCKeAuSSI01HPewevYqCYYai9dGgln59MEuuwq5yzULnn5IbcKQO3WEHRKrYY5tg1rF5QKCk2BWT3IRyWZbKZmWZcQbzNuAn5sEIUU8ib4ctlfiDJqBMKtjoeRllGsArS24-yRC9UJj7h-kmeFv396LWycvbQlWAFfVnK9BpTCAH2A',
                1, 0, 0,
                '2026-08-05T00:00:00Z'
            )
        ]
        cursor.executemany('''
        INSERT INTO family_members (id, primary_user_id, name, relation, email, status, avatar, perm_documents, perm_reminders, perm_sensitive, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', family)

        # Seed Audit Logs
        logs = [
            ('act-1', 'usr_alex_101', 'DOCUMENT_UPLOAD', 'Uploaded "2023_Tax_Return.pdf"', 'description', '2 hours ago'),
            ('act-2', 'usr_alex_101', 'AI_QUERY', 'Asked huzAI about pension benefits', 'smart_toy', 'Yesterday'),
            ('act-3', 'usr_alex_101', 'TASK_COMPLETED', 'Completed task: Vehicle registration', 'done_all', 'Oct 12, 2023')
        ]
        cursor.executemany('''
        INSERT INTO audit_logs (id, user_id, action, details, icon, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', logs)

        # Seed Government Services
        cursor.execute('''
        INSERT OR REPLACE INTO govt_services (id, title, category, description, eligibility, required_documents, process_steps, fee_info, official_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'srv-income-cert',
            'Apply for Income Certificate',
            'Certificates',
            'A streamlined, AI-assisted breakdown of the official government process.',
            json.dumps(['Must be a resident of the state.', 'Proof of current address required.', 'Valid identification documents.']),
            json.dumps(['Aadhar Card / Voter ID / State ID', 'Recent Salary Slips (if employed)', 'Passport size photograph']),
            json.dumps([
                {'step': 1, 'title': 'Prepare required documents.', 'desc': 'Scan your documents clearly. Use the Documents tab to verify formats.'},
                {'step': 2, 'title': 'Open official government portal.', 'desc': 'Access the state citizen portal using verified credentials.'},
                {'step': 3, 'title': 'Complete application form.', 'desc': 'Fill out applicant income and family details accurately.'},
                {'step': 4, 'title': 'Upload required documents.', 'desc': 'Attach digital copies of ID and salary proof.'},
                {'step': 5, 'title': 'Submit application and pay fee.', 'desc': 'Submit and save the acknowledgment receipt number.'}
            ]),
            'Usually minimal ($15-$30 depending on region).',
            'https://www.usa.gov'
        ))

        conn.commit()

if __name__ == '__main__':
    init_db()
    print("[huzAI Backend] SQLite database initialized and seeded successfully.")
