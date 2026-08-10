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
  const triggers = section.querySelectorAll('.rail-item, .group-card');
  const lowerPanel = section.querySelector('.key-decisions-lower-panel');
  const lowerPanelViews = section.querySelectorAll('.lower-panel-view');
  const resetButton = document.querySelector('[data-action="reset"]');
  const headerNav = document.querySelector('.key-decisions-header-nav');
  const decisionTitle = document.getElementById('decisionTitle');
  const navPrevBtn = document.querySelector('.key-decisions-nav-btn--prev');
  const navNextBtn = document.querySelector('.key-decisions-nav-btn--next');

  const compareToggle = frame.querySelector('.compare-toggle');
  const groupLabelButtons = Array.from(frame.querySelectorAll('.rail-group-label'));
  const mobileArrowPrev = frame.querySelector('.mobile-carousel-arrow--prev');
  const mobileArrowNext = frame.querySelector('.mobile-carousel-arrow--next');

  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const mobileDetail = document.createElement('div');
  mobileDetail.className = 'mobile-carousel-detail';
  const mobileDots = document.createElement('div');
  mobileDots.className = 'mobile-carousel-dots';
  const mobileCardTitleRow = document.createElement('div');
  mobileCardTitleRow.className = 'mobile-carousel-title-row';
  const mobileCardTitle = document.createElement('h3');
  mobileCardTitle.className = 'mobile-carousel-title';
  mobileCardTitleRow.appendChild(mobileArrowPrev);
  mobileCardTitleRow.appendChild(mobileCardTitle);
  mobileCardTitleRow.appendChild(mobileArrowNext);
  const mobileToggleRow = document.createElement('div');
  mobileToggleRow.className = 'mobile-carousel-toggle-row';
  mobileDetail.appendChild(mobileDots);
  mobileDetail.appendChild(mobileCardTitleRow);
  mobileDetail.appendChild(mobileToggleRow);

  let mobileDetailMoved = [];
  let mobileOpenGroup = null;
  let mobileGroupDecisions = [];
  let mobileGroupIndex = 0;

  function moveIntoMobileDetail(el) {
    if (!el) return;
    mobileDetailMoved.push({ el, parent: el.parentNode, next: el.nextSibling });
    mobileDetail.appendChild(el);
  }

  function restoreMovedContent() {
    mobileDetailMoved.forEach(({ el, parent, next }) => {
      parent.insertBefore(el, next);
      el.classList.add('is-hidden');
    });
    mobileDetailMoved = [];
  }

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
    'activity-panel': {
      before: { src: 'Before & After/Activity Panel after.png', alt: 'Property Pixel activity panel, before redesign' },
      after: { src: 'Before & After/Activity Panel before.png', alt: 'Property Pixel activity panel, after redesign' },
    },
    'batch-selection': {
      before: { src: 'Before & After/batch selection before.png', alt: 'Property Pixel batch selection, before redesign' },
      after: { src: 'Before & After/batch selection after.png', alt: 'Property Pixel batch selection, after redesign' },
    },
    'download-panel': {
      before: { src: 'Before & After/download before.png', alt: 'Property Pixel download panel, before redesign' },
      after: [
        { src: 'Before & After/download after 1.png', alt: 'Property Pixel download panel list view, after redesign' },
        { src: 'Before & After/download after 2.png', alt: 'Property Pixel download panel preview mode, after redesign' },
      ],
    },
  };
  const compareLoaded = {};
  const compareButtons = document.querySelectorAll('.compare-toggle-btn');
  const compareDotsEl = document.getElementById('compareDots');
  const labelCallouts = document.querySelectorAll('.label-callouts');
  const labelCalloutCenters = section.querySelectorAll('.label-callout-center');
  let compareActiveState = 'before';
  let compareVariantIndex = 0;
  let currentDecisionId = null;
  let autoCycleTimer = null;

  function getStateVariants(decisionId, state) {
    const images = decisionImages[decisionId];
    const value = images && images[state];
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  let currentIndex = -1;

  function markCompareLoaded(cacheKey) {
    compareLoaded[cacheKey] = true;
    const [decisionId, state, variantIndex] = cacheKey.split('::');
    if (decisionId === currentDecisionId && state === compareActiveState && Number(variantIndex) === compareVariantIndex) {
      compareSkeleton.classList.add('is-hidden');
    }
  }

  function preloadCompareImages(decisionId) {
    const images = decisionImages[decisionId];
    if (!images) return;
    Object.keys(images).forEach((state) => {
      getStateVariants(decisionId, state).forEach((variant, variantIndex) => {
        const cacheKey = `${decisionId}::${state}::${variantIndex}`;
        if (compareLoaded[cacheKey]) return;
        const warmer = new Image();
        warmer.addEventListener('load', () => markCompareLoaded(cacheKey), { once: true });
        warmer.src = variant.src;
      });
    });
  }

  function clearAutoCycle() {
    if (autoCycleTimer) {
      window.clearTimeout(autoCycleTimer);
      autoCycleTimer = null;
    }
  }

  function scheduleAutoCycle(variants) {
    clearAutoCycle();
    if (variants.length <= 1) return;
    autoCycleTimer = window.setTimeout(() => {
      setCompareState(compareActiveState, (compareVariantIndex + 1) % variants.length);
    }, 3500);
  }

  function renderCompareDots(variants, activeIndex) {
    compareDotsEl.innerHTML = '';
    if (variants.length <= 1) {
      compareDotsEl.classList.add('is-hidden');
      return;
    }
    compareDotsEl.classList.remove('is-hidden');
    variants.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'compare-dot' + (i === activeIndex ? ' is-active' : '');
      dot.setAttribute('aria-label', `Show image ${i + 1} of ${variants.length}`);
      dot.addEventListener('click', () => setCompareState(compareActiveState, i));
      compareDotsEl.appendChild(dot);
    });
  }

  function setCompareState(state, variantIndex) {
    compareActiveState = state;
    section.dataset.compareState = state;
    const variants = getStateVariants(currentDecisionId, state);
    compareVariantIndex = Math.min(variantIndex || 0, Math.max(variants.length - 1, 0));
    const variant = variants[compareVariantIndex];
    const imgEl = compareImageEls[state];
    const wasActive = imgEl.classList.contains('is-active');

    Object.entries(compareImageEls).forEach(([key, el]) => {
      el.classList.toggle('is-active', key === state && !!variant);
    });

    if (variant) {
      const cacheKey = `${currentDecisionId}::${state}::${compareVariantIndex}`;
      const [oldDecisionId, oldState] = (imgEl.dataset.loadedKey || '').split('::');
      const isSameVariantContext = oldDecisionId === currentDecisionId && oldState === state;
      const applyImage = () => {
        compareSkeleton.classList.toggle('is-hidden', !!compareLoaded[cacheKey]);
        if (imgEl.dataset.loadedKey === cacheKey) return;
        imgEl.dataset.loadedKey = cacheKey;
        imgEl.alt = variant.alt;
        imgEl.addEventListener('load', () => markCompareLoaded(cacheKey), { once: true });
        imgEl.src = variant.src;
      };

      if (wasActive && isSameVariantContext && imgEl.dataset.loadedKey !== cacheKey) {
        imgEl.classList.add('is-cycling');
        window.setTimeout(() => {
          applyImage();
          requestAnimationFrame(() => imgEl.classList.remove('is-cycling'));
        }, 200);
      } else {
        applyImage();
      }
    }

    compareButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.compare === state));
    labelCallouts.forEach((group) => {
      group.classList.toggle('is-hidden', !group.classList.contains(`label-callouts--${state}`));
    });

    renderCompareDots(variants, compareVariantIndex);
    scheduleAutoCycle(variants);
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

  function updateMobileArrows() {
    mobileArrowPrev.disabled = mobileGroupIndex <= 0;
    mobileArrowNext.disabled = mobileGroupIndex >= mobileGroupDecisions.length - 1;
  }

  function buildMobileDots() {
    mobileDots.innerHTML = '';
    mobileDots.classList.toggle('is-hidden', mobileGroupDecisions.length <= 1);
    mobileGroupDecisions.forEach(() => {
      const dot = document.createElement('span');
      dot.className = 'mobile-carousel-dot';
      mobileDots.appendChild(dot);
    });
  }

  function updateMobileDots() {
    Array.from(mobileDots.children).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === mobileGroupIndex);
    });
  }

  function populateMobileCard(decisionId) {
    restoreMovedContent();

    const lowerView = Array.from(lowerPanelViews).find((view) => view.dataset.decision === decisionId);
    const calloutCenter = Array.from(labelCalloutCenters).find((el) => el.dataset.decision === decisionId);
    const railItemEl = frame.querySelector(`.rail-item[data-decision="${decisionId}"]`);

    mobileCardTitle.textContent = railItemEl ? railItemEl.querySelector('.rail-label').textContent : '';

    moveIntoMobileDetail(compareToggle);
    moveIntoMobileDetail(mainBlank);
    moveIntoMobileDetail(calloutCenter);
    moveIntoMobileDetail(lowerView);
    mobileToggleRow.appendChild(compareToggle);

    mainBlank.classList.remove('is-hidden');
    if (calloutCenter) calloutCenter.classList.remove('is-hidden');
    if (lowerView) lowerView.classList.remove('is-hidden');

    currentDecisionId = decisionId;
    section.dataset.activeDecision = decisionId || '';
    setCompareState('before');
    preloadCompareImages(decisionId);
  }

  function showMobileCardAtIndex(index) {
    if (index < 0 || index >= mobileGroupDecisions.length) return;
    mobileDetail.classList.add('is-crossfading');
    window.setTimeout(() => {
      mobileGroupIndex = index;
      populateMobileCard(mobileGroupDecisions[index]);
      updateMobileArrows();
      updateMobileDots();
      mobileDetail.classList.remove('is-crossfading');
    }, 150);
  }

  function closeMobileGroup() {
    if (!mobileOpenGroup) return;
    clearAutoCycle();
    restoreMovedContent();
    if (mobileDetail.parentNode) mobileDetail.parentNode.removeChild(mobileDetail);
    mobileOpenGroup.classList.remove('is-mobile-expanded');
    mobileOpenGroup = null;
    mobileGroupDecisions = [];
    mobileGroupIndex = 0;
    currentDecisionId = null;
    delete section.dataset.activeDecision;
  }

  function openMobileGroup(groupEl) {
    if (mobileOpenGroup === groupEl) {
      closeMobileGroup();
      return;
    }
    if (mobileOpenGroup) closeMobileGroup();

    mobileGroupDecisions = Array.from(groupEl.querySelectorAll('.rail-item')).map((el) => el.dataset.decision);
    if (!mobileGroupDecisions.length) return;

    mobileOpenGroup = groupEl;
    groupEl.classList.add('is-mobile-expanded');
    groupEl.appendChild(mobileDetail);
    buildMobileDots();
    showMobileCardAtIndex(0);
    groupEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

    clearAutoCycle();
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

  mobileQuery.addEventListener('change', () => {
    closeMobileGroup();
    showDefault();
  });

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

  groupLabelButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!mobileQuery.matches) return;
      const groupEl = button.closest('.rail-group');
      if (groupEl) openMobileGroup(groupEl);
    });
  });

  mobileArrowPrev.addEventListener('click', () => showMobileCardAtIndex(mobileGroupIndex - 1));
  mobileArrowNext.addEventListener('click', () => showMobileCardAtIndex(mobileGroupIndex + 1));

  let mobileTouchStartX = 0;
  let mobileTouchStartY = 0;
  let mobileTouchTracking = false;

  mobileDetail.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    mobileTouchStartX = e.touches[0].clientX;
    mobileTouchStartY = e.touches[0].clientY;
    mobileTouchTracking = true;
  }, { passive: true });

  mobileDetail.addEventListener('touchend', (e) => {
    if (!mobileTouchTracking) return;
    mobileTouchTracking = false;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - mobileTouchStartX;
    const deltaY = touch.clientY - mobileTouchStartY;
    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    showMobileCardAtIndex(mobileGroupIndex + (deltaX < 0 ? 1 : -1));
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
