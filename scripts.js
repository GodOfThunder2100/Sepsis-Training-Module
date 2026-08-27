// ============ STATE MANAGEMENT ============
let currentStep = 0;
const totalSteps = 6;

const cover = document.getElementById('cover');
const fork = document.getElementById('fork');
const app = document.getElementById('app');
const roleBadge = document.getElementById('role-badge');

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const currentStepNum = document.getElementById('current-step-num');
const totalStepsNum = document.getElementById('total-steps-num');

// ============ INITIALIZATION ============
document.getElementById('start-course-btn').addEventListener('click', () => {
  cover.classList.add('hidden');
  const savedRole = localStorage.getItem('sepsis-training-role');
  if (savedRole) {
    setRole(savedRole);
  } else {
    fork.classList.remove('hidden');
  }
});

function setRole(role) {
  document.body.classList.remove('role-clinical', 'role-support');
  document.body.classList.add(role === 'clinical' ? 'role-clinical' : 'role-support');

  const roleLabel = role === 'clinical'
    ? 'Nurse / RUSON track'
    : 'Everyone else track';

  roleBadge.textContent = roleLabel;

  fork.classList.add('hidden');
  app.classList.remove('hidden');

  localStorage.setItem('sepsis-training-role', role);

  currentStep = 0;
  updateStepView();
  renderQuiz();
  resetScenarios();
  updateVitalsForStep();
  window.scrollTo(0, 0);
}

document.querySelectorAll('.path-card').forEach((card) => {
  card.addEventListener('click', () => setRole(card.dataset.role));
});

document.getElementById('switch-role').addEventListener('click', () => {
  app.classList.add('hidden');
  fork.classList.remove('hidden');
});

// ============ LINEAR STEP NAVIGATION ============
function updateStepView() {
  document.querySelectorAll('.panel').forEach((panel) => {
    panel.classList.remove('active');
    if (parseInt(panel.dataset.panel, 10) === currentStep) {
      panel.classList.add('active');
    }
  });

  document.querySelectorAll('.step-node').forEach((node) => {
    const stepIdx = parseInt(node.dataset.step, 10);
    node.classList.remove('active', 'completed');
    if (stepIdx === currentStep) {
      node.classList.add('active');
    } else if (stepIdx < currentStep) {
      node.classList.add('completed');
    }
  });

  const fillPercentage = (currentStep / (totalSteps - 1)) * 80;
  document.getElementById('progress-fill').style.width = `${fillPercentage}%`;

  currentStepNum.textContent = currentStep + 1;
  if (totalStepsNum) totalStepsNum.textContent = totalSteps;

  prevBtn.disabled = currentStep === 0;

  if (currentStep === totalSteps - 1) {
    nextBtn.textContent = 'Finish Course';
  } else {
    nextBtn.textContent = 'Next \u2192';
  }

  updateVitalsForStep();
  window.scrollTo(0, 0);
}

prevBtn.addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep--;
    updateStepView();
  }
});

nextBtn.addEventListener('click', () => {
  if (currentStep < totalSteps - 1) {
    currentStep++;
    updateStepView();
  } else {
    alert('Training module completed! Your results have been recorded.');
  }
});

// ============ VITALS HELPERS ============
function setVital(id, value, thresholds) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;

  el.parentElement.classList.remove('warning', 'danger');

  if (value < thresholds.low || value > thresholds.high) {
    el.parentElement.classList.add('danger');
  } else if (
    (thresholds.lowWarn && value < thresholds.lowWarn) ||
    (thresholds.highWarn && value > thresholds.highWarn)
  ) {
    el.parentElement.classList.add('warning');
  }
}

function updateVitalsForStep() {
  // Example: only show “abnormal” vitals on step 2 (panel index 1)
  if (currentStep === 1) {
    setVital('rr-value', 24, { low: 12, high: 20, lowWarn: 12, highWarn: 22 });
    setVital('hr-value', 112, { low: 60, high: 100, lowWarn: 50, highWarn: 110 });
    setVital('temp-value', 37.2, { low: 36.0, high: 37.5, lowWarn: 36.0, highWarn: 38.0 });
    setVital('sbp-value', 98, { low: 110, high: 140, lowWarn: 100, highWarn: 150 });
  } else {
    // Normal-ish values on other steps
    setVital('rr-value', 18, { low: 12, high: 20, lowWarn: 12, highWarn: 22 });
    setVital('hr-value', 88, { low: 60, high: 100, lowWarn: 50, highWarn: 110 });
    setVital('temp-value', 36.8, { low: 36.0, high: 37.5, lowWarn: 36.0, highWarn: 38.0 });
    setVital('sbp-value', 128, { low: 110, high: 140, lowWarn: 100, highWarn: 150 });
  }
}

// ============ CASE SCENARIO ============
function resetScenarios() {
  document.querySelectorAll('.scenario').forEach((scenario) => {
    const options = scenario.querySelectorAll('.option');
    const feedback = scenario.querySelector('.scenario-feedback');
    options.forEach((opt) => opt.classList.remove('correct', 'incorrect'));
    if (feedback) feedback.textContent = '';
  });
}

