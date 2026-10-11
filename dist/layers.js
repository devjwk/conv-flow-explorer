(() => {
  'use strict';
  const $=id=>document.getElementById(id), tr=(ko,en)=>ConvI18n.text(ko,en);
  const page=document.body.dataset.layer;
  const spec={
    pool:{name:['최댓값 풀링','Max Pooling'],kicker:'02 / MAX POOLING',intro:['작은 창에서 가장 큰 값만 남깁니다. 같은 채널 안에서 공간 크기를 줄이는 과정을 따라가세요.','Keep only the largest value in each window. Follow how spatial size shrinks within the same channel.'],input:'56 × 56 × 32',operation:'2 × 2 MAX',output:'28 × 28 × 32',selector:['출력 위치와 채널 선택','Choose output position and channel'],selectorNote:['선택한 채널의 2×2 입력 네 개가 출력 하나가 됩니다.','Four inputs in the selected channel become one output value.'],headings:[['입력 창의 네 값','Four input values'],['비교 중인 최댓값','Current maximum'],['선택한 출력값','Selected output']],concept:['2×2 창의 최댓값을 뽑고, 다음 창으로 두 칸 이동합니다. 곱셈이나 가중치는 없습니다.','Take the maximum in a 2×2 window, then move two positions. There are no weights or multiplications.'],role:['가로·세로를 절반으로 줄이면서 강한 특징을 남깁니다. 채널 32개는 그대로 유지합니다.','Halve height and width while retaining strong features. The 32 channels remain.'],source:['Lab 2 MaxPoolingLayer::computeNaive','실제 모델의 첫 번째 풀링: Conv 2 출력 → Max Pool 1','First pooling in the model: Conv 2 output → Max Pool 1']},
    flatten:{name:['평탄화','Flatten'],kicker:'03 / FLATTEN',intro:['3차원 특징맵의 값을 순서대로 1차원 벡터에 놓습니다. 숫자 자체는 바뀌지 않습니다.','Place the values of a 3D feature map into a 1D vector in order. The numbers themselves do not change.'],input:'4 × 4 × 128',operation:'HWC → VECTOR',output:'2,048',selector:['입력 좌표 선택','Choose input coordinates'],selectorNote:['h, w, c를 고르면 대응하는 1차원 인덱스를 보여줍니다.','Choose h, w, c to see the corresponding vector index.'],headings:[['3차원 입력 좌표','3D input coordinate'],['주소 변환','Index mapping'],['1차원 출력 위치','1D output position']],concept:['HWC 배열의 저장 순서가 이미 Flatten의 출력 순서와 같으므로 Lab 2 코드는 memcpy로 값을 그대로 복사합니다.','The HWC storage order already matches Flatten output order, so the Lab 2 code copies the values unchanged with memcpy.'],role:['위치와 채널로 구성된 특징맵을 Dense 레이어가 읽을 수 있는 길이 2,048의 벡터로 바꿉니다.','Turn the spatial feature map into a 2,048-element vector for the Dense layer.'],source:['Lab 2 FlattenLayer::computeNaive','실제 모델의 Flatten: Max Pool 3 출력 → Dense 1 입력','Flatten in the model: Max Pool 3 output → Dense 1 input']},
    dense:{name:['완전 연결','Dense'],kicker:'04 / DENSE',intro:['한 출력 뉴런에 모든 입력을 연결하고, 곱한 값을 bias에 누적합니다.','Connect every input to one output neuron and accumulate its weighted products onto the bias.'],input:'2,048',operation:'WEIGHTED SUM + ReLU',output:'256',selector:['출력 뉴런 선택','Choose output neuron'],selectorNote:['m을 바꾸면 같은 입력 벡터에 다른 weight 열과 bias가 적용됩니다.','Changing m applies a different weight column and bias to the same input vector.'],headings:[['입력 벡터 x[n]','Input vector x[n]'],['현재 weight와 누적합','Current weight and sum'],['출력 뉴런 y[m]','Output neuron y[m]']],concept:['각 m에 대해 sum=bias[m]으로 시작해 n=0…2047 순서로 input[n]×weight[n×256+m]을 더하고 ReLU를 적용합니다.','For each m, start with sum=bias[m], add input[n]×weight[n×256+m] for n=0…2047, then apply ReLU.'],role:['이전 특징 2,048개를 결합해 256개의 새로운 특징값을 만듭니다.','Combine 2,048 earlier features into 256 new feature values.'],source:['Lab 2 DenseLayer::computeNaive','실제 모델의 Dense 1: Flatten 2,048 → 출력 256','Dense 1 in the model: Flatten 2,048 → output 256']},
    softmax:{name:['소프트맥스','Softmax'],kicker:'05 / SOFTMAX',intro:['200개 점수를 서로 비교 가능한 값으로 정규화합니다. exp와 전체 합을 따라가세요.','Normalize 200 scores into comparable values. Follow the exponentials and their shared denominator.'],input:'200 LOGITS',operation:'exp + NORMALIZE',output:'200 VALUES',selector:['출력 인덱스 선택','Choose output index'],selectorNote:['선택한 점수의 exp 값과 전체 200개 exp의 합을 비교합니다.','Compare the selected score’s exponential with the sum of all 200 exponentials.'],headings:[['입력 점수 g[i]','Input score g[i]'],['안정화된 지수와 전체 합','Shifted exponential and total'],['정규화 결과 y[i]','Normalized result y[i]']],concept:['모든 점수에서 최댓값을 뺀 뒤 exp를 계산합니다. 같은 값을 빼도 결과 비율은 같고 overflow를 피할 수 있습니다.','Subtract the largest score before exp. This keeps the ratios the same and avoids overflow.'],role:['200개 클래스 점수를 합이 약 1인 상대적 값으로 바꿉니다. 이 화면에는 클래스 이름이 없어 인덱스로 표시합니다.','Turn 200 class scores into relative values summing to about 1. Class names are unavailable, so this page shows indices.'],source:['Lab 2 SoftmaxLayer::computeNaive','실제 모델의 Dense 2 logits → Softmax. Dense 2는 ReLU를 사용하지 않습니다.','Dense 2 logits → Softmax in the real model. Dense 2 does not use ReLU.']}
  }[page];
  if(!spec) return;
  const arrays={};
  function values(name){
    if(arrays[name])return arrays[name];
    const binary=atob(LAYER_DATA[name]),bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    return arrays[name]=new Float32Array(bytes.buffer);
  }
  const fmt=n=>!Number.isFinite(n)?'—':Math.abs(n)>0&&Math.abs(n)<0.0001?n.toExponential(4):Number(n.toPrecision(7)).toString();
  const label=(ko,en)=>tr(ko,en);
  const state={p:0,q:0,c:page==='pool'?2:0,h:0,w:0,m:0,i:page==='softmax'?170:0,step:0,timer:null};
  const denseInput=page==='dense'?values('denseInput'):null;
  const denseWeights=page==='dense'?values('denseWeights'):null;
  const denseBias=page==='dense'?values('denseBias'):null;
  let logits=null, shifted=null, exponentials=null, softmaxSum=0, maxLogit=0;
  if(page==='softmax'){
    const input=values('denseOutput'),weights=values('dense2Weights'),bias=values('dense2Bias');
    logits=new Float32Array(200);
    for(let m=0;m<200;m++){
      let sum=bias[m];
      for(let n=0;n<256;n++)sum=Math.fround(sum+Math.fround(input[n]*weights[n*200+m]));
      logits[m]=sum;
    }
    maxLogit=Math.max(...logits);shifted=new Float32Array(200);exponentials=new Float32Array(200);
    for(let i=0;i<200;i++){
      shifted[i]=Math.fround(logits[i]-maxLogit);
      exponentials[i]=Math.fround(Math.exp(shifted[i]));
      softmaxSum=Math.fround(softmaxSum+exponentials[i]);
    }
  }
  function maximum(){return page==='pool'?4:page==='flatten'?2048:page==='dense'?2048:200;}
  function field(name,max,value,ko,en){return `<label>${label(ko,en)}<input type="number" min="0" max="${max}" value="${value}" data-field="${name}"></label>`;}
  function setField(name,n){
    const limits={p:27,q:27,c:page==='pool'?31:127,h:3,w:3,m:255,i:199};
    state[name]=Math.max(0,Math.min(limits[name],Number.isFinite(+n)?Math.trunc(+n):0));
    state.step=0;stop();render();
  }
  function stop(){if(state.timer){clearInterval(state.timer);state.timer=null;}}
  function setStep(n){state.step=Math.max(0,Math.min(maximum(),Math.trunc(+n)||0));render();}
  function matrix(items,cols,active=-1,winner=-1){
    return `<div class="layer-matrix" style="--columns:${cols}">${items.map((n,i)=>`<div class="layer-cell ${i===active?'active':''} ${i===winner?'maximum':''}">${fmt(n)}</div>`).join('')}</div>`;
  }
  function title(id,text){$(id).textContent=text;}
  function renderPool(){
    const {p,q,c,step}=state,inp=values('poolInput'),out=values('poolOutput');
    const indexes=[0,1,2,3].map(j=>(((p*2+Math.floor(j/2))*56)+(q*2+j%2))*32+c);
    const samples=indexes.map(i=>inp[i]),max=Math.max(...samples),arg=samples.indexOf(max);
    let running=samples[0];for(let j=1;j<step;j++)running=Math.max(running,samples[j]);
    const final=out[(p*28+q)*32+c];
    title('input-kicker',`x[${p*2}:${p*2+2}, ${q*2}:${q*2+2}, ${c}]`);
    $('input-visual').innerHTML=matrix(samples,2,step?step-1:-1,step===4?arg:-1)+`<p class="layer-detail">${label('같은 채널 c 안의 네 값','Four values from the same channel c')}</p>`;
    $('process-visual').innerHTML=`<div class="layer-number"><small>${label('현재까지의 최대값','Maximum so far')}</small>${fmt(running)}</div><div class="layer-formula">max(${samples.map(fmt).join(', ')}) = ${fmt(max)}</div><p class="layer-detail">${label('비교','Comparisons')} ${step} / 4 · ${label('승자 위치','Winner position')} r=${Math.floor(arg/2)}, s=${arg%2}</p>`;
    $('output-visual').innerHTML=`<div class="layer-number"><small>y[${p},${q},${c}]</small>${fmt(final)}</div><p class="layer-detail">${label('원본 Lab 2 참조 출력 · 채널 수 유지','Original Lab 2 reference output · channel count preserved')}</p>`;
    $('layer-stage').innerHTML=`<div class="layer-formula">${step===0?label('첫 값을 최대값으로 설정합니다.','Initialize maximum with the first value.'):step<4?label(`${step}개 값을 확인했습니다. 다음 값을 비교하세요.`,`Inspected ${step} values. Compare the next one.`):label('네 값을 모두 비교했습니다. 최댓값을 출력에 저장합니다.','All four values inspected. Store the maximum as output.')}</div>`;
  }
  function renderFlatten(){
    const {h,w,c,step}=state,index=(h*4+w)*128+c,inp=values('flattenInput'),out=values('flattenOutput');
    const surrounding=[];for(let j=Math.max(0,index-3);j<=Math.min(2047,index+3);j++)surrounding.push(`<span class="${j===index?'active':''}">[${j}] ${fmt(inp[j])}</span>`);
    $('input-visual').innerHTML=`<div class="layer-number"><small>x[${h},${w},${c}]</small>${fmt(inp[index])}</div><div class="layer-ribbon">${surrounding.join('')}</div>`;
    $('process-visual').innerHTML=`<div class="layer-formula">(${h} × 4 + ${w}) × 128 + ${c} = <b>${index}</b></div><p class="layer-detail">${label('값은 변하지 않고 주소만 다시 표현됩니다.','The value stays the same; only its address is expressed differently.')}</p>`;
    $('output-visual').innerHTML=`<div class="layer-number"><small>y[${index}]</small>${fmt(out[index])}</div><p class="layer-detail">${label('입력과 출력의 차이','Input–output difference')}: ${fmt(Math.abs(inp[index]-out[index]))}</p>`;
    $('layer-stage').innerHTML=`<div class="layer-formula">${step<index?label(`벡터의 처음 ${step}개 값이 복사된 상태입니다. 선택한 값은 인덱스 ${index}에 있습니다.`,`The first ${step} vector entries are copied. The selected value is at index ${index}.`):label(`인덱스 ${index}의 값이 같은 순서로 복사되었습니다.`,`Entry ${index} has been copied in the same order.`)}</div>`;
  }
  function denseTrace(){
    const m=state.m;let sum=denseBias[m],before=sum,product=0,x=0,w=0;
    for(let n=0;n<state.step;n++){
      x=denseInput[n];w=denseWeights[n*256+m];before=sum;product=Math.fround(x*w);sum=Math.fround(sum+product);
    }
    return {sum,before,product,x,w};
  }
  function renderDense(){
    const {m,step}=state,t=denseTrace(),out=values('denseOutput');
    const n=Math.max(0,step-1),currentX=denseInput[n],currentW=denseWeights[n*256+m];
    $('input-visual').innerHTML=`<div class="layer-number"><small>x[${n}]</small>${fmt(currentX)}</div><p class="layer-detail">N = 2,048 · n = 0…2,047<br>${label('모든 출력 뉴런이 이 입력 벡터를 공유합니다.','Every output neuron shares this input vector.')}</p>`;
    $('process-visual').innerHTML=`<div class="layer-formula">${fmt(currentX)} × ${fmt(currentW)} = ${fmt(Math.fround(currentX*currentW))}</div><div class="layer-number"><small>${label('지금까지 누적한 sum','Running sum')}</small>${fmt(t.sum)}</div><p class="layer-detail">${label('시작 bias','Initial bias')}[${m}] = ${fmt(denseBias[m])}</p>`;
    $('output-visual').innerHTML=`<div class="layer-number"><small>y[${m}] · ReLU</small>${fmt(out[m])}</div><p class="layer-detail">${label('원본 Lab 2 참조 출력','Original Lab 2 reference output')}. ${label('끝까지 계산한 값과 비교하세요.','Finish the calculation to compare.')}</p>`;
    $('layer-stage').innerHTML=`<div class="layer-formula">${step===0?label('sum을 bias로 초기화합니다.','Initialize sum with bias.'):step<2048?`n=${n} · ${fmt(t.before)} + (${fmt(t.x)} × ${fmt(t.w)}) = ${fmt(t.sum)}`:`ReLU(${fmt(t.sum)}) = ${fmt(Math.max(0,t.sum))}`}</div><p class="layer-detail">weightIdx = n × 256 + m · ${label('현재 인덱스','Current index')} ${n*256+m}</p>`;
  }
  function renderSoftmax(){
    const {i,step}=state,ref=values('softmaxOutput');let partial=0;
    for(let n=0;n<step;n++)partial=Math.fround(partial+exponentials[n]);
    const calculated=Math.fround(exponentials[i]/softmaxSum),top=[...Array(200).keys()].sort((a,b)=>ref[b]-ref[a]).slice(0,6);
    $('input-visual').innerHTML=`<div class="layer-number"><small>g[${i}]</small>${fmt(logits[i])}</div><p class="layer-detail">max(g) = ${fmt(maxLogit)}<br>g[${i}] − max(g) = ${fmt(shifted[i])}</p>`;
    $('process-visual').innerHTML=`<div class="layer-formula">exp(${fmt(shifted[i])}) = ${fmt(exponentials[i])}</div><div class="layer-number"><small>${label('현재까지의 분모','Denominator so far')}</small>${fmt(partial)}</div><p class="layer-detail">${label('전체 분모','Full denominator')} = ${fmt(softmaxSum)}</p>`;
    $('output-visual').innerHTML=`<div class="layer-number"><small>y[${i}]</small>${fmt(ref[i])}</div><p class="layer-detail">${label('계산값','Calculated')} ${fmt(calculated)} · ${label('참조와 차이','Difference from reference')} ${fmt(Math.abs(calculated-ref[i]))}</p><div class="layer-detail">${label('가장 큰 출력 여섯 개','Six largest outputs')}</div>${top.map(j=>`<div class="layer-bar-row"><span>[${j}]</span><span class="layer-bar"><i style="width:${(ref[j]/ref[top[0]]*100).toFixed(2)}%"></i></span><span>${fmt(ref[j])}</span></div>`).join('')}`;
    $('layer-stage').innerHTML=`<div class="layer-formula">${step===0?label('모든 점수에서 최대값을 뺍니다.','Subtract the maximum from every score.'):step<200?label(`${step}개 exp 값을 분모에 더했습니다.`,`Added ${step} exponentials to the denominator.`):`y[${i}] = exp(g[${i}] − max) / Σ exp(g − max) ≈ ${fmt(calculated)}`}</div>`;
  }
  function render(){
    const en=ConvI18n.language==='en';
    title('layer-kicker',spec.kicker);title('layer-title',label(...spec.name));title('layer-intro-text',label(...spec.intro));
    title('layer-input-shape',spec.input);title('layer-operation',spec.operation);title('layer-output-shape',spec.output);
    title('selector-kicker',label('01 / 출력 선택','01 / SELECT OUTPUT'));title('selector-title',label(...spec.selector));title('selector-description',label(...spec.selectorNote));
    const heads=spec.headings.map(x=>label(...x));['input-title','process-title','output-title'].forEach((id,i)=>title(id,heads[i]));
    title('input-kicker','INPUT');title('process-kicker','PROCESS');title('output-kicker','OUTPUT');
    title('playback-title',label('한 단계씩 따라가기','Follow the operation step by step'));
    title('playback-description',page==='pool'?label('2×2 창의 네 값을 순서대로 비교합니다.','Compare the four values in the 2×2 window in order.'):page==='flatten'?label('복사된 벡터 원소 수를 움직여 선택한 위치를 찾습니다.','Move through copied vector entries to locate the selected value.'):page==='dense'?label('선택한 뉴런의 2,048개 곱을 bias에 누적합니다.','Accumulate 2,048 products for the selected neuron onto its bias.'):label('200개 exp를 분모에 순서대로 더합니다.','Add 200 exponentials to the denominator in order.'));
    title('concept-kicker',label('개념','CONCEPT'));title('concept-title',label('무엇을 계산하나요?','What is calculated?'));title('concept-text',label(...spec.concept));
    title('role-kicker',label('역할','ROLE'));title('role-title',label('모델에서 왜 필요할까요?','Why is it in the model?'));title('role-text',label(...spec.role));
    title('source-title',spec.source[0]);title('source-note',label(spec.source[1],spec.source[2]));
    const source=LAYER_DATA.sources[page];title('layer-source-path',`${source.path} · ${label(`${source.start}행부터`,`from line ${source.start}`)}`);
    $('layer-code').textContent=source.code.split('\n').map((line,j)=>`${String(source.start+j).padStart(3)}  ${line}`).join('\n');
    title('footer-note',label('Lab 2의 실제 image_0 데이터 · float32 · 원본 코드와 연결','Original Lab 2 image_0 data · float32 · linked to source code'));
    const fields=page==='pool'?field('p',27,state.p,'출력 행 p','Output row p')+field('q',27,state.q,'출력 열 q','Output column q')+field('c',31,state.c,'채널 c','Channel c'):page==='flatten'?field('h',3,state.h,'입력 행 h','Input row h')+field('w',3,state.w,'입력 열 w','Input column w')+field('c',127,state.c,'채널 c','Channel c'):page==='dense'?field('m',255,state.m,'뉴런 m','Neuron m'):field('i',199,state.i,'클래스 인덱스 i','Class index i');
    $('layer-fields').innerHTML=fields;
    $('layer-fields').querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>setField(input.dataset.field,input.value)));
    const step=state.step,max=maximum();$('layer-progress').max=max;$('layer-progress').value=step;
    title('layer-progress-label',`${step} / ${max}`);
    title('layer-reset',label('↺ 처음','↺ Reset'));title('layer-prev',label('← 이전','← Previous'));title('layer-play',state.timer?label('Ⅱ 일시 정지','Ⅱ Pause'):label('▶ 자동 재생','▶ Play'));title('layer-next',label('다음 →','Next →'));title('layer-finish',label('끝까지','Finish'));
    $('layer-prev').disabled=step===0;$('layer-next').disabled=step===max;$('layer-finish').disabled=step===max;
    ({pool:renderPool,flatten:renderFlatten,dense:renderDense,softmax:renderSoftmax})[page]();
    document.title=`${en?spec.name[1]:spec.name[0]} · CPRE 487 Lab Flow Explorer`;
  }
  $('layer-reset').onclick=()=>{stop();setStep(0)};
  $('layer-prev').onclick=()=>{stop();setStep(state.step-1)};
  $('layer-next').onclick=()=>{stop();setStep(state.step+1)};
  $('layer-finish').onclick=()=>{stop();setStep(maximum())};
  $('layer-progress').oninput=e=>{stop();setStep(e.target.value)};
  $('layer-play').onclick=()=>{
    if(state.timer){stop();render();return;}
    if(state.step===maximum())state.step=0;
    state.timer=setInterval(()=>{state.step++;if(state.step>=maximum())stop();render();},page==='pool'?700:page==='flatten'?40:page==='dense'?15:80);
    render();
  };
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();render();}});
  document.addEventListener('conv-languagechange',render);
  render();
})();
