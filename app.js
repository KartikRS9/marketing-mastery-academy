// Marketing Mastery Academy Application Core Controller

// Global State
let activeChapterId = null;
let currentChapterData = null;
let userProgress = {}; // Key: chapterId, Value: { completed: boolean, quizScore: number }
let activeLearningProfile = 'general';

// ============================================================
// TTS ENGINE — Text-to-Speech using Web Speech API
// ============================================================
const TTS = {
  synth: window.speechSynthesis,
  voices: [],
  activeBtn: null,
  utterance: null,

  init() {
    if (!this.synth) return;
    const loadVoices = () => {
      this.voices = this.synth.getVoices();
      const sel = document.getElementById('tts-voice-select');
      if (!sel) return;
      sel.innerHTML = '';
      // Prefer English voices first
      const eng = this.voices.filter(v => v.lang.startsWith('en'));
      const others = this.voices.filter(v => !v.lang.startsWith('en'));
      [...eng, ...others].forEach((v, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${v.name} (${v.lang})`;
        if (v.default) opt.selected = true;
        sel.appendChild(opt);
      });
    };
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
    loadVoices();

    // Controls
    document.getElementById('tts-stop-btn')?.addEventListener('click', () => this.stop());
    document.getElementById('tts-pause-btn')?.addEventListener('click', () => this.togglePause());
    document.getElementById('tts-speed-select')?.addEventListener('change', (e) => {
      if (this.utterance) this.utterance.rate = parseFloat(e.target.value);
    });
  },

  speak(text, label, btnEl) {
    if (!this.synth) return;
    this.stop();

    // Clean text — strip HTML tags and excessive whitespace
    const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) return;

    this.utterance = new SpeechSynthesisUtterance(clean);
    this.utterance.rate = parseFloat(document.getElementById('tts-speed-select')?.value || 1);
    this.utterance.pitch = 1;

    // Pick selected voice
    const sel = document.getElementById('tts-voice-select');
    if (sel && this.voices.length > 0) {
      const idx = parseInt(sel.value) || 0;
      this.utterance.voice = this.voices[idx] || this.voices[0];
    }

    this.utterance.onstart = () => {
      this.showBar(label);
      if (btnEl) {
        this.activeBtn = btnEl;
        btnEl.classList.add('tts-active');
        btnEl.innerHTML = '<i class="fa-solid fa-stop"></i> Stop';
      }
    };

    this.utterance.onend = () => this.onEnd();
    this.utterance.onerror = () => this.onEnd();

    this.synth.speak(this.utterance);
  },

  stop() {
    this.synth.cancel();
    this.onEnd();
  },

  togglePause() {
    const icon = document.getElementById('tts-pause-icon');
    if (this.synth.paused) {
      this.synth.resume();
      if (icon) { icon.className = 'fa-solid fa-pause'; }
    } else {
      this.synth.pause();
      if (icon) { icon.className = 'fa-solid fa-play'; }
    }
  },

  onEnd() {
    document.getElementById('tts-player-bar')?.classList.add('hidden');
    document.body.classList.remove('tts-playing');
    if (this.activeBtn) {
      this.activeBtn.classList.remove('tts-active');
      this.activeBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Listen';
      this.activeBtn = null;
    }
    const icon = document.getElementById('tts-pause-icon');
    if (icon) icon.className = 'fa-solid fa-pause';
  },

  showBar(label) {
    const bar = document.getElementById('tts-player-bar');
    const lbl = document.getElementById('tts-track-label');
    if (bar) bar.classList.remove('hidden');
    if (lbl) lbl.textContent = label || 'Reading…';
    document.body.classList.add('tts-playing');
  },

  // Inject a speaker button next to a text block
  btn(text, label) {
    const id = 'tts-' + Math.random().toString(36).substr(2, 8);
    // Use a data attribute to avoid inline JS issues
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          if (el.classList.contains('tts-active')) {
            this.stop();
          } else {
            this.speak(text, label, el);
          }
        });
      }
    }, 100);
    return `<button class="tts-speak-btn" id="${id}" title="Listen to this section"><i class="fa-solid fa-volume-high"></i> Listen</button>`;
  }
};



// DOM Elements
const sidebarNav = document.getElementById('sidebar-nav');
const welcomeScreen = document.getElementById('welcome-screen');
const chapterView = document.getElementById('chapter-view');
const overallProgressText = document.getElementById('overall-progress-text');
const overallProgressFill = document.getElementById('overall-progress-fill');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const sidebar = document.getElementById('sidebar');
const startLearningBtn = document.getElementById('start-learning-btn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  TTS.init();
  loadTheme();
  loadLearningProfile();
  renderCurriculum();
  setupEventListeners();
  updateProgressUI();
});

// Load and Apply Theme from LocalStorage
function loadTheme() {
  const savedTheme = localStorage.getItem('mktg_academy_theme') || 'obsidian';
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) themeSelect.value = savedTheme;
  applyThemeClass(savedTheme);
}

// Apply selected theme class to document body
function applyThemeClass(themeName) {
  // Remove all theme classes
  document.body.classList.remove(
    'theme-obsidian',
    'theme-editorial',
    'theme-deep-ocean',
    'theme-parchment',
    'theme-saas'
  );
  // Add selected theme class (body default = obsidian, no class needed but add for consistency)
  document.body.classList.add(`theme-${themeName}`);
  localStorage.setItem('mktg_academy_theme', themeName);
  updateToggleIcon(themeName);
  // Re-run Mermaid if visual tab active
  const activeTabBtn = document.querySelector('.tab-btn.active');
  if (activeTabBtn && activeTabBtn.dataset.tab === 'visual-mapping' && currentChapterData) {
    renderMermaidDiagrams(currentChapterData);
  }
}

// Update day/night toggle icon
function updateToggleIcon(themeName) {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;
  const isLight = ['editorial', 'parchment', 'saas'].includes(themeName);
  
  if (isLight) {
    toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    toggleBtn.title = 'Switch to Dark Mode';
  } else {
    toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    toggleBtn.title = 'Switch to Light Mode';
  }
}

// Load Progress from LocalStorage
function loadProgress() {
  const saved = localStorage.getItem('mktg_academy_progress');
  if (saved) {
    try {
      userProgress = JSON.parse(saved) || {};
    } catch (e) {
      userProgress = {};
    }
  }
}

// Save Progress
function saveProgress() {
  localStorage.setItem('mktg_academy_progress', JSON.stringify(userProgress));
  updateProgressUI();
}

// Render Curriculum Sidebar
function renderCurriculum() {
  sidebarNav.innerHTML = '';
  
  academyChapters.forEach(part => {
    const partTitle = document.createElement('div');
    partTitle.className = 'nav-part-title';
    partTitle.innerText = part.part;
    sidebarNav.appendChild(partTitle);
    
    const ul = document.createElement('ul');
    ul.className = 'nav-chapters-list';
    
    part.chapters.forEach(ch => {
      const li = document.createElement('li');
      li.className = 'nav-chapter-item';
      li.dataset.id = ch.id;
      
      const isCompleted = userProgress[ch.id] && userProgress[ch.id].completed;
      if (isCompleted) {
        li.classList.add('completed');
      }
      
      const icon = isCompleted ? 'fa-circle-check' : 'fa-circle';
      li.innerHTML = `
        <i class="fa-solid ${icon} nav-chapter-checkbox"></i>
        <span class="nav-chapter-text" title="Chapter ${ch.id}: ${ch.title}">Ch ${ch.id}: ${ch.title}</span>
      `;
      
      li.addEventListener('click', () => {
        selectChapter(ch.id);
      });
      
      ul.appendChild(li);
    });
    
    sidebarNav.appendChild(ul);
  });
}

// Global memory store for loaded chapter contents
window.marketingAcademyChapters = window.marketingAcademyChapters || {};

// Select and Load Chapter
function selectChapter(id) {
  // Highlight in sidebar
  document.querySelectorAll('.nav-chapter-item').forEach(el => {
    el.classList.remove('active');
    if (parseInt(el.dataset.id) === id) {
      el.classList.add('active');
    }
  });
  
  // Find chapter details in metadata
  let targetCh = null;
  let targetPart = null;
  
  for (const part of academyChapters) {
    targetCh = part.chapters.find(c => c.id === id);
    if (targetCh) {
      targetPart = part.part;
      break;
    }
  }
  
  if (!targetCh) return;
  
  // If sidebar is open in mobile overlay, close it
  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }

  // Set breadcrumbs
  document.getElementById('breadcrumb-part').innerText = targetPart.split(':')[0];
  document.getElementById('breadcrumb-chapter').innerText = `Chapter ${id}`;

  // Check if already in memory
  if (window.marketingAcademyChapters[id]) {
    currentChapterData = window.marketingAcademyChapters[id];
    activeChapterId = id;
    renderChapterView(currentChapterData, targetPart);
  } else {
    // Dynamically load the script
    injectChapterScript(targetCh.file, id, (data) => {
      if (data) {
        window.marketingAcademyChapters[id] = data;
        currentChapterData = data;
        activeChapterId = id;
        renderChapterView(data, targetPart);
      } else {
        renderStubChapter(id, targetCh, targetPart);
      }
    });
  }
}

// Dynamic Script Injector to avoid file:// CORS issues
function injectChapterScript(src, id, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = () => {
    // Read the loaded data from the dictionary
    callback(window.marketingAcademyChapters[id]);
  };
  script.onerror = () => {
    console.warn(`Could not load details for ${src}. Loading template view...`);
    callback(null);
  };
  document.body.appendChild(script);
}

// Render Stub/Template View for chapters that are not fully populated yet
function renderStubChapter(id, chapterMeta, partName) {
  currentChapterData = generateStubData(id, chapterMeta);
  activeChapterId = id;
  renderChapterView(currentChapterData, partName);
}

// Render Chapter Detailed Dashboard View
function renderChapterView(data, partName) {
  welcomeScreen.classList.add('hidden');
  chapterView.classList.remove('hidden');

  // Title and Header info
  document.getElementById('chapter-title').innerText = `Chapter ${data.id}: ${data.title}`;
  document.getElementById('chapter-part-subtitle').innerText = partName;

  // Render Active Persona Focus Panel
  renderPersonaFocusContent(data);

  // Render Lessons timeline
  const lessonsTimeline = document.getElementById('lessons-timeline');
  lessonsTimeline.innerHTML = '';
  // Close any open lesson focus card when chapter changes
  const focusCard = document.getElementById('lesson-focus-card');
  if (focusCard) focusCard.classList.add('hidden');

  data.lessons.forEach((lesson, index) => {
    const node = document.createElement('div');
    node.className = 'timeline-node';
    node.style.cursor = 'pointer';
    node.innerHTML = `
      <span class="timeline-node-num">${index + 1}</span>
      <span>${lesson}</span>
    `;
    
    node.addEventListener('click', () => {
      lessonsTimeline.querySelectorAll('.timeline-node').forEach(el => el.classList.remove('active'));
      node.classList.add('active');
      showLessonFocus(lesson);
    });
    
    lessonsTimeline.appendChild(node);
  });

  // Render STRATEGIC CORE
  renderCoreTab(data);

  // Render VISUAL MAPPING (Wait until tab activation to draw Mermaid, otherwise SVGs may collapse)
  renderVisualTab(data);

  // Render CASES & APPLICATIONS
  renderCasesTab(data);

  // Render ACADEMIC RIGOR
  renderAcademicTab(data);

  // Render REVIEW & MASTERY
  renderReviewTab(data);

  // Reset tab to Core
  switchTab('strategic-core');
}

// Tab 1: Core Rendering
function renderCoreTab(data) {
  // Learning Objectives
  const objectivesUl = document.getElementById('core-learning-objectives');
  objectivesUl.innerHTML = '';
  data.learningObjectives.forEach(obj => {
    const li = document.createElement('li');
    li.innerText = obj;
    objectivesUl.appendChild(li);
  });

  // First Principles
  const fpDiv = document.getElementById('core-first-principles');
  fpDiv.innerHTML = `
    <div class="fp-quote">${data.firstPrinciples.statement}</div>
    <p class="fp-text">${data.firstPrinciples.explanation}</p>
  `;

  // Definitions
  const defsGrid = document.getElementById('core-definitions');
  defsGrid.innerHTML = '';
  data.definitions.forEach(def => {
    const card = document.createElement('div');
    card.className = 'definition-card';
    const isTextbook = def.source.toLowerCase() === 'textbook';
    const badgeClass = isTextbook ? 'textbook-badge' : 'insight-badge';
    const sourceIcon = isTextbook ? 'fa-book' : 'fa-lightbulb';
    
    const ttsBtnDef = TTS.btn(`${def.term}. ${def.definition}`, def.term);
    card.innerHTML = `
      <div class="def-header">
        <span class="def-term">${def.term}</span>
        <span class="legend-badge def-source ${badgeClass}"><i class="fa-solid ${sourceIcon}"></i> ${def.source}</span>
        ${ttsBtnDef}
      </div>
      <p class="def-text">${def.definition}</p>
    `;
    defsGrid.appendChild(card);
  });

  // Intuition Analogy
  const intuitionDiv = document.getElementById('core-intuition');
  const ttsIntuitionText = `Analogy: ${data.intuition.analogy}. ${data.intuition.story}`;
  intuitionDiv.innerHTML = `
    <div class="intuition-analogy">
      <h4>Intuitive Analogy: ${TTS.btn(ttsIntuitionText, 'Intuition & Analogy')}</h4>
      ${data.intuition.analogy}
    </div>
    <p class="intuition-story">${data.intuition.story}</p>
  `;

  // Frameworks
  const frameworksContainer = document.getElementById('core-frameworks');
  frameworksContainer.innerHTML = '';
  data.frameworks.forEach(fw => {
    const card = document.createElement('div');
    card.className = 'framework-card';
    
    let stepsHtml = '';
    if (fw.components && fw.components.length > 0) {
      stepsHtml = `<div class="framework-steps">`;
      fw.components.forEach((comp, idx) => {
        stepsHtml += `
          <div class="framework-step">
            <strong>Step ${idx + 1}</strong>
            ${comp}
          </div>
        `;
      });
      stepsHtml += `</div>`;
    }

    const ttsFwText = `${fw.name}. ${fw.explanation}. ${fw.components ? fw.components.join('. ') : ''}`;
    card.innerHTML = `
      <h4>${fw.name} ${TTS.btn(ttsFwText, fw.name)}</h4>
      <p class="framework-desc">${fw.explanation}</p>
      ${stepsHtml}
    `;
    frameworksContainer.appendChild(card);
  });

  // Comparison Tables
  const compTableDiv = document.getElementById('core-comparison-table');
  if (data.comparisonTables && data.comparisonTables.headers) {
    let headersHtml = data.comparisonTables.headers.map(h => `<th>${h}</th>`).join('');
    let rowsHtml = data.comparisonTables.rows.map(row => {
      return `<tr>${row.map(val => `<td>${val}</td>`).join('')}</tr>`;
    }).join('');

    compTableDiv.innerHTML = `
      <table class="comp-table">
        <thead><tr>${headersHtml}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;
  } else {
    compTableDiv.innerHTML = '<p class="text-center font-muted">No comparison table available for this module.</p>';
  }

  // Cross-Links
  const crossUl = document.getElementById('core-cross-links');
  crossUl.innerHTML = '';
  data.crossLinks.forEach(link => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${link.chapter}:</strong> ${link.connection}`;
    crossUl.appendChild(li);
  });

  // Memory Techniques
  const memoryDiv = document.getElementById('core-memory-techniques');
  memoryDiv.innerHTML = '';
  data.memoryTechniques.forEach(tech => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.innerHTML = `
      <div class="memory-name"><i class="fa-solid fa-brain"></i> ${tech.name} (${tech.type})</div>
      <p class="memory-desc">${tech.details}</p>
    `;
    memoryDiv.appendChild(card);
  });
}

// Textbook Visuals Database Map
const textbookVisualsMap = {
  1: [
    {
      file: 'figure_1_1_marketing_process.jpg',
      title: 'Figure 1.1: A Simple Model of the Marketing Process',
      caption: 'Outlines the 5-step roadmap of marketing: creating customer value to capture value in return.'
    }
  ],
  2: [
    {
      file: 'figure_2_2_bcg_matrix.jpg',
      title: 'Figure 2.2: The BCG Growth-Share SBU Matrix',
      caption: 'Classifies strategic business units (SBUs) along relative market share and market growth axes.'
    },
    {
      file: 'figure_2_3_ansoff_grid.jpg',
      title: 'Figure 2.3: Product/Market Expansion Grid (Ansoff Matrix)',
      caption: 'Outlines the four pathways for company growth: penetration, development, product innovation, and diversification.'
    }
  ],
  3: [
    {
      file: 'figure_3_1_environment.jpg',
      title: 'Figure 3.1: The Marketing Microenvironment & Macroenvironment',
      caption: 'Illustrates the internal micro-forces and external macro-forces shaping company opportunities.'
    }
  ],
  5: [
    {
      file: 'figure_5_1_buyer_behavior.jpg',
      title: 'Figure 5.1: Model of Consumer Buyer Behavior',
      caption: 'Traces environmental stimuli entering the buyer black box leading to purchase choices.'
    }
  ],
  7: [
    {
      file: 'figure_7_1_stp_strategy.jpg',
      title: 'Figure 7.1: Customer Value-Driven Marketing Strategy (STP)',
      caption: 'Visualizes the step-by-step segmentation, targeting, differentiation, and positioning flow.'
    },
    {
      file: 'figure_7_2_perceptual_map.jpg',
      title: 'Figure 7.2: Perceptual Positioning Map: SUVs',
      caption: 'Maps competitor brand locations along luxury and price orientation dimensions.'
    }
  ],
  8: [
    {
      file: 'figure_8_1_product_levels.jpg',
      title: 'Figure 8.1: The Three Levels of Product',
      caption: 'Deconstructs offerings into core customer value, actual product specifications, and augmented deliverables.'
    }
  ]
};

// Tab 2: Visual Rendering
function renderVisualTab(data) {
  // Render Roadmap Timeline
  const roadmapContainer = document.getElementById('visual-roadmap-container');
  roadmapContainer.innerHTML = '';
  
  if (data.visualRoadmapSteps) {
    data.visualRoadmapSteps.forEach((step, idx) => {
      const row = document.createElement('div');
      row.className = 'timeline-visual-row';
      row.innerHTML = `
        <div class="timeline-visual-marker">
          <div class="timeline-visual-icon">${idx + 1}</div>
          <div class="timeline-visual-line"></div>
        </div>
        <div class="timeline-visual-content">
          <div class="timeline-visual-title">${step.title}</div>
          <div class="timeline-visual-desc">${step.desc}</div>
        </div>
      `;
      roadmapContainer.appendChild(row);
    });
  }

  // Render Infographics cards
  const infographicsContainer = document.getElementById('visual-infographics');
  infographicsContainer.innerHTML = '';
  data.infographics.forEach(info => {
    const card = document.createElement('div');
    card.className = 'infographic-card';
    card.innerHTML = `
      <div class="infographic-value">${info.value}</div>
      <div class="infographic-title">${info.title}</div>
      <p class="infographic-desc">${info.description}</p>
    `;
    infographicsContainer.appendChild(card);
  });

  // Render Textbook Visuals
  const visualsSection = document.getElementById('textbook-visuals-section');
  const visualsContainer = document.getElementById('textbook-visuals-container');
  
  if (visualsSection && visualsContainer) {
    const list = textbookVisualsMap[data.id];
    if (list && list.length > 0) {
      visualsSection.classList.remove('hidden');
      visualsContainer.innerHTML = list.map(item => `
        <div class="textbook-visual-card">
          <div class="textbook-visual-img-container">
            <img src="images/${item.file}" alt="${item.title}">
          </div>
          <div class="textbook-visual-info">
            <div class="textbook-visual-title">${item.title}</div>
            <div class="textbook-visual-caption">${item.caption}</div>
          </div>
        </div>
      `).join('');
    } else {
      visualsSection.classList.add('hidden');
      visualsContainer.innerHTML = '';
    }
  }
}

// Tab 3: Cases Rendering
function renderCasesTab(data) {
  // Snippets
  document.getElementById('cases-real-world').innerText = data.examples.realWorld;
  document.getElementById('cases-industry').innerText = data.examples.industry;

  // Indian Case study
  const indianCaseDiv = document.getElementById('cases-indian-case');
  indianCaseDiv.innerHTML = `
    <h4 class="case-study-title">${data.examples.indianCase.title}</h4>
    <p class="case-study-details">${data.examples.indianCase.details}</p>
  `;

  // Global Case Study
  const globalCaseDiv = document.getElementById('cases-global-case');
  globalCaseDiv.innerHTML = `
    <h4 class="case-study-title">${data.examples.globalCase.title}</h4>
    <p class="case-study-details">${data.examples.globalCase.details}</p>
  `;

  // Action Items
  const practicalUl = document.getElementById('cases-practical-applications');
  practicalUl.innerHTML = '';
  data.practicalApplications.forEach(app => {
    const li = document.createElement('li');
    li.innerText = app;
    practicalUl.appendChild(li);
  });

  // Mistakes
  const mistakesUl = document.getElementById('cases-common-mistakes');
  mistakesUl.innerHTML = '';
  data.commonMistakes.forEach(mistake => {
    const li = document.createElement('li');
    li.innerText = mistake;
    mistakesUl.appendChild(li);
  });
}

// Tab 4: Academic Rigor Rendering
function renderAcademicTab(data) {
  // Accordions helper
  function renderAccordion(targetId, qas) {
    const container = document.getElementById(targetId);
    container.innerHTML = '';
    
    qas.forEach((qa, idx) => {
      const item = document.createElement('div');
      item.className = 'accordion-item';
      const ttsQaText = `Question: ${qa.question}. Answer: ${qa.answer}`;
      const ttsBtnQa = TTS.btn(ttsQaText, `Q${idx + 1}: ${qa.question.substring(0,50)}`);
      item.innerHTML = `
        <button class="accordion-header">
          <span>Q${idx + 1}: ${qa.question}</span>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            ${ttsBtnQa}
            <i class="fa-solid fa-chevron-down accordion-icon"></i>
          </div>
        </button>
        <div class="accordion-content">
          <div class="accordion-answer">${qa.answer}</div>
        </div>
      `;
      
      const btn = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');
      
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Collapse all in this accordion container
        container.querySelectorAll('.accordion-item').forEach(el => {
          el.classList.remove('active');
          el.querySelector('.accordion-content').style.maxHeight = null;
        });
        
        if (!isActive) {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
      
      container.appendChild(item);
    });
  }

  // Interview Questions
  renderAccordion('academic-interview-questions', data.assessments.interviewQuestions);

  // MBA Questions
  renderAccordion('academic-mba-questions', data.assessments.mbaQuestions);

  // Practice Exercises and Assignments Text
  document.getElementById('academic-exercises').innerText = data.assessments.practiceExercises.join('\n\n');
  document.getElementById('academic-assignments').innerText = data.assessments.assignments.join('\n\n');

  // Scenario Caselets
  const scenarioContainer = document.getElementById('academic-scenarios');
  scenarioContainer.innerHTML = '';
  data.assessments.scenarioQuestions.forEach((s, idx) => {
    const card = document.createElement('div');
    card.className = 'scenario-card';
    card.innerHTML = `
      <div class="scenario-heading">Scenario ${idx + 1}: ${s.scenario.substring(0, 45)}...</div>
      <p class="scenario-text">${s.scenario}</p>
      <div class="scenario-query"><strong>Question:</strong> ${s.question}</div>
      <button class="btn btn-secondary btn-sm" id="show-analysis-btn-${idx}">Show Model Analysis</button>
      <p class="scenario-analysis hidden" id="analysis-text-${idx}"><strong>Strategic Analysis:</strong> ${s.analysis}</p>
    `;
    
    const btn = card.querySelector(`#show-analysis-btn-${idx}`);
    const analysis = card.querySelector(`#analysis-text-${idx}`);
    
    btn.addEventListener('click', () => {
      analysis.classList.toggle('hidden');
      btn.innerText = analysis.classList.contains('hidden') ? 'Show Model Analysis' : 'Hide Analysis';
    });

    scenarioContainer.appendChild(card);
  });
}

// Tab 5: Review & Mastery Rendering
function renderReviewTab(data) {
  // One Page Revision
  document.getElementById('review-one-page').innerHTML = formatMarkdown(data.onePageRevision);

  // Feynman Review
  const feynmanText = document.getElementById('feynman-text');
  const feynmanCheckBtn = document.getElementById('feynman-check-btn');
  const feynmanExampleBtn = document.getElementById('feynman-example-btn');
  const feynmanFeedback = document.getElementById('feynman-feedback');

  feynmanText.value = '';
  feynmanFeedback.classList.add('hidden');

  feynmanCheckBtn.onclick = () => {
    const input = feynmanText.value.trim().toLowerCase();
    if (input.length < 20) {
      feynmanFeedback.className = 'feynman-feedback error-feedback';
      feynmanFeedback.innerHTML = `<i class="fa-solid fa-circle-exclamation font-red"></i> <strong>Incomplete Review:</strong> Please write a more detailed explanation (at least 2-3 sentences) to test your conceptual recall.`;
      feynmanFeedback.classList.remove('hidden');
      return;
    }

    // Match keywords for feedback
    const keywords = data.feynmanReview.keywords || ['value', 'customer', 'exchange', 'relationships'];
    const matched = keywords.filter(word => input.includes(word.toLowerCase()));
    
    const strengthPct = Math.round((matched.length / keywords.length) * 100);
    
    feynmanFeedback.className = 'feynman-feedback';
    if (strengthPct > 70) {
      feynmanFeedback.innerHTML = `
        <i class="fa-solid fa-circle-check font-mint"></i> <strong>Excellent Feynman Recall!</strong> 
        Your explanation matched ${strengthPct}% of the critical academic criteria (Keywords included: ${matched.join(', ')}). 
        You explained the concept cleanly without relying on unnecessary complexity.
      `;
    } else {
      const missed = keywords.filter(w => !matched.includes(w.toLowerCase()));
      feynmanFeedback.innerHTML = `
        <i class="fa-solid fa-lightbulb font-gold"></i> <strong>Good Attempt:</strong> 
        Your explanation covers the basics, but misses critical structural dimensions. 
        Try integrating these concepts: <strong>${missed.join(', ')}</strong>.
      `;
    }
    feynmanFeedback.classList.remove('hidden');
  };

  feynmanExampleBtn.onclick = () => {
    feynmanText.value = data.feynmanReview.guide;
    feynmanFeedback.className = 'feynman-feedback';
    feynmanFeedback.innerHTML = `Loaded a model Feynman narrative for study. Analyze the structure and rewrite in your own words.`;
    feynmanFeedback.classList.remove('hidden');
  };

  // Render Interactive Quiz
  initInteractiveQuiz(data.masteryAssessment);
}

// Interactive Quiz Engine
function initInteractiveQuiz(questions) {
  const container = document.getElementById('quiz-container');
  container.innerHTML = '';

  let currentQIdx = 0;
  let score = 0;
  let answered = false;

  function renderQuestion() {
    container.innerHTML = '';
    const q = questions[currentQIdx];
    answered = false;

    const header = document.createElement('div');
    header.className = 'quiz-header';
    header.innerHTML = `
      <span class="quiz-progress">Question ${currentQIdx + 1} of ${questions.length}</span>
      <span class="progress-percent">Score: ${score}</span>
    `;
    container.appendChild(header);

    const qBox = document.createElement('div');
    qBox.className = 'quiz-question-box';
    qBox.innerHTML = `<p>${q.question}</p>`;
    container.appendChild(qBox);

    const optionsUl = document.createElement('ul');
    optionsUl.className = 'quiz-options-list';

    q.options.forEach((opt, idx) => {
      const li = document.createElement('li');
      const letter = String.fromCharCode(65 + idx); // A, B, C, D
      
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `
        <span class="quiz-option-letter">${letter}</span>
        <span>${opt}</span>
      `;
      
      btn.addEventListener('click', () => {
        if (answered) return; // Answer locked
        answered = true;
        
        // Disable other options and add classes
        const allBtns = optionsUl.querySelectorAll('.quiz-option-btn');
        allBtns.forEach((b, bIdx) => {
          if (bIdx === q.correct) {
            b.classList.add('correct');
          } else if (bIdx === idx) {
            b.classList.add('incorrect');
          }
        });

        // Explanation card
        const expCard = document.createElement('div');
        expCard.className = 'quiz-explanation';
        
        if (idx === q.correct) {
          score++;
          expCard.innerHTML = `<strong><i class="fa-solid fa-circle-check"></i> Correct!</strong> ${q.explanation}`;
        } else {
          expCard.innerHTML = `<strong><i class="fa-solid fa-circle-xmark font-red"></i> Incorrect:</strong> Selected option ${letter}. ${q.explanation}`;
        }
        
        container.appendChild(expCard);
        
        // Show Next button
        const footer = document.createElement('div');
        footer.className = 'quiz-footer';
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-primary';
        nextBtn.innerText = currentQIdx === questions.length - 1 ? 'Finish Assessment' : 'Next Question';
        
        nextBtn.onclick = () => {
          if (currentQIdx === questions.length - 1) {
            finishQuiz();
          } else {
            currentQIdx++;
            renderQuestion();
          }
        };
        
        footer.appendChild(nextBtn);
        container.appendChild(footer);
      });

      li.appendChild(btn);
      optionsUl.appendChild(li);
    });

    container.appendChild(optionsUl);
  }

  function finishQuiz() {
    container.innerHTML = '';
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 60;

    const resultCard = document.createElement('div');
    resultCard.className = 'quiz-result-card card';
    
    let resultMessage = '';
    let resultIcon = '';
    if (passed) {
      resultMessage = `<h3>Congratulations! Module Mastered</h3><p>You have demonstrated strategic proficiency in this module and unlocked the credential.</p>`;
      resultIcon = `<i class="fa-solid fa-award font-gold" style="font-size: 4rem;"></i>`;
      
      // Update completion in state
      userProgress[activeChapterId] = { completed: true, quizScore: score };
      saveProgress();
      renderCurriculum();
    } else {
      resultMessage = `<h3>Try Again</h3><p>We recommend reviewing the chapter frameworks and trying the assessment again to unlock credentials.</p>`;
      resultIcon = `<i class="fa-solid fa-rotate-left font-orange" style="font-size: 4rem;"></i>`;
    }

    resultCard.innerHTML = `
      ${resultIcon}
      <div class="quiz-result-score">${score} / ${questions.length}</div>
      ${resultMessage}
      <button class="btn btn-secondary" id="restart-quiz-btn"><i class="fa-solid fa-rotate-right"></i> Restart Quiz</button>
    `;

    resultCard.querySelector('#restart-quiz-btn').onclick = () => {
      initInteractiveQuiz(questions);
    };

    container.appendChild(resultCard);
  }

  renderQuestion();
}

// Switch tabs and handle lazy rendering of Mermaid
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active');
    }
  });

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  document.getElementById(`tab-${tabId}`).classList.add('active');

  // Trigger Mermaid diagrams parse if the tab is Visual Mapping
  if (tabId === 'visual-mapping' && currentChapterData) {
    renderMermaidDiagrams(currentChapterData);
  }
}

