document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.key-decisions-section');
  const frame = section.querySelector('.key-decisions-frame');
  const mainDefault = frame.querySelector('.main-panel-view--default');
  const mainBlank = frame.querySelector('.main-panel-view--blank');
  const sideDefault = frame.querySelector('.side-column-view--default');
  const sideBlank = frame.querySelector('.side-column-view--blank');
  const rail = frame.querySelector('.rail');
  const railItems = frame.querySelectorAll('.rail-item');
  const railSequence = Array.from(railItems);
  const triggers = section.querySelectorAll('[data-decision]');
  const lowerPanel = section.querySelector('.key-decisions-lower-panel');
  const lowerPanelViews = section.querySelectorAll('.lower-panel-view');
  const resetButton = document.querySelector('[data-action="reset"]');
  const headerNav = document.querySelector('.key-decisions-header-nav');
  const decisionTitle = document.getElementById('decisionTitle');
  const navPrevBtn = document.querySelector('.key-decisions-nav-btn--prev');
  const navNextBtn = document.querySelector('.key-decisions-nav-btn--next');

  const compareFrame = document.getElementById('visualProofFrame');
  const compareSkeleton = compareFrame.querySelector('.compare-image-skeleton');
  const compareImageEls = {
    before: compareFrame.querySelector('.compare-image[data-compare-image="before"]'),
    after: compareFrame.querySelector('.compare-image[data-compare-image="after"]'),
  };
  const decisionImages = {
    'visual-proof': {
      before: { src: 'Before & After/Before Visual Proof.png', alt: 'Property Pixel landing page hero, before redesign' },
      after: { src: 'Before & After/After Visual Proof.png', alt: 'Property Pixel landing page hero, after redesign' },
    },
    'web-experience': {
      before: { src: 'Before & After/Studio Web Before.png', alt: 'Property Pixel web product demo, before redesign' },
      after: { src: 'Before & After/Studio Web After.png', alt: 'Property Pixel web product demo, after redesign' },
    },
    'mobile-demo': {
      before: { src: 'Before & After/studio mobile before.png', alt: 'Property Pixel mobile product demo, before redesign' },
      after: { src: 'Before & After/studio mobile after.png', alt: 'Property Pixel mobile product demo, after redesign' },
    },
    'credits': {
      before: { src: 'Before & After/current plan before.png', alt: 'Property Pixel billing current plan, before redesign' },
      after: { src: 'Before & After/current plan after.png', alt: 'Property Pixel billing current plan, after redesign' },
    },
    'subscriptions': {
      before: { src: 'Before & After/subscription before.png', alt: 'Property Pixel subscriptions panel, before redesign' },
      after: { src: 'Before & After/subscription after.png', alt: 'Property Pixel subscriptions panel, after redesign' },
    },
    'ai-suggestions': {
      before: { src: 'Before & After/Ai Suggestion Updated Before.png', alt: 'Property Pixel AI suggestions overlay, before redesign' },
      after: { src: 'Before & After/AI Suggestion After - web.png', alt: 'Property Pixel AI suggestions overlay, after redesign' },
    },
  };
  const compareLoaded = {};
  const compareButtons = document.querySelectorAll('.compare-toggle-btn');
  const labelCallouts = document.querySelectorAll('.label-callouts');
  const labelCalloutCenters = section.querySelectorAll('.label-callout-center');
  let compareActiveState = 'before';
  let currentDecisionId = null;
  let currentIndex = -1;

  function markCompareLoaded(decisionId, state) {
    if (!compareLoaded[decisionId]) compareLoaded[decisionId] = {};
    compareLoaded[decisionId][state] = true;
    if (decisionId === currentDecisionId && state === compareActiveState) {
      compareSkeleton.classList.add('is-hidden');
    }
  }

  function preloadCompareImages(decisionId) {
    const images = decisionImages[decisionId];
    if (!images) return;
    Object.entries(images).forEach(([state, { src, alt }]) => {
      const imgEl = compareImageEls[state];
      if (imgEl.dataset.loadedFor === decisionId) return;
      imgEl.dataset.loadedFor = decisionId;
      imgEl.alt = alt;
      imgEl.addEventListener('load', () => markCompareLoaded(decisionId, state), { once: true });
      imgEl.src = src;
    });
  }

  function setCompareState(state) {
    compareActiveState = state;
    const images = decisionImages[currentDecisionId];
    Object.entries(compareImageEls).forEach(([key, el]) => {
      el.classList.toggle('is-active', !!images && key === state);
    });
    const isLoaded = !!images && !!(compareLoaded[currentDecisionId] && compareLoaded[currentDecisionId][state]);
    compareSkeleton.classList.toggle('is-hidden', isLoaded);
    compareButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.compare === state));
    labelCallouts.forEach((group) => {
      group.classList.toggle('is-hidden', !group.classList.contains(`label-callouts--${state}`));
    });
  }

  function updateNavButtons() {
    const prevItem = railSequence[currentIndex - 1];
    const nextItem = railSequence[currentIndex + 1];

    navPrevBtn.disabled = !prevItem;
    navNextBtn.disabled = !nextItem;
  }

  function expandLowerPanel() {
    const targetHeight = lowerPanel.scrollHeight;
    if (targetHeight === 0) {
      const targetY = window.scrollY + section.getBoundingClientRect().top + 24;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      return;
    }
    lowerPanel.style.transition = 'none';
    lowerPanel.style.overflow = 'hidden';
    lowerPanel.style.height = '0px';
    lowerPanel.style.opacity = '0';
    lowerPanel.getBoundingClientRect();
    lowerPanel.style.transition = 'height 300ms ease-out, opacity 300ms ease-out';
    requestAnimationFrame(() => {
      lowerPanel.style.height = targetHeight + 'px';
      lowerPanel.style.opacity = '1';
    });
    const onEnd = (e) => {
      if (e.target !== lowerPanel || e.propertyName !== 'height') return;
      lowerPanel.style.height = '';
      lowerPanel.style.opacity = '';
      lowerPanel.style.overflow = '';
      lowerPanel.style.transition = '';
      lowerPanel.removeEventListener('transitionend', onEnd);
      const targetY = window.scrollY + section.getBoundingClientRect().top + 24;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    };
    lowerPanel.addEventListener('transitionend', onEnd);
  }

  function collapseLowerPanel(onComplete) {
    const startHeight = lowerPanel.scrollHeight;
    if (startHeight === 0) {
      if (onComplete) onComplete();
      return;
    }
    lowerPanel.style.transition = 'none';
    lowerPanel.style.overflow = 'hidden';
    lowerPanel.style.height = startHeight + 'px';
    lowerPanel.style.opacity = '1';
    lowerPanel.getBoundingClientRect();
    lowerPanel.style.transition = 'height 300ms ease-out, opacity 300ms ease-out';
    requestAnimationFrame(() => {
      lowerPanel.style.height = '0px';
      lowerPanel.style.opacity = '0';
    });
    const onEnd = (e) => {
      if (e.target !== lowerPanel || e.propertyName !== 'height') return;
      lowerPanel.style.height = '';
      lowerPanel.style.opacity = '';
      lowerPanel.style.overflow = '';
      lowerPanel.style.transition = '';
      lowerPanel.removeEventListener('transitionend', onEnd);
      if (onComplete) onComplete();
    };
    lowerPanel.addEventListener('transitionend', onEnd);
  }

  function crossfadeContent(applyContent) {
    const targets = [rail, headerNav, mainBlank, sideBlank, lowerPanel].filter(Boolean);

    targets.forEach((el) => el.classList.add('is-crossfading'));
    window.setTimeout(() => {
      applyContent();
      targets.forEach((el) => el.classList.remove('is-crossfading'));
    }, 150);
  }

  function showDecisionAtIndex(index) {
    const railItemEl = railSequence[index];
    if (!railItemEl) return;

    const decisionId = railItemEl.dataset.decision || null;
    const wasOpen = section.classList.contains('is-panel-open');

    const applyDecisionContent = () => {
      mainDefault.classList.add('is-hidden');
      mainBlank.classList.remove('is-hidden');
      sideDefault.classList.add('is-hidden');
      sideBlank.classList.remove('is-hidden');
      section.classList.add('is-panel-open');

      railItems.forEach((item) => {
        item.classList.toggle('is-active', item === railItemEl);
      });

      currentIndex = index;
      decisionTitle.textContent = railItemEl.querySelector('.rail-label').textContent;
      updateNavButtons();

      lowerPanelViews.forEach((view) => {
        view.classList.toggle('is-hidden', view.dataset.decision !== decisionId);
      });

      labelCalloutCenters.forEach((el) => {
        el.classList.toggle('is-hidden', el.dataset.decision !== decisionId);
      });

      currentDecisionId = decisionId;
      section.dataset.activeDecision = decisionId || '';
      setCompareState('before');
      preloadCompareImages(decisionId);
    };

    if (wasOpen) {
      crossfadeContent(applyDecisionContent);
    } else {
      applyDecisionContent();
      expandLowerPanel();
    }
  }

  function showDecision(decisionId) {
    const railItemEl = frame.querySelector(`.rail-item[data-decision="${decisionId}"]`);
    if (railItemEl) {
      showDecisionAtIndex(railSequence.indexOf(railItemEl));
    }
  }

  function showDefault() {
    if (!section.classList.contains('is-panel-open')) return;

    collapseLowerPanel(() => {
      section.classList.remove('is-panel-open');
      mainBlank.classList.add('is-hidden');
      mainDefault.classList.remove('is-hidden');
      sideBlank.classList.add('is-hidden');
      sideDefault.classList.remove('is-hidden');
      railItems.forEach((item) => item.classList.remove('is-active'));
      currentIndex = -1;
      delete section.dataset.activeDecision;
    });
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => showDecision(trigger.dataset.decision));
  });

  resetButton.addEventListener('click', showDefault);

  navPrevBtn.addEventListener('click', () => {
    if (currentIndex > 0) showDecisionAtIndex(currentIndex - 1);
  });

  navNextBtn.addEventListener('click', () => {
    if (currentIndex >= 0 && currentIndex < railSequence.length - 1) showDecisionAtIndex(currentIndex + 1);
  });

  compareButtons.forEach((button) => {
    button.addEventListener('click', () => setCompareState(button.dataset.compare));
  });

  const lightbox = document.getElementById('imageLightbox');
  const lightboxImage = document.getElementById('imageLightboxImage');
  const lightboxCloseBtn = lightbox.querySelector('.image-lightbox-close');
  let scrollLockY = 0;

  function openLightbox(src, alt) {
    lightboxImage.src = src;
    lightboxImage.alt = alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');

    scrollLockY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollLockY}px`;
    document.body.style.width = '100%';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    lightboxImage.alt = '';

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollLockY);
  }

  document.addEventListener('click', (e) => {
    const zoomTarget = e.target.closest('.zoomable-image');
    if (zoomTarget) {
      openLightbox(zoomTarget.currentSrc || zoomTarget.src, zoomTarget.alt);
    }
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  lightboxCloseBtn.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
});
