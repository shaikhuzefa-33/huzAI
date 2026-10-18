/**
 * huzAI Assistant Engine
 * Conversational AI engine integrated with Python Flask backend `/api/ai/chat`.
 */

class AIEngine {
  constructor() {
    this.speechSynthesisAvailable = 'speechSynthesis' in window;
    this.speechRecognitionAvailable = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    this.recognition = null;
    this.initSpeech();
  }

  initSpeech() {
    if (this.speechRecognitionAvailable) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  speak(text) {
    if (!this.speechSynthesisAvailable) return;
    const prefs = window.huzAIDataStore.getPreferences();
    if (!prefs.voiceOutput) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  async generateResponse(userQuery) {
    // 1. Try Backend REST API
    if (window.huzAIApi) {
      try {
        const res = await window.huzAIApi.chat(userQuery);
        if (res && res.reply) {
          return {
            text: res.reply,
            hasStepCard: !!res.hasStepCard,
            stepCardData: res.stepCardData,
            hasReminderCard: !!res.hasReminderCard,
            reminderData: res.reminderData,
            hasDocSummaryCard: !!res.hasDocSummaryCard,
            docSummaryData: res.docSummaryData,
            followUpText: res.followUpText || ''
          };
        }
      } catch (e) {
        console.warn('[huzAI AI-Engine] Falling back to local conversational engine.');
      }
    }

    // 2. Client-side Fallback
    const query = userQuery.toLowerCase().trim();

    if (query.includes('certificate') || query.includes('government') || query.includes('apply for')) {
      return {
        text: 'Applying for a standard government certificate (such as a birth certificate or residency proof) can usually be done online through the central citizen portal. Here is the streamlined process:',
        hasStepCard: true,
        stepCardData: {
          title: 'Application Process',
          steps: [
            { num: 1, title: 'Verify Identity', desc: 'Log in using your verified Digital ID or secure authenticator app.' },
            { num: 2, title: 'Select Document Type', desc: 'Navigate to "Certificates" and select the specific document required.' },
            { num: 3, title: 'Pay Processing Fee', desc: 'Complete the secure transaction (usually $15-$30 depending on the document).' }
          ]
        },
        followUpText: 'Would you like me to prepare the initial form draft using your profile details, or do you need me to set a reminder to do this later?'
      };
    }

    if (query.includes('reminder') || query.includes('insurance') || query.includes('renew')) {
      return {
        text: 'I can help schedule that for you right away. Please review and confirm the reminder details below:',
        hasReminderCard: true,
        reminderData: {
          task: query.includes('insurance') ? 'Insurance renewal' : 'Scheduled task review',
          date: '20 September 2027',
          targetDate: '2027-09-20'
        },
        followUpText: ''
      };
    }

    if (query.includes('summarize') || query.includes('document') || query.includes('mail')) {
      const docs = window.huzAIDataStore.getDocuments();
      const firstDoc = docs[0];
      return {
        text: `Here is a summary of your key document (${firstDoc.title}):`,
        hasDocSummaryCard: true,
        docSummaryData: firstDoc,
        followUpText: `Category: ${firstDoc.category} • Expiry: ${firstDoc.expiryDate}. Would you like me to set an alert before this expires?`
      };
    }

    return {
      text: `I'm analyzing your request: "${userQuery}". All your records and vault files are secure in huzAI. How else may I assist you with your documents, reminders, or government processes today?`,
      followUpText: ''
    };
  }
}

window.huzAIEngine = new AIEngine();