// De-dent helper to clean up Mermaid string templates without breaking hierarchy
function cleanMermaidSyntax(syntax) {
  if (!syntax) return '';
  const lines = syntax.split('\n');
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  if (lines.length === 0) return '';
  
  let minIndent = Infinity;
  lines.forEach(line => {
    if (line.trim() === '') return;
    const match = line.match(/^(\s*)/);
    if (match) {
      minIndent = Math.min(minIndent, match[1].length);
    }
  });
  
  if (minIndent === Infinity || minIndent === 0) {
    return lines.join('\n');
  }
  return lines.map(line => line.substring(minIndent)).join('\n');
}

// Dynamically inject and render Mermaid text tags
function renderMermaidDiagrams(data) {
  const renderArea = (elementId, syntax) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    // Clear out previous SVG contents
    el.removeAttribute('data-processed');
    el.innerHTML = cleanMermaidSyntax(syntax);
  };

  renderArea('mermaid-knowledge-graph', data.knowledgeGraph || '');
  renderArea('mermaid-mind-map', data.mindMaps || '');
  renderArea('mermaid-flowchart', data.flowcharts || '');
  renderArea('mermaid-concept-map', data.conceptMaps || '');
  renderArea('mermaid-decision-tree', data.decisionTrees || '');
  renderArea('mermaid-visual-diagram', data.visualDiagrams || '');

  // Force Mermaid reload and parse the injected texts
  try {
    mermaid.run({
      nodes: document.querySelectorAll('.mermaid')
    });
  } catch (err) {
    console.error("Mermaid parsing error: ", err);
  }
}

