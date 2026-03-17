/* ═══════════════════════════════════════════════
   MOTOMEDIC — script.js v2 (Enhanced)
   New: Vehicle Selection, GPS Location, Dark Mode,
        i18n, SOS Modal, Chat, Dashboard, Map View,
        Emergency Panel, Request Confirm Modal
═══════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════
   DATA
══════════════════════════════ */
const PROBLEMS = [
  { id: 'flat-tire', icon: '🛞', name: 'Flat Tire',     tag: 'tires'   },
  { id: 'engine',    icon: '🔧', name: 'Engine Issue',  tag: 'engine'  },
  { id: 'battery',   icon: '🔋', name: 'Battery Dead',  tag: 'battery' },
  { id: 'fuel',      icon: '⛽', name: 'Fuel Empty',    tag: 'fuel'    },
  { id: 'brake',     icon: '🛑', name: 'Brake Problem', tag: 'brakes'  },
  { id: 'overheating', icon: '🌡️', name: 'Overheating', tag: 'engine'  },
];

const AI_RESPONSES = {
  'flat-tire': {
    summary: '🛞 <strong>Flat Tire Detected.</strong> AI suggests a roadside tire change.',
    steps: ['Pull to a safe, flat surface away from traffic.', 'Apply parking brake and turn on hazard lights.', 'Locate your spare tire and jack in the trunk.', 'Loosen lug nuts before lifting with the jack.', 'Replace tire and tighten lug nuts in a star pattern.'],
    severity: 'medium', callMechanic: true,
  },
  'engine': {
    summary: '🔧 <strong>Engine Issue Detected.</strong> AI suggests checking for common fault codes.',
    steps: ['Turn off engine immediately if warning light is red.', 'Check coolant level and oil dipstick for low fluids.', 'Look for smoke, burning smell, or unusual sounds.', 'Do NOT restart if coolant/oil is critically low.', 'Call a certified mechanic for proper diagnosis.'],
    severity: 'high', callMechanic: true,
  },
  'battery': {
    summary: '🔋 <strong>Battery Failure.</strong> AI suggests jump-start or replacement.',
    steps: ['Try jump-starting using jumper cables and a donor vehicle.', 'Connect red cable to dead (+) terminal, then donor (+).', 'Connect black cable to donor (−), then grounded metal.', 'Start the donor vehicle, wait 2 mins, start your car.', 'If no success, battery likely needs replacement.'],
    severity: 'low', callMechanic: false,
  },
  'fuel': {
    summary: '⛽ <strong>Fuel Empty.</strong> AI suggests immediate refuel — engine damage possible.',
    steps: ['Coast safely to road shoulder and activate hazards.', 'Do not attempt to restart — running dry damages fuel pump.', 'Order emergency fuel delivery from nearest garage.', 'Add at least 5–10 litres before restarting.', 'Fill tank fully to prevent fuel pump overheating.'],
    severity: 'low', callMechanic: false,
  },
  'brake': {
    summary: '🛑 <strong>CRITICAL: Brake Issue.</strong> AI flags this as a safety emergency.',
    steps: ['⚠ STOP DRIVING IMMEDIATELY — brakes are life-safety.', 'Pump brakes gently if they feel spongy or soft.', 'Use engine braking (downshift / release accelerator).', 'Steer to a safe area and apply handbrake slowly.', 'Call a mechanic NOW — do not self-repair brakes.'],
    severity: 'critical', callMechanic: true,
  },
  'overheating': {
    summary: '🌡️ <strong>Engine Overheating.</strong> AI suggests immediate action to prevent damage.',
    steps: ['Turn off AC immediately to reduce engine load.', 'If temp gauge is redlined, pull over and turn off engine.', 'Do NOT open the radiator cap while engine is hot.', 'Wait 30 minutes before checking coolant level.', 'Call mechanic — overheating can cause serious damage.'],
    severity: 'high', callMechanic: true,
  },
};

const MECHANICS = [
  { id: 1, initials: 'RS', name: "Ravi's Auto Works",    type: 'Multi-brand Workshop',       distance: '0.8 km', rating: 4.9, reviews: 312, available: true,  eta: '6 min',  tags: ['Engine', 'Battery', 'Brakes'], phone: '+91 98765 43210', mapX: '42%', mapY: '28%' },
  { id: 2, initials: 'PK', name: "Priya's Quick Fix",    type: 'Tyre & Battery Specialist',   distance: '1.2 km', rating: 4.7, reviews: 189, available: true,  eta: '9 min',  tags: ['Flat Tyre', 'Battery', 'Fuel'], phone: '+91 98001 23456', mapX: '68%', mapY: '22%' },
  { id: 3, initials: 'AM', name: 'AutoMech Express',     type: 'Emergency Roadside Service',  distance: '2.1 km', rating: 4.8, reviews: 240, available: false, eta: '15 min', tags: ['All Types', 'Towing', 'Engine'], phone: '+91 77887 99001', mapX: '75%', mapY: '58%' },
  { id: 4, initials: 'KS', name: "Kumar's Service Hub",  type: 'Certified Car Mechanic',      distance: '3.0 km', rating: 4.6, reviews: 98,  available: true,  eta: '18 min', tags: ['Brakes', 'Engine', 'Oil Change'], phone: '+91 91234 56789', mapX: '22%', mapY: '62%' },
  { id: 5, initials: 'DM', name: 'Dr. Moto Garage',      type: 'Bike & Car Specialist',       distance: '4.5 km', rating: 4.5, reviews: 162, available: true,  eta: '22 min', tags: ['Bikes', 'Fuel', 'Battery'], phone: '+91 80001 77654', mapX: '30%', mapY: '78%' },
  { id: 6, initials: 'ZA', name: 'Zoom Auto Repair',     type: '24/7 Emergency Mechanic',     distance: '5.3 km', rating: 4.3, reviews: 74,  available: false, eta: '30 min', tags: ['Towing', 'Engine', 'Brakes'], phone: '+91 70000 11223', mapX: '78%', mapY: '80%' },
];

