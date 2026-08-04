document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.key-decisions-section');
  const navbar = section.querySelector('.key-decisions-navbar');
  const frame = section.querySelector('.key-decisions-frame');
  const lowerPanel = section.querySelector('.key-decisions-lower-panel');
  const mainDefault = frame.querySelector('.main-panel-view--default');
  const mainBlank = frame.querySelector('.main-panel-view--blank');
  const sideDefault = frame.querySelector('.side-column-view--default');
  const sideBlank = frame.querySelector('.side-column-view--blank');
  const railItems = frame.querySelectorAll('.rail-item');
  const resetButton = document.querySelector('[data-action="reset"]');
  const triggers = frame.querySelectorAll('[data-decision]');

  function syncLowerPanelHeight() {
    lowerPanel.style.height = `${navbar.offsetHeight * 2}px`;
  }

  function showDecision(decisionId) {
    mainDefault.classList.add('is-hidden');
    mainBlank.classList.remove('is-hidden');
    sideDefault.classList.add('is-hidden');
    sideBlank.classList.remove('is-hidden');
    section.classList.add('is-panel-open');

    railItems.forEach((item) => {
      item.classList.toggle('is-active', item.dataset.decision === decisionId);
    });
  }

  function showDefault() {
    mainBlank.classList.add('is-hidden');
    mainDefault.classList.remove('is-hidden');
    sideBlank.classList.add('is-hidden');
    sideDefault.classList.remove('is-hidden');
    section.classList.remove('is-panel-open');

    railItems.forEach((item) => item.classList.remove('is-active'));
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => showDecision(trigger.dataset.decision));
  });

  resetButton.addEventListener('click', showDefault);

  syncLowerPanelHeight();
  window.addEventListener('resize', syncLowerPanelHeight);

  const compareImage = document.getElementById('visualProofImage');
  const compareButtons = document.querySelectorAll('.compare-toggle-btn');
  const compareImages = {
    before: 'Before & After/Before Visual Proof.png',
    after: 'Before & After/After Visual Proof.png',
  };

  compareButtons.forEach((button) => {
    button.addEventListener('click', () => {
      compareImage.src = compareImages[button.dataset.compare];
      compareButtons.forEach((btn) => btn.classList.toggle('is-active', btn === button));
    });
  });
});
