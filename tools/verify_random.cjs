// Cross-check seeded experiments against the unchanged native Lab 2 function.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const core=require('../dist/core.js');
const root=path.resolve(__dirname,'..');
const binary=path.join(root,'validation',process.platform==='win32'?'reference.exe':'reference');
function writeFloats(filename,values){const b=Buffer.alloc(values.length*4);values.forEach((v,i)=>b.writeFloatLE(v,i*4));fs.writeFileSync(filename,b);}
assert.throws(()=>core.random(0),RangeError);assert.throws(()=>core.random(1.5),RangeError);
assert.deepEqual(core.random(4870).input,core.random(4870).input);
assert.notDeepEqual(core.random(4870).input,core.random(4871).input);
const results=[];
for(const seed of [4870,4871,4294967295]){
  const d=core.random(seed),dir=path.join(root,`validation/random-${seed}`);fs.mkdirSync(dir,{recursive:true});
  assert.ok([...d.input].every(v=>v>=0&&v<=9&&Number.isInteger(v)));
  assert.ok([...d.weights].every(v=>v>=-2&&v<=2&&Number.isInteger(v)));
  assert.ok([...d.bias].every(v=>v>=-3&&v<=3&&Number.isInteger(v)));
  for(const name of ['input','weights','bias'])writeFloats(path.join(dir,name+'.bin'),d[name]);
  const output=path.join(dir,'output.bin');cp.execFileSync(binary,[dir,'random',output]);
  const native=fs.readFileSync(output);assert.equal(native.length,3*3*3*4);
  let count=0;
  for(let p=0;p<3;p++)for(let q=0;q<3;q++)for(let m=0;m<3;m++){
    assert.equal(core.trace(d,p,q,m).output,native.readFloatLE(((p*3+q)*3+m)*4));count++;
  }
  results.push({seed,outputsChecked:count,nativeMaxAbsoluteError:0});
}
const report={status:'PASS',algorithm:'xorshift32-v1',experiments:results};
fs.writeFileSync(path.join(root,'validation/random-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
