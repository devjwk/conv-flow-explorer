const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
require(path.join(root,'dist/data.js'));
const core=require(path.join(root,'dist/core.js'));
const toy=core.toy();
assert.equal(core.trace(toy,0,0,0).output,20);
assert.equal(core.trace(toy,0,0,1).output,14);
assert.deepEqual(core.trace(toy,0,0,0).terms.map(t=>t.c),[0,1,0,1,0,1,0,1]);
assert.deepEqual([...core.outputChannel(toy,0)],[20,20,20,20]);
assert.equal(core.trace(toy,1,1,1).output,14);
// Independently form an im2col patch and filter row, including a negative bias/ReLU case.
toy.bias[0]=-100;
for(let p=0;p<toy.P;p++)for(let q=0;q<toy.Q;q++)for(let m=0;m<toy.M;m++){
  const patch=[],filter=[];
  for(let r=0;r<toy.R;r++)for(let s=0;s<toy.S;s++)for(let c=0;c<toy.C;c++){
    patch.push(toy.input[(p+r)*toy.W*toy.C+(q+s)*toy.C+c]);
    filter.push(toy.weights[r*toy.S*toy.C*toy.M+s*toy.C*toy.M+c*toy.M+m]);
  }
  const result=Math.max(0,patch.reduce((sum,x,i)=>sum+x*filter[i],toy.bias[m]));
  assert.equal(core.trace(toy,p,q,m).output,result);
}
assert.equal(core.trace(toy,0,0,0).output,0);
const real=core.real(CONV_DATA);
assert.equal(real.input.length,64*64*3);assert.equal(real.weights.length,5*5*3*32);
assert.equal(real.reference.length,60*60*32);if(real.cppReference)assert.equal(real.cppReference.length,60*60*32);
let cppMax=0,tfMax=0,tfSum=0,count=0;
for(let m=0;m<real.M;m++){
  const map=core.outputChannel(real,m);
  for(let j=0;j<map.length;j++){
    const idx=j*real.M+m;
    if(real.cppReference)cppMax=Math.max(cppMax,Math.abs(map[j]-real.cppReference[idx]));
    const diff=Math.abs(map[j]-real.reference[idx]);tfMax=Math.max(tfMax,diff);tfSum+=diff;count++;
  }
  for(const [p,q] of [[0,0],[29,31],[59,59]])assert.equal(core.trace(real,p,q,m).output,map[p*real.Q+q]);
}
if(real.cppReference)assert.equal(cppMax,0,'Browser model must match original native C++ at every conv1 output');
assert.ok(tfMax<1e-4,'TensorFlow reference drift must stay within float32 tolerance');
const report={outputsChecked:count,macs:count*75,nativeCppMaxAbsoluteError:real.cppReference?cppMax:null,tensorFlowMaxAbsoluteError:tfMax,tensorFlowMeanAbsoluteError:tfSum/count,toyAndRelu:'PASS',status:'PASS'};
fs.writeFileSync(path.join(root,'validation/verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(report);