// Helper: Global Search Engine
function setupSearch() {
  // Lazy data store for search mapping
  const searchIndex = [];
  
  // Hook index elements for Chapter 1, 2, 7 (fully-populated chapters)
  function buildIndex(data) {
    if (!data) return;
    const chName = `Chapter ${data.id}: ${data.title}`;
    
    // Index Definitions
    data.definitions.forEach(d => {
      searchIndex.push({
        chId: data.id,
        category: 'Definition',
        title: d.term,
        excerpt: d.definition,
        context: chName
      });
    });

    // Index Frameworks
    data.frameworks.forEach(f => {
      searchIndex.push({
        chId: data.id,
        category: 'Framework',
        title: f.name,
        excerpt: f.explanation,
        context: chName
      });
    });

    // Index Case Studies
    searchIndex.push({
      chId: data.id,
      category: 'Indian Case',
      title: data.examples.indianCase.title,
      excerpt: data.examples.indianCase.details.substring(0, 120) + '...',
      context: chName
    });

    searchIndex.push({
      chId: data.id,
      category: 'Global Case',
      title: data.examples.globalCase.title,
      excerpt: data.examples.globalCase.details.substring(0, 120) + '...',
      context: chName
    });
  }

  // Pre-index Chapter 1, 2, and 7 details sequentially to avoid race conditions
  const sampleFiles = ['data/chapter_01.js', 'data/chapter_02.js', 'data/chapter_07.js'];
  
  function loadIndexSequentially(index) {
    if (index >= sampleFiles.length) return;
    
    const src = sampleFiles[index];
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => {
      buildIndex(window.currentChapterData);
      loadIndexSequentially(index + 1);
    };
    document.body.appendChild(s);
  }
  
  loadIndexSequentially(0);

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) {
      searchResults.classList.add('hidden');
      return;
    }

    const matches = searchIndex.filter(item => {
      return item.title.toLowerCase().includes(query) || 
             item.excerpt.toLowerCase().includes(query) || 
             item.category.toLowerCase().includes(query);
    });

    if (matches.length > 0) {
      searchResults.innerHTML = '';
      matches.slice(0, 6).forEach(m => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.innerHTML = `
          <div class="search-result-title"><span class="font-cyan">[${m.category}]</span> ${m.title}</div>
          <div class="search-result-excerpt">${m.excerpt} (${m.context})</div>
        `;
        div.addEventListener('click', () => {
          selectChapter(m.chId);
          searchResults.classList.add('hidden');
          searchInput.value = '';
        });
        searchResults.appendChild(div);
      });
      searchResults.classList.remove('hidden');
    } else {
      searchResults.innerHTML = '<div class="search-result-item font-muted text-center" style="font-size: 0.8rem;">No results found</div>';
      searchResults.classList.remove('hidden');
    }
  });

  // Close search on click outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add('hidden');
    }
  });
}