const MECHANIC_NAMES = ['Ravi Kumar', 'Priya Mehta', 'Suresh Verma', 'Deepak Singh', 'Anjali Shah'];

/* ── VEHICLE DATA ── */
const VEHICLE_DATA = {
  car: {
    Honda:   ['City', 'Amaze', 'WR-V', 'Jazz', 'Civic', 'CR-V'],
    Hyundai: ['i20', 'Creta', 'Venue', 'Verna', 'Tucson', 'Alcazar'],
    Tata:    ['Nexon', 'Punch', 'Harrier', 'Safari', 'Altroz', 'Tiago'],
    Maruti:  ['Swift', 'Baleno', 'Dzire', 'Ertiga', 'Brezza', 'Wagon R'],
    Toyota:  ['Fortuner', 'Innova', 'Camry', 'Glanza', 'Hyryder'],
    Mahindra:['Thar', 'XUV700', 'Scorpio', 'Bolero', 'BE6'],
    Kia:     ['Seltos', 'Sonet', 'Carnival', 'EV6'],
    MG:      ['Hector', 'Astor', 'Gloster', 'Comet'],
  },
  bike: {
    Honda:   ['Activa', 'Shine', 'Unicorn', 'Hornet', 'CB350'],
    Yamaha:  ['R15', 'MT-15', 'FZ-S', 'Fascino', 'Aerox'],
    Hero:    ['Splendor', 'Passion', 'Glamour', 'XPulse', 'Destini'],
    Bajaj:   ['Pulsar', 'Avenger', 'Dominar', 'Platina', 'CT100'],
    Royal_Enfield: ['Classic 350', 'Meteor 350', 'Bullet', 'Himalayan', 'Thunderbird'],
    KTM:     ['Duke 200', 'Duke 390', 'RC 200', 'Adventure 390'],
    Suzuki:  ['Gixxer', 'Hayabusa', 'V-Strom', 'Intruder'],
  },
  truck: {
    Tata:    ['407', '909', 'Prima', 'LPT', 'Signa'],
    Ashok_Leyland: ['Dost', 'Boss', 'Captain', 'U-Truck'],
    Mahindra:['Bolero Pikup', 'Jeeto', 'Alfa', 'Supro'],
    Eicher:  ['Pro 2000', 'Pro 3000', 'Pro 6000'],
  },
};

/* ── SERVICE HISTORY (dummy) ── */
const SERVICE_HISTORY = [
  { icon: '🔋', title: 'Battery Replacement', garage: "Ravi's Auto Works", date: '12 Jan 2025', status: 'done' },
  { icon: '🛞', title: 'Tyre Puncture Fix',   garage: "Priya's Quick Fix",  date: '28 Feb 2025', status: 'done' },
  { icon: '🔧', title: 'Engine Servicing',    garage: 'AutoMech Express',   date: '5 Mar 2025',  status: 'pending' },
];

