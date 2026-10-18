/**
 * huzAI Data Store
 * Reactive state store synchronized with Python Flask backend and cached in localStorage.
 */

const STORAGE_KEYS = {
  USER: 'huzai_user',
  DOCUMENTS: 'huzai_documents',
  TASKS: 'huzai_tasks',
  ACTIVITIES: 'huzai_activities',
  FAMILY: 'huzai_family',
  PREFERENCES: 'huzai_preferences'
};

const DEFAULT_DATA = {
  user: {
    name: 'Alex Vance',
    email: 'alex.vance@example.com',
    tier: 'Premium Tier',
    joinedYear: '2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBM-vceRD2yAS6pyM5L0old-5lZdH6eBnyu7kO7JDpShHQIEBpRFSVr3h1RLK3Kyy5R-BwqYT408QYMXc-UKgolj0nWjoUW5nNVEcz4fMxvA1xOBGEoE3mdUQYTMGEja7Q7jH9BrGc7b_YIHmeVUGl5ucI4KU1g-kqynveT-fQVNSSOCvjyPTsi9OZKJiOXbxATiFhrYTejOw-g_VXplqi2YovzQ6Nzmd7nfuCOuxWKVPathd6dMG6Aw'
  },
  documents: [
    {
      id: 'doc-1',
      title: 'Driving Licence',
      category: 'Identity',
      status: 'Active',
      statusType: 'active',
      docNumber: 'DL-9876-5432-10',
      issueDate: '21 Sep 2017',
      expiryDate: '20 Sep 2027',
      stateRegion: 'California',
      aiSummary: 'This document is a valid driving licence and expires on 20 September 2027.',
      icon: 'id_card',
      previewImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBF-Nu02rKkvve9eTcndG1YxXNGNlo9POFohFRsCp1OLgOCtAmqUGGayDLUaaag9np4aV9Bq8fP7cjXNBw_7rJenTRq2G7QkCxQGrvAKC_0VsZ-e6IiEipyRLb0cC-HGcApBan49QXxBsuLXfTXlKg4wIeKdHsBWGn0nLzFBo-FGxXbr92jU0ol1EWHDHYzL5YEUiqrD6jOCzIk6xc8AcimhUUviZqL2pplddob4odMn-Y8Ztspie8nVw'
    },
    {
      id: 'doc-2',
      title: "Bachelor's Degree",
      category: 'Education',
      status: 'Verified',
      statusType: 'verified',
      docNumber: 'UNIV-2018-88412',
      issueDate: '15 Jun 2018',
      expiryDate: 'Lifetime',
      stateRegion: 'National University',
      aiSummary: 'Bachelor of Science degree in Information Systems, officially authenticated.',
      icon: 'school',
      previewImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBF-Nu02rKkvve9eTcndG1YxXNGNlo9POFohFRsCp1OLgOCtAmqUGGayDLUaaag9np4aV9Bq8fP7cjXNBw_7rJenTRq2G7QkCxQGrvAKC_0VsZ-e6IiEipyRLb0cC-HGcApBan49QXxBsuLXfTXlKg4wIeKdHsBWGn0nLzFBo-FGxXbr92jU0ol1EWHDHYzL5YEUiqrD6jOCzIk6xc8AcimhUUviZqL2pplddob4odMn-Y8Ztspie8nVw'
    },
    {
      id: 'doc-3',
      title: 'Vehicle Registration',
      category: 'Vehicle',
      status: 'Expiring Soon',
      statusType: 'expiring',
      docNumber: 'VR-CA-2022-7719',
      issueDate: '05 Nov 2022',
      expiryDate: '05 Nov 2023',
      stateRegion: 'California DMV',
      aiSummary: 'Vehicle registration renewal window is open. Action is required before penalty period.',
      icon: 'directions_car',
      previewImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBF-Nu02rKkvve9eTcndG1YxXNGNlo9POFohFRsCp1OLgOCtAmqUGGayDLUaaag9np4aV9Bq8fP7cjXNBw_7rJenTRq2G7QkCxQGrvAKC_0VsZ-e6IiEipyRLb0cC-HGcApBan49QXxBsuLXfTXlKg4wIeKdHsBWGn0nLzFBo-FGxXbr92jU0ol1EWHDHYzL5YEUiqrD6jOCzIk6xc8AcimhUUviZqL2pplddob4odMn-Y8Ztspie8nVw'
    },
    {
      id: 'doc-4',
      title: 'Old Tax Return',
      category: 'Financial',
      status: 'Archived',
      statusType: 'archived',
      docNumber: 'IRS-1040-2020-09',
      issueDate: '15 Apr 2021',
      expiryDate: '2020 Tax Year',
      stateRegion: 'Federal / IRS',
      aiSummary: 'Historical federal tax filing with verified refund confirmation.',
      icon: 'account_balance_wallet',
      previewImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBF-Nu02rKkvve9eTcndG1YxXNGNlo9POFohFRsCp1OLgOCtAmqUGGayDLUaaag9np4aV9Bq8fP7cjXNBw_7rJenTRq2G7QkCxQGrvAKC_0VsZ-e6IiEipyRLb0cC-HGcApBan49QXxBsuLXfTXlKg4wIeKdHsBWGn0nLzFBo-FGxXbr92jU0ol1EWHDHYzL5YEUiqrD6jOCzIk6xc8AcimhUUviZqL2pplddob4odMn-Y8Ztspie8nVw'
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Insurance renewal',
      desc: 'Health insurance policy expires in 3 days. Action required.',
      dueText: 'Urgent',
      dueDate: '2026-08-20',
      isUrgent: true,
      completed: false,
      icon: 'health_and_safety'
    },
    {
      id: 'task-2',
      title: 'Document expiry',
      desc: "Driver's license renewal window opens soon.",
      dueText: 'Next week',
      dueDate: '2026-08-24',
      isUrgent: false,
      completed: false,
      icon: 'id_card'
    },
    {
      id: 'task-3',
      title: 'Bill payment',
      desc: 'Quarterly property tax payment due.',
      dueText: 'In 14 days',
      dueDate: '2026-08-31',
      isUrgent: false,
      completed: false,
      icon: 'receipt_long'
    },
    {
      id: 'task-4',
      title: 'Appointment',
      desc: 'Annual checkup with Dr. Smith scheduled.',
      dueText: 'In 3 weeks',
      dueDate: '2026-09-07',
      isUrgent: false,
      completed: false,
      icon: 'calendar_month'
    }
  ],
  activities: [
    { id: 'act-1', text: 'Uploaded "2023_Tax_Return.pdf"', time: '2 hours ago', icon: 'description' },
    { id: 'act-2', text: 'Asked huzAI about pension benefits', time: 'Yesterday', icon: 'smart_toy' }
  ],
  familyMembers: [
    {
      id: 'fam-1',
      name: 'Sarah Jenkins',
      relation: 'Daughter',
      status: 'Connected',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVBIk7zWOrQq-CYXw8O7cfL6t3VdyBpxGV7xI2WtIPNnLRMXhgZXw_LXm3Ko2QtZOj5iY4dGacCbT6JpBgEUwmPef58XC5Xq3NcDOzh6TFcqVlNiewF_irrirGyc1UN4fmv6Hrs9lRJSJHTQgUcUxdaBUubBEHchIPKbciKQT1zvGJLeKo2O8JGjQevkA5gIFxgXl8BubGNAazKeMj5nODtnmzFa6J8YUwhhJoMtlkTvUgjO7vLdkTVg',
      permissions: { documents: true, reminders: true, sensitive: false }
    },
    {
      id: 'fam-2',
      name: 'Michael Jenkins',
      relation: 'Son',
      status: 'Connected',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClOcxsR_bwSKNSzEhe_5gcKbA1oOrKWk7DvyZhRRZWp3nWiBg6S0JMAnmRec8Ht0c0EojDnwjIRCKeAuSSI01HPewevYqCYYai9dGgln59MEuuwq5yzULnn5IbcKQO3WEHRKrYY5tg1rF5QKCk2BWT3IRyWZbKZmWZcQbzNuAn5sEIUU8ib4ctlfiDJqBMKtjoeRllGsArS24-yRC9UJj7h-kmeFv396LWycvbQlWAFfVnK9BpTCAH2A',
      permissions: { documents: true, reminders: true, sensitive: false }
    }
  ],
  preferences: {
    theme: 'dark',
    language: 'English (US)',
    proactiveSuggestions: true,
    voiceOutput: false,
    highContrast: false
  }
};

