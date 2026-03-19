import { computeTotalPoints, ELECTRICITY_PRICE_PER_KWH } from './formulas.js';

function startCarbonGame() {
  // Qualitative questionnaire suitable for high-schoolers
  const questions = [
  { id: 'householdSize', label: 'How many people live in your home?', type: 'select', options: [ { val: 1, label: '1' }, { val: 2, label: '2' }, { val: 3.5, label: '3-4' }, { val: 5, label: '5+' } ], required: true },

  { id: 'carOwnership', label: 'Do you or your family have a car?', type: 'select', options: [ { val: 'no', label: 'No car' }, { val: 'ev', label: 'Yes — electric' }, { val: 'gas', label: 'Yes — gasoline/hybrid' } ], required: true },
  { id: 'drivingFrequency', label: 'How often do you/your family drive?', type: 'select', options: [ { val: 'rare', label: 'Rarely (a few times/month)' }, { val: 'sometimes', label: 'Sometimes (1-3 days/week)' }, { val: 'often', label: 'Often (4-6 days/week)' }, { val: 'daily', label: 'Daily' } ], required: true },

  { id: 'showerLength', label: 'Typical shower length (per person)', type: 'select', options: [ { val: '<5', label: 'Under 5 minutes' }, { val: '5-10', label: '5–10 minutes' }, { val: '10-20', label: '10–20 minutes' }, { val: '>20', label: 'Over 20 minutes' } ], required: true },
  { id: 'heatingType', label: 'Main household heating (water/heat)', type: 'select', options: [ { val: 'electric', label: 'Electric' }, { val: 'natgas', label: 'Natural gas' }, { val: 'fuelOil', label: 'Fuel oil' }, { val: 'propane', label: 'Propane' }, { val: 'unknown', label: 'I don\'t know' } ], required: true },

  { id: 'devices', label: 'How many devices (phones/laptops) are often charging/left on?', type: 'select', options: [ { val: 'none', label: 'Almost none' }, { val: 'few', label: 'A few' }, { val: 'many', label: 'Many' } ], required: true },
  { id: 'acUse', label: 'Air conditioning usage in summer', type: 'select', options: [ { val: 'never', label: 'Never' }, { val: 'sometimes', label: 'Sometimes' }, { val: 'often', label: 'Often' } ], required: true },
  { id: 'ledBulbs', label: 'Do you have LED bulbs?', type: 'select', options: [ { val: 'most', label: 'Most are LED' }, { val: 'some', label: 'Some are LED' }, { val: 'none', label: 'None are LED' } ], required: true },

  { id: 'recyclingLevel', label: 'How much does your household recycle?', type: 'select', options: [ { val: 'lots', label: 'A lot' }, { val: 'some', label: 'Some' }, { val: 'none', label: 'None' } ], required: false },

  { id: 'flights', label: 'Do you/your family fly for trips?', type: 'select', options: [ { val: 'never', label: 'Never' }, { val: 'once', label: 'Once a year' }, { val: 'few', label: 'A few times a year' } ], required: false }
  ,
  // Additional numeric/behavioural questions to vary scores
  { id: 'screenHoursPerDay', label: 'Hours of screen time per day (estimate)', type: 'number', placeholder: 'e.g. 4', required: true },
  { id: 'takeoutMealsPerWeek', label: 'Takeout / delivery meals per week', type: 'number', placeholder: 'e.g. 2', required: true },
  { id: 'laundryLoadsPerWeek', label: 'Laundry loads per week', type: 'number', placeholder: 'e.g. 3', required: true },
  { id: 'monthlyElectricityBill', label: 'Monthly electricity bill ($) — optional', type: 'number', placeholder: 'e.g. 120', required: false }
];

const state = { idx: 0, answers: {} };

// initialize defaults for select questions so required fields are considered filled
function initDefaults() {
  questions.forEach(q => {
    if (q.type === 'select' && state.answers[q.id] == null) {
      state.answers[q.id] = q.options && q.options.length ? q.options[0].val : null;
    }
    if (q.type === 'checkboxes' && state.answers[q.id] == null) {
      state.answers[q.id] = {};
    }
  });
}

  const root = document.getElementById('question-root');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const restartBtn = document.getElementById('restartBtn');
  const resultArea = document.getElementById('result-area');
  const questionArea = document.getElementById('question-area');
  const progressBar = document.getElementById('progress-bar');

function renderQuestion() {
  const q = questions[state.idx];
  root.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'question';

  const label = document.createElement('label');
  label.textContent = q.label + (q.required ? ' *' : '');
  container.appendChild(label);

  let input;
  if (q.type === 'select') {
    input = document.createElement('select');
    q.options.forEach(o => {
      const opt = document.createElement('option');
      opt.value = String(o.val);
      opt.textContent = o.label;
      input.appendChild(opt);
    });
    // default to first option if not set
    input.value = state.answers[q.id] != null ? String(state.answers[q.id]) : String(q.options[0].val);
    input.id = q.id;
    if (q.required) input.required = true;
    // initialize state with the default select value so required checks pass
    (function initSelectDefault() {
      const v = input.value;
      if (state.answers[q.id] == null) {
        if (v === 'true') state.answers[q.id] = true;
        else if (v === 'false') state.answers[q.id] = false;
        else state.answers[q.id] = isFinite(v) ? Number(v) : v;
      }
    })();
    input.addEventListener('change', (e) => {
      const v = e.target.value;
      if (v === 'true') state.answers[q.id] = true;
      else if (v === 'false') state.answers[q.id] = false;
      else state.answers[q.id] = isFinite(v) ? Number(v) : v;
      validateField(q);
    });
  } else if (q.type === 'checkboxes') {
    const boxWrap = document.createElement('div');
    q.options.forEach(o => {
      const id = `${q.id}_${o.val}`;
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.id = id;
      cb.checked = (state.answers[q.id] && state.answers[q.id][o.val]) || false;
      cb.addEventListener('change', (e) => {
        state.answers[q.id] = state.answers[q.id] || {};
        state.answers[q.id][o.val] = e.target.checked;
        validateField(q);
      });
      const lab = document.createElement('label'); lab.htmlFor = id; lab.textContent = ' ' + o.label;
      const row = document.createElement('div'); row.appendChild(cb); row.appendChild(lab);
      boxWrap.appendChild(row);
    });
    container.appendChild(boxWrap);
    input = null;
  } else {
    input = document.createElement('input');
    input.type = 'number';
    input.placeholder = q.placeholder || '';
    input.min = '0';
    input.id = q.id;
    if (q.required) input.required = true;
    input.value = state.answers[q.id] ?? '';
    input.addEventListener('input', (e) => {
      const v = e.target.value;
      state.answers[q.id] = v === '' ? '' : Number(v);
      validateField(q);
    });
  }

  // append input (or checkbox wrapper) once
  if (input) container.appendChild(input);
  // error message placeholder
  const err = document.createElement('div'); err.className = 'error-message'; err.id = q.id + '-error'; err.textContent = '';
  container.appendChild(err);
  // helper text placeholder (optional)
  const help = document.createElement('div'); help.className = 'help-text'; help.id = q.id + '-help'; help.textContent = '';
  container.appendChild(help);
  root.appendChild(container);

  prevBtn.disabled = state.idx === 0;
  nextBtn.textContent = state.idx === questions.length - 1 ? 'Finish' : 'Next';

  const pct = Math.round((state.idx) / questions.length * 100);
  progressBar.style.width = pct + '%';
}

function validateField(q) {
  const errEl = document.getElementById(q.id + '-error');
  if (!errEl) return true;
  errEl.textContent = '';
  const val = state.answers[q.id];
  if (q.required) {
    const present = (q.type === 'checkboxes') ? (val && Object.values(val).some(Boolean)) : (val != null && val !== '');
    if (!present) { errEl.textContent = 'Required'; return false; }
  }
  if (q.type === 'number' && val != null && val !== '' && Number.isNaN(Number(val))) { errEl.textContent = 'Enter a valid number'; return false; }
  if (q.type === 'number' && val != null && val < 0) { errEl.textContent = 'Must be non-negative'; return false; }
  return true;
}

function showResults() {
  // Convert qualitative answers into numeric inputs expected by formulas.js
  const mapped = mapQualitativeToNumeric(state.answers);
  const result = computeTotalPoints(mapped);
  const pts = result.points;
  document.getElementById('score').textContent = pts;
  const label = document.getElementById('score-label');
  if (result.perPersonKg <= 1000) label.textContent = 'Excellent — low footprint';
  else if (result.perPersonKg <= 5000) label.textContent = 'Good — some improvements';
  else if (result.perPersonKg <= 10000) label.textContent = 'Average — room for change';
  else label.textContent = 'High — consider lifestyle changes';

  // store last computed metadata for potential leaderboard save
  state._lastResult = result;

  questionArea.classList.add('hidden');
  resultArea.classList.remove('hidden');
  // show leaderboarding input prefill
  const nameInput = document.getElementById('nameInput');
  nameInput.value = localStorage.getItem('carbon_game_last_name') || '';
  renderLeaderboardPreview();
}

// Map qualitative answers into numeric fields used by formulas.js
function mapQualitativeToNumeric(answers) {
  const out = {};
  const hh = Number(answers.householdSize) || 1;
  out.householdSize = hh;

  // Base household electricity (monthly) scaled by household size (national avg 880.5)
  let baseElectric = 880.5 * (hh / 2.51);

  // Shower (kWh per person per month) estimates
  const showerMap = { '<5': 20, '5-10': 40, '10-20': 80, '>20': 140 };
  const perPersonShowerKwh = showerMap[answers.showerLength] || 40;

  // Devices charging/left on
  const deviceMap = { none: 5, few: 20, many: 60 };
  const devicesKwh = deviceMap[answers.devices] || 20;

  // AC usage estimate
  const acMap = { never: 0, sometimes: 100, often: 300 };
  const acKwh = acMap[answers.acUse] || 0;

  // LED bulbs effect: if none, assume higher electricity use
  const ledMap = { most: 0, some: 20, none: 40 };
  const ledKwh = ledMap[answers.ledBulbs] || 20;

  // Flights convert to flight hours roughly
  const flightsMap = { never: 0, once: 5, few: 20 };
  const flightHours = flightsMap[answers.flights] || 0;

  // Driving mapping
  const drivingMap = { rare: 20, sometimes: 100, often: 300, daily: 500 };
  const milesPerWeek = answers.carOwnership === 'no' ? 0 : (drivingMap[answers.drivingFrequency] || 100);
  out.milesPerWeek = milesPerWeek;
  out.mpg = answers.carOwnership === 'ev' ? 0 : 24.8; // mpg 0 for EV (we'll add electricity instead)
  out.maintenance = true;

  // If EV, convert driving to electricity (kWh): average 0.3 kWh/mile
  let evExtraKwh = 0;
  if (answers.carOwnership === 'ev') {
    const milesPerYear = (milesPerWeek || 0) * 52;
    evExtraKwh = milesPerYear * 0.3 / 12; // monthly
    // gas-driven vehicle emissions will be 0
    out.milesPerWeek = 0;
  }

  // Sum monthly electricity components
  const showerTotalKwh = perPersonShowerKwh * hh; // assume each person similar showers
  // If user provided monthly bill, use it to derive kWh (more accurate)
  let monthlyElectricityKwh;
  if (answers.monthlyElectricityBill > 0) {
    monthlyElectricityKwh = Math.round(answers.monthlyElectricityBill / ELECTRICITY_PRICE_PER_KWH);
  } else {
    monthlyElectricityKwh = Math.round(baseElectric + showerTotalKwh + devicesKwh + acKwh + ledKwh + evExtraKwh + (Number(answers.screenHoursPerDay || 0) * 30 * 0.05) + ((Number(answers.laundryLoadsPerWeek || 0) * 4.3) * 2.5));
  }
  out.monthlyElectricityKwh = monthlyElectricityKwh;

  // Map shower heating to gas/fuel/propanes depending on heating type
  const heating = answers.heatingType || 'unknown';
  if (heating === 'natgas') {
    // convert shower kWh to therms: 1 therm ~ 29.3 kWh
    const monthlyTherms = (showerTotalKwh) / 29.3;
    out.natgasMonthlyTherms = Math.round(monthlyTherms * 10) / 10;
  } else if (heating === 'fuelOil') {
    // convert kWh to gallons of fuel oil (BTU-based) rough estimate: 1 gallon fuel oil ~ 137,394 BTU ~ 40.3 kWh
    const gallons = showerTotalKwh / 40.3;
    out.fuelOilMonthlyGallons = Math.round(gallons * 10) / 10;
  } else if (heating === 'propane') {
    const gallons = showerTotalKwh / 26.9; // propane ~26.9 kWh/gal
    out.propaneMonthlyGallons = Math.round(gallons * 10) / 10;
  } else {
    // electric or unknown -> include shower in electricity already
  }

  // Recycling mapping
  const recycling = {};
  if (answers.recyclingLevel === 'lots') {
    recycling.metal = recycling.plastic = recycling.glass = recycling.newspaper = recycling.magazines = true;
  } else if (answers.recyclingLevel === 'some') {
    recycling.metal = recycling.plastic = true;
  }
  out.recycling = recycling;

  // flights
  out.flight_hours = flightHours;

  // takeout meals -> approximate lbs CO2 per meal (~2 kg = 4.4 lbs)
  const takeoutPerMealLbs = 4.4;
  const takeoutCount = Number(answers.takeoutMealsPerWeek || 0);
  const additionalLbs = takeoutCount * 52 * takeoutPerMealLbs;
  out.additionalLbs = additionalLbs;

  // natural gas/fuel oil/propane defaults to 0 if not set
  out.natgasMonthlyTherms = out.natgasMonthlyTherms || 0;
  out.fuelOilMonthlyGallons = out.fuelOilMonthlyGallons || 0;
  out.propaneMonthlyGallons = out.propaneMonthlyGallons || 0;

  return out;
}

// Server submit helper: posts score payload to a user-supplied endpoint (e.g., Supabase function or API)
async function submitScoreToServer(endpoint, payload) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    return await res.json();
  } catch (err) {
    throw err;
  }
}

