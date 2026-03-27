/* ==========================================================
   TriNetra app.js – All interactive logic
   ========================================================== */

// ================================================================
// NAVBAR SCROLL EFFECT + HAMBURGER
// ================================================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const allNavLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  highlightActiveSection();
});

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

allNavLinks.forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

function highlightActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) current = sec.id;
  });
  allNavLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}

// ================================================================
// HERO PARTICLES
// ================================================================
(function initParticles() {
  const container = document.getElementById('particles');
  const count = 25;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${8 + Math.random() * 12}s;
      animation-delay: ${Math.random() * 15}s;
      opacity: ${0.3 + Math.random() * 0.4};
    `;
    container.appendChild(p);
  }
})();

// ================================================================
// LEAFLET MAP – SAFETY ZONES
// ================================================================
let safetyMap, markersAll = [], circlesAll = [];

const zones = [
  // HIGH RISK (Red)
  { lat: 27.0844, lng: 93.6053, name: "Arunachal Border Zone", type: "red", radius: 50000, desc: "Restricted – Inner Line Permit Required. No foreign nationals.", state: "Arunachal Pradesh" },
  { lat: 24.8170, lng: 93.9368, name: "Manipur Hill Districts", type: "red", radius: 35000, desc: "Civil unrest. Travel advisory active. Valley districts only.", state: "Manipur" },
  { lat: 25.6750, lng: 94.1167, name: "Nagaland Border Corridor", type: "red", radius: 30000, desc: "Sensitive military zone. Permit required for all visitors.", state: "Nagaland" },
  { lat: 23.3441, lng: 92.7661, name: "Mizoram-Myanmar Border", type: "red", radius: 40000, desc: "Restricted zone. PAP mandatory for foreign nationals.", state: "Mizoram" },

  // CAUTION (Orange)
  { lat: 26.5775, lng: 93.1711, name: "Kaziranga Buffer Zone", type: "orange", radius: 18000, desc: "Wildlife conflict zone. No entry after 6 PM.", state: "Assam" },
  { lat: 25.2744, lng: 91.7349, name: "Meghalaya Cave Networks", type: "orange", radius: 15000, desc: "Flash flood risk in monsoon. Guided tours only.", state: "Meghalaya" },
  { lat: 27.3389, lng: 88.6065, name: "Nathu La Pass Vicinity", type: "orange", radius: 20000, desc: "High altitude – permit required. Weather unpredictable.", state: "Sikkim" },
  { lat: 23.8315, lng: 91.2868, name: "Tripura Forest Reserve", type: "orange", radius: 22000, desc: "Wildlife alert. Guided groups only. No solo trekking.", state: "Tripura" },

  // SAFE (Green)
  { lat: 25.5788, lng: 91.8933, name: "Shillong City Centre", type: "green", radius: 12000, desc: "Fully tourist-safe. Police presence active.", state: "Meghalaya" },
  { lat: 26.1445, lng: 91.7362, name: "Guwahati City", type: "green", radius: 15000, desc: "Major transit hub. Tourist-friendly zone.", state: "Assam" },
  { lat: 27.3314, lng: 88.6138, name: "Gangtok Town", type: "green", radius: 10000, desc: "Verified safe. Tourist police deployed.", state: "Sikkim" },
  { lat: 23.8315, lng: 91.2868, name: "Agartala City", type: "green", radius: 12000, desc: "Safe for tourism. Heritage walk recommended.", state: "Tripura" },
];

function initMap() {
  safetyMap = L.map('safetyMap', {
    center: [25.8, 92.5],
    zoom: 6,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd', maxZoom: 19
  }).addTo(safetyMap);

  plotZones('all');

  // Layer filter buttons
  document.querySelectorAll('.map-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      plotZones(btn.dataset.layer);
    });
  });
}

function plotZones(filter) {
  // Clear existing
  circlesAll.forEach(c => safetyMap.removeLayer(c));
  markersAll.forEach(m => safetyMap.removeLayer(m));
  circlesAll = []; markersAll = [];

  const colorMap = { red: '#ef4444', orange: '#f97316', green: '#10b981' };
  const filtered = filter === 'all' ? zones : zones.filter(z => z.type === filter);

  filtered.forEach(zone => {
    const color = colorMap[zone.type];
    const circle = L.circle([zone.lat, zone.lng], {
      radius: zone.radius,
      color: color, fillColor: color,
      fillOpacity: 0.15, weight: 2, opacity: 0.7
    }).addTo(safetyMap);

    circle.bindPopup(`
      <div style="font-family:'Outfit',sans-serif; color:#f1f5f9; background:#1a2234; border-radius:8px; padding:4px; min-width:200px;">
        <h4 style="margin:0 0 6px; color:${color}; font-size:0.95rem;">${zone.name}</h4>
        <p style="margin:0 0 6px; font-size:0.82rem; color:#94a3b8;">${zone.desc}</p>
        <span style="font-size:0.72rem; background:rgba(255,255,255,0.07); padding:2px 8px; border-radius:4px;">${zone.state}</span>
      </div>
    `, { className: 'custom-popup' });

    const marker = L.circleMarker([zone.lat, zone.lng], {
      radius: 8, color: color, fillColor: color, fillOpacity: 0.9, weight: 2
    }).addTo(safetyMap);

    marker.bindPopup(circle.getPopup().getContent(), { className: 'custom-popup' });

    circlesAll.push(circle);
    markersAll.push(marker);
  });
}

// ================================================================
// WEATHER SYSTEM
// ================================================================
const weatherData = {
  shillong: {
    icon: '⛈️', temp: 18, condition: 'Heavy Thunderstorm', feels: 'Feels like 15°C | Humidity 92%',
    warning: 'Extremely heavy rainfall expected in Meghalaya over next 48 hours. Flash flood risk HIGH in Cherrapunji, Mawsynram & surrounding areas.',
    alertActive: true,
    forecast: [
      { day: 'Today', icon: '⛈️', cond: 'Thunderstorm', temp: '18°C', risk: true },
      { day: 'Sat', icon: '🌧️', cond: 'Heavy Rain', temp: '17°C', risk: true },
      { day: 'Sun', icon: '🌦️', cond: 'Showers', temp: '20°C', risk: false },
      { day: 'Mon', icon: '⛅', cond: 'Partly Cloudy', temp: '22°C', risk: false },
      { day: 'Tue', icon: '🌤️', cond: 'Mostly Clear', temp: '24°C', risk: false },
    ],
    tips: ['Waterproofs mandatory for all outdoor activities', 'Avoid Cherrapunji valley hikes for 72h', 'Check cave tour cancellations before visiting Mawlynnong', 'Roads to Dawki may be waterlogged']
  },
  guwahati: {
    icon: '🌦️', temp: 28, condition: 'Partly Cloudy with Showers', feels: 'Feels like 31°C | Humidity 78%',
    warning: 'Brahmaputra river levels rising. Stay away from riverbanks. Some ferry services suspended.',
    alertActive: true,
    forecast: [
      { day: 'Today', icon: '🌦️', cond: 'Showers', temp: '28°C', risk: false },
      { day: 'Sat', icon: '⛈️', cond: 'Thunderstorm', temp: '26°C', risk: true },
      { day: 'Sun', icon: '🌧️', cond: 'Rain', temp: '25°C', risk: false },
      { day: 'Mon', icon: '🌤️', cond: 'Clear', temp: '30°C', risk: false },
      { day: 'Tue', icon: '☀️', cond: 'Sunny', temp: '32°C', risk: false },
    ],
    tips: ['Monitor Brahmaputra flood alerts', 'Kaziranga safari closed during extreme rains', 'Carry insect repellent in all seasons', 'Book hotels in advance during Bihu season']
  },
  itanagar: {
    icon: '🌨️', temp: 12, condition: 'Light Snow at Higher Altitude', feels: 'Feels like 9°C | Humidity 65%',
    warning: 'Snowfall above 2000m altitude. Some mountain passes temporarily closed. ILP required for all routes.',
    alertActive: true,
    forecast: [
      { day: 'Today', icon: '🌨️', cond: 'Light Snow', temp: '12°C', risk: true },
      { day: 'Sat', icon: '❄️', cond: 'Snowfall', temp: '8°C', risk: true },
      { day: 'Sun', icon: '⛅', cond: 'Cloudy', temp: '14°C', risk: false },
      { day: 'Mon', icon: '🌤️', cond: 'Partly Sunny', temp: '16°C', risk: false },
      { day: 'Tue', icon: '☀️', cond: 'Clear', temp: '18°C', risk: false },
    ],
    tips: ['Carry warm layers even in summer', 'Mountain passes may close without notice', 'ILP essential – carry multiple copies', 'Altitude sickness kit recommended above 3000m']
  },
  kohima: {
    icon: '🌫️', temp: 16, condition: 'Foggy with Drizzle', feels: 'Feels like 13°C | Humidity 86%',
    warning: 'Dense fog conditions on Dimapur-Kohima highway. Night driving not advised.',
    alertActive: false,
    forecast: [
      { day: 'Today', icon: '🌫️', cond: 'Foggy', temp: '16°C', risk: false },
      { day: 'Sat', icon: '🌦️', cond: 'Drizzle', temp: '17°C', risk: false },
      { day: 'Sun', icon: '⛅', cond: 'Cloudy', temp: '19°C', risk: false },
      { day: 'Mon', icon: '🌤️', cond: 'Clearing', temp: '21°C', risk: false },
      { day: 'Tue', icon: '☀️', cond: 'Sunny', temp: '23°C', risk: false },
    ],
    tips: ['Hornbill Festival (Dec): book months ahead', 'Tribal village visits require prior permission', 'Drive cautiously on mountain roads after rain', 'Best visited Oct-April for clear weather']
  },
  imphal: {
    icon: '⛅', temp: 22, condition: 'Overcast, Mild', feels: 'Feels like 20°C | Humidity 70%',
    warning: 'Ongoing civil situation in hill districts. Valley areas safe. Register with local police on arrival.',
    alertActive: true,
    forecast: [
      { day: 'Today', icon: '⛅', cond: 'Overcast', temp: '22°C', risk: false },
      { day: 'Sat', icon: '🌦️', cond: 'Light Rain', temp: '20°C', risk: false },
      { day: 'Sun', icon: '🌤️', cond: 'Partly Clear', temp: '24°C', risk: false },
      { day: 'Mon', icon: '☀️', cond: 'Sunny', temp: '26°C', risk: false },
      { day: 'Tue', icon: '⛅', cond: 'Mild Cloud', temp: '24°C', risk: false },
    ],
    tips: ['Register at Foreigners Registration Office on arrival', 'Avoid hill districts completely', 'Keibul Lamjao NP requires advance booking', 'Local currency preferred – fewer ATMs in rural areas']
  },
  agartala: {
    icon: '☀️', temp: 30, condition: 'Sunny & Warm', feels: 'Feels like 33°C | Humidity 72%',
    warning: null,
    alertActive: false,
    forecast: [
      { day: 'Today', icon: '☀️', cond: 'Sunny', temp: '30°C', risk: false },
      { day: 'Sat', icon: '🌤️', cond: 'Mostly Sunny', temp: '31°C', risk: false },
      { day: 'Sun', icon: '⛅', cond: 'Partly Cloudy', temp: '29°C', risk: false },
      { day: 'Mon', icon: '🌦️', cond: 'Showers', temp: '27°C', risk: false },
      { day: 'Tue', icon: '☀️', cond: 'Clear', temp: '30°C', risk: false },
    ],
    tips: ['Best time to visit: Nov-Feb', 'Ujjayanta Palace closes on Mondays', 'E-visa for Bangladesh border crossing', 'Carry sunscreen – intense heat in summer']
  },
  aizawl: {
    icon: '🌤️', temp: 20, condition: 'Pleasant & Breezy', feels: 'Feels like 18°C | Humidity 68%',
    warning: null,
    alertActive: false,
    forecast: [
      { day: 'Today', icon: '🌤️', cond: 'Breezy', temp: '20°C', risk: false },
      { day: 'Sat', icon: '☀️', cond: 'Sunny', temp: '22°C', risk: false },
      { day: 'Sun', icon: '⛅', cond: 'Mild Cloud', temp: '21°C', risk: false },
      { day: 'Mon', icon: '🌦️', cond: 'Light Rain', temp: '18°C', risk: false },
      { day: 'Tue', icon: '🌤️', cond: 'Clearing', temp: '21°C', risk: false },
    ],
    tips: ['PAP required for foreign tourists', 'No alcohol in dry zones (Sunday law)', 'Phawngpui (Blue Mountain) trekking: Oct-Mar', 'Local church concerts worth attending']
  },
  gangtok: {
    icon: '🌨️', temp: 8, condition: 'Light Snowfall', feels: 'Feels like 5°C | Humidity 55%',
    warning: 'Snowfall at Nathula Pass and Tsomgo Lake. Route temporarily closed. Check with local operators.',
    alertActive: true,
    forecast: [
      { day: 'Today', icon: '🌨️', cond: 'Snowfall', temp: '8°C', risk: true },
      { day: 'Sat', icon: '❄️', cond: 'Heavy Snow', temp: '4°C', risk: true },
      { day: 'Sun', icon: '⛅', cond: 'Overcast', temp: '10°C', risk: false },
      { day: 'Mon', icon: '🌤️', cond: 'Clearing', temp: '12°C', risk: false },
      { day: 'Tue', icon: '☀️', cond: 'Clear', temp: '14°C', risk: false },
    ],
    tips: ['Altitude sickness common above 3500m', 'Nathula Pass permit: book 1 week ahead', 'Carry woolens year-round', 'Rohtang Pass snow: hire certified guides only']
  },
};

function updateWeather(city) {
  const d = weatherData[city];
  document.getElementById('weatherIcon').textContent = d.icon;
  document.getElementById('weatherTemp').textContent = d.temp + '°C';
  document.getElementById('weatherCond').textContent = d.condition;
  document.getElementById('weatherFeels').textContent = d.feels;

  const alertBadge = document.getElementById('weatherAlertBadge');
  alertBadge.style.display = d.alertActive ? 'block' : 'none';

  const warningBox = document.getElementById('weatherWarningBox');
  if (d.alertActive && d.warning) {
    warningBox.style.display = 'block';
    document.getElementById('warningText').textContent = d.warning;
  } else {
    warningBox.style.display = 'none';
  }

  // Forecast
  const strip = document.getElementById('forecastStrip');
  strip.innerHTML = '<div style="padding:0.75rem 0 0.5rem; font-size:0.78rem; font-weight:800; color:var(--text-muted); letter-spacing:1px; text-transform:uppercase;">5-Day Forecast</div>';
  d.forecast.forEach(item => {
    strip.innerHTML += `
      <div class="forecast-item">
        <span class="forecast-day">${item.day}</span>
        <span class="forecast-icon">${item.icon}</span>
        <span class="forecast-cond">${item.cond}</span>
        <span class="forecast-temp">${item.temp}</span>
        ${item.risk ? '<span class="forecast-badge">⚠️ Risk</span>' : '<span class="forecast-badge safe">✓ OK</span>'}
      </div>`;
  });

  // Tips
  const tipsList = document.getElementById('weatherTips');
  tipsList.innerHTML = d.tips.map(t => `<li>${t}</li>`).join('');
}

document.getElementById('weatherSelect').addEventListener('change', (e) => {
  updateWeather(e.target.value);
});

// Climate Calendar
function buildCalendar() {
  const months = [
    { name: 'Jan', icon: '❄️', cls: 'month-best' },
    { name: 'Feb', icon: '🌸', cls: 'month-best' },
    { name: 'Mar', icon: '🌼', cls: 'month-best' },
    { name: 'Apr', icon: '🌤️', cls: 'month-ok' },
    { name: 'May', icon: '🌧️', cls: 'month-ok' },
    { name: 'Jun', icon: '⛈️', cls: 'month-risky' },
    { name: 'Jul', icon: '🌊', cls: 'month-risky' },
    { name: 'Aug', icon: '🌊', cls: 'month-risky' },
    { name: 'Sep', icon: '🌦️', cls: 'month-ok' },
    { name: 'Oct', icon: '🍂', cls: 'month-best' },
    { name: 'Nov', icon: '🌤️', cls: 'month-best' },
    { name: 'Dec', icon: '❄️', cls: 'month-best' },
  ];
  const grid = document.getElementById('monthGrid');
  months.forEach(m => {
    grid.innerHTML += `
      <div class="month-cell ${m.cls}">
        <div class="m-name">${m.name}</div>
        <div class="m-icon">${m.icon}</div>
      </div>`;
  });

  // Legend
  grid.insertAdjacentHTML('afterend', `
    <div style="display:flex; gap:1.5rem; margin-top:1rem; flex-wrap:wrap; font-size:0.8rem; color:var(--text-muted);">
      <span><span style="display:inline-block;width:12px;height:12px;background:rgba(16,185,129,0.3);border-radius:2px;margin-right:6px;"></span>Best Time to Visit</span>
      <span><span style="display:inline-block;width:12px;height:12px;background:rgba(245,158,11,0.2);border-radius:2px;margin-right:6px;"></span>Moderate – Exercise Caution</span>
      <span><span style="display:inline-block;width:12px;height:12px;background:rgba(239,68,68,0.2);border-radius:2px;margin-right:6px;"></span>Monsoon Risk – Avoid if possible</span>
    </div>`);
}

// ================================================================
// ETIQUETTE TABS
// ================================================================
const etiquetteData = {
  general: {
    dos: [
      'Carry a printed copy of your itinerary and hotel bookings', 'Register with the local police/FRO within 24 hours of arrival', 'Dress modestly in rural and tribal areas', 'Learn a few words in the local language – it goes a long way', 'Keep emergency contacts saved offline on your phone', 'Always travel in groups after dark in unfamiliar areas',
    ],
    donts: [
      'Do not enter restricted zones without proper permits', 'Never photograph military installations or border areas', "Don't depend solely on digital maps – offline maps essential", 'Avoid displaying expensive jewelry and gadgets in public', "Don't ignore vehicle breakdowns – always carry a spare tyre", "Never travel to unstable areas against local police advice",
    ]
  },
  religious: {
    dos: [
      'Remove footwear before entering monasteries and temples', 'Dress conservatively – cover shoulders and knees', 'Accept prasad / blessings with both hands respectfully', 'Walk clockwise around stupas and prayer wheels', 'Ask permission before photographing rituals or ceremonies', 'Observe silence or speak softly inside sacred spaces',
    ],
    donts: [
      'Do not touch idols, sacred items, or altar pieces', "Don't enter inner sanctums unless explicitly invited", 'Never point feet toward deities or monks', 'Photography restrictions inside: always confirm first', 'Do not enter with leather products in some temples', "Don't interrupt ongoing prayers or chants",
    ]
  },
  tribal: {
    dos: [
      'Seek permission before visiting a tribal village', 'Respect village elders and follow their guidance', 'Accept food or drinks offered – refusing can cause offence', 'Bring small gifts like stationery or fruit – not alcohol', 'Engage with local guides certified by the tribal council', 'Observe and appreciate cultural performances respectfully',
    ],
    donts: [
      "Do not gift alcohol – many tribes are teetotal", "Never photograph tribal women and children without consent", "Don't touch tattoos – they hold sacred significance", "Avoid discussing political or land rights disputes", "Never mock or imitate traditional dress or practices", "Do not pick or buy items designated as culturally sacred",
    ]
  },
  wildlife: {
    dos: [
      'Keep strictly to marked safari trails at all times', 'Maintain silence – loud noises disturb wildlife', 'Follow guide instructions without question in the park', 'Keep car windows up when near large wildlife', 'Report injured or sick animals to forest staff immediately', 'Carry your park entry permit at all times',
    ],
    donts: [
      "Never feed wild animals – it's illegal and dangerous", 'Do not exit the vehicle during jungle safaris', 'Avoid visiting buffer zones after 6 PM', "Don't litter – plastics can be fatal for wildlife", 'Never pursue animals for better photos', "Do not attempt to approach rhinos or elephants",
    ]
  },
  photo: {
    dos: [
      'Always ask permission before photographing people', 'Landscapes and architecture are generally fine to shoot', 'Use drone photography only with valid permits', 'Photography at many monasteries: seek monks\' consent', 'Pay small photography fees at heritage sites respectfully', 'Shooting markets and local life: be discreet and kind',
    ],
    donts: [
      'No photography near military camps, borders, or checkposts', "Don't photograph women bathing at rivers or public spaces", 'Never post geo-tags of restricted or sensitive zones online', "Don't use flash photography in low-light heritage spaces", 'Never photograph corpses during funeral rites', 'Drone use near airports or border zones is illegal',
    ]
  }
};

function renderEtiquette(tab) {
  const d = etiquetteData[tab];
  const content = document.getElementById('tabContent');
  content.innerHTML = `
    <div class="tab-inner">
      <div class="tip-card do">
        <div class="tip-header do">✅ Do's</div>
        <ul class="tip-list">${d.dos.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>
      <div class="tip-card dont">
        <div class="tip-header dont">❌ Don'ts</div>
        <ul class="tip-list">${d.donts.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>
    </div>`;
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderEtiquette(btn.dataset.tab);
  });
});

// Heritage Sites
const sites = [
  { name: 'Kamakhya Temple', state: 'Assam', desc: 'One of India\'s most powerful Shakti peethas. Major pilgrimage site.', icon: '🛕', bg: 'linear-gradient(135deg,#7c2d12,#1c0a00)', tags: ['Hindu Temple', 'No Menstruating Women Inside', 'Photography Restricted'] },
  { name: 'Tawang Monastery', state: 'Arunachal Pradesh', desc: 'Largest monastery in India. 400-year-old Gelugpa Buddhist complex.', icon: '⛩️', bg: 'linear-gradient(135deg,#1e3a5f,#0c1f3d)', tags: ['Buddhist', 'Remove Shoes', 'Silence Required', 'ILP Needed'] },
  { name: 'Loktak Lake', state: 'Manipur', desc: 'The only floating lake park in the world. Home of the Phumdis.', icon: '🏞️', bg: 'linear-gradient(135deg,#064e3b,#022c22)', tags: ['UNESCO Listed', 'Boat Permit', 'No Littering'] },
  { name: 'Living Root Bridges', state: 'Meghalaya', desc: 'Bio-engineered bridges grown over centuries by the Khasi people.', icon: '🌉', bg: 'linear-gradient(135deg,#166534,#052e16)', tags: ['Indigenous Heritage', 'No Carving', 'Guide Mandatory'] },
  { name: 'Dzükou Valley', state: 'Nagaland', desc: 'Valley of flowers on Nagaland-Manipur border. Sacred Naga land.', icon: '🏔️', bg: 'linear-gradient(135deg,#5b21b6,#2e1065)', tags: ['Trekking', 'ILP Required', 'No Campfires'] },
  { name: 'Ujjayanta Palace', state: 'Tripura', desc: 'Former royal palace turned museum. Blend of Mughal and British styles.', icon: '🏛️', bg: 'linear-gradient(135deg,#92400e,#451a03)', tags: ['Museum', 'No Flash Photo', 'Heritage Site'] },
];

function renderSites() {
  const grid = document.getElementById('sitesGrid');
  sites.forEach(site => {
    grid.innerHTML += `
      <div class="site-card">
        <div class="site-image" style="background:${site.bg};">
          <span style="font-size:4rem;">${site.icon}</span>
          <div class="site-overlay">
            <span class="site-state">${site.state}</span>
          </div>
        </div>
        <div class="site-info">
          <h4>${site.name}</h4>
          <p>${site.desc}</p>
          <div class="site-tags">${site.tags.map(t => `<span class="site-tag">${t}</span>`).join('')}</div>
        </div>
      </div>`;
  });
}

// ================================================================
// ACCOMMODATION FINDER
// ================================================================
const accommodations = [
  { name: 'The Polo Towers', state: 'Meghalaya', city: 'Shillong', type: 'Hotel', budget: 'Premium (₹5000+)', safety: 'safe', stars: '★★★★★', price: '₹7,200', features: ['24/7 Security', 'WiFi', 'Restaurant', 'GPS Verified'], icon: '🏨', bg: '#1a2234' },
  { name: 'Brahmaputra Riverside Homestay', state: 'Assam', city: 'Guwahati', type: 'Homestay', budget: 'Budget (under ₹1500)', safety: 'safe', stars: '★★★★', price: '₹1,200', features: ['Police Registered', 'Local Guide', 'Home-cooked meals'], icon: '🏡', bg: '#1a2a20' },
  { name: 'Alpine Eco Lodge Gangtok', state: 'Sikkim', city: 'Gangtok', type: 'Eco Lodge', budget: 'Mid-range (₹1500–5000)', safety: 'safe', stars: '★★★★', price: '₹3,500', features: ['Eco-certified', 'Mountain View', 'Trekking Desk', '24h Security'], icon: '🏕️', bg: '#1a1a2e' },
  { name: 'Circuit House Kohima', state: 'Nagaland', city: 'Kohima', type: 'Government Guest House', budget: 'Budget (under ₹1500)', safety: 'safe', stars: '★★★', price: '₹800', features: ['Govt. Owned', 'ILP Help Desk', 'Police Adjacent'], icon: '🏢', bg: '#1e1a2e' },
  { name: 'Tawang Tourist Lodge', state: 'Arunachal Pradesh', city: 'Tawang', type: 'Government Guest House', budget: 'Budget (under ₹1500)', safety: 'safe', stars: '★★★', price: '₹1,100', features: ['Near Monastery', 'Heated Rooms', 'Emergency Desk'], icon: '🏔️', bg: '#1e2a1a' },
  { name: 'Hotel Imphal Grand', state: 'Manipur', city: 'Imphal', type: 'Hotel', budget: 'Mid-range (₹1500–5000)', safety: 'caution', stars: '★★★★', price: '₹4,200', features: ['Valley Zone Only', 'Security Staff', 'Tourist Police #'], icon: '🏨', bg: '#2a1a1a' },
  { name: 'Meghalaya Forest Retreat', state: 'Meghalaya', city: 'Cherrapunji', type: 'Eco Lodge', budget: 'Mid-range (₹1500–5000)', safety: 'safe', stars: '★★★★', price: '₹4,800', features: ['Cloud Forest', 'Trek Guide', 'Emergency Satellite'], icon: '🌿', bg: '#1a2a1a' },
  { name: 'Lake View Homestay', state: 'Manipur', city: 'Moirang', type: 'Homestay', budget: 'Budget (under ₹1500)', safety: 'caution', stars: '★★★', price: '₹900', features: ['Loktak View', 'Local Family', 'Valley Area'], icon: '🏡', bg: '#2a2a1a' },
  { name: 'Heritage Tripura Palace', state: 'Tripura', city: 'Agartala', type: 'Hotel', budget: 'Premium (₹5000+)', safety: 'safe', stars: '★★★★★', price: '₹6,500', features: ['Royal Heritage', 'Museum Adjacent', 'Full Security', 'Restaurant'], icon: '🏛️', bg: '#2a1a0a' },
];

let filteredAccom = [...accommodations];

function filterAccommodations() {
  const state = document.getElementById('accomState').value;
  const type = document.getElementById('accomType').value;
  const budget = document.getElementById('accomBudget').value;

  filteredAccom = accommodations.filter(a => {
    return (!state || a.state === state) &&
           (!type || a.type === type) &&
           (!budget || a.budget === budget);
  });

  renderAccommodations();
}

function renderAccommodations() {
  const grid = document.getElementById('accomGrid');
  grid.innerHTML = '';

  if (filteredAccom.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">
      <div style="font-size:3rem; margin-bottom:1rem;">🔍</div>
      <h3 style="margin-bottom:0.5rem;">No stays found</h3>
      <p>Try adjusting your filters to find accommodations.</p>
    </div>`;
    return;
  }

  filteredAccom.forEach(a => {
    const safetyLabel = a.safety === 'safe' ? '🛡️ Verified Safe' : '⚠️ Exercise Caution';
    const safetyClass = a.safety;
    grid.innerHTML += `
      <div class="accom-card">
        <div class="accom-image" style="background:${a.bg};">
          <span style="font-size:4rem;">${a.icon}</span>
          <span class="accom-safety-badge ${safetyClass}">${safetyLabel}</span>
          <span class="accom-type-tag">${a.type}</span>
        </div>
        <div class="accom-body">
          <div class="accom-header">
            <h4>${a.name}</h4>
            <span class="accom-stars">${a.stars}</span>
          </div>
          <div class="accom-location">📍 ${a.city}, ${a.state}</div>
          <div class="accom-features">${a.features.map(f => `<span class="accom-feat">${f}</span>`).join('')}</div>
          <div class="accom-footer">
            <div class="accom-price">${a.price} <span>/night</span></div>
            <button class="accom-book">Book Now →</button>
          </div>
        </div>
      </div>`;
  });
}

// ================================================================
// SOS BUTTON SYSTEM
// ================================================================
let sosTimer = null;
let sosDuration = 3000; // 3 seconds hold
let sosStart = null;
let sosActive = false;
const circumference = 2 * Math.PI * 54; // r=54

const stationsByState = [
  'Shillong Police Control Room',
  'Guwahati Police Headquarters',
  'Itanagar Police Station',
  'Kohima District Police',
  'Imphal East Police Station',
  'Agartala City Police',
  'Aizawl District Police',
  'Gangtok Police Station',
  'Silchar Police Control Room',
  'Dibrugarh Police',
];
const responseTimes = ['6–10 minutes', '8–12 minutes', '10–15 minutes', '7–11 minutes'];

function updateSOSInfo() {
  const station = stationsByState[Math.floor(Math.random() * stationsByState.length)];
  const response = responseTimes[Math.floor(Math.random() * responseTimes.length)];
  document.getElementById('nearestStation').textContent = station;
  document.getElementById('responseTime').textContent = response;

  // Try geolocation
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        document.getElementById('sosLocation').textContent = `${lat}°N, ${lng}°E`;
        document.getElementById('modalLocation').textContent = `${lat}°N, ${lng}°E`;
      },
      () => {
        document.getElementById('sosLocation').textContent = '25.5788°N, 91.8933°E (Approx.)';
      }
    );
  } else {
    document.getElementById('sosLocation').textContent = '25.5788°N, 91.8933°E (Approx.)';
  }
  document.getElementById('modalStation').textContent = station;
}

