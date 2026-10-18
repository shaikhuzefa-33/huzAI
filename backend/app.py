import os
import sys
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
sys.path.insert(0, BASE_DIR)

from database import init_db
from routes.auth_routes import auth_bp
from routes.doc_routes import doc_bp
from routes.reminder_routes import reminder_bp
from routes.ai_routes import ai_bp
from routes.govt_routes import govt_bp
from routes.family_routes import family_bp
from routes.profile_routes import profile_bp
from routes.audit_routes import audit_bp

def create_app():
    # Initialize SQLite Database
    init_db()

    app = Flask(__name__, static_folder=PROJECT_ROOT)
    CORS(app)

    # Register API Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(doc_bp)
    app.register_blueprint(reminder_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(govt_bp)
    app.register_blueprint(family_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(audit_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'appName': 'huzAI Fullstack Engine',
            'version': '1.0.0',
            'database': 'SQLite 3 (huzai.db)',
            'features': [
                'Authentication & Sessions',
                'Encrypted Document Vault',
                'Reminders & Task Automation',
                'Conversational AI & Intent Routing',
                'Government Guides & Process Timelines',
                'Trusted Family Access Matrix',
                'Elder Mode Accessibility & Localization',
                'Audit Logging & Data Export'
            ]
        })

    # Serve Frontend Client
    @app.route('/', defaults={'path': 'index.html'})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path.startswith('api/'):
            return jsonify({'error': 'Endpoint not found'}), 404
        file_path = os.path.join(PROJECT_ROOT, path)
        if os.path.exists(file_path):
            return send_from_directory(PROJECT_ROOT, path)
        return send_from_directory(PROJECT_ROOT, 'index.html')

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    print("\n=======================================================")
    print("  huzAI Fullstack Server is running at:")
    print(f"  -> http://localhost:{port}")
    print(f"  -> API Health: http://localhost:{port}/api/health")
    print("=======================================================\n")
    app.run(host='0.0.0.0', port=port, debug=False)
