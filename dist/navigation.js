(() => {
  'use strict';
  const items=[['index.html','Home','홈'],['convolution.html','Convolution','합성곱'],['pool.html','Max Pooling','최댓값 풀링'],['flatten.html','Flatten','평탄화'],['dense.html','Dense','완전 연결'],['softmax.html','Softmax','확률 변환']];
  const nav=document.createElement('nav');
  nav.className='layer-navigation';nav.setAttribute('aria-label','Layer pages');
  document.querySelector('.topbar').after(nav);
  const pathBar=document.createElement('div');pathBar.className='model-path';nav.after(pathBar);
  const sequence=[
    ['Conv 1','convolution.html','64×64×3 → 60×60×32'],['Conv 2','convolution.html','60×60×32 → 56×56×32'],
    ['Pool 1','pool.html','56×56×32 → 28×28×32'],['Conv 3','convolution.html','28×28×32 → 26×26×64'],
    ['Conv 4','convolution.html','26×26×64 → 24×24×64'],['Pool 2','pool.html','24×24×64 → 12×12×64'],
    ['Conv 5','convolution.html','12×12×64 → 10×10×64'],['Conv 6','convolution.html','10×10×64 → 8×8×128'],
    ['Pool 3','pool.html','8×8×128 → 4×4×128'],['Flatten','flatten.html','4×4×128 → 2048'],
    ['Dense 1','dense.html','2048 → 256'],['Dense 2','dense.html','256 → 200'],
    ['Softmax','softmax.html','200 → 200']
  ];
  function render(){
    const en=ConvI18n.language==='en', path=location.pathname.split('/').pop()||'index.html';
    nav.innerHTML='';
    items.forEach(([href,english,korean],i)=>{
      const a=document.createElement('a');a.href=href;a.textContent=`${String(i+1).padStart(2,'0')} / ${en?english:korean}`;
      if(path===href){a.className='active';a.setAttribute('aria-current','page');}
      nav.append(a);
    });
    nav.setAttribute('aria-label',en?'Site pages':'사이트 페이지');
    pathBar.replaceChildren();
    const label=document.createElement('span');label.className='model-path-label';label.textContent=en?'LAB 2 MODEL FLOW':'LAB 2 모델 흐름';pathBar.append(label);
    sequence.forEach(([name,href,shape],i)=>{
      const link=document.createElement('a');link.href=href;link.title=shape;
      link.textContent=name;link.setAttribute('aria-label',`${name}: ${shape}`);
      if(path===href)link.className='related';
      pathBar.append(link);
      if(i<sequence.length-1){const arrow=document.createElement('span');arrow.className='model-path-arrow';arrow.textContent='→';pathBar.append(arrow);}
    });
  }
  document.addEventListener('conv-languagechange',render);render();
})();
