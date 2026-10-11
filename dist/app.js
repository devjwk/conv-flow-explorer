(() => {
  'use strict';
  const $=id=>document.getElementById(id), core=ConvCore, tr=ConvI18n.text;
  let seedNotice='';
  const actual=core.real(CONV_DATA);
  let d=core.toy(), mode='toy', p=0,q=0,m=0,viewC=0,step=0,timer=null;
  let current=core.trace(d,p,q,m), maps=new Map(), source='lab2',seed=4870;
  const fmt=v=>Math.abs(v)<1e-7 && v!==0 ? v.toExponential(3) : Number(v.toPrecision(6)).toString();
  const tiny=v=>mode!=='real' ? fmt(v) : Number(v.toFixed(2)).toString();
  const escape=s=>s.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clamp=(v,max)=>Math.max(0,Math.min(max,Number.isFinite(+v)?Math.trunc(+v):0));
  function stop(){if(timer){clearInterval(timer);timer=null;} $('play').textContent=tr('▶ 자동 재생','▶ Play');}
  function setSelection(np,nq,nm){stop();p=clamp(np,d.P-1);q=clamp(nq,d.Q-1);m=clamp(nm,d.M-1);step=0;viewC=0;current=core.trace(d,p,q,m);render();}
  function map(){if(!maps.has(m))maps.set(m,core.outputChannel(d,m));return maps.get(m);}
  function informativeFilter(){
    let selected=0,largest=0;
    for(let filter=0;filter<d.M;filter++){
      const channel=core.outputChannel(d,filter);
      const peak=Math.max(...channel);
      if(peak>largest){largest=peak;selected=filter;}
    }
    return selected;
  }
  function setMode(next){stop();mode=next;d=next==='toy'?core.toy():next==='random'?core.random(seed):actual;maps=new Map();p=q=viewC=step=0;m=next==='random'?informativeFilter():0;current=core.trace(d,p,q,m);render();
    const url=new URL(location.href);if(next==='random')url.searchParams.set('seed',seed);else url.searchParams.delete('seed');try{history.replaceState(null,'',url);}catch(_){} }
  function changed(){stop();maps.clear();step=0;current=core.trace(d,p,q,m);render();}
  function editableCell(value,change,active=false){
    const cell=document.createElement('div');cell.className='matrix-cell'+(active?' active':'');
    if(mode!=='real'){
      const input=document.createElement('input');input.type='number';input.min='-99';input.max='99';input.step='any';input.value=value;input.setAttribute('aria-label',change.label);
      input.addEventListener('change',()=>{const n=+input.value;if(input.value.trim()===''||!Number.isFinite(n)||Math.abs(n)>99){input.value=value;return;}change.action(Math.fround(n));changed();});cell.append(input);
    }else{cell.textContent=tiny(value);cell.title=fmt(value);cell.setAttribute('aria-label',`${change.label}: ${fmt(value)}`);}
    return cell;
  }
  function renderMatrices(){
    const t=step?current.terms[step-1]:null;
    $('patch-label').textContent=tr(`관찰 채널 c=${viewC} · 입력 창`,`Inspecting c=${viewC} · input window`);
    $('patch-grid').style.setProperty('--cols',d.S);$('patch-grid').replaceChildren();
    for(let r=0;r<d.R;r++)for(let s=0;s<d.S;s++){
      const xi=core.inputIndex(d,p,q,r,s,viewC);
      $('patch-grid').append(editableCell(d.input[xi],{label:tr(`입력 행 ${p+r}, 열 ${q+s}, 채널 ${viewC}`,`Input row ${p+r}, column ${q+s}, channel ${viewC}`),action:n=>{d.input[xi]=n;}},!!t&&t.r===r&&t.s===s&&t.c===viewC));
    }
    $('weight-slices').replaceChildren();
    $('weight-slices').classList.toggle('real',mode==='real');
    $('patch-grid').classList.toggle('real',mode==='real');
    for(let c=0;c<d.C;c++){
      const slice=document.createElement('div');slice.className='weight-slice'+(viewC===c?' observing':'');
      const h=document.createElement('h3');h.textContent=tr(`c=${c}용 조각`,`Slice for c=${c}`);slice.append(h);
      const grid=document.createElement('div');grid.className='matrix-grid';grid.style.setProperty('--cols',d.S);
      for(let r=0;r<d.R;r++)for(let s=0;s<d.S;s++){
        const wi=core.weightIndex(d,r,s,c,m);
        grid.append(editableCell(d.weights[wi],{label:tr(`필터 ${m}, 행 ${r}, 열 ${s}, 채널 ${c}`,`Filter ${m}, row ${r}, column ${s}, channel ${c}`),action:n=>{d.weights[wi]=n;}},!!t&&t.r===r&&t.s===s&&t.c===c));
      }
      slice.append(grid);$('weight-slices').append(slice);
    }
    $('input-edit-note').textContent=mode!=='real'?tr('숫자를 수정하면 계산이 다시 시작됩니다.','Editing a number restarts the calculation.'):tr('표시는 소수 2자리 · 마우스를 올리면 상세값 · 계산은 원본 float32','Two decimal display · hover for details · original float32 calculation');
  }
  function drawInput(){
    const canvas=$('input-canvas'),ctx=canvas.getContext('2d'),cw=canvas.width/d.W,ch=canvas.height/d.H;
    const values=[];for(let h=0;h<d.H;h++)for(let w=0;w<d.W;w++)values.push(d.input[(h*d.W+w)*d.C+viewC]);
    const lo=Math.min(...values),hi=Math.max(...values);
    values.forEach((v,i)=>{const a=(v-lo)/(hi-lo||1);ctx.fillStyle=`rgb(${Math.round(237-a*197)},${Math.round(249-a*107)},${Math.round(251-a*103)})`;ctx.fillRect((i%d.W)*cw,Math.floor(i/d.W)*ch,cw,ch);});
    if(mode!=='real'){
      ctx.font='bold 25px ui-monospace,monospace';ctx.textAlign='center';ctx.textBaseline='middle';
      values.forEach((v,i)=>{const a=(v-lo)/(hi-lo||1);ctx.fillStyle=a>.65?'#fff':'#174e60';ctx.fillText(fmt(v),(i%d.W+.5)*cw,(Math.floor(i/d.W)+.5)*ch);});
      ctx.strokeStyle='#ffffff70';ctx.lineWidth=1;for(let i=1;i<d.W;i++){ctx.beginPath();ctx.moveTo(i*cw,0);ctx.lineTo(i*cw,canvas.height);ctx.stroke();}for(let i=1;i<d.H;i++){ctx.beginPath();ctx.moveTo(0,i*ch);ctx.lineTo(canvas.width,i*ch);ctx.stroke();}
    }
    ctx.strokeStyle='#ef792e';ctx.lineWidth=4;ctx.strokeRect(q*cw+2,p*ch+2,d.S*cw-4,d.R*ch-4);
    const term=step?current.terms[step-1]:null;
    if(term&&term.c===viewC){ctx.fillStyle='#ffad4444';ctx.fillRect((q+term.s)*cw,(p+term.r)*ch,cw,ch);ctx.strokeStyle='#f5b869';ctx.lineWidth=2;ctx.strokeRect((q+term.s)*cw+1,(p+term.r)*ch+1,cw-2,ch-2);}
    if(mode==='real'){
      const rgb=$('rgb-canvas'),rc=rgb.getContext('2d'),im=rc.createImageData(d.W,d.H);
      for(let i=0;i<d.H*d.W;i++){for(let c=0;c<3;c++)im.data[i*4+c]=Math.round(Math.max(0,Math.min(1,d.input[i*3+c]))*255);im.data[i*4+3]=255;}
      const off=document.createElement('canvas');off.width=d.W;off.height=d.H;off.getContext('2d').putImageData(im,0,0);rc.imageSmoothingEnabled=false;rc.drawImage(off,0,0,rgb.width,rgb.height);
    }
  }
  function drawOutput(){
    const canvas=$('output-canvas'),ctx=canvas.getContext('2d'),values=map(),hi=Math.max(...values),cw=canvas.width/d.Q,ch=canvas.height/d.P;
    for(let j=0;j<values.length;j++){const a=values[j]/(hi||1);ctx.fillStyle=`rgb(${Math.round(246-a*131)},${Math.round(241-a*171)},${Math.round(252-a*71)})`;ctx.fillRect(j%d.Q*cw,Math.floor(j/d.Q)*ch,cw+.2,ch+.2);}
    if(mode!=='real'){ctx.font=`bold ${mode==='toy'?35:27}px ui-monospace,monospace`;ctx.textAlign='center';ctx.textBaseline='middle';for(let j=0;j<values.length;j++){ctx.fillStyle=values[j]/(hi||1)>.55?'white':'#6a4897';ctx.fillText(fmt(values[j]),(j%d.Q+.5)*cw,(Math.floor(j/d.Q)+.5)*ch);}}
    ctx.strokeStyle='#f09641';ctx.lineWidth=mode!=='real'?5:2;ctx.strokeRect(q*cw+1,p*ch+1,cw-2,ch-2);
    $('selected-output').innerHTML=`<span>y[${p},${q},${m}]</span><strong>${fmt(current.output)}</strong>`;
    if(mode==='real'){
      const i=(p*d.Q+q)*d.M+m,err=Math.abs(current.output-d.reference[i]);
      $('reference-note').innerHTML=(d.cppReference?tr(`원본 Lab 2 C++: <b>${fmt(d.cppReference[i])}</b><br>`,`Original Lab 2 C++: <b>${fmt(d.cppReference[i])}</b><br>`):'')+tr(`TensorFlow 참조: <b>${fmt(d.reference[i])}</b> · 절대 오차 ${fmt(err)}`,`TensorFlow reference: <b>${fmt(d.reference[i])}</b> · absolute error ${fmt(err)}`);
    }else{
      const allZero=values.every(value=>value===0);
      $('reference-note').textContent=allZero
        ?tr(`이 필터의 출력 ${values.length}개는 모두 0입니다. 선택 위치의 누적합 ${fmt(current.sum)}에 ReLU를 적용해 ${fmt(current.output)}이 됩니다.`,`All ${values.length} outputs of this filter are zero. At the selected position, ReLU turns the raw sum ${fmt(current.sum)} into ${fmt(current.output)}.`)
        :tr(`선택 위치: 누적합 ${fmt(current.sum)} → ReLU 출력 ${fmt(current.output)}. 다른 필터 m을 선택하면 출력 채널이 바뀝니다.`,`Selected position: raw sum ${fmt(current.sum)} → ReLU output ${fmt(current.output)}. Choose another filter m to see a different output channel.`);
    }
  }
  function renderCode(){
    const done=step===current.terms.length,stage=step===0?3:done?6:5;
    const lines=[`for (p = 0; p < ${d.P}; p++)`,`  for (q = 0; q < ${d.Q}; q++)`,`    for (m = 0; m < ${d.M}; m++) {`,`      sum = bias[m];`,`      for (r) for (s) for (c)`,`        sum += input[inputIdx] * weight[weightIdx];`,`      output[outputIdx] = sum > 0 ? sum : 0;`,`    }`];
    $('live-code').innerHTML=lines.map((line,i)=>`<span class="code-line ${i<3?'outer':i===4?'inner':''} ${i===stage?'hot':''}">${escape(line)}</span>`).join('');
    $('code-stage').textContent=step===0?'BIAS INIT':done?'RELU / STORE':'MULTIPLY + ACCUMULATE';
    const t=step?current.terms[step-1]:null;
    $('address-info').textContent=t?`inputIdx = ((${p+t.r}) × ${d.W} + ${q+t.s}) × ${d.C} + ${t.c} = ${t.xi}\nweightIdx = ((${t.r} × ${d.S} + ${t.s}) × ${d.C} + ${t.c}) × ${d.M} + ${m} = ${t.wi}`:`outputIdx = (${p} × ${d.Q} + ${q}) × ${d.M} + ${m} = ${(p*d.Q+q)*d.M+m}`;
    $('address-info').style.whiteSpace='pre-wrap';
  }
  function renderStep(){
    const n=current.terms.length,t=step?current.terms[step-1]:null,done=step===n,sum=t?t.after:current.bias;
    $('progress').max=n;$('progress').value=step;$('progress-label').textContent=`${step} / ${n} MACs`;
    $('loop-position').textContent=`p=${p} q=${q} m=${m}`+(t?` | r=${t.r} s=${t.s} c=${t.c}`:tr(' | bias 준비',' | bias ready'));
    $('phase-note').textContent=step===0?tr(`새 출력 계산을 시작합니다. sum을 bias[${m}]=${fmt(current.bias)}로 초기화했습니다.`,`Starting a new output. Initialize sum with bias[${m}]=${fmt(current.bias)}.`):done?tr(`모든 ${n}개 곱의 누적 완료. ReLU 후 출력 y[${p},${q},${m}]에 저장합니다.`,`All ${n} products accumulated. Apply ReLU and store y[${p},${q},${m}].`):tr(`${step}번째 곱 · 입력 (${p+t.r},${q+t.s},c=${t.c})와 필터 (r=${t.r},s=${t.s},c=${t.c},m=${m})`,`Product ${step} · input (${p+t.r},${q+t.s},c=${t.c}) and filter (r=${t.r},s=${t.s},c=${t.c},m=${m})`);
    $('equation').innerHTML=t?`<div class="operand"><small>input[${t.xi}]</small><strong>${fmt(t.x)}</strong></div><span class="operator">×</span><div class="operand weight"><small>weight[${t.wi}]</small><strong>${fmt(t.w)}</strong></div><span class="operator">=</span><div class="operand product"><small>${tr('곱','Product')}</small><strong>${fmt(t.product)}</strong></div>`:`<div class="equation-placeholder">${tr('다음 곱 → 버튼으로 첫 계산을 시작하세요.','Press Next product → to start the calculation.')}</div>`;
    $('accumulator').innerHTML=`<span class="sum-label">${done?tr('최종 sum','Final sum'):tr('현재 sum','Running sum')}</span><strong>${fmt(sum)}</strong><small>${done?`ReLU → ${fmt(current.output)}`:t?`${fmt(t.before)} + ${fmt(t.product)}`:tr('bias에서 시작','Start from bias')}</small>`;
    const totals=Array(d.C).fill(0),counts=Array(d.C).fill(0);for(let i=0;i<step;i++){totals[current.terms[i].c]+=current.terms[i].product;counts[current.terms[i].c]++;}
    $('channel-sums').innerHTML=totals.map((v,c)=>`<div class="channel-sum ${t&&t.c===c?'active':''}">c=${c} · ${counts[c]}/${d.R*d.S} ${tr('곱','products')}<b>${fmt(v)}</b></div>`).join('')+`<div class="channel-sum">bias<b>${fmt(current.bias)}</b></div>`;
    $('trace-table').innerHTML=current.terms.map((v,i)=>`<tr class="${i===step-1?'current-row':i<step?'done-row':''}"><td>${i+1}</td><td>${v.r},${v.s},${v.c}</td><td>${v.xi}</td><td>${v.wi}</td><td>${fmt(v.x)} × ${fmt(v.w)}</td><td>${i<step?fmt(v.after):'—'}</td></tr>`).join('');
    $('previous').disabled=step===0;$('next').disabled=done;$('finish').disabled=done;
    renderMatrices();drawInput();renderCode();
  }
  function renderNotice(){
    $('seed-status').textContent=seedNotice==='invalid'?tr('1~4294967295 사이의 정수를 입력하세요.','Enter an integer from 1 to 4294967295.')
      :seedNotice==='generated'?tr(`Seed ${seed} 생성 완료`,`Seed ${seed} generated`)
      :seedNotice==='new'?tr(`새 seed: ${seed}`,`New seed: ${seed}`):'';
  }
  function render(){
    renderNotice();
    $('next-output').textContent=tr('다음 출력 (m → q → p)','Next output (m → q → p)');
    $('play').textContent=timer?tr('Ⅱ 일시 정지','Ⅱ Pause'):tr('▶ 자동 재생','▶ Play');
    $('toy-mode').classList.toggle('active',mode==='toy');$('real-mode').classList.toggle('active',mode==='real');$('toy-mode').setAttribute('aria-pressed',mode==='toy');$('real-mode').setAttribute('aria-pressed',mode==='real');
    $('random-mode').classList.toggle('active',mode==='random');$('random-mode').setAttribute('aria-pressed',mode==='random');$('random-controls').hidden=mode!=='random';$('seed').value=seed;
    $('mode-note').textContent=mode==='toy'?tr('3×3 입력 · 입력 채널 2개 · 필터 2개. 작은 숫자를 직접 수정하며 원리를 확인하세요.','3×3 input · 2 input channels · 2 filters. Edit small numbers to explore the calculation.'):mode==='random'?tr(`Seed ${seed} · 4×4 입력 · 입력 채널 3개 · 필터 3개. 출력 하나에 12 MACs. 새 숫자 배정 후 같은 반복문으로 실험합니다.`,`Seed ${seed} · 4×4 input · 3 input channels · 3 filters. 12 MACs per output. Explore the same loops with new random values.`):tr('Lab 2의 image_0.bin과 conv1_weights.bin 원본 데이터. 출력 하나에 75 MACs, 전체 conv1에 8,640,000 MACs.','Original Lab 2 image_0.bin and conv1_weights.bin. 75 MACs per output; 8,640,000 MACs for conv1.');
    $('input-shape').textContent=`${d.H} × ${d.W} × ${d.C}`;$('weight-shape').textContent=`${d.R} × ${d.S} × ${d.C} × ${d.M}`;$('output-shape').textContent=`${d.P} × ${d.Q} × ${d.M}`;
    $('p').max=d.P-1;$('q').max=d.Q-1;$('p').value=p;$('q').value=q;
    $('m').replaceChildren();for(let i=0;i<d.M;i++){const op=document.createElement('option');op.value=i;op.textContent=`m = ${i}`;$('m').append(op);}$('m').value=m;
    $('window-size').textContent=tr(`${d.R}×${d.S} 창`,`${d.R}×${d.S} window`);$('filter-size').textContent=tr(`필터 1개: ${d.R}×${d.S}×${d.C}`,`One filter: ${d.R}×${d.S}×${d.C}`);
    $('filter-title').textContent=tr(`필터 m=${m} · 채널별 weight`,`Filter m=${m} · channel weights`);$('output-title').textContent=tr(`필터 ${m}의 출력 채널`,`Output channel of filter ${m}`);
    $('bias-label').textContent=`bias[${m}]`;$('bias').value=d.bias[m];$('bias').disabled=mode==='real';
    $('rgb-preview').hidden=mode!=='real';
    $('channel-tabs').replaceChildren();for(let c=0;c<d.C;c++){const b=document.createElement('button');b.textContent=`c=${c}`+(mode==='real'?` · ${['R','G','B'][c]}`:'');b.className=c===viewC?'active':'';b.setAttribute('aria-pressed',c===viewC);b.addEventListener('click',()=>{viewC=c;render();});$('channel-tabs').append(b);}
    $('tensor-explanation').innerHTML=tr(`<div class="tensor-explain-line">필터 하나 = <b>${d.C}장의 ${d.R}×${d.S} weight 조각</b><br>입력 채널 ${d.C}개를 모두 곱해서 출력값 하나로 더합니다.</div><div class="tensor-explain-line output">그런 필터가 <b>${d.M}개 → 출력 채널 ${d.M}개</b><br>위치마다 ${d.M}개 출력 · 전체 ${d.P}×${d.Q}×${d.M} = ${(d.P*d.Q*d.M).toLocaleString()}개 출력값</div>`,`<div class="tensor-explain-line">One filter = <b>${d.C} slices of ${d.R}×${d.S} weights</b><br>Multiply across all ${d.C} input channels and accumulate into one output.</div><div class="tensor-explain-line output"><b>${d.M} filters → ${d.M} output channels</b><br>${d.M} outputs per position · ${d.P}×${d.Q}×${d.M} = ${(d.P*d.Q*d.M).toLocaleString()} output values in total</div>`);
    drawOutput();renderStep();renderSources();
  }
  const descriptions={
    lab2:'현재 화면의 계산 기준입니다. 원본 C++를 그대로 호출한 결과와 화면의 JavaScript float32 계산을 비교했습니다. 강조 화면은 학습용으로 짧게 표현하며, 아래는 원본 코드입니다.',
    lab3:'같은 input×weight를 hardware multiply stage에서 계산하고 다음 stage의 accumulator에 더합니다. 이 화면은 FPGA cycle이나 handshake를 시뮬레이션하지 않습니다.',
    lab4:'float32 입력을 정수로 바꾸고 (input − inZero)×weight를 int32 accumulator에 더합니다. 현재 화면의 float32 값과 정수값은 서로 다른 표현입니다.',
    lab5:'출력 채널별 kernel과 zero-point 보정 offset을 준비합니다. 입력 patch는 한 번 모아 여러 필터가 공유하고, 내적을 macGroup에 보냅니다. 현재 화면은 하드웨어 실행이 아닙니다.'};
  const sourceEnglish={lab2:'Lab 2 · float32 convolution',lab3:'Lab 3 · multiply / accumulate',lab4:'Lab 4 · integer convolution',lab5:'Lab 5 · patch → hardware MAC'};
  const descriptionsEnglish={
    lab2:'The calculation reference for this view. JavaScript float32 outputs were compared with the original C++ function. The highlighted view is shortened for learning; the excerpt below is original code.',
    lab3:'The same input×weight product is computed in the hardware multiply stage, then added to the accumulator in the next stage. This view does not simulate FPGA cycles or handshakes.',
    lab4:'Float32 inputs are converted to integers, and (input − inZero)×weight is added to an int32 accumulator. Float32 and integer values are different representations.',
    lab5:'A kernel and zero-point correction offset are prepared for each output channel. Input patches are gathered once and shared across filters; dot products are sent to macGroup. This view does not execute hardware.'};
  function renderSources(){
    $('source-tabs').replaceChildren();for(const s of CONV_DATA.sources){const b=document.createElement('button');b.textContent=tr(s.title,sourceEnglish[s.key]);b.className=s.key===source?'active':'';b.setAttribute('aria-pressed',s.key===source);b.addEventListener('click',()=>{source=s.key;renderSources();});$('source-tabs').append(b);}
    const item=CONV_DATA.sources.find(s=>s.key===source);$('source-description').textContent=tr(descriptions[source],descriptionsEnglish[source]);$('source-path').textContent=tr(`${item.path} · ${item.start}행부터`,`${item.path} · from line ${item.start}`);$('source-code').textContent=item.code.split('\n').map((line,i)=>`${String(item.start+i).padStart(3)}  ${line}`).join('\n');
  }
  function moveStep(next){step=clamp(next,current.terms.length);if(step)viewC=current.terms[step-1].c;render();}
  $('toy-mode').onclick=()=>setMode('toy');$('real-mode').onclick=()=>setMode('real');
  function applySeed(){const value=+$('seed').value;if(!Number.isInteger(value)||value<1||value>4294967295){seedNotice='invalid';renderNotice();return;}seed=value;seedNotice='generated';setMode('random');}
  $('random-mode').onclick=()=>setMode('random');$('apply-seed').onclick=applySeed;
  $('seed').onkeydown=e=>{if(e.key==='Enter')applySeed();};
  $('shuffle').onclick=()=>{seed=Math.floor(Math.random()*4294967295)+1;seedNotice='new';setMode('random');};
  $('p').onchange=()=>setSelection($('p').value,q,m);$('q').onchange=()=>setSelection(p,$('q').value,m);$('m').onchange=()=>setSelection(p,q,$('m').value);
  $('bias').onchange=()=>{const value=+$('bias').value;if(Number.isFinite(value)&&$('bias').value.trim()!==''){d.bias[m]=Math.fround(value);changed();}else $('bias').value=d.bias[m];};
  $('next-output').textContent=tr('다음 출력 (m → q → p)','Next output (m → q → p)');$('next-output').onclick=()=>{const next=((p*d.Q+q)*d.M+m+1)%(d.P*d.Q*d.M);setSelection(Math.floor(next/(d.Q*d.M)),Math.floor(next/d.M)%d.Q,next%d.M);};
  $('reset').onclick=()=>{stop();moveStep(0);};$('previous').onclick=()=>{stop();moveStep(step-1);};$('next').onclick=()=>{stop();moveStep(step+1);};$('finish').onclick=()=>{stop();moveStep(current.terms.length);};
  $('progress').oninput=()=>{stop();moveStep(+$('progress').value);};
  $('play').onclick=()=>{if(timer){stop();return;}if(step===current.terms.length)moveStep(0);$('play').textContent=tr('Ⅱ 일시 정지','Ⅱ Pause');timer=setInterval(()=>{moveStep(step+1);if(step===current.terms.length)stop();},+$('speed').value);};
  $('speed').onchange=()=>{if(timer){stop();$('play').click();}};
  $('output-canvas').onclick=e=>{const rect=e.currentTarget.getBoundingClientRect();setSelection(Math.floor((e.clientY-rect.top)/rect.height*d.P),Math.floor((e.clientX-rect.left)/rect.width*d.Q),m);};
  $('output-canvas').onkeydown=e=>{const deltas={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};if(deltas[e.key]){e.preventDefault();const [dp,dq]=deltas[e.key];setSelection(p+dp,q+dq,m);}};
  document.addEventListener('conv-languagechange',render);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  // Read-only debug snapshot for validation and reproducible study.
  globalThis.ConvExplorer={snapshot:()=>({mode,p,q,m,viewC,step,seed,terms:current.terms.length,sum:step?current.terms[step-1].after:current.bias,output:current.output,playing:!!timer}),setSelection};
  const requestedSeed=Number(new URLSearchParams(location.search).get('seed'));
  if(Number.isInteger(requestedSeed)&&requestedSeed>=1&&requestedSeed<=4294967295){seed=requestedSeed;setMode('random');}else render();
})();
