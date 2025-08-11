/* ======= Museum Mystery Quiz ======= */
const $ = (sel) => document.querySelector(sel);
const btnStart = $('#startBtn');
const btnReset = $('#resetBtn');
const btnNext = $('#nextBtn');
const btnFinish = $('#finishBtn');
const btnPlayAgain = $('#playAgainBtn');

const elQ = $('#question');
const elChoices = $('#choices');
const elQuiz = $('#quiz');
const elResult = $('#result');
const elQNum = $('#qNum');
const elQTotal = $('#qTotal');
const elScore = $('#score');
const elTime = $('#time');
const elBest = $('#best');
const elFinal = $('#finalScore');
const elFinalTotal = $('#finalTotal');
const elBestNote = $('#bestNote');

document.getElementById('year').textContent = new Date().getFullYear();

/* ---- Questions (customize freely) ---- */
const QUESTIONS = [
  {
    q: "Obsidian spearheads are primarily made from…",
    choices: ["Volcanic glass", "Basalt", "Granite", "Bone"],
    answer: 0,
    note: "Volcanic glass = obsidian; sharp and common in lithic tools."
  },
  {
    q: "‘Ushabti’ figures in Egyptian burials were intended to…",
    choices: ["Guard the tomb", "Hold kohl", "Serve the deceased in the afterlife", "Store grain"],
    answer: 2
  },
  {
    q: "Coprolite is the term for…",
    choices: ["Ancient pigment", "Fossilized dung", "Bronze alloy", "Clay tablet"],
    answer: 1
  },
  {
    q: "A corded storage jar’s ‘cord impression’ typically comes from…",
    choices: ["Decoration after firing", "Rope wrapped during forming", "Shipping damage", "Mineral veins"],
    answer: 1
  },
  {
    q: "Basaltic glyphstones most likely originate from…",
    choices: ["Volcanic contexts", "River deltas", "Limestone caves", "Peat bogs"],
    answer: 0
  },
  {
    q: "Kohl containers were used in antiquity for…",
    choices: ["Storing perfume", "Cosmetic eye paint", "Incense ash", "Medicinal herbs"],
    answer: 1
  },
  {
    q: "Cranial vault fragments are part of the…",
    choices: ["Pelvis", "Skull", "Hand", "Foot"],
    answer: 1
  },
  {
    q: "Obsidian tools often show this manufacturing clue:",
    choices: ["Billet flaking & conchoidal fracture", "Casting seams", "Weaving pattern", "Kiln stamps"],
    answer: 0
  },
  {
    q: "A midden is best described as…",
    choices: ["A burial chamber", "A storage pit", "A refuse deposit", "A kiln"],
    answer: 2
  },
  {
    q: "Faience amulets are typically associated with which culture?",
    choices: ["Norse", "Egyptian", "Han Chinese", "Maya"],
    answer: 1
  }
];

const QUIZ_LENGTH = 10;       // ask all questions (or set < 10 to sample)
const TIMER_SECS  = 90;

let order = [];
let i = 0;
let score = 0;
let picking = true;
let timer = null;
let secondsLeft = TIMER_SECS;

function fmt(n){ return String(n).padStart(2,'0'); }
function renderTime(){
  const m = Math.floor(secondsLeft/60), s = secondsLeft%60;
  elTime.textContent = `${fmt(m)}:${fmt(s)}`;
}
function tick(){
  secondsLeft--;
  renderTime();
  if(secondsLeft <= 0){ finish(); }
}
function startTimer(){
  secondsLeft = TIMER_SECS;
  renderTime();
  timer = setInterval(tick, 1000);
}
function stopTimer(){ if(timer){ clearInterval(timer); timer=null; } }

function shuffle(arr){
  for(let j=arr.length-1;j>0;j--){
    const k = Math.floor(Math.random()*(j+1));
    [arr[j],arr[k]]=[arr[k],arr[j]];
  }
  return arr;
}

function start(){
  order = shuffle([...Array(QUIZ_LENGTH).keys()]);
  i = 0;
  score = 0;
  picking = true;
  elScore.textContent = score;
  elQTotal.textContent = QUIZ_LENGTH;
  elResult.hidden = true;
  elQuiz.hidden = false;
  btnNext.disabled = true;
  btnFinish.hidden = true;
  startTimer();
  renderQ();
}

function reset(){
  stopTimer();
  elQuiz.hidden = false;
  elResult.hidden = true;
  elChoices.innerHTML = '';
  elQ.textContent = 'Click “Start Quiz”';
  elQNum.textContent = '0';
  elQTotal.textContent = QUIZ_LENGTH;
  elScore.textContent = '0';
  btnNext.disabled = true;
  btnFinish.hidden = true;
  secondsLeft = TIMER_SECS; renderTime();
}

function renderQ(){
  const idx = order[i];
  const Q = QUESTIONS[idx];
  elQNum.textContent = i+1;
  elQ.textContent = Q.q;
  elChoices.innerHTML = '';

  Q.choices.forEach((text, k) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.className = 'choice';
    b.type = 'button';
    b.textContent = text;
    b.setAttribute('aria-pressed','false');
    b.addEventListener('click', () => pick(k, Q.answer, b));
    b.addEventListener('keyup', (e)=>{ if(e.key==='Enter' || e.key===' '){ pick(k,Q.answer,b); }});
    li.appendChild(b);
    elChoices.appendChild(li);
  });

  btnNext.disabled = true;
  btnFinish.hidden = (i !== QUIZ_LENGTH-1);
  picking = true;
}

function pick(k, correctIndex, btn){
  if(!picking) return;
  picking = false;

  // mark pressed
  Array.from(document.querySelectorAll('.choice')).forEach(c => c.setAttribute('aria-pressed','false'));
  btn.setAttribute('aria-pressed','true');

  // mark correctness
  const all = Array.from(document.querySelectorAll('.choice'));
  all.forEach((c, idx) => {
    if(idx === correctIndex) c.classList.add('correct');
    if(idx === k && k !== correctIndex) c.classList.add('incorrect');
    c.disabled = true;
  });

  if(k === correctIndex){ score += 10; elScore.textContent = score; }
  btnNext.disabled = (i === QUIZ_LENGTH-1); // disable at last; use Finish instead
}

function next(){
  if(i < QUIZ_LENGTH-1){
    i++;
    renderQ();
  }
}

function finish(){
  stopTimer();
  elQuiz.hidden = true;
  elResult.hidden = false;
  elFinal.textContent = score;
  elFinalTotal.textContent = QUIZ_LENGTH*10;

  // High score
  const best = Number(localStorage.getItem('museumQuizBest') || 0);
  if(score > best){
    localStorage.setItem('museumQuizBest', String(score));
    elBestNote.hidden = false;
  } else {
    elBestNote.hidden = true;
  }
  updateBest();
}

function updateBest(){
  elBest.textContent = localStorage.getItem('museumQuizBest') || '0';
}

/* === Events === */
btnStart.addEventListener('click', start);
btnReset.addEventListener('click', reset);
btnNext.addEventListener('click', next);
btnFinish.addEventListener('click', finish);
btnPlayAgain.addEventListener('click', start);

updateBest();
reset();