/* ── I18N STRINGS ── */
const TRANSLATIONS = {
  en: {
    nav_home: 'Home', nav_vehicle: 'My Vehicle', nav_problems: 'Diagnose',
    nav_mechanics: 'Garages', nav_dashboard: 'Dashboard', nav_contact: 'Contact',
    btn_login: 'Login', btn_gethelp: 'Get Help',
    hero_badge: 'AI-Powered Emergency System', hero_sub: 'Emergency Roadside Help',
    hero_desc: 'AI-powered assistance for instant vehicle repair — smart diagnostics, nearby garages, and live video in seconds.',
    sos_button: 'SOS Emergency', btn_gethelp_now: 'Get Help Now', btn_nearby: 'Nearby Garages',
    stat_mechanics: 'Mechanics Online', stat_response: 'Response Rate', stat_avg: 'Avg Response',
    vehicle_tag: 'MY VEHICLE', vehicle_title: 'Select Your Vehicle', vehicle_sub: 'Save your vehicle details for faster emergency response.',
    type_car: 'Car', type_bike: 'Bike', type_truck: 'Truck',
    vehicle_brand: 'Brand', vehicle_model: 'Model', vehicle_year: 'Year', vehicle_reg: 'Registration No.',
    save_vehicle: 'Save Vehicle', clear_vehicle: 'Clear',
    diagnose_tag: 'DIAGNOSE', diagnose_title: "What's Wrong With Your Vehicle?",
    diagnose_sub: 'Select your problem and let our AI guide you to the fastest solution.',
    ai_title: 'AI MotoMedic Diagnosis',
    nearby_tag: 'NEARBY', nearby_title: 'Garages Near You', nearby_sub: 'Real-time availability of verified garages in your area.',
    loc_default: 'Location not detected', detect_location: 'Detect My Location',
    filter_all: 'All', filter_available: 'Available Now', filter_top: 'Top Rated',
    ep_title: 'Need Immediate Help?', ep_desc: 'Choose the fastest way to get assistance right now. Our response team is standing by 24/7.',
    ep_mechanic: 'Request Mechanic', ep_mechanic_sub: 'Arrives in ~6 min',
    ep_video: 'Start Video Call', ep_video_sub: 'Connect instantly',
    ep_chat: 'Chat Support', ep_chat_sub: 'Text with mechanic',
    video_title: 'Talk to a Mechanic\nRight Now — Live',
    video_desc: 'Not sure what\'s wrong? Connect with a certified mechanic via video call for instant diagnosis.',
    start_video: 'Start Video Help', video_tap: 'Tap to start video consultation',
    vf1: 'Free first consultation', vf2: 'Certified mechanics only', vf3: '24/7 availability',
    dash_tag: 'DASHBOARD', dash_title: 'Your Account', dash_sub: 'Profile, service history and saved garages.',
    dash_profile: 'Profile', dash_history: 'Service History', dash_saved: 'Saved Garages', dash_stats: 'Your Stats',
    stat_services: 'Services Used', stat_saved_garages: 'Saved Garages', stat_video_calls: 'Video Calls', stat_avg_rating: 'Avg. Rating',
    contact_tag: 'CONTACT', contact_title: 'Need More Help?', contact_sub: 'Reach out to our 24/7 emergency support team.',
    emergency_helpline: 'Emergency Helpline', helpline_hours: 'Available 24 hours, 7 days a week',
    coverage: 'Coverage', coverage_detail: '50+ cities across India',
    form_send: 'Send a Request', form_name: 'Full Name', form_phone: 'Phone Number', form_problem: 'Problem Description', form_submit: 'Send Request →',
  },
  hi: {
    nav_home: 'होम', nav_vehicle: 'मेरी गाड़ी', nav_problems: 'समस्या',
    nav_mechanics: 'गैराज', nav_dashboard: 'डैशबोर्ड', nav_contact: 'संपर्क',
    btn_login: 'लॉगिन', btn_gethelp: 'मदद लें',
    hero_badge: 'AI-संचालित आपातकालीन प्रणाली', hero_sub: 'आपातकालीन रोडसाइड सहायता',
    hero_desc: 'वाहन मरम्मत के लिए AI-संचालित सहायता — स्मार्ट निदान, नजदीकी गैराज, और लाइव वीडियो।',
    sos_button: 'SOS आपातकाल', btn_gethelp_now: 'अभी मदद लें', btn_nearby: 'नजदीकी गैराज',
    stat_mechanics: 'मैकेनिक ऑनलाइन', stat_response: 'प्रतिक्रिया दर', stat_avg: 'औसत प्रतिक्रिया',
    vehicle_tag: 'मेरी गाड़ी', vehicle_title: 'अपना वाहन चुनें', vehicle_sub: 'तेज़ सहायता के लिए अपना वाहन विवरण सहेजें।',
    type_car: 'कार', type_bike: 'बाइक', type_truck: 'ट्रक',
    vehicle_brand: 'ब्रांड', vehicle_model: 'मॉडल', vehicle_year: 'वर्ष', vehicle_reg: 'पंजीकरण नं.',
    save_vehicle: 'वाहन सहेजें', clear_vehicle: 'साफ करें',
    diagnose_tag: 'समस्या पहचानें', diagnose_title: 'आपके वाहन में क्या खराबी है?',
    diagnose_sub: 'अपनी समस्या चुनें और AI को सबसे तेज़ समाधान खोजने दें।',
    ai_title: 'AI MotoMedic निदान',
    nearby_tag: 'नजदीक', nearby_title: 'आपके पास गैराज', nearby_sub: 'आपके क्षेत्र में सत्यापित गैराज की रीयल-टाइम उपलब्धता।',
    loc_default: 'स्थान नहीं मिला', detect_location: 'मेरा स्थान पहचानें',
    filter_all: 'सभी', filter_available: 'अभी उपलब्ध', filter_top: 'शीर्ष रेटेड',
    ep_title: 'तुरंत मदद चाहिए?', ep_desc: 'अभी सहायता पाने का सबसे तेज़ तरीका चुनें। हमारी टीम 24/7 तैयार है।',
    ep_mechanic: 'मैकेनिक बुलाएं', ep_mechanic_sub: '~6 मिनट में आएगा',
    ep_video: 'वीडियो कॉल शुरू करें', ep_video_sub: 'तुरंत कनेक्ट करें',
    ep_chat: 'चैट सहायता', ep_chat_sub: 'मैकेनिक से टेक्स्ट करें',
    video_title: 'अभी मैकेनिक से बात करें — Live',
    video_desc: 'समझ नहीं आ रहा? वीडियो कॉल से तुरंत निदान पाएं।',
    start_video: 'वीडियो सहायता शुरू करें', video_tap: 'वीडियो परामर्श शुरू करने के लिए टैप करें',
    vf1: 'पहली परामर्श मुफ्त', vf2: 'केवल प्रमाणित मैकेनिक', vf3: '24/7 उपलब्धता',
    dash_tag: 'डैशबोर्ड', dash_title: 'आपका खाता', dash_sub: 'प्रोफाइल, सेवा इतिहास और सहेजे गए गैराज।',
    dash_profile: 'प्रोफाइल', dash_history: 'सेवा इतिहास', dash_saved: 'सहेजे गैराज', dash_stats: 'आपके आँकड़े',
    stat_services: 'उपयोग की सेवाएं', stat_saved_garages: 'सहेजे गैराज', stat_video_calls: 'वीडियो कॉल', stat_avg_rating: 'औसत रेटिंग',
    contact_tag: 'संपर्क', contact_title: 'और मदद चाहिए?', contact_sub: 'हमारी 24/7 आपातकालीन टीम से संपर्क करें।',
    emergency_helpline: 'आपातकालीन हेल्पलाइन', helpline_hours: '24 घंटे, सप्ताह के 7 दिन',
    coverage: 'कवरेज', coverage_detail: 'भारत के 50+ शहरों में',
    form_send: 'अनुरोध भेजें', form_name: 'पूरा नाम', form_phone: 'फोन नंबर', form_problem: 'समस्या विवरण', form_submit: 'अनुरोध भेजें →',
  },
};

/* ══════════════════════════════
   STATE
══════════════════════════════ */
const state = {
  selectedProblem: null,
  videoConnected: false,
  activeFilter: 'all',
  currentLang: 'en',
  currentTheme: 'dark',
  savedVehicle: null,
  savedGarages: new Set(),
  sosCountdownTimer: null,
  selectedVehicleType: 'car',
};