let sosInterval = null;

function startSOS() {
  if (sosActive) return;
  sosStart = Date.now();
  const circle = document.getElementById('sosProgressCircle');
  const btn = document.getElementById('sosButton');
  const status = document.getElementById('sosStatus');

  status.innerHTML = `<div class="status-indicator active"><span class="status-dot"></span>Sending SOS – Hold for 3 seconds…</div>`;
  btn.style.boxShadow = '0 0 80px rgba(239,68,68,0.7), 0 0 120px rgba(239,68,68,0.3), inset 0 4px 20px rgba(255,255,255,0.2)';

  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = circumference;

  // Use setInterval for reliable cross-browser timing
  clearInterval(sosInterval);
  sosInterval = setInterval(() => {
    if (!sosStart) { clearInterval(sosInterval); return; }
    const elapsed = Date.now() - sosStart;
    const progress = Math.min(elapsed / sosDuration, 1);
    const offset = circumference * (1 - progress);
    circle.style.strokeDashoffset = offset;

    if (progress >= 1) {
      clearInterval(sosInterval);
      triggerSOS();
    }
  }, 30);

  // Fallback timeout
  sosTimer = setTimeout(() => {
    if (sosStart && !sosActive) triggerSOS();
  }, sosDuration + 200);
}

function cancelSOS() {
  if (sosActive) return;
  sosStart = null;
  clearInterval(sosInterval);
  clearTimeout(sosTimer);

  const circle = document.getElementById('sosProgressCircle');
  const btn = document.getElementById('sosButton');
  const status = document.getElementById('sosStatus');

  circle.style.strokeDashoffset = circumference;
  btn.style.boxShadow = '';
  status.innerHTML = `<div class="status-indicator status-ready"><span class="status-dot"></span>System Ready – GPS Active</div>`;
}

