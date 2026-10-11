(function(root) {
  'use strict';
  const f = Math.fround;
  const inputIndex = (d,p,q,r,s,c) => ((p+r)*d.W+q+s)*d.C+c;
  const weightIndex = (d,r,s,c,m) => ((r*d.S+s)*d.C+c)*d.M+m;
  function trace(d,p,q,m) {
    const terms=[]; let sum=f(d.bias[m]);
    const channels=Array(d.C).fill(0);
    for(let r=0;r<d.R;r++) for(let s=0;s<d.S;s++) for(let c=0;c<d.C;c++) {
      const xi=inputIndex(d,p,q,r,s,c), wi=weightIndex(d,r,s,c,m);
      const x=d.input[xi], w=d.weights[wi], product=f(x*w), before=sum;
      sum=f(sum+product); channels[c]+=product;
      terms.push({r,s,c,xi,wi,x,w,product,before,after:sum});
    }
    return {terms,channels,bias:d.bias[m],sum,output:Math.max(0,sum)};
  }
  function outputChannel(d,m) {
    const values=new Float32Array(d.P*d.Q);
    for(let p=0;p<d.P;p++) for(let q=0;q<d.Q;q++) {
      let sum=f(d.bias[m]);
      for(let r=0;r<d.R;r++) for(let s=0;s<d.S;s++) for(let c=0;c<d.C;c++)
        sum=f(sum+f(d.input[inputIndex(d,p,q,r,s,c)]*d.weights[weightIndex(d,r,s,c,m)]));
      values[p*d.Q+q]=Math.max(0,sum);
    }
    return values;
  }
  function decode(b64) {
    const raw=atob(b64), buffer=new ArrayBuffer(raw.length), bytes=new Uint8Array(buffer);
    for(let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i);
    const view=new DataView(buffer), values=new Float32Array(raw.length/4);
    for(let i=0;i<values.length;i++) values[i]=view.getFloat32(i*4,true);
    return values;
  }
  function toy() {
    const d={H:3,W:3,C:2,R:2,S:2,M:2,P:2,Q:2,
      input:new Float32Array([1,9,2,8,3,7,4,6,5,5,6,4,7,3,8,2,9,1]),
      weights:new Float32Array(16),bias:new Float32Array(2)};
    const slices=[[[1,0,0,1],[1,0,0,1]], [[1,1,0,0],[0,0,1,1]]];
    for(let m=0;m<2;m++) for(let c=0;c<2;c++) for(let r=0;r<2;r++) for(let s=0;s<2;s++)
      d.weights[weightIndex(d,r,s,c,m)]=slices[m][c][r*2+s];
    return d;
  }
  function real(payload) {
    const d={...payload};
    for(const key of ['input','weights','bias','reference','cppReference'])
      d[key]=payload[key]?decode(payload[key]):null;
    return d;
  }
  function random(seed) {
    if(!Number.isInteger(seed)||seed<1||seed>4294967295) throw new RangeError('Seed must be an integer from 1 to 4294967295');
    let state=seed>>>0;
    const next=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
    const values=(count,min,max)=>Float32Array.from({length:count},()=>min+next()%(max-min+1));
    return {H:4,W:4,C:3,R:2,S:2,M:3,P:3,Q:3,seed,
      input:values(4*4*3,0,9),weights:values(2*2*3*3,-2,2),bias:values(3,-3,3)};
  }
  const api={inputIndex,weightIndex,trace,outputChannel,decode,toy,real,random};
  root.ConvCore=api;
  if(typeof module!=='undefined') module.exports=api;
})(globalThis);
