const duration = 60;
const endTime = Date.now() + duration * 1000;

const timing = setInterval(() => {
  const now = Date.now();

  const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

  console.log(remaining);

  if (remaining === 0) {
    clearInterval(timing);
  }
}, 1000);