/* ══════════════════════════════
   UTILS
══════════════════════════════ */
const qs  = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

function showToast(message, type = 'success', duration = 3500) {
  const toast    = qs('#toast');
  const toastTxt = qs('#toastText');
  const toastIco = qs('#toastIcon');
  const icons    = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toastTxt.textContent = message;
  toastIco.textContent = icons[type] || '✅';
  toast.className = `toast toast-${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

function openModal(id) {
  const m = qs(`#${id}`);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = qs(`#${id}`);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}

/* ══════════════════════════════
   LOADING SCREEN
══════════════════════════════ */
function initLoadingScreen() {
  const overlay = qs('#loadingOverlay');
  const bar = document.createElement('div');
  bar.className = 'loading-bar';
  bar.innerHTML = '<div class="loading-bar-fill"></div>';
  overlay.querySelector('.loading-content').appendChild(bar);
  setTimeout(() => { overlay.classList.add('fade'); setTimeout(() => overlay.remove(), 500); }, 1800);
}

/* ══════════════════════════════
   DARK MODE TOGGLE (NEW)
══════════════════════════════ */
function initThemeToggle() {
  const btn = qs('#themeToggle');
  const icon = qs('#themeIcon');
  // Load saved preference
  const saved = localStorage.getItem('mm-theme') || 'dark';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const next = state.currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('mm-theme', next);
    showToast(`${next === 'dark' ? '🌙 Dark' : '☀️ Light'} mode activated`, 'info', 2000);
  });
}
function applyTheme(theme) {
  state.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  qs('#themeIcon').textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ══════════════════════════════
   I18N / LANGUAGE TOGGLE (NEW)
══════════════════════════════ */
function initLangToggle() {
  qs('#langToggle').addEventListener('click', () => {
    const next = state.currentLang === 'en' ? 'hi' : 'en';
    applyLang(next);
  });
}
function applyLang(lang) {
  state.currentLang = lang;
  const strings = TRANSLATIONS[lang];
  qs('#langFlag').textContent = lang === 'hi' ? '🇬🇧' : '🇮🇳';
  qs('#langLabel').textContent = lang === 'hi' ? 'EN' : 'हिं';
  qsa('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (strings[key]) el.textContent = strings[key];
  });
  showToast(lang === 'hi' ? '🇮🇳 हिंदी भाषा चुनी गई' : '🇬🇧 English selected', 'info', 2000);
}

/* ══════════════════════════════
   NAVBAR
══════════════════════════════ */
function initNavbar() {
  const navbar    = qs('#navbar');
  const hamburger = qs('#hamburger');
  const navLinks  = qs('#navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    const sections = ['home', 'vehicle', 'problems', 'mechanics', 'dashboard', 'contact'];
    let current = 'home';
    sections.forEach(id => {
      const el = qs(`#${id}`);
      if (el && window.scrollY >= el.offsetTop - 120) current = id;
    });
    qsa('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = qsa('span', hamburger);
    const isOpen = navLinks.classList.contains('open');
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    spans[1].style.opacity   = isOpen ? '0' : '';
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });

  qsa('.nav-link', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      qsa('span', hamburger).forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
}

/* ══════════════════════════════
   VEHICLE SELECTION (NEW)
══════════════════════════════ */
function initVehicleSection() {
  // Type toggle
  qsa('.vtype-btn', qs('#vehicleTypeToggle')).forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.vtype-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedVehicleType = btn.dataset.type;
      populateBrands(btn.dataset.type);
      qs('#vehicleModel').innerHTML = '<option value="">-- Select Model --</option>';
    });
  });

  // Brand change → populate models
  qs('#vehicleBrand').addEventListener('change', () => {
    const brand = qs('#vehicleBrand').value;
    populateModels(state.selectedVehicleType, brand);
  });

  // Populate years
  const yearSel = qs('#vehicleYear');
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 2000; y--) {
    yearSel.innerHTML += `<option value="${y}">${y}</option>`;
  }

  // Initial brand population
  populateBrands('car');

  // Save button
  qs('#saveVehicleBtn').addEventListener('click', saveVehicle);
  qs('#clearVehicleBtn').addEventListener('click', clearVehicle);
  qs('#editVehicleBtn').addEventListener('click', () => {
    qs('#savedVehicle').style.display = 'none';
    qs('.vehicle-form-grid').style.display = '';
    qs('.vehicle-form-actions').style.display = '';
    qs('.vehicle-type-toggle').style.display = '';
    state.savedVehicle = null;
  });

  // Load from localStorage
  const saved = localStorage.getItem('mm-vehicle');
  if (saved) {
    try { restoreSavedVehicle(JSON.parse(saved)); } catch(e) {}
  }
}

function populateBrands(type) {
  const brands = Object.keys(VEHICLE_DATA[type] || {});
  const sel = qs('#vehicleBrand');
  sel.innerHTML = '<option value="">-- Select Brand --</option>';
  brands.forEach(b => sel.innerHTML += `<option value="${b}">${b.replace('_', ' ')}</option>`);
}

function populateModels(type, brand) {
  const models = (VEHICLE_DATA[type] || {})[brand] || [];
  const sel = qs('#vehicleModel');
  sel.innerHTML = '<option value="">-- Select Model --</option>';
  models.forEach(m => sel.innerHTML += `<option value="${m}">${m}</option>`);
}