// expose a small UI action for server submit
const serverSubmitBtn = document.createElement('button');
serverSubmitBtn.className = 'btn';
serverSubmitBtn.textContent = 'Share score (server)';
serverSubmitBtn.style.marginLeft = '8px';
serverSubmitBtn.addEventListener('click', async () => {
  if (!state._lastResult) return alert('No result to share.');
  const endpoint = prompt('Paste your server endpoint URL (POST JSON). For Supabase use a server-side function URL.');
  if (!endpoint) return;
  const name = document.getElementById('nameInput').value.trim() || 'Anonymous';
  const payload = { name, points: state._lastResult.points, perPersonKg: state._lastResult.perPersonKg, timestamp: Date.now() };
  try {
    await submitScoreToServer(endpoint, payload);
    alert('Score submitted to server.');
  } catch (e) {
    alert('Failed to submit: ' + e.message);
  }
});

// append server submit button next to save button in result area (once DOM loaded)
document.addEventListener('DOMContentLoaded', () => {
  const submitBtn = document.getElementById('submitLeaderboardBtn');
  if (submitBtn && submitBtn.parentNode) submitBtn.parentNode.appendChild(serverSubmitBtn);
});

prevBtn.addEventListener('click', () => {
  if (state.idx > 0) { state.idx--; renderQuestion(); }
});

