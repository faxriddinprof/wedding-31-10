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
      $('#audio-status').textContent = 'Musiqa yoqildi.';
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
  const openedKey = 'ag-envelope-opened-v2';
  let opening = false;
  let openingTimer;
  let previouslyOpened = false;
  try { previouslyOpened = sessionStorage.getItem(openedKey) === 'yes'; } catch { /* Optional preference. */ }
  const finishOpening = () => {
    if (!opening) return;
    opening = false;
    clearTimeout(openingTimer);
    welcome.close();
    document.body.style.overflow = '';
    try { sessionStorage.setItem(openedKey, 'yes'); } catch { /* Optional preference. */ }
    window.scrollTo({ top: 0, behavior: 'instant' });
    $('#couple-names').setAttribute('tabindex', '-1');
    $('#couple-names').focus({ preventScroll: true });
  };
  $('#open-invitation').addEventListener('click', () => {
    if (opening) return;
    opening = true;
    if (welcomeMusic.checked) playAudio();
    else { audio.pause(); safeStore.set('ag-music', 'off'); }
    $('#open-invitation').disabled = true;
    welcomeMusic.disabled = true;
    welcome.classList.add('is-opening');
    // Match the final CSS fade, with a fallback if animationend is not delivered.
    openingTimer = window.setTimeout(finishOpening, reducedMotion ? 0 : 2900);
  });
  welcome.addEventListener('animationend', (event) => {
    if (event.target === welcome && event.animationName === 'invitationReveal') finishOpening();
  });
  welcome.addEventListener('close', () => {
    clearTimeout(openingTimer);
    opening = false;
    document.body.style.overflow = '';
  });
  welcome.addEventListener('cancel', () => {
    try { sessionStorage.setItem(openedKey, 'yes'); } catch { /* Optional preference. */ }
  });
  const showEnvelope = () => {
    clearTimeout(openingTimer);
    opening = false;
    welcome.classList.remove('is-opening');
    $('#open-invitation').disabled = false;
    welcomeMusic.disabled = false;
    welcomeMusic.checked = safeStore.get('ag-music') !== 'off';
    welcome.showModal();
    document.body.style.overflow = 'hidden';
  };
  if (typeof welcome.showModal === 'function') {
    $('#replay-invitation').hidden = false;
    $('#replay-invitation').addEventListener('click', showEnvelope);
  }
  // Direct section links remain immediately usable.
  if (!previouslyOpened && !location.hash && typeof welcome.showModal === 'function') {
    showEnvelope();
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
