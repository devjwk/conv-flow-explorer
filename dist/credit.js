(() => {
  'use strict';
  const main = document.querySelector('main');
  if (!main) return;
  const note = document.createElement('div');
  note.className = 'source-credit';
  main.append(note);
  function render() {
    note.textContent = ConvI18n.language === 'ko'
      ? '출처: Iowa State University CprE 487/587 강의 제공 DNN framework 및 하드웨어 템플릿을 바탕으로 제작. 개인 학습을 위한 비영리 시각화이며, 원본 자료의 권리는 각 권리자에게 있습니다.'
      : 'Based on Iowa State University CprE 487/587 course-provided DNN framework and hardware templates. A noncommercial visualization for personal study; rights to original materials remain with their respective owners.';
  }
  document.addEventListener('conv-languagechange', render);
  render();
})();