function saveVehicle() {
  const type  = state.selectedVehicleType;
  const brand = qs('#vehicleBrand').value;
  const model = qs('#vehicleModel').value;
  const year  = qs('#vehicleYear').value;
  const reg   = qs('#vehicleReg').value.trim();
  if (!brand || !model) { showToast('⚠ Please select brand and model', 'warning'); return; }

  const vehicle = { type, brand, model, year, reg };
  state.savedVehicle = vehicle;
  localStorage.setItem('mm-vehicle', JSON.stringify(vehicle));
  restoreSavedVehicle(vehicle);
  showToast(`🚗 ${brand} ${model} saved successfully!`, 'success');
}

function restoreSavedVehicle(v) {
  const icons = { car: '🚗', bike: '🏍️', truck: '🚛' };
  qs('#svIcon').textContent  = icons[v.type] || '🚗';
  qs('#svName').textContent  = `${v.brand} ${v.model} ${v.year || ''}`.trim();
  qs('#svReg').textContent   = v.reg || 'No reg. number';
  qs('#savedVehicle').style.display = 'flex';
  qs('.vehicle-form-grid').style.display  = 'none';
  qs('.vehicle-form-actions').style.display = 'none';
  qs('.vehicle-type-toggle').style.display  = 'none';
  state.savedVehicle = v;
  // Update dashboard profile
  qs('#profileVehicleText').textContent = `${v.brand} ${v.model}`;
  qs('#profileVehicleSummary').querySelector('.pv-icon').textContent = icons[v.type] || '🚗';
}

function clearVehicle() {
  qs('#vehicleBrand').value  = '';
  qs('#vehicleModel').value  = '';
  qs('#vehicleYear').value   = '';
  qs('#vehicleReg').value    = '';
  state.savedVehicle = null;
  localStorage.removeItem('mm-vehicle');
  showToast('Vehicle details cleared', 'info', 2000);
}

/* ══════════════════════════════
   PROBLEMS SECTION
══════════════════════════════ */
function renderProblems() {
  const grid = qs('#problemsGrid');
  grid.innerHTML = PROBLEMS.map(p => `
    <div class="problem-card" data-id="${p.id}" role="button" tabindex="0" aria-label="Select problem: ${p.name}">
      <div class="problem-check">✓</div>
      <span class="problem-icon">${p.icon}</span>
      <span class="problem-name">${p.name}</span>
    </div>
  `).join('');
  qsa('.problem-card').forEach(card => {
    card.addEventListener('click', () => selectProblem(card.dataset.id));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') selectProblem(card.dataset.id); });
  });
}

function selectProblem(id) {
  if (state.selectedProblem === id) return;
  state.selectedProblem = id;
  qsa('.problem-card').forEach(c => c.classList.toggle('selected', c.dataset.id === id));
  showAILoading(id);
}

function showAILoading(id) {
  const box    = qs('#aiBox');
  const result = qs('#aiResult');
  const actions= qs('#aiActions');
  const loader = qs('#aiLoader');
  box.classList.add('visible');
  result.innerHTML = ''; actions.innerHTML = '';
  loader.classList.remove('hidden');
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => { loader.classList.add('hidden'); renderAIResponse(id); }, 1800);
}

function renderAIResponse(id) {
  const data = AI_RESPONSES[id];
  if (!data) return;
  const sevColors = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ff2d2d' };
  qs('#aiResult').innerHTML = `
    <p style="margin-bottom:.5rem">${data.summary}</p>
    <p style="font-size:.78rem;color:var(--text-3);font-family:var(--font-mono);margin-bottom:1rem;">
      SEVERITY: <span style="color:${sevColors[data.severity]};font-weight:700;">${data.severity.toUpperCase()}</span>
    </p>
    <div class="ai-steps">
      ${data.steps.map((s, i) => `<div class="ai-step"><span class="step-num">${i+1}</span><span>${s}</span></div>`).join('')}
    </div>
  `;
  const btns = [];
  if (data.callMechanic) btns.push(`<button class="ai-action-btn primary" onclick="scrollToMechanics()">📍 Find Nearby Garage</button>`);
  btns.push(`<button class="ai-action-btn secondary" onclick="openModal('videoModal');initVideoCall()">📹 Video Consultation</button>`);
  btns.push(`<button class="ai-action-btn secondary" onclick="openModal('chatModal')">💬 Chat Support</button>`);
  qs('#aiActions').innerHTML = btns.join('');
}

function scrollToMechanics() { qs('#mechanics').scrollIntoView({ behavior: 'smooth' }); }