function triggerSOS() {
  sosActive = true;
  const modal = document.getElementById('sosModal');
  modal.classList.add('active');

  // Flash the page red briefly
  const flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;inset:0;background:rgba(239,68,68,0.2);z-index:8000;pointer-events:none;animation:fadeOut 0.8s forwards;';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 800);

  // Add flash animation
  const style = document.createElement('style');
  style.textContent = '@keyframes fadeOut{from{opacity:1}to{opacity:0}}';
  document.head.appendChild(style);
}

function closeSOS() {
  const modal = document.getElementById('sosModal');
  modal.classList.remove('active');
  sosActive = false;
  cancelSOS();
}

// ================================================================
// INTERSECTION OBSERVER – Animate cards on scroll
// ================================================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  const cards = document.querySelectorAll('.alert-card, .tip-card, .site-card, .accom-card, .strip-card, .sos-info-card, .number-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.4s ease ${i * 0.05}s, transform 0.4s ease ${i * 0.05}s`;
    observer.observe(card);
  });
}

// ================================================================
// SMOOTH SECTION TAG ANIMATION
// ================================================================
function initSectionAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.section-header').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Override IntersectionObserver for section headers
  const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.section-header').forEach(h => {
    h.style.opacity = '0';
    h.style.transform = 'translateY(20px)';
    h.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    headerObserver.observe(h);
  });
});

// ================================================================
// INIT ALL
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  updateWeather('shillong');
  buildCalendar();
  renderEtiquette('general');
  renderSites();
  renderAccommodations();
  updateSOSInfo();
  initScrollAnimations();

  // Floating SOS tooltip
  const floatSOS = document.getElementById('floatingSOS');
  floatSOS.title = 'Emergency SOS – Click to go to SOS section';
});
