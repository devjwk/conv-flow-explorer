(() => {
  'use strict';
  function render() {
    const language = ConvI18n.language;
    document.querySelectorAll('[data-ko][data-en]').forEach(element => {
      if (element.tagName === 'H1') element.innerHTML = element.dataset[language];
      else element.textContent = element.dataset[language];
    });
    document.title = language === 'ko' ? 'CPRE 487 Lab Flow Explorer · 홈' : 'CPRE 487 Lab Flow Explorer · Home';
    document.querySelector('meta[name=description]').content = language === 'ko'
      ? 'CPRE 487 Lab 2의 레이어 계산을 실제 데이터와 코드로 따라가는 학습 도구'
      : 'An interactive guide to CNN layers using real CPRE 487 Lab 2 data and code.';
    const seed = new URLSearchParams(location.search).get('seed');
    if (seed && /^\d+$/.test(seed)) document.querySelectorAll('a[href="convolution.html"]').forEach(link => { link.href = `convolution.html?seed=${encodeURIComponent(seed)}`; });
  }
  document.addEventListener('conv-languagechange', render);
  render();
})();