// Setup Event Listeners
function setupEventListeners() {
  // Mobile Sidebar Toggle
  toggleSidebarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('open');
  });

  // Close mobile sidebar on main content area click
  const mainViewport = document.querySelector('.main-viewport');
  if (mainViewport) {
    mainViewport.addEventListener('click', () => {
      if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Day/Night Toggle Button
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = localStorage.getItem('mktg_academy_theme') || 'obsidian';
      const isLight = ['editorial', 'parchment', 'saas'].includes(currentTheme);
      
      const nextTheme = isLight ? 'obsidian' : 'parchment';
      
      applyThemeClass(nextTheme);
      const themeSelect = document.getElementById('theme-select');
      if (themeSelect) themeSelect.value = nextTheme;
    });
  }

  // Theme Select Dropdown
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      const selectedTheme = e.target.value;
      localStorage.setItem('mktg_academy_theme', selectedTheme);
      applyThemeClass(selectedTheme);
    });
  }

  // Settings Modal Toggle Buttons
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');

  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', () => {
      settingsModal.classList.add('open');
    });
  }

  if (closeModalBtn && settingsModal) {
    closeModalBtn.addEventListener('click', () => {
      settingsModal.classList.remove('open');
    });
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        settingsModal.classList.remove('open');
      }
    });
  }

  // Radio Profile Selection Change Listeners
  document.querySelectorAll('input[name="learning-profile"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const selectedProfile = e.target.value;
      localStorage.setItem('mktg_academy_profile', selectedProfile);
      activeLearningProfile = selectedProfile;
      if (currentChapterData) {
        renderPersonaFocusContent(currentChapterData);
      }
    });
  });

  // Close Lesson Focus Card Button
  const closeLessonBtn = document.getElementById('close-lesson-btn');
  if (closeLessonBtn) {
    closeLessonBtn.addEventListener('click', () => {
      const card = document.getElementById('lesson-focus-card');
      if (card) card.classList.add('hidden');
      document.querySelectorAll('.timeline-node').forEach(el => el.classList.remove('active'));
    });
  }

  // Start Learning button
  startLearningBtn.addEventListener('click', () => {
    // Select first chapter
    selectChapter(1);
  });

  // Tab switcher buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Setup search box indexer
  setupSearch();
}

// Update overall progress bar
function updateProgressUI() {
  const totalChapters = 20; // total marketing syllabus chapters
  const completedCount = Object.keys(userProgress).filter(k => userProgress[k].completed).length;
  
  const pct = Math.round((completedCount / totalChapters) * 100);
  overallProgressText.innerText = `${pct}%`;
  overallProgressFill.style.width = `${pct}%`;
}

// Simple markdown string formatting helper
function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*?)\n/g, '<h4>$1</h4>')
    .replace(/## (.*?)\n/g, '<h3>$1</h3>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/- (.*?)\n/g, '<li>$1</li>');
}