class DataStore {
  constructor() {
    this.init();
    this.syncFromBackend();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_DATA.user));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(DEFAULT_DATA.documents));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_DATA.tasks));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(DEFAULT_DATA.activities));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FAMILY)) {
      localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(DEFAULT_DATA.familyMembers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PREFERENCES)) {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(DEFAULT_DATA.preferences));
    }
  }

  async syncFromBackend() {
    if (!window.huzAIApi) return;
    try {
      // 1. Sync Documents
      const docRes = await window.huzAIApi.getDocuments().catch(() => null);
      if (docRes && docRes.documents) {
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docRes.documents));
      }

      // 2. Sync Reminders
      const remRes = await window.huzAIApi.getReminders().catch(() => null);
      if (remRes && remRes.tasks) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(remRes.tasks));
      }

      // 3. Sync Family
      const famRes = await window.huzAIApi.getFamily().catch(() => null);
      if (famRes && famRes.family) {
        localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(famRes.family));
      }

      // 4. Sync Profile & Preferences
      const profRes = await window.huzAIApi.getProfile().catch(() => null);
      if (profRes) {
        if (profRes.user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profRes.user));
        if (profRes.preferences) localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(profRes.preferences));
      }

      // 5. Sync Activities
      const auditRes = await window.huzAIApi.getAuditLogs().catch(() => null);
      if (auditRes && auditRes.logs) {
        const activities = auditRes.logs.map(l => ({ id: l.id, text: l.details, time: l.timestamp, icon: l.icon }));
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
      }

      // Re-render UI if app initialized
      if (window.huzAIApp) {
        window.huzAIApp.renderDashboard();
        window.huzAIApp.renderDocuments();
        window.huzAIApp.renderFamily();
        window.huzAIApp.renderProfile();
      }
    } catch (e) {
      console.warn('[huzAI DataStore] Backend sync fallback to local cache.');
    }
  }

  // Getters
  getUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || DEFAULT_DATA.user;
  }

  getDocuments() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) || DEFAULT_DATA.documents;
  }

  getDocumentById(id) {
    const docs = this.getDocuments();
    return docs.find(d => d.id === id) || docs[0];
  }

  getTasks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || DEFAULT_DATA.tasks;
  }

  getActivities() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) || DEFAULT_DATA.activities;
  }

  getFamilyMembers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAMILY)) || DEFAULT_DATA.familyMembers;
  }

  getPreferences() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFERENCES)) || DEFAULT_DATA.preferences;
  }

  // Actions with Backend Sync
  async updateUser(userData) {
    const user = { ...this.getUser(), ...userData };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    if (window.huzAIApi) {
      await window.huzAIApi.updateProfile(userData).catch(() => {});
    }
    return user;
  }

  async addDocument(doc) {
    const docs = this.getDocuments();
    const newDoc = {
      id: 'doc-' + Date.now(),
      status: 'Active',
      statusType: 'active',
      icon: 'description',
      previewImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBF-Nu02rKkvve9eTcndG1YxXNGNlo9POFohFRsCp1OLgOCtAmqUGGayDLUaaag9np4aV9Bq8fP7cjXNBw_7rJenTRq2G7QkCxQGrvAKC_0VsZ-e6IiEipyRLb0cC-HGcApBan49QXxBsuLXfTXlKg4wIeKdHsBWGn0nLzFBo-FGxXbr92jU0ol1EWHDHYzL5YEUiqrD6jOCzIk6xc8AcimhUUviZqL2pplddob4odMn-Y8Ztspie8nVw',
      aiSummary: 'Verified and secured document stored in huzAI encrypted vault.',
      ...doc
    };
    docs.unshift(newDoc);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    this.addActivity(`Uploaded "${newDoc.title}"`, 'description');

    if (window.huzAIApi) {
      const res = await window.huzAIApi.addDocument(newDoc).catch(() => null);
      if (res && res.document) {
        newDoc.id = res.document.id;
      }
    }
    return newDoc;
  }

  async deleteDocument(id) {
    let docs = this.getDocuments();
    const docToDelete = docs.find(d => d.id === id);
    docs = docs.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    if (docToDelete) {
      this.addActivity(`Deleted document "${docToDelete.title}"`, 'delete');
    }
    if (window.huzAIApi) {
      await window.huzAIApi.deleteDocument(id).catch(() => {});
    }
    return docs;
  }

  async addTask(task) {
    const tasks = this.getTasks();
    const newTask = {
      id: 'task-' + Date.now(),
      isUrgent: false,
      completed: false,
      icon: 'notifications',
      ...task
    };
    tasks.unshift(newTask);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.addActivity(`Created reminder: ${newTask.title}`, 'notifications');

    if (window.huzAIApi) {
      const res = await window.huzAIApi.addReminder(newTask).catch(() => null);
      if (res && res.task) {
        newTask.id = res.task.id;
      }
    }
    return newTask;
  }

  async toggleTaskCompleted(id) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      if (task.completed) {
        this.addActivity(`Completed task: ${task.title}`, 'done_all');
      }
    }
    if (window.huzAIApi) {
      await window.huzAIApi.toggleReminder(id).catch(() => {});
    }
    return tasks;
  }

  async addFamilyMember(member) {
    const members = this.getFamilyMembers();
    const newMember = {
      id: 'fam-' + Date.now(),
      status: 'Invited',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClOcxsR_bwSKNSzEhe_5gcKbA1oOrKWk7DvyZhRRZWp3nWiBg6S0JMAnmRec8Ht0c0EojDnwjIRCKeAuSSI01HPewevYqCYYai9dGgln59MEuuwq5yzULnn5IbcKQO3WEHRKrYY5tg1rF5QKCk2BWT3IRyWZbKZmWZcQbzNuAn5sEIUU8ib4ctlfiDJqBMKtjoeRllGsArS24-yRC9UJj7h-kmeFv396LWycvbQlWAFfVnK9BpTCAH2A',
      permissions: { documents: true, reminders: false, sensitive: false },
      ...member
    };
    members.push(newMember);
    localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(members));
    this.addActivity(`Invited family member: ${newMember.name}`, 'person_add');

    if (window.huzAIApi) {
      const res = await window.huzAIApi.inviteFamily(newMember).catch(() => null);
      if (res && res.member) {
        newMember.id = res.member.id;
      }
    }
    return newMember;
  }

  async updateFamilyPermissions(memberId, permissions) {
    const members = this.getFamilyMembers();
    const member = members.find(m => m.id === memberId);
    if (member) {
      member.permissions = { ...member.permissions, ...permissions };
      localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(members));
      this.addActivity(`Updated permissions for ${member.name}`, 'family_restroom');
    }
    if (window.huzAIApi) {
      await window.huzAIApi.updateFamilyPermissions(memberId, permissions).catch(() => {});
    }
    return members;
  }

  async revokeFamilyMember(memberId) {
    let members = this.getFamilyMembers();
    const member = members.find(m => m.id === memberId);
    members = members.filter(m => m.id !== memberId);
    localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(members));
    if (member) {
      this.addActivity(`Revoked access for ${member.name}`, 'person_remove');
    }
    if (window.huzAIApi) {
      await window.huzAIApi.revokeFamily(memberId).catch(() => {});
    }
    return members;
  }

  async updatePreferences(prefs) {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    if (window.huzAIApi) {
      await window.huzAIApi.updatePreferences(updated).catch(() => {});
    }
    return updated;
  }

  addActivity(text, icon = 'info') {
    const activities = this.getActivities();
    activities.unshift({
      id: 'act-' + Date.now(),
      text,
      time: 'Just now',
      icon
    });
    if (activities.length > 20) activities.pop();
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }

  exportAllData() {
    return {
      exportedAt: new Date().toISOString(),
      user: this.getUser(),
      documents: this.getDocuments(),
      tasks: this.getTasks(),
      activities: this.getActivities(),
      family: this.getFamilyMembers(),
      preferences: this.getPreferences()
    };
  }

  resetAllData() {
    localStorage.clear();
    this.init();
  }
}

window.huzAIDataStore = new DataStore();