nextBtn.addEventListener('click', () => {
  // basic validation: numbers should be >=0 and required fields must be present
  const q = questions[state.idx];
  // inline validate current field
  const ok = validateField(q);
  if (!ok) return; // error displayed inline

  if (state.idx < questions.length - 1) { state.idx++; renderQuestion(); }
  else {
      // final validation across all required fields (show inline errors)
      let firstInvalidIndex = -1;
      questions.forEach((x, i) => { const valid = validateField(x); if (!valid && firstInvalidIndex === -1) firstInvalidIndex = i; });
      if (firstInvalidIndex !== -1) { state.idx = firstInvalidIndex; renderQuestion(); return; }
      showResults();
    }
});

if (restartBtn) {
  restartBtn.addEventListener('click', () => {
    state.idx = 0; state.answers = {}; resultArea.classList.add('hidden'); questionArea.classList.remove('hidden'); renderQuestion();
  });
}

// initial render
initDefaults();
  renderQuestion();

  // --- Leaderboard functionality (localStorage) ---
  const LB_KEY = 'carbon_game_leaderboard_v1';

function getLeaderboard() {
  try { return JSON.parse(localStorage.getItem(LB_KEY) || '[]'); } catch { return []; }
}

function saveLeaderboardEntry(name, points, perPersonKg) {
  const list = getLeaderboard();
  const entry = { name: name || 'Anonymous', points, perPersonKg, ts: Date.now() };
  list.push(entry);
  // sort ascending (lower points is better)
  list.sort((a, b) => a.points - b.points || a.ts - b.ts);
  // keep top 50
  const kept = list.slice(0, 50);
  localStorage.setItem(LB_KEY, JSON.stringify(kept));
  localStorage.setItem('carbon_game_last_name', entry.name);
  return kept;
}