// Generate Stub Data for non-loaded chapters (so curriculum outlines remain clickable and readable)
function generateStubData(id, chMeta) {
  return {
    id: id,
    title: chMeta.title,
    lessons: chMeta.lessons,
    learningObjectives: [
      `Analyze the key themes of ${chMeta.title}.`,
      "Master the fundamental equations, principles, and concepts governing this module.",
      "Understand practical application within corporate and consumer contexts."
    ],
    firstPrinciples: {
      statement: `Theoretical foundation of ${chMeta.title}`,
      explanation: "This module breaks down core structural assumptions to explain how customer values are strategically managed in competitive environments."
    },
    definitions: [
      { term: chMeta.title.split(':')[0], definition: `The core practice representing ${chMeta.title}.`, source: "Textbook" },
      { term: "Strategic Priority", definition: "A critical roadmap metric determining resource allocation priorities.", source: "Professional Insight" }
    ],
    intuition: {
      analogy: "Like navigating a ship through changing winds, marketing requires adjusting strategic sails while maintaining core destination values.",
      story: "Marketers often fail because they focus on tactics (building individual engines) rather than strategy (mapping out the ultimate trade route)."
    },
    frameworks: [
      { name: "Executive Decision Loop", explanation: "A model organizing analysis, execution, and ROI measurements.", components: ["Situation Audit", "Strategic Intent", "Tactical Execution", "Performance Metrics"] }
    ],
    comparisonTables: {
      headers: ["Metric", "Traditional Practice", "Professional Academy Standard"],
      rows: [
        ["Orientation", "Reactive planning", "First-principles driven"],
        ["Implementation", "Siloed execution", "Cross-linked network alignment"]
      ]
    },
    crossLinks: [
      { chapter: "Chapter 1 (Creating Value)", connection: "Fundamental value concepts link directly with strategic outputs of this chapter." }
    ],
    memoryTechniques: [
      { name: "S-A-T-E", type: "Mnemonic", details: "Situation, Align, Tactics, Evaluation." }
    ],
    visualRoadmapSteps: chMeta.lessons.map(l => ({ title: l.split(' → ')[1] || l, desc: `Complete critical study material and exercises for ${l}.` })),
    infographics: [
      { value: "100%", title: "Curriculum Match", description: "Follows exact Pearson/Kotler chapter contents." },
      { value: "Level A", title: "Difficulty Level", description: "Standard MBA rigorous analytical approach." },
      { value: "Caselets", title: "Practice Mode", description: "Real-world context simulation scenario questions." }
    ],
    examples: {
      realWorld: "Corporate giants routinely pivot their operational strategies to align with these variables.",
      industry: "FMCG, automotive, and tech firms utilize these structures in their annual marketing planning workshops.",
      indianCase: { title: "Amul Co-operative Model", details: "A classic example of supply chain alignment, scale management, and consistent branding that disrupted Indian dairy markets." },
      globalCase: { title: "Starbucks Value Delivery", details: "Standardized customer service, premium location strategies, and global supply integration creating a third-place experience." }
    },
    practicalApplications: [
      "Review organizational value chain structures on Monday morning.",
      "Conduct target market segment alignments with product manager leaders."
    ],
    commonMistakes: [
      "Mistaking tactical campaign shifts for long-term strategic positioning.",
      "Neglecting customer feedback loops when monitoring performance dashboard matrices."
    ],
    assessments: {
      interviewQuestions: [
        { question: `What is the core takeaway of ${chMeta.title}?`, answer: "The alignment of product, price, place, and promotion with the target customer segment's specific value requirements." }
      ],
      mbaQuestions: [
        { question: `Critically analyze the strategic implications of ${chMeta.title} in a high-tech sector.`, answer: "High-tech sectors demand rapid adaptation loops, making linear forecasting obsolete in favor of dynamic strategic portfolio management." }
      ],
      scenarioQuestions: [
        { scenario: "A legacy retail brand is losing share to digital native startups in major metropolitan areas.", question: "How should the executive board restructure their marketing orientation?", analysis: "Transition from retail footprint footprint to an omnichannel strategy driven by first-principles customer journey analysis." }
      ],
      practiceExercises: [
        "Construct an audit dashboard measuring primary variables of this chapter against a competitor."
      ],
      assignments: [
        "Write a 1,500-word strategic paper proposing an operational revamp for a company of your choice."
      ]
    },
    feynmanReview: {
      prompt: `Explain the essence of ${chMeta.title} as simply as possible.`,
      guide: "Marketing is about finding what people need, building the best way to satisfy that need, telling them about it, and keeping them happy so they help you grow.",
      keywords: ["customer", "strategy", "value", "marketing"]
    },
    onePageRevision: `### Chapter Summary\nThis chapter establishes standard strategic guidelines.\n\n### Key Concepts\n- **Strategic Intent:** Long-term target positioning.\n- **Execution Framework:** Linking variables with target segments.\n- **Performance Measurement:** Tracking marketing ROI outputs.`,
    masteryAssessment: [
      { question: `Which of the following is the most critical starting point for strategic planning?`, options: ["Competitor discount tracking", "Defining a customer-centric mission statement", "Hiring sales executives", "Launching advertising campaigns"], correct: 1, explanation: "Defining a clear, customer-centric mission statement sets the baseline orientation for all strategic alignment efforts." },
      { question: `How do practitioners distinguish strategy from tactics?`, options: ["Strategy is expensive, tactics are cheap", "Strategy focuses on 'why' and 'who', tactics focus on 'how' and 'where'", "Strategy is for executives, tactics are for juniors", "They are identical terms"], correct: 1, explanation: "Strategy defines target destination, value proposition, and segments, while tactics govern campaign implementation details." }
    ],
    knowledgeGraph: (() => {
      const lessonsList = chMeta.lessons.map((l, i) => {
        const cleanL = l.split(' → ')[1] || l;
        return `L${i}["${cleanL}"]`;
      });
      let syntax = 'graph TD\n';
      syntax += `  Start["${chMeta.title}"] --> L0\n`;
      for (let i = 0; i < lessonsList.length - 1; i++) {
        syntax += `  L${i} --> L${i+1}\n`;
      }
      lessonsList.forEach((lbl, i) => {
        syntax += `  ${lbl}\n`;
      });
      return syntax;
    })(),
    mindMaps: (() => {
      let syntax = 'mindmap\n';
      syntax += `  root("${chMeta.title.split(':')[0].replace(/"/g, '')}")\n`;
      chMeta.lessons.forEach(l => {
        const cleanL = (l.split(' → ')[1] || l).replace(/"/g, '');
        syntax += `    "${cleanL}"\n`;
      });
      return syntax;
    })(),
    flowcharts: `
      graph LR
        Input["Input Context"] --> Process["${chMeta.title.split(':')[0].replace(/"/g, '')} Analysis"]
        Process --> Output["Market Performance Output"]
    `,
    conceptMaps: `
      graph TD
        Core["${chMeta.title.split(':')[0].replace(/"/g, '')}"] --> Principles["Strategic Principles"]
        Core --> Implementation["Implementation Tactics"]
    `,
    decisionTrees: `
      graph TD
        Decision["Strategic Choice"] --> OptionA["Segment Niche Targeting"]
        Decision --> OptionB["Mass Expansion Strategy"]
    `,
    visualDiagrams: `
      graph TD
        Corporate["Corporate SBU Objectives"] --> Product["Product Roadmap Alignment"]
    `
  };
}

// Lesson Overviews Database (Day/Night Theme Blended)
const lessonDescriptions = {
  // Chapter 1 Lessons
  "Lesson 1 → What Is Marketing?": "Understanding marketing as the organizational process of building profitable customer relationships by creating, delivering, and capturing value. Focuses on the shift from transactional selling to relationship-driven customer equity.",
  "Lesson 2 → Marketing Process": "The 5-step master path: 1. Audit marketplace needs and customer characteristics; 2. Design value-driven STP strategy; 3. Develop 4Ps plan; 4. CRM & customer delight; 5. Capture lifetime customer value and equity.",
  "Lesson 3 → Needs, Wants & Demands": "Needs are basic human deprivations (physical, social, individual). Wants are cultural translations of needs. Demands are wants backed by buying power.",
  "Lesson 4 → Market Offerings": "Combinations of physical products, digital services, information, or brand experiences offered to a market to satisfy customer needs.",
  "Lesson 5 → Customer Value": "The customer's evaluation of the differences between all the benefits and all the costs of a market offering relative to competing offers.",
  "Lesson 6 → Exchange & Relationships": "Exchange is the act of obtaining a desired object by offering something in return. Marketing consists of actions taken to create, maintain, and grow these relationships.",
  "Lesson 7 → Markets": "The set of all actual and potential buyers of a product or service. Buyers share a particular need or want that can be satisfied through exchanges.",
  "Lesson 8 → Marketing Strategy": "Selecting which customer segments to serve (Targeting) and deciding what value proposition will be promised to them (Positioning).",
  "Lesson 9 → Marketing Mix": "The set of tactical marketing tools—Product, Price, Place, and Promotion (the 4Ps)—that the firm blends to produce the response it wants in the target market.",
  "Lesson 10 → CRM": "Customer Relationship Management. The overall process of building and maintaining profitable customer relationships by delivering superior customer value and satisfaction.",
  "Lesson 11 → Capturing Customer Value": "Harvesting customer lifetime value (CLV), increasing share of customer, and maximizing customer equity (the sum of all CLVs).",
  "Lesson 12 → Changing Marketing Landscape": "Adapting strategies to digital technology, mobile and social media networks, big data analytics, sustainable marketing responsibility, and global trade networks.",

  // Chapter 2 Lessons
  "Lesson 1 → Company-Wide Strategic Planning & Market-Oriented Mission": "Aligning company capabilities with market options. Setting a mission statement defined by customer needs rather than physical products.",
  "Lesson 2 → Setting Company Objectives and Goals": "Translating the corporate mission into measurable, hierarchical objectives for business operations, research, and marketing.",
  "Lesson 3 → Designing the Business Portfolio": "Analyzing and allocating capital across the company's collection of strategic business units (SBUs) using portfolio matrices.",
  "Lesson 4 → The Boston Consulting Group (BCG) Approach": "Classifying SBUs into Stars (high growth, high share), Cash Cows (low growth, high share), Question Marks (high growth, low share), and Dogs (low growth, low share).",
  "Lesson 5 → Developing Strategies for Growth and Downsizing": "Using the Ansoff Grid to select growth engines: Market Penetration, Market Development, Product Development, and Diversification, or pruning weak SBUs.",
  "Lesson 6 → Planning Marketing: Partnering to Build Customer Relationships": "Integrating marketing with engineering, finance, and logistics to design and support value-creation loops.",
  "Lesson 7 → Value Chains and Value Delivery Networks": "Value Chain: Internal SBU coordination. Value Delivery Network: Outer coordination of suppliers, distributors, and end-consumers.",
  "Lesson 8 → Customer Value-Driven Marketing Strategy": "The STP process of dividing the market (Segmentation) and targeting high-yield segments (Targeting).",
  "Lesson 9 → Developing an Integrated Marketing Mix (The 4 Ps)": "Designing Product, Price, Place, and Promotion variables to deliver the positioned value proposition.",
  "Lesson 10 → Managing the Marketing Effort (SWOT Analysis & Planning)": "Executing a SWOT audit (Strengths, Weaknesses, Opportunities, Threats) and monitoring marketing implementation plans.",
  "Lesson 11 → Measuring and Managing Marketing Return on Investment (ROI)": "Calculating Net Marketing Profit divided by Marketing Expenditures to ensure marketing adds positive economic value.",

  // Chapter 7 Lessons
  "Lesson 1 → Market Segmentation (Consumer, Business, and International)": "Dividing a diverse market into smaller, homogeneous consumer groups using Geographic, Demographic, Psychographic, and Behavioral variables.",
  "Lesson 2 → Requirements for Effective Segmentation": "Evaluating segments using the MASDA checklist: Measurable, Accessible, Substantial, Differentiable, and Actionable.",
  "Lesson 3 → Market Targeting (Evaluating and Selecting Segments)": "Choosing a coverage strategy: Undifferentiated (Mass), Differentiated (Segmented), Concentrated (Niche), or Micromarketing (Local/Individual).",
  "Lesson 4 → Differentiation and Positioning (Positioning Maps & Strategies)": "Plotting competitor perceptual positioning maps, identifying points of difference, and crafting winning value proposition statements."
};

// Lesson Visuals Database Map for Timeline Node Integration
const lessonVisualsMap = {
  // Chapter 1
  "Lesson 1 → What Is Marketing?": {
    file: "figure_1_1_marketing_process.jpg",
    caption: "<strong>Figure 1.1: A Simple Model of the Marketing Process.</strong> This model outlines the 5 key steps: understanding the marketplace, designing value-driven STP strategy, building integrated 4Ps campaigns, fostering customer delight, and harvesting customer lifetime value (CLV) and customer equity."
  },
  "Lesson 2 → Marketing Process": {
    file: "figure_1_1_marketing_process.jpg",
    caption: "<strong>Figure 1.1: The 5-Step Marketing Process.</strong> Shows how creating customer value in the first 4 steps is the direct prerequisite to capturing value from customers in return in Step 5."
  },
  "Lesson 3 → Needs, Wants & Demands": {
    file: "figure_1_1_marketing_process.jpg",
    caption: "<strong>Core Customer Concepts.</strong> Illustrates how human Needs translate into cultural Wants, which become buying-power Demands for specific market offerings."
  },
  
  // Chapter 2
  "Lesson 1 → Company-Wide Strategic Planning & Market-Oriented Mission": {
    file: "figure_2_2_bcg_matrix.jpg",
    caption: "<strong>Corporate Strategic Planning.</strong> Setting a customer-centric mission statement defines the scope of all SBU portfolio planning."
  },
  "Lesson 4 → The Boston Consulting Group (BCG) Approach": {
    file: "figure_2_2_bcg_matrix.jpg",
    caption: "<strong>Figure 2.2: BCG SBU growth-share matrix.</strong> Classifies business divisions into Stars, Cash Cows, Question Marks, and Dogs along market share and market growth vectors, guiding capital allocation decisions."
  },
  "Lesson 5 → Developing Strategies for Growth and Downsizing": {
    file: "figure_2_3_ansoff_grid.jpg",
    caption: "<strong>Figure 2.3: Product/Market Expansion Grid.</strong> Shows the four primary SBU growth strategies: Market Penetration, Market Development, Product Development, and Diversification."
  },
  
  // Chapter 3
  "Lesson 1 → Analyzing the Marketing Environment": {
    file: "figure_3_1_environment.jpg",
    caption: "<strong>Figure 3.1: The Marketing Environment.</strong> Deconstructs corporate marketing inputs into Microforces (immediate stakeholders like company, suppliers, competitors, customers) and Macroforces (broader trends like technology, demographic cohorts, and legislation)."
  },

  // Chapter 5
  "Lesson 1 → Model of Consumer Behavior": {
    file: "figure_5_1_buyer_behavior.jpg",
    caption: "<strong>Figure 5.1: Model of Consumer Buyer Behavior.</strong> Traces how environmental stimuli enter the consumer black box (characteristics and decision steps) to shape purchase choice responses."
  },
  
  // Chapter 7
  "Lesson 3 → Market Targeting (Evaluating and Selecting Segments)": {
    file: "figure_7_1_stp_strategy.jpg",
    caption: "<strong>Figure 7.1: Customer Value-Driven Marketing Strategy (STP).</strong> Shows how market segmentation and targeting (selecting customers to serve) work in tandem with differentiation and positioning (deciding on a value proposition)."
  },
  "Lesson 4 → Differentiation and Positioning (Positioning Maps & Strategies)": {
    file: "figure_7_2_perceptual_map.jpg",
    caption: "<strong>Figure 7.2: Perceptual Positioning Map.</strong> Plots competitor brand locations along luxury and price orientation dimensions, helping brands identify strategic points of difference."
  },
  
  // Chapter 8
  "Lesson 1 → Three Levels of Product": {
    file: "figure_8_1_product_levels.jpg",
    caption: "<strong>Figure 8.1: The Three Levels of Product.</strong> Outlines the concentric rings of product design: Core Customer Value (what the customer is really buying), Actual Product features/branding, and Augmented Product services."
  }
};

// Show Lesson Focus Details
function showLessonFocus(lessonTitle) {
  const card = document.getElementById('lesson-focus-card');
  const title = document.getElementById('lesson-focus-title');
  const desc = document.getElementById('lesson-focus-desc');
  
  const visualSeg = document.getElementById('lesson-visual-segment');
  const visualImgBox = document.getElementById('lesson-visual-img-box');
  const visualCaption = document.getElementById('lesson-visual-caption');
  
  if (!card || !title || !desc) return;
  
  const summary = lessonDescriptions[lessonTitle] || 
                  `This lesson explores the key variables, strategic concepts, and implementation guides related to: "${lessonTitle}". Select the tabs below to study its frameworks, visual mappings, and assessments in detail.`;
  
  title.innerText = lessonTitle;
  desc.innerText = summary;
  
  // Handle Lesson Visual Mapping
  if (visualSeg && visualImgBox && visualCaption) {
    const visual = lessonVisualsMap[lessonTitle];
    if (visual) {
      visualSeg.classList.remove('hidden');
      visualImgBox.innerHTML = `<img src="images/${visual.file}" alt="${lessonTitle}">`;
      visualCaption.innerHTML = visual.caption;
    } else {
      visualSeg.classList.add('hidden');
      visualImgBox.innerHTML = '';
      visualCaption.innerHTML = '';
    }
  }
  
  // Add TTS button alongside the lesson title
  const ttsBtnHtml = TTS.btn(summary, lessonTitle);
  title.innerHTML = `${lessonTitle} ${ttsBtnHtml}`;
  desc.innerText = summary;
  
  card.classList.remove('hidden');
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Learning Profiles Database
const personaDatabase = {
  // Chapter 1 Persona Overviews
  1: {
    socratic: {
      concept: "Customer Value Creation and Relationship Building",
      problem: "A major Indian budget hotel aggregator is experiencing high churn among business travelers who complain about inconsistent room quality, unreliable Wi-Fi, and slow check-ins. The operations team suggests lowering prices further. As a trainer, how would you restructure their marketing orientation to stop the churn without cutting margins?",
      guide: "Focus on Customer Value-driven strategy rather than price cuts. Re-engineer the offering to establish a minimum baseline quality standard (Wi-Fi speed, express check-in), transforming it from a pure cost-play to a relationship-driven value proposition.",
      keywords: ["value", "relationship", "offering", "delight", "quality"]
    },
    network: {
      core80_20: [
        { concept: "Customer Value & Satisfaction", ratio: "Drives 50% of retention value" },
        { concept: "Customer Lifetime Value (CLV)", ratio: "Drives long-term SBU asset valuation" }
      ],
      dependencies: {
        prereqs: "None (Introductory Module)",
        forward: "Directly determines strategic inputs for Chapter 2 (Mission design) and Chapter 7 (STP framework).",
        backward: "None."
      },
      graphSyntax: `
        graph TD
          Needs[Marketplace Needs] --> Value[Customer Value]
          Value --> Satisfaction[Satisfaction & Delight]
          Satisfaction --> CLV[Customer Lifetime Value]
          CLV --> Equity[Customer Equity]
      `
    },
    caseStudy: {
      harvardCase: {
        title: "Harvard Case Method: The Jio Digital Ecosystem Launch (2016)",
        context: "Reliance Jio Infocomm disrupted the Indian telecom sector by offering free high-speed 4G data and voice calling for 6 months, building a subscriber base of 100M+ in record time. It shifted the value proposition from commoditized voice calls to digital data ecosystems.",
        lessons: "Jio realized that in a digital economy, data is the entry point to customer lifetime value (CLV). By building a strong customer relationship platform (JioTV, JioMart, JioCinema), they captured immense digital equity.",
        alternatives: [
          { decision: "Match incumbents with standard voice packages", result: "Would have resulted in price wars with no digital ecosystem lock-in." },
          { decision: "Invest heavily in digital content ecosystem", result: "Succeeded. Jio transformed from a dumb pipe into a multi-sided ecosystem aggregator." }
        ],
        questions: [
          "How did Jio leverage the difference between consumer Needs, Wants, and Demands?",
          "Critically evaluate Jio's free data pricing using the concept of customer equity."
        ]
      },
      indianExample: { title: "Amul Dairy Cooperative", details: "Secures customer value for millions of Indian farmers while providing reliable dairy offerings to urban consumers." },
      globalExample: { title: "Netflix Personalization Engine", details: "Uses advanced recommendation algorithms to maximize subscriber retention, directly driving customer lifetime value (CLV)." }
    },
    pmPerspective: {
      problem: "Tech users struggle with 'feature fatigue'. Incumbents pack products with technical features, ignoring user core problems.",
      jtbd: "Job-To-Be-Done: 'Get reliable, fast access to critical information without distraction.' (Product is Google Search, not advertising).",
      pmf: "Sean Ellis PMF Test: If at least 40% of surveyed users would be 'very disappointed' if your product disappeared, PMF is validated.",
      metrics: "LTV/CAC Ratio: SaaS benchmark is > 3x. Low churn (< 2% monthly) is required to sustain customer equity.",
      rice: "Reach (100k users), Impact (3/high), Confidence (80%), Effort (2 months) = High Priority.",
      saasCase: "Slack's simple onboarding loop: focuses on getting users to send 2,000 team messages (the 'aha' moment of value activation) rather than listing platform features."
    }
  },

  // Chapter 2 Persona Overviews
  2: {
    socratic: {
      concept: "Business Portfolio Strategy and Strategic Business Units (SBUs)",
      problem: "A diversified Indian consumer electronics conglomerate has an SBU that manufactures CRT televisions. The SBU has low relative market share in a rapidly declining market, but continues to generate small cash surpluses. The CEO wants to invest 50 Crore to upgrade the factory to manufacture LED TVs. Using BCG and strategic planning logic, what is your critique?",
      guide: "The CRT division is a 'Dog'. Investing 50 Crore is a major strategic misalignment. Capital should be allocated to Question Marks or Stars in growth sectors, rather than attempt a high-cost pivot of a Dog.",
      keywords: ["dog", "portfolio", "bcg", "star", "cash cow", "sbu"]
    },
    network: {
      core80_20: [
        { concept: "Mission Statement Alignment", ratio: "Governs all SBU decisions" },
        { concept: "BCG Matrix Capital Allocation", ratio: "Prevents cash drain on weak SBUs" }
      ],
      dependencies: {
        prereqs: "Chapter 1 (Customer Value creation)",
        forward: "Directly determines the tactical Marketing Mix (4Ps) planned in Chapter 8-14.",
        backward: "Links back to Chapter 1 value capture dynamics."
      },
      graphSyntax: `
        graph TD
          Mission[Corporate Mission] --> SBU[Business Portfolio Plan]
          SBU --> BCG[BCG Matrix Allocations]
          BCG --> Growth[Ansoff Growth Strategy]
          Growth --> MarketingPlan[Integrated Marketing Plan]
      `
    },
    caseStudy: {
      harvardCase: {
        title: "Harvard Case Method: Amul's Strategic SBU Portfolio",
        context: "Amul manages a diverse portfolio of dairy products. Liquid milk acts as their massive Cash Cow, generating consistent cash flow with low market growth. Cheese and Butter act as Stars, requiring steady marketing investment to capture high-growth segments, while Organic Foods act as Question Marks.",
        lessons: "Diversified cooperatives must cross-subsidize high-growth Stars and speculative Question Marks using stable cash surpluses harvested from Cash Cows, while maintaining lean value chain partnerships.",
        alternatives: [
          { decision: "Invest cash cow profits into aggressive price cuts", result: "Temporary market share gain but starves high-growth product categories of R&D capital." },
          { decision: "Re-invest cash cow surpluses into high-growth processed foods SBUs", result: "Succeeded. Sustained Amul's market leadership for decades." }
        ],
        questions: [
          "Classify Amul's SBUs using the BCG matrix criteria.",
          "How does Amul maintain value delivery network alignment with dairy farmers?"
        ]
      },
      indianExample: { title: "ITC Limited diversification", details: "ITC leverages cash cows (tobacco SBU) to fund Stars and Question Marks in their FMCG and hospitality portfolios." },
      globalExample: { title: "Apple Inc. portfolio transition", details: "Apple uses iPhone cash surpluses to fund speculative R&D stars like Apple Vision Pro and Apple Silicon chips." }
    },
    pmPerspective: {
      problem: "Product teams build features that do not align with the company's core strategic mission, resulting in resource waste.",
      jtbd: "SBU Scoping: 'Establish a unified development cadence that connects engineering outputs to market-oriented goals.'",
      pmf: "PMF Portfolio Fit: Ensuring that a new feature SBU fits into the existing product ecosystem without cannibalizing Cash Cows.",
      metrics: "Monthly Active Users (MAU), Customer Retention Cost (CRC), and Net Promoter Score (NPS) to measure SBU performance.",
      rice: "RICE Matrix applied to product backlog items to select portfolio growth engines.",
      saasCase: "HubSpot's expansion from a simple inbound marketing tool (Single Product SBU) to an all-in-one CRM Suite, successfully executing an Ansoff Product Development strategy."
    }
  },

  // Chapter 7 Persona Overviews
  7: {
    socratic: {
      concept: "Market Segmentation, Targeting, and Positioning (STP)",
      problem: "An Indian SaaS startup is building a project management tool. They have designed it to be 'universal'—suitable for college students, freelancers, construction companies, and enterprise engineering teams. Their current customer acquisition cost (CAC) is unsustainably high because they are pitching to everyone. How would you apply STP logic to stabilize their CAC?",
      guide: "Stop mass marketing. Segment the market. Target a single high-value niche (e.g., engineering teams of 10-50 people) with a concentrated strategy. Position the tool precisely for their workflow (e.g. Jira alternative without the bloat).",
      keywords: ["segment", "target", "niche", "positioning", "cac", "stp"]
    },
    network: {
      core80_20: [
        { concept: "Target Market Selection", ratio: "Reduces marketing spend waste by 80%" },
        { concept: "Positioning Statement Point-of-Difference", ratio: "Drives conversion conversion metrics" }
      ],
      dependencies: {
        prereqs: "Chapter 5 (Consumer Behavior analysis)",
        forward: "Directly determines product features (Chapter 8) and price structure (Chapter 10-11).",
        backward: "Links back to Chapter 2 strategic STP planning layers."
      },
      graphSyntax: `
        graph TD
          Segmentation[Segment Markets] --> Targeting[Select Target Segment]
          Targeting --> Differentiation[Define Point-of-Difference]
          Differentiation --> Positioning[Craft Positioning Statement]
      `
    },
    caseStudy: {
      harvardCase: {
        title: "Harvard Case Method: Nykaa's Niche Cosmetics Segmentation (2012)",
        context: "Nykaa entered the highly competitive Indian cosmetics market by targeting a highly specific segment: female beauty shoppers looking for premium international brands with advisory content. They bypassed general marketplaces like Amazon by operating an inventory-led, content-rich retail model.",
        lessons: "By utilizing a Concentrated (Niche) targeting strategy, Nykaa avoided direct price wars with horizontal e-commerce giants, establishing strong brand loyalty and high customer lifetime value.",
        alternatives: [
          { decision: "Launch as a horizontal discount marketplace", result: "Would have been crushed by Flipkart and Amazon's massive capital reserves." },
          { decision: "Focus strictly on authentic brands and content curation", result: "Succeeded. Built high-trust segment positioning, enabling a highly successful IPO." }
        ],
        questions: [
          "Analyze Nykaa's segmentation variables (Geographic vs Psychographic).",
          "Explain the point-of-difference Nykaa established in their positioning statement."
        ]
      },
      indianExample: { title: "Paper Boat (Hector Beverages)", details: "Targeted urban Indian consumers with nostalgic ethnic drinks (Aam Panna, Jaljeera), establishing a highly premium psychographic niche." },
      globalExample: { title: "Starbucks Perceptual Mapping", details: "Positions itself as a premium 'third place' between home and work, charging high prices backed by experiential value." }
    },
    pmPerspective: {
      problem: "Product managers design features for the 'average user', leading to a bloated product that satisfies no one.",
      jtbd: "STP Persona definition: 'As a startup engineering lead, I need a frictionless way to track sprint progress so my team stays aligned.'",
      pmf: "Segment-specific PMF: Achieving PMF in a small target segment first, before expanding (e.g. Facebook starting only with Harvard students).",
      metrics: "LTV/CAC Ratio by Customer Cohort. High conversion rates within targeted segments.",
      rice: "Segment-driven prioritization to build features that target high-conversion user personas.",
      saasCase: "Superhuman Email: Targeted high-volume email power users with a premium shortcut-driven client ($30/mo), achieving phenomenal PMF metrics by ignoring the mainstream consumer market."
    }
  }
};

// Generate Persona Stub details dynamically for stubs
function generatePersonaStubData(id, chMeta, profile) {
  const chTitle = chMeta.title;
  if (profile === 'socratic') {
    return {
      concept: `Strategic Core of ${chTitle}`,
      problem: `A software firm specializing in ${chTitle} is failing to convert trial users. As their strategic advisor, how would you restructure their operations?`,
      guide: `Focus on customer pain points, optimize feature prioritization, and streamline user onboarding loops.`,
      keywords: ["value", "onboarding", "product", "features"]
    };
  } else if (profile === 'network') {
    return {
      core80_20: [
        { concept: `${chTitle} Orientation`, ratio: "Drives 60% of outcomes" },
        { concept: `Key Frameworks of Chapter ${id}`, ratio: "Governs core operations" }
      ],
      dependencies: {
        prereqs: `Chapter ${id-1 || 1} core concepts.`,
        forward: `Shapes tactical plans in Chapter ${id+1}.`,
        backward: `Links back to Chapter ${id-1 || 1} deliverables.`
      },
      graphSyntax: `
        graph TD
          ConceptA[Core Concept A] --> ConceptB[Core Concept B]
      `
    };
  } else if (profile === 'case-study') {
    return {
      harvardCase: {
        title: `Harvard Case Study: Strategic Analysis of ${chTitle}`,
        context: `Company X faced severe competition when launching their offering. They resolved this by executing a structured strategic analysis matching Chapter ${id} rules.`,
        lessons: "Sustained competitive positioning requires clear value alignments.",
        alternatives: [
          { decision: "Maintain legacy positioning", result: "Gradual decline in market share." },
          { decision: "Execute Chapter strategic revamp", result: "Unlocked high-yield growth segments." }
        ],
        questions: [
          `How does this case demonstrate the principles of ${chTitle}?`
        ]
      },
      indianExample: { title: "Amul Enterprise SBU", details: "Maintains optimal alignment across cooperative networks." },
      globalExample: { title: "Apple Inc. ecosystem", details: "Drives customer retention via ecosystem integration." }
    };
  } else {
    // PM
    return {
      problem: `Engineers building features for the 'average' user of ${chTitle}.`,
      jtbd: `Job-To-Be-Done: 'Get reliable workflow alignments with minimum friction.'`,
      pmf: "Achieve at least 45% 'very disappointed' responses on the PMF survey.",
      metrics: "Monthly Active Users (MAU), CAC payback period < 8 months.",
      rice: "Reach (20k), Impact (2), Confidence (70%), Effort (1 month) = High priority backlog item.",
      saasCase: "Dropbox's file-sharing onboarding loop: focusing on getting a user to share one file (the key value moment)."
    };
  }
}

// Load Learning Profile from LocalStorage
function loadLearningProfile() {
  const saved = localStorage.getItem('mktg_academy_profile') || 'general';
  activeLearningProfile = saved;
  
  // Set Radio checked
  const radio = document.querySelector(`input[name="learning-profile"][value="${saved}"]`);
  if (radio) {
    radio.checked = true;
  }
}

// Render Active Persona Focus Panel at top of Chapter View
function renderPersonaFocusContent(data) {
  const panel = document.getElementById('persona-focus-card');
  const heading = document.getElementById('persona-focus-heading');
  const content = document.getElementById('persona-focus-content');
  
  if (!panel || !heading || !content) return;
  if (!data) {
    panel.classList.add('hidden');
    return;
  }
  
  panel.classList.remove('hidden');
  
  // Fetch from DB or generate stub
  const dbData = (personaDatabase[data.id] && personaDatabase[data.id][activeLearningProfile]) ||
                 generatePersonaStubData(data.id, data, activeLearningProfile);
                 
  if (activeLearningProfile === 'general') {
    heading.innerText = `Academic Mentor Mode: Kotler Sequence & Curriculum`;
    content.innerHTML = `
      <div class="socratic-challenge-box" style="border-left: 4px solid var(--primary);">
        <p class="socratic-problem-text" style="font-size: 0.9rem; line-height: 1.6;">
          <i class="fa-solid fa-graduation-cap font-primary" style="font-size: 1.15rem; margin-right: 0.35rem;"></i>
          <strong>Hello, Scholar!</strong> I am your personal marketing mentor and university professor. 
          For Chapter <strong>${data.id}</strong> (<em>${data.title}</em>), we are following the exact chapter and lesson sequence from Kotler & Armstrong's <em>Principles of Marketing</em>.
        </p>
        <p class="socratic-problem-text" style="margin-top: 0.8rem; font-size: 0.85rem; color: var(--text-secondary);">
          Do not skip any modules. In the tabs below, we have comprehensively structured all <strong>30 core academic elements</strong> (Objectives, First Principles, simple definitions, intuition, case studies, visual dependency maps, and common student mistakes).
        </p>
        <div style="margin-top: 1rem; border-top: 1px dashed var(--border-card); padding-top: 0.8rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            <i class="fa-solid fa-circle-exclamation font-gold"></i> <strong>Mentorship Rule:</strong> Do not move to the next lesson or chapter until you have achieved professional-level mastery on this module's mastery test.
          </div>
          <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.4rem 0.8rem;" onclick="document.querySelector('.tab-btn[data-tab=\\'review-mastery\\']').click();">
            <i class="fa-solid fa-graduation-cap"></i> Jump to Mastery Test
          </button>
        </div>
      </div>
    `;
  } else if (activeLearningProfile === 'socratic') {
    heading.innerText = `Socratic Trainer: Concept & Problem Scoping`;
    content.innerHTML = `
      <div class="socratic-challenge-box">
        <div class="socratic-problem-title"><i class="fa-solid fa-circle-question"></i> CONCEPT: ${dbData.concept}</div>
        <p class="socratic-problem-text"><strong>Strategic Challenge:</strong> ${dbData.problem}</p>
      </div>
      <div class="socratic-input-area">
        <textarea id="socratic-proposal" placeholder="Type your strategic proposal here... Include keywords such as: ${dbData.keywords.join(', ')}"></textarea>
        <button class="btn btn-primary" id="socratic-submit-btn"><i class="fa-solid fa-paper-plane"></i> Submit Proposal</button>
        <div id="socratic-feedback" class="socratic-feedback-box hidden"></div>
      </div>
    `;
    
    // Bind click validation
    document.getElementById('socratic-submit-btn').onclick = () => {
      const input = document.getElementById('socratic-proposal').value.trim().toLowerCase();
      const feedback = document.getElementById('socratic-feedback');
      feedback.classList.remove('hidden');
      
      if (input.length < 20) {
        feedback.className = 'socratic-feedback-box socratic-feedback-error';
        feedback.innerHTML = `<strong>Incomplete Solution:</strong> Please provide a more detailed analysis (at least 2-3 sentences) to justify your strategic proposal.`;
        return;
      }
      
      const matched = dbData.keywords.filter(w => input.includes(w.toLowerCase()));
      const passed = matched.length >= 2;
      
      if (passed) {
        feedback.className = 'socratic-feedback-box socratic-feedback-success';
        feedback.innerHTML = `
          <strong><i class="fa-solid fa-circle-check font-mint"></i> Solution Accepted!</strong><br>
          Excellent strategic approach. You effectively utilized these core concepts: <strong>${matched.join(', ')}</strong>.<br><br>
          <strong>Model Guide:</strong> ${dbData.guide}
        `;
      } else {
        const missed = dbData.keywords.filter(w => !matched.includes(w.toLowerCase()));
        feedback.className = 'socratic-feedback-box socratic-feedback-error';
        feedback.innerHTML = `
          <strong><i class="fa-solid fa-circle-exclamation font-red"></i> Proposal Refused:</strong> Your solution lacks core strategic frameworks.<br><br>
          Please rewrite your proposal and integrate at least two of these concepts: <strong>${missed.join(', ')}</strong>.
        `;
      }
    };
    
  } else if (activeLearningProfile === 'network') {
    heading.innerText = `Network Architect: Prerequisites & Dependencies`;
    
    let conceptsHtml = dbData.core80_20.map(c => `
      <div class="network-concept-item">
        <div class="network-concept-name"><i class="fa-solid fa-star font-gold"></i> ${c.concept}</div>
        <div class="network-concept-ratio">${c.ratio}</div>
      </div>
    `).join('');
    
    content.innerHTML = `
      <div class="network-grid">
        <div class="network-8020-card">
          <h5><i class="fa-solid fa-scale-balanced font-primary"></i> 80/20 Core Concept Priority</h5>
          <p class="font-muted" style="font-size: 0.75rem; margin-bottom: 0.5rem;">The 20% of high-yield concepts that drive 80% of module comprehension:</p>
          ${conceptsHtml}
        </div>
        <div class="network-links-card">
          <h5><i class="fa-solid fa-arrows-spin font-secondary"></i> Prerequisite & Linkage Map</h5>
          <div class="network-link-row" style="margin-top: 0.5rem;">
            <div class="network-link-label">PREREQUISITE DEPENDENCY:</div>
            <div>${dbData.dependencies.prereqs}</div>
          </div>
          <div class="network-link-row">
            <div class="network-link-label">FORWARD CONNECTIONS:</div>
            <div>${dbData.dependencies.forward}</div>
          </div>
          <div class="network-link-row">
            <div class="network-link-label">BACKWARD CONNECTIONS:</div>
            <div>${dbData.dependencies.backward}</div>
          </div>
        </div>
      </div>
      <div class="visual-section card" style="margin-top: 1.5rem; padding: 1.25rem !important;">
        <h5><i class="fa-solid fa-circle-nodes"></i> Dynamic Dependencies Flow</h5>
        <div class="diagram-render-area" style="min-height: 150px !important; margin-top: 0.5rem;">
          <div class="mermaid" id="mermaid-persona-dependencies"></div>
        </div>
      </div>
    `;
    
    // Render the mini dependencies flowchart
    setTimeout(() => {
      const el = document.getElementById('mermaid-persona-dependencies');
      if (el) {
        el.removeAttribute('data-processed');
        el.innerHTML = cleanMermaidSyntax(dbData.graphSyntax);
        try {
          mermaid.run({ nodes: [el] });
        } catch (err) {
          console.error("Mermaid error: ", err);
        }
      }
    }, 100);
    
  } else if (activeLearningProfile === 'case-study') {
    heading.innerText = `Case Scholar: Case Method & Strategic Alternatives`;
    
    let tableRows = dbData.harvardCase.alternatives.map(a => `
      <tr>
        <td><strong>${a.decision}</strong></td>
        <td>${a.result}</td>
      </tr>
    `).join('');
    
    let questionsList = dbData.harvardCase.questions.map(q => `<li>${q}</li>`).join('');
    
    content.innerHTML = `
      <div class="case-scholar-box">
        <div class="case-study-narrative">
          <h5>${dbData.harvardCase.title}</h5>
          <p style="margin-top: 0.5rem; line-height: 1.5;">${dbData.harvardCase.context}</p>
          <p style="margin-top: 0.5rem;"><strong>Core Lessons Learned:</strong> ${dbData.harvardCase.lessons}</p>
        </div>
        
        <div class="two-col-grid" style="margin-top: 0.5rem;">
          <div>
            <h5>Alternative Strategic Decisions</h5>
            <table class="case-alternatives-table">
              <thead>
                <tr>
                  <th>Decision Option</th>
                  <th>Outcome Analysis</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
          <div style="background: var(--bg-sidebar); border: 1px solid var(--border-card); padding: 1rem; border-radius: 8px;">
            <h5>Harvard Discussion Questions</h5>
            <ul style="padding-left: 1.2rem; font-size: 0.75rem; line-height: 1.5; color: var(--text-secondary); margin-top: 0.5rem;">
              ${questionsList}
            </ul>
          </div>
        </div>
        
        <div class="two-col-grid" style="margin-top: 0.5rem;">
          <div style="background: var(--bg-sidebar); border: 1px solid var(--border-card); padding: 1rem; border-radius: 8px;">
            <h6 style="color: var(--primary); font-weight: 700;"><i class="fa-solid fa-store"></i> Indian Corporate Reference</h6>
            <p style="font-size: 0.75rem; line-height: 1.4; color: var(--text-secondary); margin-top: 0.25rem;"><strong>${dbData.indianExample.title}:</strong> ${dbData.indianExample.details}</p>
          </div>
          <div style="background: var(--bg-sidebar); border: 1px solid var(--border-card); padding: 1rem; border-radius: 8px;">
            <h6 style="color: var(--secondary); font-weight: 700;"><i class="fa-solid fa-globe"></i> Global Corporate Reference</h6>
            <p style="font-size: 0.75rem; line-height: 1.4; color: var(--text-secondary); margin-top: 0.25rem;"><strong>${dbData.globalExample.title}:</strong> ${dbData.globalExample.details}</p>
          </div>
        </div>
      </div>
    `;
    
  } else if (activeLearningProfile === 'product-manager') {
    heading.innerText = `Tech Product Manager: Value Props & PMF Alignment`;
    content.innerHTML = `
      <div class="pm-blueprint">
        <div class="pm-blueprint-card">
          <div class="pm-card-title"><i class="fa-solid fa-bugs"></i> Customer Problem (JTBD)</div>
          <p class="pm-card-desc"><strong>Core Scoping:</strong> ${dbData.problem}</p>
          <p class="pm-card-desc" style="margin-top: 0.5rem;"><strong>Job-To-Be-Done:</strong> ${dbData.jtbd}</p>
        </div>
        
        <div class="pm-blueprint-card">
          <div class="pm-card-title"><i class="fa-solid fa-chart-line"></i> PMF Indicators & Metrics</div>
          <p class="pm-card-desc"><strong>PMF Validation (Sean Ellis):</strong> ${dbData.pmf}</p>
          <p class="pm-card-desc" style="margin-top: 0.5rem;"><strong>Key SaaS Performance metrics:</strong> ${dbData.metrics}</p>
        </div>

        <div class="pm-blueprint-card">
          <div class="pm-card-title"><i class="fa-solid fa-filter"></i> Prioritization Matrix (RICE)</div>
          <p class="pm-card-desc">RICE prioritizes feature roadmaps by evaluating Reach, Impact, Confidence, and Effort.</p>
          <p class="pm-card-desc" style="margin-top: 0.5rem;"><strong>Sprint Scoping:</strong> ${dbData.rice}</p>
        </div>

        <div class="pm-blueprint-card">
          <div class="pm-card-title"><i class="fa-solid fa-laptop-code"></i> SaaS Technology Caselet</div>
          <p class="pm-card-desc">How software platforms connect marketing positioning directly with code pipelines:</p>
          <p class="pm-card-desc" style="margin-top: 0.5rem;">${dbData.saasCase}</p>
        </div>
      </div>
    `;
  }
}

// ============================================================
// DOWNLOAD NOTES FUNCTION
// Generates a beautifully formatted HTML notes document from
// the current chapter's full data and triggers a download.
// ============================================================
function downloadChapterNotes() {
  if (!currentChapterData) {
    alert('Please select a chapter first.');
    return;
  }

  const d = currentChapterData;
  const chapterNum = d.id || activeChapterId;

  // Build definitions HTML
  const defsHtml = (d.definitions || []).map(def => `
    <div class="notes-def-card">
      <div class="notes-def-term">${def.term}</div>
      <div class="notes-def-body">${def.definition}</div>
      <div class="notes-def-source">— ${def.source || 'Kotler & Armstrong'}</div>
    </div>`).join('');

  // Build learning objectives
  const objHtml = (d.learningObjectives || []).map((o, i) =>
    `<li><span class="lo-num">LO ${i+1}</span> ${o}</li>`).join('');

  // Build frameworks
  const fwHtml = (d.frameworks || []).map(f => `
    <div class="notes-framework">
      <h4>${f.name}</h4>
      <p>${f.explanation}</p>
      ${f.components ? `<ul>${f.components.map(c => `<li>${c}</li>`).join('')}</ul>` : ''}
    </div>`).join('');

  // Build examples
  const ex = d.examples || {};
  const exHtml = `
    ${ex.realWorld ? `<div class="notes-example"><strong>Real World:</strong> ${ex.realWorld}</div>` : ''}
    ${ex.industry ? `<div class="notes-example"><strong>Industry:</strong> ${ex.industry}</div>` : ''}
    ${ex.indianCase ? `<div class="notes-case india"><span>🇮🇳 Indian Case: ${ex.indianCase.title}</span><p>${ex.indianCase.details}</p></div>` : ''}
    ${ex.globalCase ? `<div class="notes-case global"><span>🌍 Global Case: ${ex.globalCase.title}</span><p>${ex.globalCase.details}</p></div>` : ''}`;

  // Build interview questions
  const iqHtml = ((d.assessments || {}).interviewQuestions || []).map((q, i) => `
    <div class="notes-q">
      <div class="notes-q-label">Q${i+1}</div>
      <div><strong>${q.question}</strong><p class="notes-ans">${q.answer}</p></div>
    </div>`).join('');

  // Build MCQs
  const mcqHtml = (d.masteryAssessment || []).map((q, i) => `
    <div class="notes-mcq">
      <p><strong>MCQ ${i+1}:</strong> ${q.question}</p>
      <ul>${q.options.map((o, oi) => `<li class="${oi === q.correct ? 'correct-opt' : ''}">${oi === q.correct ? '✓ ' : ''}${o}</li>`).join('')}</ul>
      <p class="notes-exp"><em>Explanation: ${q.explanation}</em></p>
    </div>`).join('');

  // Build common mistakes
  const mistakesHtml = (d.commonMistakes || []).map(m => `<li>⚠️ ${m}</li>`).join('');

  // Build practical applications
  const practicalHtml = (d.practicalApplications || []).map(p => `<li>✅ ${p}</li>`).join('');

  // Build crosslinks
  const crossHtml = (d.crossLinks || []).map(c => `<li><strong>${c.chapter}:</strong> ${c.connection}</li>`).join('');

  // Build memory techniques
  const memHtml = (d.memoryTechniques || []).map(m => `
    <div class="notes-mnemonic">
      <span class="mnem-badge">${m.type}</span>
      <strong>${m.name}</strong>: ${m.details}
    </div>`).join('');

  // Build comparison table
  const compTable = d.comparisonTables || {};
  const tableHtml = compTable.headers ? `
    <table class="notes-table">
      <thead><tr>${compTable.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${(compTable.rows || []).map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Chapter ${chapterNum}: ${d.title} — Study Notes</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f8f7f4; color: #1a1a2e; padding: 2rem; line-height: 1.7; font-size: 14px; }
  .notes-doc { max-width: 860px; margin: 0 auto; background: white; padding: 3rem; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .notes-header { border-bottom: 3px solid #cca04c; padding-bottom: 1.5rem; margin-bottom: 2rem; }
  .notes-source { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
  .notes-chapter-num { font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 700; color: #cca04c; text-transform: uppercase; letter-spacing: 2px; }
  h1 { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 800; color: #0f1924; line-height: 1.2; margin: 0.5rem 0 1rem; }
  h2 { font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 700; color: #0f1924; border-left: 4px solid #cca04c; padding-left: 0.75rem; margin: 2rem 0 1rem; }
  h3 { font-family: 'Outfit', sans-serif; font-size: 0.95rem; font-weight: 700; color: #333; margin: 1.25rem 0 0.5rem; }
  h4 { font-size: 0.9rem; font-weight: 700; color: #444; margin-bottom: 0.35rem; }
  p { margin-bottom: 0.6rem; color: #333; }
  ul { padding-left: 1.2rem; margin-bottom: 0.75rem; }
  li { margin-bottom: 0.35rem; }
  .section { margin-bottom: 2.5rem; }
  .section-divider { border: none; border-top: 1px solid #eee; margin: 2rem 0; }
  /* Objectives */
  .notes-obj-list { list-style: none; padding: 0; }
  .notes-obj-list li { display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.6rem 0.75rem; background: #f8f6ff; border-radius: 6px; margin-bottom: 0.5rem; }
  .lo-num { background: #6c47ff; color: white; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; flex-shrink: 0; }
  /* Definitions */
  .notes-def-card { background: #fffbf0; border: 1px solid #f0d89a; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
  .notes-def-term { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1rem; color: #7a5100; margin-bottom: 0.3rem; }
  .notes-def-body { color: #333; }
  .notes-def-source { font-size: 0.75rem; color: #aaa; margin-top: 0.3rem; }
  /* Frameworks */
  .notes-framework { background: #f0f8ff; border-left: 3px solid #4e9af1; padding: 1rem; border-radius: 0 8px 8px 0; margin-bottom: 0.75rem; }
  /* Examples */
  .notes-example { background: #f4f4f4; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 0.5rem; }
  .notes-case { padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; }
  .notes-case.india { background: #fff8f0; border: 1px solid #f0c88a; }
  .notes-case.global { background: #f0f8ff; border: 1px solid #a0c8f0; }
  .notes-case span { display: block; font-weight: 700; margin-bottom: 0.3rem; }
  /* Questions */
  .notes-q { display: flex; gap: 0.75rem; background: #f9f9ff; border-radius: 8px; padding: 0.9rem; margin-bottom: 0.6rem; }
  .notes-q-label { background: #1a1a2e; color: #cca04c; font-weight: 700; font-size: 0.78rem; padding: 0.25rem 0.5rem; border-radius: 4px; height: fit-content; flex-shrink: 0; }
  .notes-ans { color: #555; font-size: 0.88rem; margin-top: 0.3rem; }
  /* MCQ */
  .notes-mcq { background: #f8f8f8; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
  .notes-mcq ul { list-style: none; padding-left: 0; }
  .notes-mcq li { padding: 0.3rem 0.5rem; border-radius: 4px; }
  .correct-opt { background: #e8f5e9; color: #2e7d32; font-weight: 600; }
  .notes-exp { background: #fffde7; padding: 0.5rem 0.75rem; border-radius: 4px; margin-top: 0.5rem; font-size: 0.85rem; }
  /* Mnemonic */
  .notes-mnemonic { display: flex; gap: 0.5rem; align-items: flex-start; background: #f5f0ff; padding: 0.7rem 1rem; border-radius: 6px; margin-bottom: 0.5rem; }
  .mnem-badge { background: #7c3aed; color: white; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: 4px; flex-shrink: 0; }
  /* Table */
  .notes-table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
  .notes-table th { background: #1a1a2e; color: #cca04c; padding: 0.6rem 0.8rem; text-align: left; font-size: 0.85rem; }
  .notes-table td { padding: 0.5rem 0.8rem; border-bottom: 1px solid #eee; font-size: 0.87rem; }
  .notes-table tr:nth-child(even) td { background: #f9f9f9; }
  /* Footer */
  .notes-footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #eee; text-align: center; font-size: 0.75rem; color: #aaa; }
  @media print {
    body { background: white; padding: 0; }
    .notes-doc { box-shadow: none; padding: 1.5rem; }
  }
</style>
</head>
<body>
<div class="notes-doc">

  <div class="notes-header">
    <div class="notes-source">📚 Kotler & Armstrong — Principles of Marketing, 17th Global Edition</div>
    <div class="notes-chapter-num">Chapter ${chapterNum}</div>
    <h1>${d.title}</h1>
    <p style="color:#666; font-size:0.85rem;">Complete Study Notes · Marketing Mastery Academy · Generated ${new Date().toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'})}</p>
  </div>

  <div class="section">
    <h2>📋 Learning Objectives</h2>
    <ul class="notes-obj-list">${objHtml}</ul>
  </div>

  <hr class="section-divider">

  <div class="section">
    <h2>🔑 Key Definitions</h2>
    ${defsHtml || '<p>See textbook for key term definitions.</p>'}
  </div>

  <hr class="section-divider">

  <div class="section">
    <h2>💡 Intuition & Analogy</h2>
    ${d.intuition ? `
      <div class="notes-example"><strong>Analogy:</strong> ${d.intuition.analogy}</div>
      <div class="notes-example"><strong>Story:</strong> ${d.intuition.story}</div>` : ''}
  </div>

  <hr class="section-divider">

  <div class="section">
    <h2>🏗️ Frameworks & Models</h2>
    ${fwHtml || '<p>See textbook chapter for detailed framework breakdowns.</p>'}
  </div>

  <hr class="section-divider">

  <div class="section">
    <h2>📊 Comparison Table</h2>
    ${tableHtml || '<p>Refer to the Visual Mapping tab for comparison data.</p>'}
  </div>

  <hr class="section-divider">

  <div class="section">
    <h2>🌍 Real-World & Case Examples</h2>
    ${exHtml}
  </div>

  <hr class="section-divider">

  <div class="section">
    <h2>🛠️ Practical Applications</h2>
    <ul>${practicalHtml}</ul>
  </div>

  <hr class="section-divider">

  <div class="section">
    <h2>⚠️ Common Mistakes</h2>
    <ul>${mistakesHtml}</ul>
  </div>

  <hr class="section-divider">

  <div class="section">
    <h2>🧠 Memory Techniques</h2>
    ${memHtml || '<p>Use the S-A-T-E mnemonic: Situation → Align → Tactics → Evaluate.</p>'}
  </div>

  <hr class="section-divider">

  <div class="section">
    <h2>🔗 Cross-Links to Other Chapters</h2>
    <ul>${crossHtml}</ul>
  </div>

  <hr class="section-divider">

  <div class="section">
    <h2>🎤 Interview Questions & Model Answers</h2>
    ${iqHtml || '<p>Prepare using the key concepts and definitions from this chapter.</p>'}
  </div>

  <hr class="section-divider">

  <div class="section">
    <h2>📝 MCQ Practice</h2>
    ${mcqHtml || '<p>Refer to the Mastery Assessment tab for MCQs.</p>'}
  </div>

  <hr class="section-divider">

  <div class="section">
    <h2>⚡ One-Page Revision Summary</h2>
    <div style="background:#f8f8f8; padding:1.25rem; border-radius:8px; white-space:pre-wrap; font-size:0.9rem;">${(d.onePageRevision || '').replace(/##/g,'').replace(/\*\*/g,'').replace(/\*/g,'')}</div>
  </div>

  <div class="notes-footer">
    Marketing Mastery Academy · Based on Kotler & Armstrong Principles of Marketing · For personal educational use only
  </div>

</div>
</body>
</html>`;

  // Trigger download
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Chapter_${chapterNum}_${d.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)}_Notes.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
