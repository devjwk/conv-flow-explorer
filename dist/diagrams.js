(() => {
  'use strict';
  const page = document.body.dataset.layer || 'convolution';
  const copy = {
    convolution: {
      title: ['합성곱은 무엇을 하나요?', 'What does convolution do?'],
      description: ['필터를 입력 위로 움직이며 각 위치의 R×S×C개 값을 weight와 곱해 bias에 더합니다. ReLU를 거친 값 하나가 그 필터의 출력 채널 한 칸이 됩니다.', 'Slide a filter over the input. At each position, multiply R×S×C values by weights, add the bias, and apply ReLU. The result fills one cell of that filter’s output channel.'],
      example: ['예: 1×1 창·2채널이면 2×4 + 3×(−1) + bias 1 = 6 → ReLU 출력 6', 'Example: with a 1×1 window and 2 channels, 2×4 + 3×(−1) + bias 1 = 6 → ReLU output 6'],
      why: ['서로 다른 필터는 다른 특징을 찾으므로 출력 채널도 따로 생깁니다.', 'Different filters can detect different features, so each gets a separate output channel.'],
      steps: [['입력 창 · R×S칸×C채널', 'Input window · R×S positions×C channels'], ['필터 · C개 조각', 'Filter · C slices'], ['출력 · P×Q칸×M채널', 'Output · P×Q positions×M channels']],
      units: ['H/W/P/Q/R/S = 공간 칸 수(픽셀 위치) · C/M = 채널 수 · 각 칸의 숫자 = 단위 없는 활성값', 'H/W/P/Q/R/S = spatial positions (pixel locations) · C/M = channel counts · cell numbers = unitless activations']
    },
    pool: {
      title: ['최댓값 풀링은 무엇을 하나요?', 'What does max pooling do?'],
      description: ['각 채널에서 2×2 창의 네 값을 비교하고 최댓값 하나만 남깁니다. 창을 두 칸씩 이동하므로 가로·세로 크기는 절반이 되고 채널 수는 그대로입니다.', 'Compare four values in a 2×2 window within each channel and keep the maximum. Moving by two positions halves height and width while preserving the channel count.'],
      example: ['예: [1, 4; 2, 3] → max = 4 (곱셈·weight 없음)', 'Example: [1, 4; 2, 3] → max = 4 (no multiplication or weights)'],
      why: ['강한 반응을 남기면서 다음 레이어가 처리할 공간 위치를 줄입니다.', 'It retains strong responses and gives later layers fewer spatial positions to process.'],
      steps: [['입력 · H×W칸×C채널', 'Input · H×W positions×C channels'], ['2×2칸 최댓값', '2×2-position maximum'], ['출력 · H/2×W/2칸×C채널', 'Output · H/2×W/2 positions×C channels']],
      units: ['H/W = 공간 칸 수(픽셀 위치) · C = 채널 수 · 2×2 = 채널별 비교 창의 크기', 'H/W = spatial positions (pixel locations) · C = channel count · 2×2 = window size per channel']
    },
    flatten: {
      title: ['평탄화는 무엇을 하나요?', 'What does flatten do?'],
      description: ['특징맵의 (행, 열, 채널) 주소를 1차원 인덱스로 바꿉니다. HWC 순서를 유지해 값을 일렬로 놓을 뿐, 더하거나 곱하지 않습니다.', 'Convert each (row, column, channel) address to a 1D index. Keep HWC order and place the same values in a vector, without adding or multiplying them.'],
      example: ['예: H=W=C=2일 때 x[1,0,1] → 인덱스 (1×2+0)×2+1 = 5', 'Example: with H=W=C=2, x[1,0,1] → index (1×2+0)×2+1 = 5'],
      why: ['공간 특징맵을 Dense 레이어가 읽는 입력 벡터로 연결합니다.', 'It connects a spatial feature map to the input vector expected by a Dense layer.'],
      steps: [['특징맵 · H×W칸×C채널', 'Feature map · H×W positions×C channels'], ['순서대로 펼치기', 'Read in order'], ['벡터 · HWC개 원소', 'Vector · HWC elements']],
      units: ['H/W = 공간 칸 수 · C = 채널 수 · 4×4×128 = 2,048개 스칼라 원소. 겹친 면은 128채널을 축약해 그렸습니다.', 'H/W = spatial positions · C = channel count · 4×4×128 = 2,048 scalar elements. The stacked planes abbreviate 128 channels.']
    },
    dense: {
      title: ['완전 연결층은 무엇을 하나요?', 'What does a dense layer do?'],
      description: ['출력 뉴런마다 모든 입력에 각기 다른 weight를 곱해 bias에 더합니다. 이 모델의 Dense 1은 그 합에 ReLU를 적용해 새 특징값을 만듭니다.', 'For each output neuron, multiply every input by that neuron’s weights and add its bias. Dense 1 in this model applies ReLU to make a new feature value.'],
      example: ['예: 입력 [2,3], weight [1,2], bias −1 → 2×1 + 3×2 − 1 = 7', 'Example: inputs [2,3], weights [1,2], bias −1 → 2×1 + 3×2 − 1 = 7'],
      why: ['전체 입력 특징을 조합해 출력 뉴런마다 다른 판단 근거를 만듭니다.', 'It combines all input features into a different signal for each output neuron.'],
      steps: [['입력 · N개 원소', 'Input · N elements'], ['가중합 + bias', 'Weighted sum + bias'], ['출력 · M개 뉴런', 'Output · M neurons']],
      units: ['N/M = 원소·뉴런 개수 · 입력값/weight/bias/출력값 = 단위 없는 수치', 'N/M = element and neuron counts · inputs/weights/bias/outputs = unitless numbers']
    },
    softmax: {
      title: ['소프트맥스는 무엇을 하나요?', 'What does softmax do?'],
      description: ['클래스별 점수(logit)를 exp로 양수로 바꾼 뒤 전체 exp의 합으로 나눕니다. 점수가 클수록 결과도 커지고, 모든 출력의 합은 1이 됩니다.', 'Convert class scores (logits) to positive values with exp, then divide each by the total. Higher scores get larger results, and all outputs sum to 1.'],
      example: ['예: 점수 [0,1] → exp [1,2.718] → 결과 약 [0.269,0.731]', 'Example: scores [0,1] → exp [1,2.718] → outputs about [0.269,0.731]'],
      why: ['서로 다른 클래스 점수를 한 분포 안에서 비교할 수 있게 합니다.', 'It makes scores comparable within one distribution over classes.'],
      steps: [['입력 · 200개 점수', 'Input · 200 scores'], ['exp ÷ 전체 합', 'exp ÷ total'], ['출력 · 200개 확률', 'Output · 200 probabilities']],
      units: ['점수와 확률에는 물리 단위가 없습니다. 출력 확률은 0~1이며 200개를 더하면 1입니다. 막대의 입체 두께는 데이터 차원이 아닙니다.', 'Scores and probabilities have no physical unit. Each output is 0–1; all 200 outputs sum to 1. Bar depth is visual only, not a data dimension.']
    }
  }[page];
  if (!copy) return;
  const intro = document.querySelector(page === 'convolution' ? '.intro' : '.layer-intro');
  if (!intro) return;
  const section = document.createElement('section');
  section.className = 'principle-section';
  section.setAttribute('aria-label', 'Layer principle diagram');
  intro.after(section);

  const shape = (x, y, w, h, depth, color) => {
    const top = `${x},${y} ${x+depth},${y-depth*.52} ${x+w+depth},${y-depth*.52} ${x+w},${y}`;
    const side = `${x+w},${y} ${x+w+depth},${y-depth*.52} ${x+w+depth},${y+h-depth*.52} ${x+w},${y+h}`;
    return `<polygon points="${top}" fill="${color}" fill-opacity=".21" stroke="${color}" stroke-opacity=".75"/><polygon points="${side}" fill="${color}" fill-opacity=".15" stroke="${color}" stroke-opacity=".75"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" fill-opacity=".08" stroke="${color}" stroke-width="1.5"/>`;
  };
  const grid = (x, y, w, h, cols, rows, color) => {
    let result='';
    for(let c=1;c<cols;c++)result+=`<line x1="${x+c*w/cols}" y1="${y}" x2="${x+c*w/cols}" y2="${y+h}" stroke="${color}" stroke-opacity=".35"/>`;
    for(let r=1;r<rows;r++)result+=`<line x1="${x}" y1="${y+r*h/rows}" x2="${x+w}" y2="${y+r*h/rows}" stroke="${color}" stroke-opacity=".35"/>`;
    return result;
  };
  const dot = (x,y,color,r=5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" fill-opacity=".82"/>`;
  const line = (x1,y1,x2,y2,color='#9ba6bb',opacity=.6) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.4"/>`;
  const arrow = (x1,y1,x2,y2) => `<path d="M${x1} ${y1} L${x2} ${y2} m-10 -7 10 7 -10 7" fill="none" stroke="#aeb9d2" stroke-width="2" stroke-linejoin="round"/>`;
  const text = (x,y,value,color='#cbd5e7',size=14) => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-family="ui-monospace, SFMono-Regular, Consolas, monospace">${value}</text>`;
  const tag = (x,y,value,color='#cbd5e7') => `<text x="${x}" y="${y}" fill="${color}" stroke="#0d1321" stroke-width="5" paint-order="stroke" font-size="15" font-weight="600" font-family="ui-monospace, SFMono-Regular, Consolas, monospace">${value}</text>`;
  const bracketH = (x1,x2,y,label,tx,ty,color) => `${line(x1,y,x2,y,color,1)}${line(x1,y-7,x1,y+7,color,1)}${line(x2,y-7,x2,y+7,color,1)}${tag(tx,ty,label,color)}`;
  const bracketV = (x,y1,y2,label,tx,ty,color) => `${line(x,y1,x,y2,color,1)}${line(x-7,y1,x+7,y1,color,1)}${line(x-7,y2,x+7,y2,color,1)}${tag(tx,ty,label,color)}`;
  const bracketD = (x1,y1,x2,y2,label,tx,ty,color) => `${line(x1,y1,x2,y2,color,1)}${dot(x1,y1,color,2)}${dot(x2,y2,color,2)}${tag(tx,ty,label,color)}`;
  function picture(kind, en) {
    const cyan='#62e3d6', violet='#c2a4ff', orange='#ffb579';
    let svg='';
    if(kind==='convolution'){
      for(let i=2;i>=0;i--){const x=52+i*22,y=80-i*13;svg+=shape(x,y,138,132,25,cyan)+grid(x,y,138,132,5,5,cyan);}
      svg+=`<rect x="88" y="95" width="55" height="53" fill="${orange}" fill-opacity=".25" stroke="${orange}" stroke-width="3"/>`;
      svg+=arrow(273,140,336,140);
      for(let i=2;i>=0;i--){const x=366+i*18,y=105-i*10;svg+=shape(x,y,82,82,18,violet)+grid(x,y,82,82,3,3,violet);}
      svg+=text(468,153,'×  Σ',orange,23)+arrow(550,140,626,140);
      for(let i=2;i>=0;i--){const x=665+i*20,y=83-i*11;svg+=shape(x,y,133,129,22,violet)+grid(x,y,133,129,5,5,violet);}
      svg+=`<rect x="720" y="120" width="26" height="26" fill="${orange}" stroke="${orange}"/>`;
      svg+=bracketV(37,80,212,en?'R rows':'R행',5,150,cyan)+bracketH(52,190,226,en?'S columns':'S열',82,251,cyan);
      svg+=bracketD(195,78,241,51,en?'C channels':'C채널',207,39,cyan);
      svg+=bracketH(366,448,202,en?'R×S filter':'R×S 필터',357,225,violet);
      svg+=bracketV(648,83,212,en?'P rows':'P행',617,152,violet)+bracketH(665,798,226,en?'Q columns':'Q열',693,251,violet);
      svg+=bracketD(804,81,844,59,en?'M channels':'M채널',826,42,violet);
    } else if(kind==='pool'){
      for(let i=2;i>=0;i--){const x=65+i*21,y=80-i*12;svg+=shape(x,y,177,135,24,cyan)+grid(x,y,177,135,4,4,cyan);}
      svg+=`<rect x="109" y="113" width="88" height="67" fill="${orange}" fill-opacity=".22" stroke="${orange}" stroke-width="3"/>`;
      svg+=arrow(322,145,411,145)+text(447,151,'max(2×2)',orange,20)+arrow(570,145,662,145);
      for(let i=2;i>=0;i--){const x=702+i*20,y=98-i*11;svg+=shape(x,y,102,102,20,violet)+grid(x,y,102,102,2,2,violet);}
      svg+=`<rect x="742" y="138" width="51" height="51" fill="${orange}" fill-opacity=".3" stroke="${orange}" stroke-width="2"/>`;
      svg+=bracketV(47,80,215,en?'56 rows':'56행',7,150,cyan)+bracketH(65,242,229,en?'56 columns':'56열',103,253,cyan);
      svg+=bracketD(245,78,287,54,en?'32 channels':'32채널',258,39,cyan);
      svg+=bracketV(684,98,200,en?'28 rows':'28행',647,156,violet)+bracketH(702,804,218,en?'28 columns':'28열',716,242,violet);
      svg+=bracketD(805,96,844,75,en?'32 channels':'32채널',818,58,violet);
    } else if(kind==='flatten'){
      for(let i=2;i>=0;i--){const x=64+i*23,y=92-i*13;svg+=shape(x,y,147,121,24,cyan)+grid(x,y,147,121,4,4,cyan);}
      svg+=arrow(330,145,470,145)+text(383,124,'HWC',orange,16);
      for(let i=0;i<9;i++){const x=520+i*39;svg+=shape(x,120,29,43,8,i===3?orange:violet);svg+=text(x+8,146,String(i),i===3?'#ffb579':'#cbd5e7',12);}
      svg+=text(866,149,'…',violet,25);
      svg+=bracketV(45,92,213,en?'4 rows':'4행',7,154,cyan)+bracketH(64,211,228,en?'4 columns':'4열',108,252,cyan);
      svg+=bracketD(215,90,261,64,en?'128 channels':'128채널',246,47,cyan);
      svg+=bracketH(520,861,187,en?'2,048 elements':'원소 2,048개',629,214,violet);
    } else if(kind==='dense'){
      const ins=[74,111,148,185,222],outs=[91,145,199];
      svg+=shape(176,64,87,177,22,cyan)+shape(665,70,92,167,23,violet);
      ins.forEach(y=>{outs.forEach(oy=>svg+=line(238,y,710,oy,violet,.23));svg+=dot(238,y,cyan,8);});
      outs.forEach((y,i)=>{svg+=dot(710,y,violet,13);svg+=text(746,y+5,`y${i}`,violet,15);});
      svg+=text(95,40,'x[0…N−1]',cyan,17)+text(432,42,'Σ x[n]·w[n,m] + b[m]',orange,16)+text(678,40,'ReLU',violet,17);
      svg+=text(223,261,'⋮',cyan,26)+text(699,261,'⋮',violet,26);
      svg+=bracketV(155,64,241,en?'2,048 inputs':'입력 2,048개',12,161,cyan);
      svg+=bracketV(788,70,237,en?'256 neurons':'뉴런 256개',803,160,violet);
    } else if(kind==='softmax'){
      const left=[58,112,76,172,91],right=[37,70,47,126,56];
      for(let i=0;i<5;i++){
        const x=92+i*44;svg+=shape(x,220-left[i],26,left[i],9,cyan);
        const rx=678+i*44;svg+=shape(rx,220-right[i],26,right[i],9,i===3?orange:violet);
      }
      svg+=arrow(350,144,428,144)+text(452,149,'exp / Σ exp',orange,20)+arrow(582,144,648,144);
      svg+=bracketH(92,294,238,en?'200 scores':'점수 200개',121,263,cyan);
      svg+=bracketH(678,880,238,en?'200 probabilities':'확률 200개',701,263,violet);
      svg+=bracketV(65,47,220,en?'unitless':'단위 없음',5,135,cyan);
      svg+=bracketV(908,94,220,en?'0–1':'0~1',919,164,violet);
      svg+=tag(768,284,en?'sum = 1':'합계 = 1',orange);
    }
    return `<svg class="principle-svg" viewBox="0 0 960 290" role="img" aria-label="${kind} operation shown as layered 3D shapes" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="diagram-bg" x2="1" y2="1"><stop stop-color="#62e3d6" stop-opacity=".09"/><stop offset="1" stop-color="#c2a4ff" stop-opacity=".08"/></linearGradient></defs><rect width="960" height="290" fill="url(#diagram-bg)"/>${svg}</svg>`;
  }
  function render() {
    const i=ConvI18n.language==='en'?1:0;
    section.setAttribute('aria-label',i?'Layer principle diagram':'레이어 원리 다이어그램');
    section.innerHTML=`<div class="principle-heading"><span class="eyebrow">LAYER PRINCIPLE / 3D VIEW</span><h2>${copy.title[i]}</h2><p>${copy.description[i]}</p><div class="principle-example"><strong>${i?'SMALL EXAMPLE':'작은 예시'}</strong><span>${copy.example[i]}</span></div><p class="principle-why"><strong>${i?'WHY IT MATTERS':'왜 쓰나요?'}</strong> ${copy.why[i]}</p></div><div class="principle-figure">${picture(page,i)}<div class="principle-legend">${copy.steps.map((entry,j)=>`<span><b>0${j+1}</b>${entry[i]}</span>`).join('')}</div><p class="principle-units"><strong>${i?'UNITS':'단위'}</strong> ${copy.units[i]}</p></div>`;
    section.querySelector('svg').setAttribute('aria-label',copy.description[i]);
  }
  document.addEventListener('conv-languagechange',render);
  render();
})();