function renderLeaderboardList(container) {
  const list = getLeaderboard();
  if (!list.length) { container.textContent = 'No entries yet.'; return; }
  const table = document.createElement('table');
  table.style.width = '100%';
  table.innerHTML = `<thead><tr><th>#</th><th>Name</th><th>Points</th><th>kg/person/yr</th></tr></thead>`;
  const body = document.createElement('tbody');
  list.forEach((e, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${escapeHtml(e.name)}</td><td>${e.points}</td><td>${Math.round(e.perPersonKg)}</td>`;
    body.appendChild(tr);
  });
  table.appendChild(body);
  container.innerHTML = '';
  container.appendChild(table);
}

function renderLeaderboardPreview() {
  const lbContainer = document.getElementById('leaderboard-list');
  renderLeaderboardList(lbContainer);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

// wire leaderboard buttons
const submitHandler = async () => {
  const name = document.getElementById('nameInput').value.trim() || 'Anonymous';
  if (!state._lastResult) return alert('No result to save.');
  const payload = { name, points: state._lastResult.points, perPersonKg: state._lastResult.perPersonKg };
  try {
    const res = await fetch('/api/carbon-game/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || ('Server responded ' + res.status));
    }
    // also keep local copy
    saveLeaderboardEntry(name, state._lastResult.points, state._lastResult.perPersonKg);
    renderLeaderboardPreview();
    // show leaderboard after successful submit
    resultArea.classList.add('hidden');
    document.getElementById('leaderboard-area').classList.remove('hidden');
  } catch (e) {
    // save locally on failure and still show leaderboard
    saveLeaderboardEntry(name, state._lastResult.points, state._lastResult.perPersonKg);
    renderLeaderboardPreview();
    resultArea.classList.add('hidden');
    document.getElementById('leaderboard-area').classList.remove('hidden');
  }
};

const submitBtnEl = document.getElementById('submitLeaderboardBtn');
if (submitBtnEl) submitBtnEl.addEventListener('click', submitHandler);

  document.getElementById('exportToCardBtn').addEventListener('click', async () => {
    if (!state._lastResult) return alert('No result to export.');
    const name = document.getElementById('nameInput').value.trim() || 'Anonymous';
    const payload = { name, points: state._lastResult.points, perPersonKg: Math.round(state._lastResult.perPersonKg) };
    try {
      const res = await fetch('/api/carbon-game/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Export failed');
      const json = await res.json();
      const token = json.token;
      // Redirect to app page to claim the token (app will claim it server-side)
      window.location.href = `/app/my-card?import_token=${encodeURIComponent(token)}`;
    } catch (e) {
      // fallback to query param redirect (less secure)
      const nameEnc = encodeURIComponent(name);
      const points = encodeURIComponent(state._lastResult.points);
      const perPersonKg = encodeURIComponent(Math.round(state._lastResult.perPersonKg));
      window.location.href = `/app/my-card?import_carbon_score=1&name=${nameEnc}&points=${points}&kg=${perPersonKg}`;
    }
  });

  // clear button removed in simplified UI
}

// Start when DOM is ready
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startCarbonGame);
else startCarbonGame();

