/**
 * huzAI Application Controller & Router
 * Unifies all Stitch screens into a full-featured, interactive Single Page Application.
 */

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.selectedDocId = 'doc-1';
    this.selectedFamilyId = 'fam-1';
    this.shaderInitialized = false;
    this.init();
  }

  init() {
    // Setup router
    window.addEventListener('hashchange', () => this.handleRouting());
    
    // Initial routing
    if (!window.location.hash) {
      window.location.hash = '#dashboard';
    }
    this.handleRouting();

    // Bind event handlers
    this.bindEvents();

    // Initial renders
    this.renderDashboard();
    this.renderDocuments();
    this.renderTasks();
    this.renderFamily();
    this.renderProfile();
    this.renderElderMode();
  }

  /* -------------------------------------------------------------------------- */
  /* Routing & View Management                                                   */
  /* -------------------------------------------------------------------------- */
  handleRouting() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const [viewName, param] = hash.split('/');

    if (viewName === 'doc-details' && param) {
      this.selectedDocId = param;
    }

    this.showView(viewName);
  }

  navigateTo(view, param = null) {
    if (param) {
      window.location.hash = `#${view}/${param}`;
    } else {
      window.location.hash = `#${view}`;
    }
  }

  showView(viewName) {
    const validViews = [
      'init', 'login', 'signup', 'dashboard', 'home', 'assistant',
      'documents', 'doc-details', 'gov-guide', 'gov-process',
      'elder-mode', 'family', 'profile', 'settings'
    ];

    let targetView = viewName;
    if (targetView === 'home') targetView = 'dashboard';
    if (targetView === 'settings') targetView = 'profile';

    if (!validViews.includes(targetView)) {
      targetView = 'dashboard';
    }

    this.currentView = targetView;

    // Hide all views
    document.querySelectorAll('.view-container').forEach(el => {
      el.classList.remove('active');
    });

    // Show target view
    const viewEl = document.getElementById(`view-${targetView}`);
    if (viewEl) {
      viewEl.classList.add('active');
      window.scrollTo(0, 0);
    }

    // Handle navigation shell visibility (suppressed on task-focused/auth screens)
    const shellSuppressedViews = ['init', 'login', 'signup', 'doc-details'];
    const sideNav = document.getElementById('desktop-sidebar');
    const mobileHeader = document.getElementById('mobile-header');
    const mobileNav = document.getElementById('mobile-bottom-nav');

    if (shellSuppressedViews.includes(targetView)) {
      if (sideNav) sideNav.style.display = 'none';
      if (mobileHeader) mobileHeader.style.display = 'none';
      if (mobileNav) mobileNav.style.display = 'none';
      document.body.classList.remove('md:pl-64');
    } else {
      if (sideNav) sideNav.style.display = '';
      if (mobileHeader) mobileHeader.style.display = '';
      if (mobileNav) mobileNav.style.display = '';
      document.body.classList.add('md:pl-64');
    }

    // Update active nav link indicators
    this.updateActiveNavLinks(targetView);

    // View-specific initializations
    if (targetView === 'init') {
      this.startShaderAnimation();
    } else if (targetView === 'doc-details') {
      this.renderDocDetails();
    } else if (targetView === 'elder-mode') {
      window.huzAIElderMode.updateUI();
    } else if (targetView === 'family') {
      this.renderFamily();
    }
  }

  updateActiveNavLinks(viewName) {
    // Desktop links
    document.querySelectorAll('#desktop-sidebar nav a, #desktop-sidebar nav li a').forEach(a => {
      const href = a.getAttribute('href') || '';
      const linkView = href.replace('#', '');
      
      const isActive = (linkView === viewName) ||
        (linkView === 'dashboard' && viewName === 'home') ||
        (linkView === 'profile' && viewName === 'settings');

      if (isActive) {
        a.className = 'flex items-center gap-3 px-4 py-3 text-primary font-bold bg-surface-container-highest rounded-lg transition-transform scale-95 active:scale-90';
        const icon = a.querySelector('.material-symbols-outlined');
        if (icon) icon.style.fontVariationSettings = "'FILL' 1";
      } else {
        a.className = 'flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200 rounded-lg';
        const icon = a.querySelector('.material-symbols-outlined');
        if (icon) icon.style.fontVariationSettings = "'FILL' 0";
      }
    });

    // Mobile bottom nav links
    document.querySelectorAll('#mobile-bottom-nav a').forEach(a => {
      const href = a.getAttribute('href') || '';
      const linkView = href.replace('#', '');

      const isActive = (linkView === viewName) ||
        (linkView === 'dashboard' && viewName === 'home') ||
        (linkView === 'profile' && viewName === 'settings');

      if (isActive) {
        a.className = 'flex flex-col items-center justify-center text-primary bg-primary-container/20 rounded-xl p-2 active:scale-95 transition-all w-16';
        const icon = a.querySelector('.material-symbols-outlined');
        if (icon) icon.style.fontVariationSettings = "'FILL' 1";
      } else {
        a.className = 'flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-all w-16';
        const icon = a.querySelector('.material-symbols-outlined');
        if (icon) icon.style.fontVariationSettings = "'FILL' 0";
      }
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Initializing Shader & Animation Screen                                     */
  /* -------------------------------------------------------------------------- */
  startShaderAnimation() {
    const canvas = document.getElementById('shader-canvas-ANIMATION_29');
    if (!canvas) return;

    function syncSize() {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    syncSize();
    window.addEventListener('resize', syncSize);

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(uv, center);
    float pulse = 0.5 + 0.5 * sin(u_time * 1.5);
    float glow = exp(-dist * 8.0) * (0.8 + 0.2 * pulse);
    float scan = smoothstep(0.48, 0.5, abs(fract(uv.y - u_time * 0.1) - 0.5));
    vec3 color1 = vec3(0.0, 0.5, 1.0);
    vec3 color2 = vec3(0.5, 0.0, 1.0);
    vec3 finalColor = mix(color1, color2, uv.y + 0.2 * sin(u_time));
    finalColor *= glow;
    finalColor += 0.05 * scan * color1;
    gl_FragColor = vec4(finalColor, 1.0);
}`;

    function createShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');

    let running = true;
    function render(t) {
      if (!running) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // Animate progress bar and status messages
    const statusMessages = [
      'Establishing secure connection...',
      'Syncing your documents...',
      'Optimizing AI assistant for your preferences...',
      'Preparing your dashboard...',
      'Finalizing setup...'
    ];
    const statusEl = document.getElementById('init-status-text');
    const progressEl = document.getElementById('init-progress-bar');
    const percentageEl = document.getElementById('init-percentage-text');

    let currentMsgIdx = 0;
    let progress = 0;

    const msgInterval = setInterval(() => {
      currentMsgIdx = (currentMsgIdx + 1) % statusMessages.length;
      if (statusEl) statusEl.textContent = statusMessages[currentMsgIdx];
    }, 2000);

    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        clearInterval(msgInterval);
        setTimeout(() => {
          this.navigateTo('dashboard');
        }, 800);
      }
      if (progressEl) progressEl.style.width = `${progress}%`;
      if (percentageEl) percentageEl.textContent = `${progress}%`;
    }, 200);
  }

  /* -------------------------------------------------------------------------- */
  /* Dashboard View                                                             */
  /* -------------------------------------------------------------------------- */
  renderDashboard() {
    const user = window.huzAIDataStore.getUser();
    const greetingEl = document.getElementById('dashboard-greeting');
    if (greetingEl) {
      greetingEl.textContent = `Good morning, ${user.name.split(' ')[0]}`;
    }

    this.renderTasks();
    this.renderActivities();
  }

  renderTasks() {
    const tasks = window.huzAIDataStore.getTasks();
    const container = document.getElementById('dashboard-tasks-grid');
    if (!container) return;

    container.innerHTML = tasks.slice(0, 4).map(task => `
      <div class="p-stack-md bg-surface-container-high border border-surface-variant rounded-xl flex flex-col gap-3 relative overflow-hidden transition-all duration-300 hover:border-outline">
        ${task.isUrgent ? '<div class="absolute top-0 right-0 w-16 h-16 bg-error-container/10 rounded-bl-[100px] blur-xl"></div>' : ''}
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center ${task.isUrgent ? 'text-error' : 'text-primary-fixed-dim'}">
            <span class="material-symbols-outlined">${task.icon}</span>
          </div>
          <span class="font-label-sm text-label-sm ${task.isUrgent ? 'text-error bg-error-container/20' : 'text-on-surface-variant bg-surface-container'} px-2 py-1 rounded-md">
            ${task.dueText}
          </span>
        </div>
        <div>
          <h4 class="font-body-lg text-body-lg font-medium text-primary mb-1">${task.title}</h4>
          <p class="font-body-md text-body-md text-on-surface-variant line-clamp-2">${task.desc}</p>
        </div>
        <div class="mt-auto pt-2 flex justify-between items-center">
          <button onclick="window.huzAIApp.toggleTask('${task.id}')" class="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">${task.completed ? 'check_circle' : 'radio_button_unchecked'}</span>
            ${task.completed ? 'Completed' : 'Mark Done'}
          </button>
        </div>
      </div>
    `).join('');
  }

  renderActivities() {
    const activities = window.huzAIDataStore.getActivities();
    const container = document.getElementById('dashboard-activities-list');
    if (!container) return;

    container.innerHTML = activities.slice(0, 3).map(act => `
      <div class="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
        <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
          <span class="material-symbols-outlined">${act.icon}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-body-md text-body-md text-primary truncate">${act.text}</p>
          <p class="font-label-sm text-label-sm text-on-surface-variant">${act.time}</p>
        </div>
      </div>
    `).join('');
  }

  toggleTask(taskId) {
    window.huzAIDataStore.toggleTaskCompleted(taskId);
    this.renderTasks();
    this.renderActivities();
    this.showToast('Task updated successfully!', 'success');
  }

  /* -------------------------------------------------------------------------- */
  /* Documents Dashboard & Document Details                                     */
  /* -------------------------------------------------------------------------- */
  renderDocuments(filterCategory = 'All', searchQuery = '') {
    const docs = window.huzAIDataStore.getDocuments();
    const container = document.getElementById('documents-grid');
    if (!container) return;

    const filtered = docs.filter(doc => {
      const matchesCategory = (filterCategory === 'All' || doc.category.toLowerCase() === filterCategory.toLowerCase());
      const matchesSearch = !searchQuery || 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-5xl mb-2 opacity-50">search_off</span>
          <p class="font-headline-md text-lg">No documents found</p>
          <p class="text-sm mt-1">Try another search or upload a new document.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(doc => {
      let badgeColor = 'bg-secondary-container/20 text-secondary-fixed';
      let dotColor = 'bg-emerald-400';
      if (doc.statusType === 'expiring') {
        badgeColor = 'bg-error-container/20 text-error';
        dotColor = 'bg-error';
      } else if (doc.statusType === 'archived') {
        badgeColor = 'bg-surface-container-highest text-on-surface-variant';
        dotColor = 'bg-outline';
      }

      return `
        <div onclick="window.huzAIApp.navigateTo('doc-details', '${doc.id}')" class="group bg-surface-container border border-surface-container-high rounded-xl p-stack-md hover:border-secondary-container hover:bg-surface-variant transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col h-full">
          <div class="flex justify-between items-start mb-stack-md">
            <div class="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 text-secondary">
              <span class="material-symbols-outlined">${doc.icon}</span>
            </div>
            <span class="flex items-center gap-1.5 ${badgeColor} px-2 py-1 rounded-full font-label-sm text-[10px]">
              <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span> ${doc.status}
            </span>
          </div>
          <div class="mt-auto">
            <h3 class="font-headline-md text-headline-md text-primary mb-1">${doc.title}</h3>
            <p class="text-on-surface-variant font-label-sm text-label-sm mb-4">Category: ${doc.category}</p>
            <div class="flex justify-between items-center pt-stack-sm border-t border-outline-variant/30">
              <span class="text-on-surface-variant text-sm">Expires</span>
              <span class="${doc.statusType === 'expiring' ? 'text-error' : 'text-primary'} text-sm font-medium">${doc.expiryDate}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  filterDocuments(category) {
    document.querySelectorAll('.doc-filter-btn').forEach(btn => {
      if (btn.dataset.category === category) {
        btn.className = 'doc-filter-btn active whitespace-nowrap px-4 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm border border-primary';
      } else {
        btn.className = 'doc-filter-btn whitespace-nowrap px-4 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm border border-outline-variant hover:border-secondary transition-colors';
      }
    });
    const searchInput = document.getElementById('docs-search-input');
    const query = searchInput ? searchInput.value : '';
    this.renderDocuments(category, query);
  }

  renderDocDetails() {
    const doc = window.huzAIDataStore.getDocumentById(this.selectedDocId);
    if (!doc) return;

    const titleEl = document.getElementById('doc-detail-title');
    const categoryEl = document.getElementById('doc-detail-category');
    const statusEl = document.getElementById('doc-detail-status');
    const summaryEl = document.getElementById('doc-detail-summary');
    const numEl = document.getElementById('doc-detail-number');
    const issueEl = document.getElementById('doc-detail-issue');
    const expiryEl = document.getElementById('doc-detail-expiry');
    const regionEl = document.getElementById('doc-detail-region');
    const imgEl = document.getElementById('doc-detail-image');
    const lightboxImg = document.getElementById('lightbox-image');

    if (titleEl) titleEl.textContent = doc.title;
    if (categoryEl) categoryEl.textContent = doc.category;
    if (statusEl) statusEl.textContent = doc.status;
    if (summaryEl) summaryEl.textContent = doc.aiSummary;
    if (numEl) numEl.textContent = doc.docNumber;
    if (issueEl) issueEl.textContent = doc.issueDate;
    if (expiryEl) expiryEl.textContent = doc.expiryDate;
    if (regionEl) regionEl.textContent = doc.stateRegion;
    if (imgEl) imgEl.src = doc.previewImage;
    if (lightboxImg) lightboxImg.src = doc.previewImage;
  }

  deleteCurrentDocument() {
    if (confirm('Are you sure you want to delete this document?')) {
      window.huzAIDataStore.deleteDocument(this.selectedDocId);
      this.showToast('Document deleted successfully', 'info');
      this.navigateTo('documents');
      this.renderDocuments();
    }
  }

  downloadCurrentDocument() {
    const doc = window.huzAIDataStore.getDocumentById(this.selectedDocId);
    const content = `huzAI Document Export\n--------------------------------\nTitle: ${doc.title}\nCategory: ${doc.category}\nDocument Number: ${doc.docNumber}\nIssue Date: ${doc.issueDate}\nExpiry Date: ${doc.expiryDate}\nRegion: ${doc.stateRegion}\nSummary: ${doc.aiSummary}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}_details.txt`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Document details downloaded', 'success');
  }

  /* -------------------------------------------------------------------------- */
  /* AI Assistant Chat Engine                                                   */
  /* -------------------------------------------------------------------------- */
  sendChatMessage(customText = null) {
    const input = document.getElementById('ai-chat-input');
    const text = customText || (input ? input.value.trim() : '');
    if (!text) return;

    if (input) input.value = '';

    const chatArea = document.getElementById('ai-chat-messages');
    if (!chatArea) return;

    // Append User Message
    const userMsgHtml = `
      <div class="flex flex-col items-end gap-2 self-end max-w-[85%] md:max-w-[70%]">
        <div class="bg-surface-container-high text-on-surface px-6 py-4 rounded-2xl rounded-tr-sm border border-outline-variant/30 font-body-md text-body-md">
          ${this.escapeHtml(text)}
        </div>
      </div>
    `;
    chatArea.insertAdjacentHTML('beforeend', userMsgHtml);
    chatArea.scrollTop = chatArea.scrollHeight;

    // Show Thinking indicator
    const thinkingHtml = `
      <div id="ai-thinking-dots" class="flex items-center gap-2 self-start ml-11 opacity-50 my-2">
        <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
        <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-75"></div>
        <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-150"></div>
      </div>
    `;
    chatArea.insertAdjacentHTML('beforeend', thinkingHtml);
    chatArea.scrollTop = chatArea.scrollHeight;

    // Simulate AI Response Delay
    setTimeout(async () => {
      const thinkingEl = document.getElementById('ai-thinking-dots');
      if (thinkingEl) thinkingEl.remove();

      const response = await window.huzAIEngine.generateResponse(text);

      let extraCardHtml = '';

      if (response.hasStepCard && response.stepCardData) {
        extraCardHtml = `
          <div class="bg-surface-container rounded-xl border border-surface-container-high overflow-hidden my-2">
            <div class="p-4 border-b border-surface-container-high bg-surface-container-low flex justify-between items-center">
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">${response.stepCardData.title}</span>
              <span class="material-symbols-outlined text-on-surface-variant text-sm">account_balance</span>
            </div>
            <div class="p-5 flex flex-col gap-4">
              ${response.stepCardData.steps.map((s, idx) => `
                <div class="flex gap-4">
                  <div class="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 font-label-sm text-label-sm text-primary">${s.num}</div>
                  <div>
                    <h4 class="font-headline-md text-[16px] font-medium text-primary mb-1">${s.title}</h4>
                    <p class="font-body-md text-[14px] text-on-surface-variant">${s.desc}</p>
                  </div>
                </div>
                ${idx < response.stepCardData.steps.length - 1 ? '<div class="w-px h-4 bg-surface-container-highest ml-3 -my-2"></div>' : ''}
              `).join('')}
            </div>
            <div class="p-4 bg-surface-container-low border-t border-surface-container-high flex justify-end gap-3">
              <button onclick="window.huzAIApp.navigateTo('gov-guide')" class="px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-label-sm text-label-sm hover:bg-surface-variant transition-colors">Read Guidelines</button>
              <button onclick="window.huzAIApp.navigateTo('gov-process')" class="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-surface-tint transition-colors flex items-center gap-2">
                Start Application
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        `;
      } else if (response.hasReminderCard && response.reminderData) {
        extraCardHtml = `
          <div class="bg-surface-container rounded-xl border border-primary/30 shadow-[0_0_20px_rgba(255,255,255,0.03)] overflow-hidden relative my-2">
            <div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
            <div class="p-6">
              <div class="flex items-center gap-3 mb-4 text-primary">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">event_available</span>
                <h3 class="font-headline-md text-[18px] font-semibold">Create reminder?</h3>
              </div>
              <div class="bg-surface-container-lowest rounded-lg p-4 border border-surface-container-high mb-6">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-label-sm text-label-sm text-on-surface-variant">Task</span>
                  <span class="font-body-md text-body-md text-primary font-medium">${response.reminderData.task}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="font-label-sm text-label-sm text-on-surface-variant">Date</span>
                  <span class="font-body-md text-body-md text-on-surface">${response.reminderData.date}</span>
                </div>
              </div>
              <div class="flex gap-3 w-full">
                <button onclick="this.closest('.bg-surface-container').remove(); window.huzAIApp.showToast('Reminder canceled', 'info');" class="flex-1 py-3 rounded-lg border border-outline-variant text-on-surface font-label-sm text-label-sm hover:bg-surface-variant transition-colors active:scale-[0.98]">
                  Cancel
                </button>
                <button onclick="window.huzAIApp.confirmChatReminder('${response.reminderData.task}', '${response.reminderData.date}', '${response.reminderData.targetDate}'); this.disabled = true; this.textContent = 'Confirmed ✓';" class="flex-1 py-3 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-surface-tint transition-colors active:scale-[0.98]">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        `;
      } else if (response.hasDocSummaryCard && response.docSummaryData) {
        const doc = response.docSummaryData;
        extraCardHtml = `
          <div class="bg-surface-container rounded-xl border border-surface-container-high p-4 my-2 flex items-center justify-between">
            <div>
              <h4 class="font-headline-md text-sm text-primary font-bold">${doc.title}</h4>
              <p class="text-xs text-on-surface-variant">${doc.docNumber} • Expires ${doc.expiryDate}</p>
            </div>
            <button onclick="window.huzAIApp.navigateTo('doc-details', '${doc.id}')" class="px-3 py-1.5 rounded-lg bg-surface-container-high text-xs text-primary hover:bg-surface-variant transition-colors">
              View Document
            </button>
          </div>
        `;
      }

      const aiMsgHtml = `
        <div class="flex flex-col items-start gap-4 self-start max-w-[95%] md:max-w-[85%] my-2">
          <div class="flex items-start gap-3 w-full">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              <span class="material-symbols-outlined text-background text-sm" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
            </div>
            <div class="flex-1 flex flex-col gap-3">
              <div class="font-body-md text-body-md text-on-surface leading-relaxed">
                ${response.text.replace(/\n/g, '<br>')}
              </div>
              ${extraCardHtml}
              ${response.followUpText ? `<div class="font-body-md text-body-md text-on-surface">${response.followUpText}</div>` : ''}
            </div>
          </div>
        </div>
      `;

      chatArea.insertAdjacentHTML('beforeend', aiMsgHtml);
      chatArea.scrollTop = chatArea.scrollHeight;

      // Speak aloud if voice output enabled
      window.huzAIEngine.speak(response.text);

    }, 800);
  }

  confirmChatReminder(title, dueText, dueDate) {
    window.huzAIDataStore.addTask({
      title,
      desc: `Scheduled through huzAI Assistant for ${dueText}.`,
      dueText,
      dueDate,
      isUrgent: false,
      icon: 'event_available'
    });
    this.renderTasks();
    this.showToast(`Reminder created: "${title}"`, 'success');
  }

  /* -------------------------------------------------------------------------- */
  /* Trusted Family Management                                                  */
  /* -------------------------------------------------------------------------- */
  renderFamily() {
    const members = window.huzAIDataStore.getFamilyMembers();
    const container = document.getElementById('family-members-list');
    if (!container) return;

    container.innerHTML = members.map(m => {
      const isSelected = m.id === this.selectedFamilyId;
      const isConnected = m.status === 'Connected';

      return `
        <div onclick="window.huzAIApp.selectFamilyMember('${m.id}')" class="p-4 rounded-xl border ${isSelected ? 'border-outline-variant bg-surface-container-highest' : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container'} cursor-pointer transition-colors relative overflow-hidden group">
          <div class="flex items-center gap-4 relative z-10">
            <div class="w-12 h-12 rounded-full overflow-hidden border border-outline-variant shrink-0">
              <img class="w-full h-full object-cover" src="${m.avatar}" alt="${m.name}">
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-body-lg text-body-lg text-on-surface truncate">${m.name}</h3>
              <p class="font-label-sm text-label-sm text-on-surface-variant truncate">${m.relation}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <div class="w-2 h-2 rounded-full ${isConnected ? 'bg-primary shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-outline'}"></div>
              <span class="font-label-sm text-label-sm ${isConnected ? 'text-primary' : 'text-on-surface-variant'}">${m.status}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Render permission management panel for selected member
    const selected = members.find(m => m.id === this.selectedFamilyId) || members[0];
    if (selected) {
      const nameHeader = document.getElementById('family-manage-name');
      const avatarImg = document.getElementById('family-manage-avatar');
      const toggleDocs = document.getElementById('toggle-family-docs');
      const toggleRems = document.getElementById('toggle-family-rems');
      const toggleSens = document.getElementById('toggle-family-sens');

      if (nameHeader) nameHeader.textContent = `Manage ${selected.name.split(' ')[0]}'s Access`;
      if (avatarImg) avatarImg.src = selected.avatar;
      if (toggleDocs) toggleDocs.checked = !!selected.permissions.documents;
      if (toggleRems) toggleRems.checked = !!selected.permissions.reminders;
      if (toggleSens) toggleSens.checked = !!selected.permissions.sensitive;
    }
  }

  selectFamilyMember(memberId) {
    this.selectedFamilyId = memberId;
    this.renderFamily();
  }

  updateSelectedFamilyPermission(permType, isChecked) {
    window.huzAIDataStore.updateFamilyPermissions(this.selectedFamilyId, {
      [permType]: isChecked
    });
    this.showToast('Permission settings saved', 'success');
  }

  revokeSelectedFamilyMember() {
    const members = window.huzAIDataStore.getFamilyMembers();
    const selected = members.find(m => m.id === this.selectedFamilyId);
    if (!selected) return;

    if (confirm(`Are you sure you want to revoke all access for ${selected.name}?`)) {
      window.huzAIDataStore.revokeFamilyMember(this.selectedFamilyId);
      this.selectedFamilyId = members[0]?.id || '';
      this.renderFamily();
      this.showToast(`Access revoked for ${selected.name}`, 'info');
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Profile & Settings                                                         */
  /* -------------------------------------------------------------------------- */
  renderProfile() {
    const user = window.huzAIDataStore.getUser();
    const prefs = window.huzAIDataStore.getPreferences();

    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const tierEl = document.getElementById('profile-tier');
    const joinedEl = document.getElementById('profile-joined');
    const avatarEl = document.getElementById('profile-avatar');

    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (tierEl) tierEl.textContent = user.tier;
    if (joinedEl) joinedEl.textContent = `Joined ${user.joinedYear}`;
    if (avatarEl) avatarEl.src = user.avatar;

    const toggleProactive = document.getElementById('toggle-proactive');
    const toggleVoice = document.getElementById('toggle-voice');
    const toggleContrast = document.getElementById('toggle-contrast');

    if (toggleProactive) toggleProactive.checked = !!prefs.proactiveSuggestions;
    if (toggleVoice) toggleVoice.checked = !!prefs.voiceOutput;
    if (toggleContrast) toggleContrast.checked = !!prefs.highContrast;
  }

  exportData() {
    const data = window.huzAIDataStore.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `huzAI_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('All your data has been exported securely.', 'success');
  }

  deleteAccount() {
    if (confirm('WARNING: Are you sure you want to permanently delete your account and clear all stored data? This cannot be undone.')) {
      window.huzAIDataStore.resetAllData();
      this.showToast('Account deleted. Resetting workspace.', 'info');
      this.navigateTo('login');
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Elder Mode Controller                                                      */
  /* -------------------------------------------------------------------------- */
  renderElderMode() {
    window.huzAIElderMode.updateUI();
  }

  startElderVoiceInteraction() {
    const modal = document.getElementById('modal-elder-voice');
    if (modal) modal.classList.remove('hidden');

    const voiceStatus = document.getElementById('elder-voice-status');
    if (voiceStatus) voiceStatus.textContent = 'Listening to your voice...';

    if (window.huzAIEngine.recognition) {
      try {
        window.huzAIEngine.recognition.start();
        window.huzAIEngine.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (voiceStatus) voiceStatus.textContent = `Heard: "${transcript}"`;
          setTimeout(() => {
            if (modal) modal.classList.add('hidden');
            this.navigateTo('assistant');
            this.sendChatMessage(transcript);
          }, 1200);
        };
        window.huzAIEngine.recognition.onerror = () => {
          if (voiceStatus) voiceStatus.textContent = 'Speak clearly into your microphone...';
        };
      } catch (e) {
        // Already started or unsupported
      }
    } else {
      setTimeout(() => {
        if (voiceStatus) voiceStatus.textContent = 'Processing request...';
        setTimeout(() => {
          if (modal) modal.classList.add('hidden');
          this.navigateTo('assistant');
          this.sendChatMessage('Help me with my health insurance renewal');
        }, 1500);
      }, 1500);
    }
  }

  stopElderVoiceInteraction() {
    const modal = document.getElementById('modal-elder-voice');
    if (modal) modal.classList.add('hidden');
    if (window.huzAIEngine && window.huzAIEngine.recognition) {
      try {
        window.huzAIEngine.recognition.abort();
      } catch (e) {}
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Toast Notification System                                                  */
  /* -------------------------------------------------------------------------- */
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check_circle';
    if (type === 'error') iconName = 'error';

    toast.innerHTML = `
      <span class="material-symbols-outlined toast-icon">${iconName}</span>
      <div class="flex-1">${this.escapeHtml(message)}</div>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* -------------------------------------------------------------------------- */
  /* Event Listeners & Binding                                                  */
  /* -------------------------------------------------------------------------- */
  bindEvents() {
    // Quick search from Dashboard
    const dashInput = document.getElementById('dashboard-ai-input');
    const dashSendBtn = document.getElementById('dashboard-ai-send-btn');
    if (dashInput && dashSendBtn) {
      const handleDashSubmit = () => {
        const val = dashInput.value.trim();
        if (val) {
          this.navigateTo('assistant');
          setTimeout(() => this.sendChatMessage(val), 200);
          dashInput.value = '';
        }
      };
      dashSendBtn.addEventListener('click', handleDashSubmit);
      dashInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleDashSubmit();
      });
    }

    // Documents search & filter
    const docSearchInput = document.getElementById('docs-search-input');
    if (docSearchInput) {
      docSearchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        const activeFilterBtn = document.querySelector('.doc-filter-btn.active');
        const cat = activeFilterBtn ? activeFilterBtn.dataset.category : 'All';
        this.renderDocuments(cat, query);
      });
    }

    // Government Guide search
    const govSearchInput = document.getElementById('gov-guide-search');
    if (govSearchInput) {
      govSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = govSearchInput.value.trim();
          if (val) {
            this.navigateTo('assistant');
            setTimeout(() => this.sendChatMessage(`Help me with government process: ${val}`), 200);
          }
        }
      });
    }
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.huzAIApp = new App();
});
