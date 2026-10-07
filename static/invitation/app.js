(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const safeStore = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Private mode remains functional. */ } },
  };
  const audio = $('#background-audio');
  const musicToggle = $('#music-toggle');
  const soundIcon = $('#sound-icon');
  let audioPending = false;
  audio.volume = 0.32;
  const updateAudioButton = () => {
    const playing = !audio.paused;
    musicToggle.setAttribute('aria-pressed', String(playing));
    musicToggle.setAttribute('aria-label', playing ? 'Musiqani o‘chirish' : 'Musiqani yoqish');
    soundIcon.setAttribute('href', playing ? '#icon-sound' : '#icon-muted');
  };
  const playAudio = async () => {
    if (audioPending) return;
    audioPending = true;
    musicToggle.setAttribute('aria-busy', 'true');
    try {
      await audio.play();
      safeStore.set('ag-music', 'on');
      $('#audio-status').textContent = 'Sokin ohang yoqildi.';
    } catch {
      $('#audio-status').textContent = 'Ohangni ijro etib bo‘lmadi. Musiqa tugmasini yana bosing.';
    } finally {
      audioPending = false;
      musicToggle.removeAttribute('aria-busy');
      updateAudioButton();
    }
  };
  musicToggle.hidden = false;
  musicToggle.addEventListener('click', () => {
    if (audioPending) return;
    if (audio.paused) playAudio();
    else {
      audio.pause();
      safeStore.set('ag-music', 'off');
      $('#audio-status').textContent = 'Ohang o‘chirildi.';
    }
  });
  ['play', 'pause', 'ended', 'error'].forEach((event) => audio.addEventListener(event, updateAudioButton));
  document.addEventListener('visibilitychange', () => {
    // Do not unexpectedly resume playback when returning to a tab.
    if (document.hidden && !audio.paused) audio.pause();
  });

  const welcome = $('#welcome');
  const welcomeMusic = $('#welcome-music');
  welcomeMusic.checked = safeStore.get('ag-music') !== 'off';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let previouslyOpened = false;
  try { previouslyOpened = sessionStorage.getItem('ag-opened') === 'yes'; } catch { /* Optional preference. */ }
  const finishOpening = () => {
    welcome.close();
    document.body.style.overflow = '';
    try { sessionStorage.setItem('ag-opened', 'yes'); } catch { /* Optional preference. */ }
    $('#couple-names').setAttribute('tabindex', '-1');
    $('#couple-names').focus({ preventScroll: true });
  };
  $('#open-invitation').addEventListener('click', () => {
    if (welcomeMusic.checked) playAudio();
    else safeStore.set('ag-music', 'off');
    $('#open-invitation').disabled = true;
    welcome.classList.add('is-opening');
    window.setTimeout(finishOpening, reducedMotion ? 0 : 450);
  });
  welcome.addEventListener('close', () => { document.body.style.overflow = ''; });
  welcome.addEventListener('cancel', () => {
    try { sessionStorage.setItem('ag-opened', 'yes'); } catch { /* Optional preference. */ }
  });
  // Direct section links and form validation pages must remain immediately usable.
  if (!previouslyOpened && !location.hash && !$('#form-status').textContent.trim() && typeof welcome.showModal === 'function') {
    welcome.showModal();
    document.body.style.overflow = 'hidden';
  }

  const eventTime = Date.parse(document.body.dataset.eventDate);
  const updateCountdown = () => {
    let remaining = Math.max(0, Math.floor((eventTime - Date.now()) / 1000));
    if (!Number.isFinite(remaining)) return;
    const values = { days: Math.floor(remaining / 86400), hours: Math.floor(remaining / 3600) % 24, minutes: Math.floor(remaining / 60) % 60, seconds: remaining % 60 };
    Object.entries(values).forEach(([key, value]) => { $('#' + key).textContent = String(value).padStart(2, '0'); });
    if (remaining === 0) $('#countdown-heading').textContent = 'SAODATLI KUNIMIZ KELDI · XUSH KELIBSIZ!';
  };
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  const prayerButton = $('#prayer-button');
  prayerButton.hidden = false;
  const showPrayerThanks = () => {
    prayerButton.classList.add('is-sent');
    prayerButton.setAttribute('aria-pressed', 'true');
    prayerButton.querySelector('use').setAttribute('href', '#icon-check');
    prayerButton.querySelector('span').textContent = 'Alloh qabul qilsin';
    $('#prayer-thanks').textContent = 'Samimiy duolaringiz uchun rahmat. Omin!';
  };
  if (safeStore.get('ag-prayed') === 'yes') showPrayerThanks();
  else prayerButton.setAttribute('aria-pressed', 'false');
  prayerButton.addEventListener('click', () => {
    safeStore.set('ag-prayed', 'yes');
    showPrayerThanks();
  });

  const form = $('#rsvp-form');
  const status = $('#form-status');
  const updateGuestField = () => {
    const declined = form.querySelector('[name=attendance]:checked')?.value === 'no';
    $('#guests-field').hidden = declined;
    $('#guest-count').disabled = declined;
  };
  form.querySelectorAll('[name=attendance]').forEach((radio) => radio.addEventListener('change', updateGuestField));
  updateGuestField();
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('[type=submit]');
    if (submit.disabled || !form.reportValidity()) return;
    submit.disabled = true;
    submit.querySelector('span').textContent = 'Yuborilmoqda…';
    status.textContent = '';
    status.classList.remove('success');
    form.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, credentials: 'same-origin', signal: controller.signal });
      if (!response.headers.get('content-type')?.includes('application/json')) {
        throw new Error(response.status === 403 ? 'Sahifa muddati tugagan. Sahifani yangilang va qayta urinib ko‘ring.' : 'Javobni yuborib bo‘lmadi. Bir ozdan so‘ng qayta urinib ko‘ring.');
      }
      const data = await response.json();
      if (response.ok && data.ok) {
        status.classList.add('success');
        status.textContent = data.message;
      } else {
        status.textContent = data.message || 'Iltimos, belgilangan maydonlarni tekshiring.';
        Object.entries(data.errors || {}).forEach(([field, errors]) => {
          const target = document.getElementById(field + '-error');
          const message = errors.map((item) => item.message).join(' ');
          if (target) target.textContent = message;
          else status.textContent += ' ' + message;
          const input = form.elements.namedItem(field);
          if (input && typeof input.setAttribute === 'function') input.setAttribute('aria-invalid', 'true');
        });
      }
    } catch (error) {
      status.textContent = error.name === 'AbortError' || error instanceof TypeError
        ? 'Aloqani tekshiring. Javob yuborilgan bo‘lishi mumkin — qayta yuborsangiz, avvalgi javobingiz yangilanadi.'
        : error.message;
    } finally {
      clearTimeout(timeout);
      submit.disabled = false;
      submit.querySelector('span').textContent = 'Javobni yuborish';
      status.focus({ preventScroll: true });
      status.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'center' });
    }
  });

  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.06 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    document.documentElement.classList.add('motion-ready');
  }
  const progress = $('.reading-progress');
  let scheduled = false;
  const updateProgress = () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (height > 0 ? (window.scrollY / height) * 100 : 0) + '%';
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();
})();
