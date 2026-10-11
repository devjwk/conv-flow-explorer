/* Korean / English copy. No numeric state is changed when switching languages. */
(() => {
  'use strict';
  const dictionary = {
  "로컬 학습 도구": "Local learning tool",
  "하나의 출력이 만들어지는 순간.": "Watch one output come to life.",
  "위치를 고르고, 채널을 곱하고, 더합니다. 내 코드의 여섯 반복문을 눈으로 따라가세요.": "Choose a position. Multiply across channels. Accumulate. Follow the six loops in your code.",
  "작은 예제로 이해": "Small example",
  "내 conv1 데이터": "Real conv1 data",
  "난수 실험": "Random experiment",
  "같은 seed, 같은 실험.": "Same seed. Same experiment.",
  "입력 0~9 · weight −2~2 · bias −3~3 · C=3 / M=3": "Input 0–9 · weights −2–2 · bias −3–3 · C=3 / M=3",
  "이 seed로 생성": "Apply seed",
  "↻ 새 숫자 배정": "↻ New random values",
  "· 입력 채널": "· input channels",
  "· 필터 묶음": "· filter bank",
  "· 출력 채널": "· output channels",
  "C개 채널은 합쳐서 하나로.": "C channels combine into one value.",
  "M개 필터는 각각 다른 출력으로.": "M filters produce separate outputs.",
  "바깥 반복문 · 어느 출력을 만들까요?": "Outer loops · choose an output",
  "는 위치를,": " select the position; ",
  "은 필터를 선택합니다.": " selects the filter.",
  "출력 행": "Output row",
  "출력 열": "Output column",
  "필터 / 출력 채널": "Filter / output channel",
  "다음 출력 위치 →": "Next output →",
  "모든 입력 채널을 함께 봅니다": "See all input channels together",
  "선택한 입력 창": "Selected input window",
  "실제 image_0 · RGB": "Real image_0 · RGB",
  "입력은 [0,1]의 float32": "Input: float32 in [0,1]",
  "같은": "At the same",
  "에서 모든 필터가 이 입력 창을 공유합니다.": ", every filter shares this input window.",
  "필터 하나 안의 채널별 weight": "Channel weights within one filter",
  "아래 조각들은": "These slices form",
  "하나의 필터": "one filter",
  "입니다. 각 조각을 같은 번호의 입력 채널과 곱합니다.": ". Multiply each slice by the input channel with the same index.",
  "필터의 bias": "Filter bias",
  "완성된 값 미리보기": "Completed output preview",
  "클릭하여 추적할 위치를 선택 · 방향키로 이동": "Click a position to trace · move with arrow keys",
  "아래 계산기는 선택한 출력": "The calculation below traces",
  "하나": "one",
  "를 단계별로 추적합니다.": " selected output, step by step.",
  "안쪽 반복문 · 한 곱씩 누적합니다": "Inner loops · accumulate one product at a time",
  "순서. 가장 안쪽의": "order. The innermost",
  "가 먼저 바뀝니다.": " changes first.",
  "↺ 초기화": "↺ Reset",
  "← 이전 곱": "← Previous",
  "▶ 자동 재생": "▶ Play",
  "다음 곱 →": "Next product →",
  "끝까지 계산": "Finish calculation",
  "속도": "Speed",
  "천천히": "Slow",
  "보통": "Normal",
  "빠르게": "Fast",
  "채널별 합은 설명용 분해입니다. 실제 코드는": "Channel sums are an explanatory breakdown. The actual code accumulates in",
  "순서로 하나의 float32 sum에 누적합니다.": "order into a single float32 sum.",
  "계산 기록과 배열 주소 펼치기": "Expand calculation trace and array addresses",
  "순서": "Step",
  "누적 sum": "Running sum",
  "필터의 두께와 출력의 두께": "Filter depth and output depth",
  "입력 채널을 따로 출력하지 않는 이유": "Why input channels do not become separate outputs",
  "필터 하나가 찾는 특징은 모든 입력 채널의 정보를 함께 사용합니다. c별 곱을 하나의 sum에 더하기 때문에 c 차원은 출력에서 사라집니다. 서로 다른 필터 m의 sum은 각각 저장하므로 m 차원은 출력에 남습니다.": "Each filter uses information from every input channel. Products across c are accumulated into one sum, so c disappears from the output. Each filter m stores its own sum, so m remains as the output channel dimension.",
  "이 계산이 다음 Lab에서 어떻게 이어질까?": "How does this calculation connect to later labs?",
  "TF 입력·weight": "TF inputs · weights",
  "직접 누적": "Direct accumulation",
  "정수·HW MAC": "Integer · HW MAC",
  "현재 화면은 Lab 2의 float32 convolution을 재현합니다. 아래 실제 코드 조각으로 정수 계산과 hardware MAC 호출까지 연결해 읽을 수 있습니다.": "This view reproduces Lab 2 float32 convolution. Read the original excerpts below to connect it to integer arithmetic and hardware MAC calls.",
  "내 저장소의 실제 코드": "Original code from the lab repositories",
  "Stride 1 · padding 없음 · batch 1 · Lab 2 코드의 float32 연산 순서": "Stride 1 · no padding · batch 1 · Lab 2 float32 operation order",
  "사용법 / 데이터 출처": "Guide / data sources",
  "데이터 선택": "Choose data",
  "난수 실험 설정": "Random experiment settings",
  "난수 seed": "Random seed",
  "텐서 크기 관계": "Tensor shape relationship",
  "관찰할 입력 채널": "Input channel to inspect",
  "입력 이미지와 선택한 필터 창": "Input image and selected filter window",
  "실제 RGB 입력 이미지": "Real RGB input image",
  "선택한 필터의 bias": "Selected filter bias",
  "완성된 출력 채널. 클릭하여 출력 위치 선택": "Completed output channel. Click to choose a position",
  "처음으로": "Reset calculation",
  "누적한 곱 개수": "Number of accumulated products",
  "현재 단계의 코드": "Code at the current step",
  "Lab 코드 선택": "Choose lab source code",
  "input × weight": "input × weight"
};
  const url = new URL(location.href);
  let stored;
  try { stored = localStorage.getItem('conv-explorer-language'); } catch (_) {}
  let language = ['ko','en'].includes(url.searchParams.get('lang')) ? url.searchParams.get('lang')
    : ['ko','en'].includes(stored) ? stored : navigator.language.startsWith('ko') ? 'ko' : 'en';
  const copy = [], attributes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement.closest('script,style,pre,code')) continue;
    const text = node.nodeValue.trim();
    if (dictionary[text]) copy.push({node, ko:node.nodeValue, en:node.nodeValue.replace(text,dictionary[text])});
  }
  document.querySelectorAll('[aria-label]').forEach(element => {
    const ko = element.getAttribute('aria-label');
    if (dictionary[ko]) attributes.push({element, ko, en:dictionary[ko]});
  });
  function apply() {
    document.documentElement.lang = language;
    document.title = language === 'ko' ? 'Conv Flow Explorer · 코드로 보는 convolution' : 'Conv Flow Explorer · Convolution through code';
    document.querySelector('meta[name=description]').content = language === 'ko'
      ? '실제 Lab 코드와 함께 convolution의 입력, 필터, 채널, 누적 과정을 따라가는 한영 학습 도구'
      : 'A Korean / English learning tool tracing convolution inputs, filters, channels and accumulation with original lab code.';
    copy.forEach(item => { if(item.node.isConnected) item.node.nodeValue = item[language]; });
    attributes.forEach(item => item.element.setAttribute('aria-label', item[language]));
    document.querySelectorAll('[data-language]').forEach(button => {
      const active = button.dataset.language === language;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
  }
  function set(next) {
    if(!['ko','en'].includes(next)) return;
    language = next;
    try { localStorage.setItem('conv-explorer-language',language); } catch (_) {}
    const nextURL = new URL(location.href); nextURL.searchParams.set('lang',language);
    try { history.replaceState(null,'',nextURL); } catch (_) {}
    apply();
    document.dispatchEvent(new Event('conv-languagechange'));
  }
  globalThis.ConvI18n = {text:(ko,en)=>language==='ko'?ko:en, get language(){return language;}, set};
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click',()=>set(button.dataset.language)));
  apply();
})();