document.querySelectorAll('.scenario-options').forEach((group) => {
  const correctIndex = parseInt(group.dataset.correct, 10);
  const feedback = group.parentElement.querySelector('.scenario-feedback');
  const options = group.querySelectorAll('.option');

  options.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      options.forEach((b) => b.classList.remove('correct', 'incorrect'));
      if (i === correctIndex) {
        btn.classList.add('correct');
        feedback.textContent = 'Right — escalating promptly is the safest call here.';
        feedback.style.color = 'var(--fern)';
      } else {
        btn.classList.add('incorrect');
        options[correctIndex].classList.add('correct');
        feedback.textContent = 'Not quite — the safest response is highlighted above.';
        feedback.style.color = 'var(--alert)';
      }
    });
  });
});

// ============ QUIZ ============
const quizBank = {
  clinical: [
    {
      q: "Which of these is often the FIRST sign of sepsis in an older adult, rather than fever?",
      choices: ["New or worsening confusion", "A rash", "Joint pain", "Loss of taste"],
      correct: 0,
    },
    {
      q: "A resident has RR 25, HR 112, Temp 37.2°C. What should happen?",
      choices: ["Wait for a fever to develop first", "Escalate now — this meets deterioration criteria", "Document only, review tomorrow", "Nothing — temp is normal"],
      correct: 1,
    },
    {
      q: "In ISBAR, what does the 'B' stand for?",
      choices: ["Breathing", "Background", "Bloods", "Bed number"],
      correct: 1,
    },
    {
      q: "A resident has a 'not for CPR' order but is for active treatment. They show signs of sepsis. What should you do?",
      choices: ["Withhold escalation, they're DNR", "Escalate — DNR isn't a reason to withhold assessment or treatment", "Ask the family first", "Wait until the next shift"],
      correct: 1,
    },
    {
      q: "Why don't hospital-derived early warning scores always fit residential aged care well?",
      choices: ["They're too cheap to use", "Subtle behavioural change matters more than vital-sign thresholds in frail older adults", "They take too long to calculate", "They're not evidence-based"],
      correct: 1,
    },
  ],
  support: [
    {
      q: "A resident seems confused and hasn't eaten. What should you do?",
      choices: ["Wait and see if they improve by the next meal", "Tell the nurse straight away, with details", "Note it in your head for handover", "Nothing, it's probably nothing"],
      correct: 1,
    },
    {
      q: "When you tell a nurse about a change, what's most useful to include?",
      choices: ["Just that something feels off", "Who, what you noticed, when, and how it's different from usual", "Your own guess at a diagnosis", "Nothing — nurses will figure it out"],
      correct: 1,
    },
    {
      q: "Which of these is a genuine red flag worth reporting?",
      choices: ["Resident is quieter than usual and skipped breakfast", "Resident asked for a second cup of tea", "Resident wants to watch a different TV show", "Resident is tired after a long walk outside"],
      correct: 0,
    },
    {
      q: "True or false: you need to be sure it's serious before telling a nurse.",
      choices: ["True — only report confirmed problems", "False — report what you notice, let the nurse assess"],
      correct: 1,
    },
    {
      q: "Why does what you notice matter so much in aged care?",
      choices: ["It doesn't really — nurses check everyone anyway", "Staffing ratios mean support staff often spend the most time with residents", "You're expected to diagnose conditions", "It's just a formality"],
      correct: 1,
    },
  ],
};

function renderQuiz() {
  const role = document.body.classList.contains('role-clinical') ? 'clinical' : 'support';
  const container = document.getElementById('quiz-container');
  if (!container) return;

  container.innerHTML = '';

  const result = document.getElementById('quiz-result');
  if (result) result.classList.add('hidden', 'low');

  quizBank[role].forEach((item, qi) => {
    const div = document.createElement('div');
    div.className = 'quiz-q';
    div.dataset.correct = item.correct;

    const choicesHtml = item.choices.map((c, ci) => `
      <label><input type="radio" name="q${qi}" value="${ci}"> ${c}</label>
    `).join('');

    div.innerHTML = `<p>${qi + 1}. ${item.q}</p><div class="quiz-choices">${choicesHtml}</div>`;
    container.appendChild(div);
  });
}

document.getElementById('quiz-submit').addEventListener('click', () => {
  const questions = document.querySelectorAll('.quiz-q');
  let score = 0;

  questions.forEach((qDiv) => {
    const correct = parseInt(qDiv.dataset.correct, 10);
    const selected = qDiv.querySelector('input:checked');
    if (selected && parseInt(selected.value, 10) === correct) {
      score++;
    }
  });

  const result = document.getElementById('quiz-result');
  result.classList.remove('hidden', 'low');

  const pct = Math.round((score / questions.length) * 100);
  if (pct < 60) {
    result.classList.add('low');
  }

  result.textContent = `Score: ${score} / ${questions.length} (${pct}%)`;

  const role = document.body.classList.contains('role-clinical') ? 'clinical' : 'support';
  localStorage.setItem(`sepsis-training-score-${role}`, pct);
});
