const e = require('./engine.js');
const cases = require('./expected.json');
let pass=0, fail=0;
const close=(a,b)=>Math.abs(a-b) <= 1e-9*Math.max(1,Math.abs(b));
function cmp(a,b,path){
  if (typeof b==='number'){ if(!(typeof a==='number'&&close(a,b))) throw new Error(path+': '+a+' != '+b); return; }
  if (typeof b==='object'&&b!==null){ for(const k of Object.keys(b)) cmp(a&&a[k],b[k],path+'.'+k); return; }
  if (a!==b) throw new Error(path+': '+JSON.stringify(a)+' != '+JSON.stringify(b));
}
const fns={plan:e.plan,sh:e.shutterCheck,cov:e.coverage,bat:e.batteries,sli:e.slider};
for(const c of cases){
  try{ cmp(fns[c.fn](...c.args),c.exp,c.fn+'('+c.args+')'); pass++; }
  catch(err){ fail++; console.log('FAIL',err.message); }
}
const A=[[e.BUFFER_S,1],[e.plan(60,15,24,25).frames,360],[e.plan(60,15,24,25).interval,10],
  [e.coverage(360,10,24).clipSec,15]];
for(const [g,w] of A){ if(close(g,w)) pass++; else { fail++; console.log('ANCHOR FAIL',g,w);} }
function prop(name,f){ try{ if(!f()) throw 0; pass++; }catch{ fail++; console.log('PROP FAIL',name); } }
prop('plan<->coverage round-trip',()=>{ const p=e.plan(60,15,24,25); const c=e.coverage(p.frames,p.interval,24); return close(c.eventMin,60)&&close(c.clipSec,15); });
prop('longer event widens interval',()=> e.plan(120,15,24,25).interval > e.plan(60,15,24,25).interval);
prop('longer clip means more frames',()=> e.plan(60,30,24,25).frames > e.plan(60,15,24,25).frames);
prop('higher fps means more frames',()=> e.plan(60,15,60,25).frames > e.plan(60,15,24,25).frames);
prop('playback equals requested clip',()=> close(e.plan(45,20,30,25).playbackSec,20));
prop('storage scales with MB per frame',()=> close(e.plan(60,15,24,50).storageMb, 2*e.plan(60,15,24,25).storageMb));
prop('shutter equal to interval does not fit',()=> e.shutterCheck(5,5).fits===false);
prop('natural shutter is half the interval',()=> close(e.shutterCheck(10,1).naturalShutter,5));
prop('coverage time is shots x interval',()=> close(e.coverage(100,7,24).eventSec,700));
prop('battery count covers the frames',()=>{ const b=e.batteries(1000,400); return b.count*400>=1000 && (b.count-1)*400<1000; });
prop('one battery verdict under capacity',()=> e.batteries(399,400).count===1);
prop('slider steps sum to travel',()=>{ const s=e.slider(300,360,24); return close(s.mmPerShot*360,300); });
prop('apparent speed = travel / clip length',()=>{ const s=e.slider(300,360,24); return close(s.apparentMmPerClipSec,300/s.clipSec); });
for(const bad of [[0,15,24,25],[60,0,24,25],[60,15,0,25],[60,15,24,0]]){ try{ e.plan(...bad); fail++; console.log('ERR FAIL plan',bad);}catch{ pass++; } }
for(const bad of [[0,1],[5,0]]){ try{ e.shutterCheck(...bad); fail++; console.log('ERR FAIL sh',bad);}catch{ pass++; } }
for(const bad of [[0,10,24],[100,0,24],[100,10,0]]){ try{ e.coverage(...bad); fail++; console.log('ERR FAIL cov',bad);}catch{ pass++; } }
for(const bad of [[0,400],[360,0]]){ try{ e.batteries(...bad); fail++; console.log('ERR FAIL bat',bad);}catch{ pass++; } }
for(const bad of [[0,360,24],[300,0,24],[300,360,0]]){ try{ e.slider(...bad); fail++; console.log('ERR FAIL sli',bad);}catch{ pass++; } }
console.log(pass+'/'+(pass+fail)+' checks pass');
process.exit(fail?1:0);
