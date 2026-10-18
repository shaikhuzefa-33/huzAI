/**
 * huzAI Elder Mode & Multi-Language Dictionary
 * Provides high-accessibility support and real-time localization.
 */

const ELDER_TRANSLATIONS = {
  en: {
    title: 'How can I help you today?',
    subtitle: 'Tap the big button below to talk.',
    talkButton: 'Talk to huzAI',
    readDocs: 'Read Documents',
    readDocsSub: 'Bills, letters, or forms',
    myReminders: 'My Reminders',
    myRemindersSub: 'Medicines & appointments',
    govHelp: 'Government Help',
    govHelpSub: 'Pensions & services',
    callFamily: 'Call Family',
    callFamilySub: 'Connect with trusted contacts',
    languageLabel: 'Language / భాష / भाषा',
    listening: 'Listening to your voice...',
    speakPrompt: 'Please speak now. huzAI is listening.',
    voiceDone: 'Done Speaking'
  },
  te: {
    title: 'ఈరోజు నేను మీకు ఎలా సహాయపడగలను?',
    subtitle: 'మాట్లాడటానికి క్రింది పెద్ద బటన్‌ను నొక్కండి.',
    talkButton: 'huzAI తో మాట్లాడండి',
    readDocs: 'పత్రాలు చదవండి',
    readDocsSub: 'బిల్లులు, లేఖలు లేదా ఫారమ్‌లు',
    myReminders: 'నా రిమైండర్‌లు',
    myRemindersSub: 'మందులు మరియు అపాయింట్‌మెంట్‌లు',
    govHelp: 'ప్రభుత్వ సహాయం',
    govHelpSub: 'పెన్షన్లు మరియు సేవలు',
    callFamily: 'కుటుంబానికి కాల్ చేయండి',
    callFamilySub: 'విశ్వసనీయ వ్యక్తులతో మాట్లాడండి',
    languageLabel: 'భాష / Language / भाषा',
    listening: 'మీ స్వరాన్ని వింటున్నాను...',
    speakPrompt: 'దయచేసి మాట్లాడండి. huzAI వింటోంది.',
    voiceDone: 'పూర్తయింది'
  },
  hi: {
    title: 'आज मैं आपकी क्या मदद कर सकता हूँ?',
    subtitle: 'बात करने के लिए नीचे दिए गए बड़े बटन को दबाएं।',
    talkButton: 'huzAI से बात करें',
    readDocs: 'दस्तावेज़ पढ़ें',
    readDocsSub: 'बिल, पत्र या फॉर्म',
    myReminders: 'मेरे रिमाइंडर',
    myRemindersSub: 'दवाएं और अपॉइंटमेंट',
    govHelp: 'सरकारी सहायता',
    govHelpSub: 'पेंशन और सेवाएं',
    callFamily: 'परिवार को कॉल करें',
    callFamilySub: 'विश्वसनीय संपर्कों से जुड़ें',
    languageLabel: 'भाषा / Language / భాష',
    listening: 'आपकी आवाज़ सुनी जा रही है...',
    speakPrompt: 'कृपया बोलें। huzAI सुन रहा है।',
    voiceDone: 'बात पूरी हुई'
  }
};

class ElderModeController {
  constructor() {
    this.currentLanguage = 'en';
  }

  setLanguage(lang) {
    if (!ELDER_TRANSLATIONS[lang]) lang = 'en';
    this.currentLanguage = lang;
    this.updateUI();
  }

  updateUI() {
    const t = ELDER_TRANSLATIONS[this.currentLanguage];
    const elTitle = document.getElementById('elder-title');
    const elSub = document.getElementById('elder-subtitle');
    const elTalkBtn = document.getElementById('elder-talk-btn-text');
    const elDocTitle = document.getElementById('elder-docs-title');
    const elDocSub = document.getElementById('elder-docs-sub');
    const elRemTitle = document.getElementById('elder-rem-title');
    const elRemSub = document.getElementById('elder-rem-sub');
    const elGovTitle = document.getElementById('elder-gov-title');
    const elGovSub = document.getElementById('elder-gov-sub');
    const elFamTitle = document.getElementById('elder-fam-title');
    const elFamSub = document.getElementById('elder-fam-sub');
    const elLangLabel = document.getElementById('elder-lang-label');

    if (elTitle) elTitle.textContent = t.title;
    if (elSub) elSub.textContent = t.subtitle;
    if (elTalkBtn) elTalkBtn.textContent = t.talkButton;
    if (elDocTitle) elDocTitle.textContent = t.readDocs;
    if (elDocSub) elDocSub.textContent = t.readDocsSub;
    if (elRemTitle) elRemTitle.textContent = t.myReminders;
    if (elRemSub) elRemSub.textContent = t.myRemindersSub;
    if (elGovTitle) elGovTitle.textContent = t.govHelp;
    if (elGovSub) elGovSub.textContent = t.govHelpSub;
    if (elFamTitle) elFamTitle.textContent = t.callFamily;
    if (elFamSub) elFamSub.textContent = t.callFamilySub;
    if (elLangLabel) elLangLabel.textContent = t.languageLabel;

    // Update active button styles
    ['en', 'te', 'hi'].forEach(l => {
      const btn = document.getElementById(`elder-lang-btn-${l}`);
      if (btn) {
        if (l === this.currentLanguage) {
          btn.className = 'px-8 py-4 bg-primary text-on-primary rounded-full text-xl font-bold active:scale-95 transition-transform shadow-lg';
        } else {
          btn.className = 'px-8 py-4 bg-surface-container-high border-2 border-outline-variant text-primary rounded-full text-xl font-bold hover:bg-surface-variant active:scale-95 transition-transform';
        }
      }
    });
  }
}

// Global instance
window.huzAIElderMode = new ElderModeController();
