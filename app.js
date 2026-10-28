const input = document.querySelector("#input");
const time = document.querySelector("#time");
const startBtn = document.querySelector(".startBtn");
const box = document.querySelectorAll(".box");

const timerControls = document.querySelector(".timer-controls");
const timerCircle = document.querySelector(".timer-circle");
const loadingProgress = document.querySelector(".loadingProgress");
const load = document.querySelector(".load");
const display = document.querySelector(".display");
const percentage = document.querySelector(".percentage");
const division = document.querySelector(".division");
const divisionMini = document.querySelector(".divisionMini");
const Clear = document.querySelector(".Clear");

const pauseBtn = document.querySelector("#pauseBtn");
const themeToggle = document.querySelector(".change");
const colorChange = document.querySelector(".color-change");

let area;
let timing = null;
let timeLeft = 0;
let initialTime = 0;
let endTime = null;
let container = JSON.parse(localStorage.getItem("focusKey")) || [];
let nextId = localStorage.getItem("focusId") || 1;

let months = [
  " JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

colorChange.addEventListener("click", function () {
  document.body.classList.toggle("light-mode");
  themeToggle.classList.toggle("active");

  const isLight = document.body.classList.contains("light-mode");

  localStorage.setItem("theme", isLight ? "light" : "dark");
});
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light-mode");
}

// Preset buttons
box.forEach((b) => {
  b.addEventListener("click", function () {
    input.value = b.getAttribute("value");
  });
});

// Set the timer duration
startBtn.addEventListener("click", function () {
  const duration = Number(input.value);

  if (
    input.value.trim() === "" ||
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    window.alert("Invalid input");
    return;
  }

  clearInterval(timing);
  timing = null;
  endTime = null;

  area = duration;
  initialTime = area * 60;
  timeLeft = initialTime;

  pauseBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
      <path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"/>
    </svg>
    <p>Start</p>
  `;

  input.value = "";
  refresh();
});

// Display the selected duration
function refresh() {
  time.textContent = calculation(timeLeft);
  updateProgress();
}

// Format seconds into a readable time
function calculation(index) {
  const hour = Math.floor(index / 3600);
  const minute = Math.floor((index % 3600) / 60);
  const seconds = Math.floor(index % 60);

  let timeCount = "";

  if (hour > 0) {
    timeCount += `${String(hour).padStart(2, "0")}:`;
  }

  if (minute > 0 || hour > 0) {
    timeCount += `${String(minute).padStart(2, "0")}:`;
  }

  timeCount += String(seconds).padStart(2, "0");

  return timeCount;
}

// Update the circle and loading bar
function updateProgress() {
  if (!initialTime || initialTime <= 0) {
    return;
  }

  const elapsedTime = initialTime - timeLeft;

  const progress = Math.min(
    100,
    Math.max(0, (elapsedTime / initialTime) * 100),
  );

  timerCircle.style.background = `conic-gradient(var(--primary) ${progress}%, var(--border) ${progress}% 100%)`;

  loadingProgress.style.background = `conic-gradient(var(--primary) ${progress}%, var(--border) ${progress}% 100%)`;

  load.style.width = `${progress}%`;

  percentage.textContent = `${Math.floor(progress)}%`;
  const progressDivision = Math.min(4, Math.floor(progress / 25) + 1);

  division.textContent = `${progressDivision}/4`;
  divisionMini.textContent = progressDivision;
}

// Timer control buttons
timerControls.addEventListener("click", function (e) {
  const resetBtn = e.target.closest("#resetBtn");
  const clickedPauseBtn = e.target.closest("#pauseBtn");
  const stopBtn = e.target.closest("#stopBtn");

  if (resetBtn) {
    reset();
  } else if (clickedPauseBtn) {
    if (timing === null) {
      start();
    } else {
      pause();
    }
  } else if (stopBtn) {
    stop();
  }
});

// Start or resume the countdown
function start() {
  // Prevent multiple intervals or starting without a duration
  if (timing !== null || timeLeft <= 0) {
    return;
  }

  // Create a new deadline from the remaining time
  endTime = Date.now() + timeLeft * 1000;

  pauseBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
      <path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"/>
    </svg>
    <p>Pause</p>
  `;

  // Update immediately, then keep refreshing the display
  updateTimer();

  if (timeLeft > 0) {
    timing = setInterval(updateTimer, 250);
  }
}

// Recalculate the remaining time from the deadline
function updateTimer() {
  if (endTime === null) {
    return;
  }

  const now = Date.now();

  timeLeft = Math.max(0, Math.ceil((endTime - now) / 1000));

  time.textContent = calculation(timeLeft);
  updateProgress();

  // Countdown finished
  if (timeLeft === 0) {
    clearInterval(timing);
    timing = null;
    endTime = null;
    pushing();
    saveData();
  }
}

// Pause the countdown
function pause() {
  if (timing === null) {
    return;
  }

  // Calculate the accurate remaining time before pausing
  updateTimer();

  // The timer may have finished during that update
  if (timing === null) {
    return;
  }

  clearInterval(timing);
  timing = null;
  endTime = null;

  pauseBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
      <path d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z"/>
    </svg>
    <p>Resume</p>
  `;
}

// Stop and clear the timer
function stop() {
  clearInterval(timing);
  timing = null;
  endTime = null;

  area = 0;
  initialTime = 0;
  timeLeft = 0;

  time.textContent = "00:00";

  timerCircle.style.background = "var(--border)";
  loadingProgress.style.background = "var(--border)";
  load.style.width = "0%";
}

// Reset to the originally selected duration
function reset() {
  clearInterval(timing);
  timing = null;
  endTime = null;

  timeLeft = initialTime;

  time.textContent = calculation(timeLeft);
  updateProgress();

  pauseBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
      <path d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z"/>
    </svg>
    <p>Resume</p>
  `;
}

function pushing() {
  if (!area || area <= 0) {
    return;
  }

  let dateData = new Date();
  let day = dateData.getDate();
  let month = dateData.getMonth();
  const hours = String(dateData.getHours()).padStart(2, "0");
  const minutes = String(dateData.getMinutes()).padStart(2, "0");

  container.push({
    id: nextId++,
    task: `${area} min`,
    data: `${day} ${months[month]}  ·  ${hours}:${minutes}`,
  });
  updateDisplay();
}

function updateDisplay() {
  let item = container.map((m) => {
    return ` <div class="card" data-id="${m.id}">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                    <path
                      d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"
                    />
                  </svg>
                  <p>${m.task}</p>
                </div>
                <small>${m.data}</small>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                  <path
                    d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"
                  />
                </svg>
              </div>`;
  });

  item = item.join("");
  display.innerHTML = item;
}

function saveData() {
  localStorage.setItem("focusKey", JSON.stringify(container));
  localStorage.setItem("focusId", nextId);
}

Clear.addEventListener("click", function () {
  localStorage.clear("focusKey");
  localStorage.clear("focusId");
  display.innerHTML = "";
  container = [];
  nextId = 1;
});

updateDisplay();
