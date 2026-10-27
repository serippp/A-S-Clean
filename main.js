/* A&S Clean — static, dependency-free interactions. */
'use strict';
document.documentElement.classList.add('js');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navegacao');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
function closeMenu(returnFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
  document.body.classList.remove('menu-open');
  main.inert = false;
  footer.inert = false;
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  if (!open) return closeMenu();
  menuButton.setAttribute('aria-expanded', 'true');
  navigation.classList.add('open');
  document.body.classList.add('menu-open');
  main.inert = true;
  footer.inert = true;
});
navigation.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', e => {
  if (menuButton.getAttribute('aria-expanded') !== 'true') return;
  if (e.key === 'Escape') closeMenu(true);
  if (e.key === 'Tab') {
    const focusable = [menuButton, ...navigation.querySelectorAll('a')];
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
window.matchMedia('(min-width:761px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { header.classList.toggle('scrolled', window.scrollY > 15); ticking = false; });
}, { passive: true });
header.classList.toggle('scrolled', window.scrollY > 15);

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  });
}, { threshold: .08, rootMargin: '0px 0px -15px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const sections = [...document.querySelectorAll('main section[id]')];
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navigation.querySelectorAll('a:not(.button)').forEach(a => {
      const current = a.hash === '#' + entry.target.id;
      a.classList.toggle('active', current);
      if (current) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-15% 0px -60% 0px' });
sections.forEach(section => navObserver.observe(section));

const services = [...document.querySelectorAll('.service')];
services.forEach(service => {
  service.addEventListener('toggle', () => {
    if (service.open) services.forEach(other => { if (other !== service) other.open = false; });
  });
});
document.querySelectorAll('[data-service]').forEach(a => {
  a.href = 'https://wa.me/351934417216?text=' + encodeURIComponent('Olá! Gostaria de pedir um orçamento para o serviço de ' + a.dataset.service.toLocaleLowerCase('pt-PT') + '.');
});

const videos = [...document.querySelectorAll('video')];
const userPaused = new WeakSet();
const visibleVideos = new Set();
function loadVideo(video) {
  const source = video.querySelector('source[data-src]');
  if (source) { source.src = source.dataset.src; delete source.dataset.src; video.load(); }
}
function playVideo(video) {
  loadVideo(video);
  const promise = video.play();
  if (promise) promise.catch(() => updateVideoControl(video));
}
function updateVideoControl(video) {
  const button = document.querySelector('[data-video="' + video.id + '"]');
  const playing = !video.paused && !video.ended;
  button.setAttribute('aria-label', playing ? 'Pausar vídeo' : 'Reproduzir vídeo');
  button.querySelector('span').textContent = playing ? 'Ⅱ' : '▶';
  button.querySelector('.control-text').textContent = playing ? 'Pausar' : 'Reproduzir';
}
videos.forEach(video => {
  video.muted = true;
  if (motion.matches) { video.autoplay = false; video.removeAttribute('autoplay'); video.pause(); }
  ['play', 'pause', 'ended', 'error'].forEach(event => video.addEventListener(event, () => updateVideoControl(video)));
  document.querySelector('[data-video="' + video.id + '"]').addEventListener('click', () => {
    if (video.paused) { userPaused.delete(video); playVideo(video); }
    else { userPaused.add(video); video.pause(); }
  });
  updateVideoControl(video);
});
const videoObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const video = entry.target;
    if (entry.isIntersecting) {
      visibleVideos.add(video);
      if (!motion.matches && !userPaused.has(video) && !document.hidden) playVideo(video);
    } else { visibleVideos.delete(video); video.pause(); }
  });
}, { threshold: .15 });
videos.forEach(video => videoObserver.observe(video));
motion.addEventListener('change', () => videos.forEach(video => {
  if (motion.matches) { video.autoplay = false; video.pause(); }
  else if (visibleVideos.has(video) && !userPaused.has(video)) playVideo(video);
}));
document.addEventListener('visibilitychange', () => {
  videos.forEach(video => {
    if (document.hidden) video.pause();
    else if (!motion.matches && visibleVideos.has(video) && !userPaused.has(video)) playVideo(video);
  });
});

const photoDialog = document.querySelector('#photo-dialog');
const openPhoto = document.querySelector('.photo-open');
openPhoto.addEventListener('click', () => {
  photoDialog.showModal();
  document.body.classList.add('dialog-open');
});
document.querySelector('.dialog-close').addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('click', e => {
  if (e.target === photoDialog) photoDialog.close();
});
photoDialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  openPhoto.focus({ preventScroll: true });
});
document.querySelector('#year').textContent = new Date().getFullYear();
