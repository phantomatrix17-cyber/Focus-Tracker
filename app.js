const input = document.querySelector("#input");
const time = document.querySelector("#time");
const startBtn = document.querySelector(".startBtn");
const box = document.querySelectorAll(".box");

const timerControls = document.querySelector(".timer-controls");
const timerCircle = document.querySelector(".timer-circle");
const loadingProgress = document.querySelector(".loadingProgress");
const load = document.querySelector(".load");

const pauseBtn = document.querySelector("#pauseBtn");

let area;
let timing = null;
let timeLeft = 0;
let initialTime = 0;
let endTime = null;

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
    if (timing === null) {
      start();
    } else {
      stop();
    }
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