/* ══════════════════════════════
   GPS LOCATION (NEW)
══════════════════════════════ */
function initLocationDetect() {
  qs('#detectLocationBtn').addEventListener('click', () => {
    const spinner = qs('#locateSpinner');
    const locText = qs('#locText');
    const btn     = qs('#detectLocationBtn');
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    spinner.style.display = 'block';
    btn.disabled = true;
    locText.textContent = 'Detecting your location...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        spinner.style.display = 'none';
        btn.disabled = false;
        // Simulate reverse geocoding
        const simCities = ['Mumbai, Maharashtra', 'Pune, Maharashtra', 'Bengaluru, Karnataka', 'Delhi, NCR', 'Chennai, Tamil Nadu', 'Hyderabad, Telangana'];
        const city = simCities[Math.floor(Math.random() * simCities.length)];
        locText.textContent = `📍 ${city} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        qs('#sosLocText').textContent = `${city}`;
        showToast(`📍 Location detected: ${city}`, 'success');
        // Update garage distances realistically
        updateGarageDistances();
      },
      () => {
        spinner.style.display = 'none';
        btn.disabled = false;
        locText.textContent = 'Location access denied';
        // Fallback: simulate
        locText.textContent = '📍 Mumbai, Maharashtra (simulated)';
        qs('#sosLocText').textContent = 'Mumbai, Maharashtra';
        showToast('📍 Using simulated location: Mumbai, Maharashtra', 'info');
        updateGarageDistances();
      },
      { timeout: 8000 }
    );
  });
}

function updateGarageDistances() {
  // Re-render mechanics with slightly varied distances
  MECHANICS.forEach(m => {
    const base = parseFloat(m.distance);
    const variation = (Math.random() * 0.4 - 0.2).toFixed(1);
    m.distance = Math.max(0.3, base + parseFloat(variation)).toFixed(1) + ' km';
  });
  renderMechanics(state.activeFilter);
  renderMapPins();
}

/* ══════════════════════════════
   MECHANICS / GARAGES
══════════════════════════════ */
function renderMechanics(filter = 'all') {
  const grid = qs('#mechanicsGrid');
  let list = MECHANICS;
  if (filter === 'available') list = MECHANICS.filter(m => m.available);
  if (filter === 'top') list = MECHANICS.filter(m => m.rating >= 4.7);

  grid.innerHTML = list.map(m => `
    <div class="mechanic-card" data-id="${m.id}">
      <div class="mc-header">
        <div class="mc-avatar">${m.initials}</div>
        <div><div class="mc-name">${m.name}</div><div class="mc-type">${m.type}</div></div>
        <span class="mc-avail ${m.available ? 'available' : 'busy'}">● ${m.available ? 'Available' : 'Busy'}</span>
      </div>
      <div class="mc-stats">
        <div class="mc-stat"><span class="mc-stat-val">⭐ ${m.rating}</span><span class="mc-stat-key">${m.reviews} reviews</span></div>
        <div class="mc-stat"><span class="mc-stat-val">📍 ${m.distance}</span><span class="mc-stat-key">Distance</span></div>
        <div class="mc-stat"><span class="mc-stat-val">🕐 ~${m.eta}</span><span class="mc-stat-key">ETA</span></div>
      </div>
      <div class="mc-tags">${m.tags.map(t => `<span class="mc-tag">${t}</span>`).join('')}</div>
      <div class="mc-actions">
        <button class="mc-btn call" onclick="callMechanic('${m.phone}','${m.name}')">📞 Call</button>
        <button class="mc-btn visit" onclick="requestVisit(${m.id},'${m.name}')">🚗 Request</button>
        <button class="mc-btn save ${state.savedGarages.has(m.id) ? 'saved' : ''}" onclick="toggleSaveGarage(${m.id})" title="Save Garage">
          ${state.savedGarages.has(m.id) ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  `).join('');
}

function callMechanic(phone, name) {
  showToast(`📞 Calling ${name} at ${phone}...`, 'info');
}

function requestVisit(id, name) {
  const mech = MECHANICS.find(m => m.id === id);
  qs('#reqSubText').textContent = `Your request has been sent to ${name}.`;
  qs('#reqMechanicInfo').innerHTML = mech ? `
    <div class="mc-avatar" style="width:42px;height:42px;font-size:1rem">${mech.initials}</div>
    <div><strong>${mech.name}</strong><br><small style="color:var(--text-2)">⭐ ${mech.rating} · ${mech.distance} · ETA ${mech.eta}</small></div>
  ` : '';
  openModal('requestModal');
  animateRequestTracker();
  showToast(`🚗 Request sent to ${name}! Confirming...`, 'success');
}

function animateRequestTracker() {
  const step2 = qs('#trackStep2');
  const step3 = qs('#trackStep3');
  const step4 = qs('#trackStep4');
  setTimeout(() => { step2.classList.add('done'); step2.classList.remove('active'); step3.classList.add('active'); }, 2000);
  setTimeout(() => { step3.classList.add('done'); step3.classList.remove('active'); step4.classList.add('active'); }, 5000);
  setTimeout(() => { step4.classList.add('done'); step4.classList.remove('active'); showToast('🎉 Mechanic has arrived!', 'success'); }, 9000);
}

/* ── Save/Unsave Garage ── */
function toggleSaveGarage(id) {
  const mech = MECHANICS.find(m => m.id === id);
  if (!mech) return;
  if (state.savedGarages.has(id)) {
    state.savedGarages.delete(id);
    showToast(`Removed ${mech.name} from saved garages`, 'info', 2000);
  } else {
    state.savedGarages.add(id);
    showToast(`❤️ ${mech.name} saved to your garages!`, 'success', 2000);
  }
  renderMechanics(state.activeFilter);
  renderSavedGarages();
}

function initMechanicsFilter() {
  qsa('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeFilter = btn.dataset.filter;
      renderMechanics(state.activeFilter);
    });
  });
}

/* ── MAP VIEW TOGGLE (NEW) ── */
function initMapViewToggle() {
  qs('#listViewBtn').addEventListener('click', () => {
    qs('#listView').style.display = '';
    qs('#mapView').style.display = 'none';
    qs('#listViewBtn').classList.add('active');
    qs('#mapViewBtn').classList.remove('active');
  });
  qs('#mapViewBtn').addEventListener('click', () => {
    qs('#listView').style.display = 'none';
    qs('#mapView').style.display = '';
    qs('#listViewBtn').classList.remove('active');
    qs('#mapViewBtn').classList.add('active');
    renderMapPins();
  });
}

function renderMapPins() {
  const pinsContainer = qs('#mapPins');
  pinsContainer.innerHTML = MECHANICS.map((m, i) => `
    <div class="map-pin" style="left:${m.mapX};top:${m.mapY};animation-delay:${i*0.1}s" 
         onclick="showToast('${m.name} — ${m.distance} — ⭐${m.rating}','info',3000)">
      <div class="pin-dot ${m.available ? 'green' : 'yellow'}"></div>
      <div class="pin-label">${m.initials} · ${m.distance}</div>
    </div>
  `).join('');
}

/* ══════════════════════════════
   EMERGENCY PANEL (NEW)
══════════════════════════════ */
function initEmergencyPanel() {
  qs('#epMechanicBtn').addEventListener('click', () => {
    // Find nearest available mechanic
    const nearest = MECHANICS.filter(m => m.available)[0];
    if (nearest) requestVisit(nearest.id, nearest.name);
    else showToast('⚠ No mechanics available right now. Try calling.', 'warning');
  });
  qs('#epVideoBtn').addEventListener('click', () => { openModal('videoModal'); initVideoCall(); });
  qs('#epChatBtn').addEventListener('click', () => openModal('chatModal'));
}

/* ══════════════════════════════
   SOS EMERGENCY (NEW)
══════════════════════════════ */
function initSOS() {
  qs('#heroSosBtn').addEventListener('click', triggerSOS);
}

function triggerSOS() {
  openModal('sosModal');
  showToast('🆘 Emergency alert sent! Help is on the way.', 'error', 5000);
  startSOSCountdown();
  // Try to get location
  qs('#sosLocText').textContent = 'Detecting location...';
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const simCities = ['Mumbai, Maharashtra', 'Pune, Maharashtra', 'Delhi, NCR'];
        qs('#sosLocText').textContent = simCities[Math.floor(Math.random() * simCities.length)];
      },
      () => { qs('#sosLocText').textContent = 'Location shared (simulated)'; }
    );
  } else { qs('#sosLocText').textContent = 'Location shared (simulated)'; }
}

function startSOSCountdown() {
  clearInterval(state.sosCountdownTimer);
  let secs = 60;
  qs('#sosCountdown').textContent = secs;
  state.sosCountdownTimer = setInterval(() => {
    secs--;
    qs('#sosCountdown').textContent = secs;
    if (secs <= 0) {
      clearInterval(state.sosCountdownTimer);
      qs('#sosCountdown').textContent = '🎉';
      showToast('🎉 Mechanic has arrived at your location!', 'success', 5000);
    }
  }, 1000);
}

/* ══════════════════════════════
   VIDEO CALL
══════════════════════════════ */
function initVideoCall() {
  state.videoConnected = false;
  const vmStatusText = qs('#vmStatusText');
  const vmMechAvatar = qs('#vmMechAvatar');
  const vmMechName   = qs('#vmMechName');
  const vmInfo       = qs('#vmInfo');
  const vmEnd        = qs('#vmEnd');

  vmStatusText.textContent = 'Connecting to nearest mechanic...';
  vmMechAvatar.textContent = '?';
  vmMechName.textContent   = 'Finding...';
  vmInfo.textContent       = '';
  qs('#vmStatus').querySelector('.vm-spinner').style.display = 'block';

  const mechanic = MECHANIC_NAMES[Math.floor(Math.random() * MECHANIC_NAMES.length)];

  setTimeout(() => { vmStatusText.textContent = `Found: ${mechanic} — Establishing secure call...`; }, 1200);
  setTimeout(() => {
    vmStatusText.textContent = 'Connected! ✅';
    qs('#vmStatus').querySelector('.vm-spinner').style.display = 'none';
    vmMechAvatar.textContent = mechanic.split(' ').map(n => n[0]).join('');
    vmMechName.textContent   = mechanic;
    vmInfo.textContent       = '🟢 Call in progress — 00:00';
    state.videoConnected     = true;
    let secs = 0;
    const timer = setInterval(() => {
      if (!state.videoConnected) { clearInterval(timer); return; }
      secs++;
      const m = String(Math.floor(secs / 60)).padStart(2, '0');
      const s = String(secs % 60).padStart(2, '0');
      vmInfo.textContent = `🟢 Call in progress — ${m}:${s}`;
    }, 1000);
    vmEnd._timer = timer;
  }, 3000);

  vmEnd.onclick = () => {
    state.videoConnected = false;
    clearInterval(vmEnd._timer);
    vmInfo.textContent = '📴 Call ended. Thank you!';
    vmStatusText.textContent = 'Call disconnected.';
    vmMechAvatar.textContent = '✓';
    setTimeout(() => closeModal('videoModal'), 1500);
  };
}

/* ══════════════════════════════
   CHAT (NEW)
══════════════════════════════ */
const CHAT_RESPONSES = {
  'engine': ['Check your coolant level first! 🔧', 'Is the check engine light on? What color?', 'Try turning off the AC to reduce load.', 'I can be there in 8 minutes. Please stay safe.'],
  'tyre':   ['Do you have a spare tyre in the boot?', 'Apply the parking brake first.', 'I can send someone for a tyre change. Sharing my ETA.'],
  'start':  ['Try jump-starting if someone is nearby.', 'Is the battery indicator on?', 'Could be a dead battery or starter motor issue.'],
  'default':['Got it! I\'m looking at your issue now. 🔍', 'Can you share a photo if possible?', 'I\'ll send you step-by-step guidance shortly.', 'On my way! ETA 8 minutes. 🚗'],
};

function initChat() {
  const input = qs('#chatInput');
  const sendBtn = qs('#chatSendBtn');

  const sendMessage = () => {
    const text = input.value.trim();
    if (!text) return;
    addChatMessage(text, 'user');
    input.value = '';
    // Simulate mechanic reply
    setTimeout(() => {
      const keyword = text.toLowerCase().includes('engine') ? 'engine'
        : text.toLowerCase().includes('tyre') || text.toLowerCase().includes('tire') ? 'tyre'
        : text.toLowerCase().includes('start') ? 'start' : 'default';
      const replies = CHAT_RESPONSES[keyword];
      const reply   = replies[Math.floor(Math.random() * replies.length)];
      addChatMessage(reply, 'mech', 'RS');
    }, 1000 + Math.random() * 800);
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
}

function addChatMessage(text, type, avatarText = 'YOU') {
  const msgs = qs('#chatMessages');
  const div  = document.createElement('div');
  div.className = `chat-msg ${type === 'user' ? 'user-msg' : 'mech-msg'}`;
  div.innerHTML = `
    <div class="msg-avatar">${type === 'user' ? 'YOU' : avatarText}</div>
    <div class="msg-bubble">${text}</div>
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  // Hide quick replies after first user message
  if (type === 'user') qs('#chatQuickReplies').style.display = 'none';
}

function sendQuickReply(text) {
  addChatMessage(text, 'user');
  qs('#chatQuickReplies').style.display = 'none';
  setTimeout(() => {
    const replies = CHAT_RESPONSES['default'];
    addChatMessage(replies[Math.floor(Math.random() * replies.length)], 'mech', 'RS');
  }, 1200);
}

/* ══════════════════════════════
   DASHBOARD (NEW)
══════════════════════════════ */
function initDashboard() {
  renderServiceHistory();
  renderSavedGarages();
}

function renderServiceHistory() {
  const list = qs('#historyList');
  list.innerHTML = SERVICE_HISTORY.map(h => `
    <div class="history-item">
      <span class="hi-icon">${h.icon}</span>
      <div class="hi-info">
        <strong>${h.title}</strong>
        <span>${h.garage} · ${h.date}</span>
      </div>
      <span class="hi-status ${h.status}">${h.status === 'done' ? '✓ Done' : '⏳ Pending'}</span>
    </div>
  `).join('');
}

function renderSavedGarages() {
  const list = qs('#savedGaragesList');
  const saved = MECHANICS.filter(m => state.savedGarages.has(m.id));
  if (saved.length === 0) {
    list.innerHTML = '<p style="color:var(--text-3);font-size:.875rem;text-align:center;padding:1rem">No saved garages yet. Heart ❤️ a garage to save it.</p>';
    return;
  }
  list.innerHTML = saved.map(m => `
    <div class="sg-item">
      <div class="sg-avatar">${m.initials}</div>
      <div class="sg-info"><strong>${m.name}</strong><span>⭐ ${m.rating} · ${m.distance}</span></div>
      <button class="sg-remove" onclick="toggleSaveGarage(${m.id})" title="Remove">✕</button>
    </div>
  `).join('');
}

/* ══════════════════════════════
   CONTACT FORM
══════════════════════════════ */
function initContactForm() {
  qs('#contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name  = qs('#cName').value.trim();
    const phone = qs('#cPhone').value.trim();
    if (!name || !phone) { showToast('⚠ Please fill in name and phone number', 'warning'); return; }
    qs('#formSuccess').classList.add('visible');
    qs('#contactForm .form-submit').disabled = true;
    showToast(`✅ Request received, ${name}! We'll call you shortly.`, 'success');
    setTimeout(() => {
      qs('#contactForm').reset();
      qs('#formSuccess').classList.remove('visible');
      qs('#contactForm .form-submit').disabled = false;
    }, 5000);
  });
}

/* ══════════════════════════════
   AUTH MODAL
══════════════════════════════ */
function initAuthModal() {
  qs('#openLogin').addEventListener('click',    () => { openModal('authModal'); switchTab('login'); });
  qs('#openRegister').addEventListener('click', () => { openModal('authModal'); switchTab('register'); });
  qs('#loginTab').addEventListener('click',    () => switchTab('login'));
  qs('#registerTab').addEventListener('click', () => switchTab('register'));
}

function switchTab(tab) {
  const isLogin = tab === 'login';
  qs('#loginForm').classList.toggle('hidden', !isLogin);
  qs('#registerForm').classList.toggle('hidden', isLogin);
  qs('#loginTab').classList.toggle('active', isLogin);
  qs('#registerTab').classList.toggle('active', !isLogin);
}

function showAuthSuccess() {
  showToast('✅ Welcome to MotoMedic!', 'success');
  closeModal('authModal');
}

/* ══════════════════════════════
   VIDEO SECTION BUTTON
══════════════════════════════ */
function initVideoSection() {
  qs('#startVideoBtn').addEventListener('click',  () => { openModal('videoModal'); initVideoCall(); });
  qs('#videoPreview').addEventListener('click',   () => { openModal('videoModal'); initVideoCall(); });
}

/* ══════════════════════════════
   MODALS: CLOSE HANDLERS
══════════════════════════════ */
function initModalClosers() {
  qsa('[data-modal]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.modal)));
  qsa('.modal-overlay').forEach(overlay => overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') qsa('.modal-overlay.open').forEach(o => closeModal(o.id)); });
}

/* ══════════════════════════════
   SCROLL ANIMATIONS
══════════════════════════════ */
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

  const targets = qsa('.mechanic-card, .problem-card, .ci-card, .emergency-card, .dash-card, .ep-btn');
  targets.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
    observer.observe(el);
  });
}

/* ══════════════════════════════
   INIT
══════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initThemeToggle();
  initLangToggle();
  initNavbar();
  initVehicleSection();
  renderProblems();
  renderMechanics();
  initMechanicsFilter();
  initMapViewToggle();
  initLocationDetect();
  initEmergencyPanel();
  initSOS();
  initVideoSection();
  initChat();
  initDashboard();
  initContactForm();
  initAuthModal();
  initModalClosers();
  setTimeout(initScrollAnimations, 300);
});

/* ── GLOBAL EXPORTS ── */
window.openModal       = openModal;
window.closeModal      = closeModal;
window.showAuthSuccess = showAuthSuccess;
window.switchTab       = switchTab;
window.scrollToMechanics = scrollToMechanics;
window.initVideoCall   = initVideoCall;
window.sendQuickReply  = sendQuickReply;
window.toggleSaveGarage= toggleSaveGarage;
window.callMechanic    = callMechanic;
window.requestVisit    = requestVisit;
