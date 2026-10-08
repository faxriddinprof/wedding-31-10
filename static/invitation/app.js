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
  let reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const openedKey = 'ag-envelope-opened-v2';
  let opening = false;
  let openingTimer;
  let handoffTimer;
  let bridge;
  const letter = $('.envelope-letter');
  const hero = $('.hero-frame');
  const cloneHero = () => {
    const clone = hero.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    return clone;
  };
  const clearTransition = () => {
    clearTimeout(openingTimer);
    clearTimeout(handoffTimer);
    bridge?.remove();
    bridge = null;
    letter.querySelector('.envelope-preview')?.remove();
    letter.classList.remove('has-preview');
    letter.style.removeProperty('height');
  };
  const prepareLetter = () => {
    const preview = cloneHero();
    const target = hero.getBoundingClientRect();
    const scale = letter.getBoundingClientRect().width / target.width;
    preview.classList.add('envelope-preview');
    Object.assign(preview.style, { width: `${target.width}px`, height: `${target.height}px`, transform: `scale(${scale})` });
    letter.style.height = `${target.height * scale}px`;
    letter.classList.add('has-preview');
    letter.appendChild(preview);
  };
  const startHandoff = () => {
    if (!opening || bridge) return;
    const source = letter.getBoundingClientRect();
    const target = hero.getBoundingClientRect();
    bridge = cloneHero();
    bridge.classList.add('envelope-bridge');
    const transform = `translate(${source.left - target.left}px, ${source.top - target.top}px) scale(${source.width / target.width}, ${source.height / target.height})`;
    Object.assign(bridge.style, { left: `${target.left}px`, top: `${target.top}px`, width: `${target.width}px`, height: `${target.height}px`, transform });
    welcome.appendChild(bridge);
    welcome.classList.add('is-handoff');
    if (typeof bridge.animate === 'function') {
      const duration = Number(getComputedStyle(welcome).getPropertyValue('--handoff-duration')) || 1050;
      bridge.animate([{ transform }, { transform: 'none' }], { duration, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' });
    } else {
      finishOpening();
    }
  };
  let previouslyOpened = false;
  try { previouslyOpened = sessionStorage.getItem(openedKey) === 'yes'; } catch { /* Optional preference. */ }
  const finishOpening = () => {
    if (!opening) return;
    opening = false;
    clearTimeout(openingTimer);
    welcome.close();
    clearTransition();
    document.body.style.overflow = '';
    document.body.classList.remove('is-revealing');
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
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!reducedMotion) prepareLetter();
    welcome.classList.add('is-opening');
    document.body.classList.add('is-revealing');
    // Match the final CSS fade, with a fallback if animationend is not delivered.
    const timing = getComputedStyle(welcome);
    const openingDuration = Number(timing.getPropertyValue('--opening-duration')) || 5500;
    const letterEnd = (Number(timing.getPropertyValue('--letter-delay')) || 2500) + (Number(timing.getPropertyValue('--letter-duration')) || 1900);
    if (!reducedMotion) handoffTimer = window.setTimeout(startHandoff, letterEnd + 100);
    openingTimer = window.setTimeout(finishOpening, reducedMotion ? 0 : openingDuration + 250);
  });
  welcome.addEventListener('animationend', (event) => {
    if (event.target === letter && event.animationName === 'letterReveal') startHandoff();
    if (event.target === welcome && event.animationName === 'invitationReveal') finishOpening();
  });
  welcome.addEventListener('close', () => {
    clearTransition();
    opening = false;
    document.body.style.overflow = '';
    document.body.classList.remove('is-revealing');
  });
  welcome.addEventListener('cancel', () => {
    try { sessionStorage.setItem(openedKey, 'yes'); } catch { /* Optional preference. */ }
  });
  const showEnvelope = () => {
    clearTransition();
    opening = false;
    welcome.classList.remove('is-opening', 'is-handoff');
    document.body.classList.remove('is-revealing');
    $('#open-invitation').disabled = false;
    welcomeMusic.disabled = false;
    welcomeMusic.checked = safeStore.get('ag-music') !== 'off';
    welcome.showModal();
    document.body.style.overflow = 'hidden';
  };
  // A changed viewport invalidates the measured destination; finish without a jump.
  window.addEventListener('resize', () => { if (opening) finishOpening(); });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
    reducedMotion = event.matches;
    if (event.matches && opening) finishOpening();
  });
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
