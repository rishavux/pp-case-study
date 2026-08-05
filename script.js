document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.key-decisions-section');
  const frame = section.querySelector('.key-decisions-frame');
  const mainDefault = frame.querySelector('.main-panel-view--default');
  const mainBlank = frame.querySelector('.main-panel-view--blank');
  const sideDefault = frame.querySelector('.side-column-view--default');
  const sideBlank = frame.querySelector('.side-column-view--blank');
  const railItems = frame.querySelectorAll('.rail-item');
  const triggers = section.querySelectorAll('[data-decision]');
  const lowerPanelViews = section.querySelectorAll('.lower-panel-view');
  const resetButton = document.querySelector('[data-action="reset"]');

  function showDecision(decisionId) {
    mainDefault.classList.add('is-hidden');
    mainBlank.classList.remove('is-hidden');
    sideDefault.classList.add('is-hidden');
    sideBlank.classList.remove('is-hidden');
    section.classList.add('is-panel-open');

    railItems.forEach((item) => {
      item.classList.toggle('is-active', item.dataset.decision === decisionId);
    });

    lowerPanelViews.forEach((view) => {
      view.classList.toggle('is-hidden', view.dataset.decision !== decisionId);
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

  const compareImage = document.getElementById('visualProofImage');
  const compareButtons = document.querySelectorAll('.compare-toggle-btn');
  const compareImages = {
    before: 'Before & After/Before Visual Proof.png',
    after: 'Before & After/After Visual Proof.png',
  };
  const labelCallouts = document.querySelectorAll('.label-callouts');

  compareButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const state = button.dataset.compare;
      compareImage.src = compareImages[state];
      compareButtons.forEach((btn) => btn.classList.toggle('is-active', btn === button));
      labelCallouts.forEach((group) => {
        group.classList.toggle('is-hidden', !group.classList.contains(`label-callouts--${state}`));
      });
    });
  });
});
