import './style.css';

function updateDate() {
  const day = document.querySelector('.date');
  const month = document.querySelector('.month');
  const weekday = document.querySelector('.day');

  if (!day || !month || !weekday) {
    // missing elements, bail early
    return;
  }

  const date = new Date();
  day.innerHTML = `${date.toLocaleString('default', {
    day: '2-digit',
  })}`;
  month.innerHTML = `${date.toLocaleString('default', { month: 'long' })}`;
  weekday.innerHTML = `${date.toLocaleString('default', {
    weekday: 'long',
  })}`;
}

function updateClock() {
  const hour = document.querySelector('.hour');
  const minute = document.querySelector('.minute');

  if (!hour || !minute) {
    // missing elements, bail early
    return;
  }

  const date = new Date();
  hour.innerHTML = `${date.toLocaleString('default', {
    hour: '2-digit',
    hour12: false,
  })}`;
  minute.innerHTML = `${
    date
      .toLocaleString('default', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .split(':')[1]
  }`;
}

window.addEventListener('onWidgetLoad', function () {
  updateDate();
  setInterval(updateClock, 1000);
});

if (import.meta.env.DEV) {
  updateDate();
  setInterval(updateClock, 1000);
}
