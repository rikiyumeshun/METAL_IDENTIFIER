import {writeFileSync} from 'node:fs';
function study(){
 const grades=[["SUS304",1.37],["Ti Gr2",1.82],["C51000",8.7],["ADC12",13],["A5083",16.53],["A6061-T6",24.94],["A1050A",34.51],["C1020",58]];
 const fs=[100,300,1000,3000,10000,30000,100000,300000], a=.003;
 const response=(s,f)=>{const x=f*Math.PI*4*Math.PI*1e-7*s*1e6*a*a;return x/(1+x*x)};
 const tilt=fs.map(f=>Math.log10(f/Math.sqrt(fs[0]*fs.at(-1))));const avg=v=>v.reduce((a,b)=>a+b,0)/v.length;
 const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
 const center=v=>{const m=avg(v);return v.map(x=>x-m)};
 const tc=center(tilt), t2=dot(tc,tc);
 const detrend=v=>{const c=center(v), k=dot(c,tc)/t2;return c.map((x,i)=>x-k*tc[i])};
 const methods=["raw","gain","affine","affine_tilt"];
 const models=grades.map(([g,s])=>{const v=fs.map(f=>response(s,f));return {g,v,center:center(v),detrend:detrend(v)}});
 let seed=20260120;function U(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed+.5)/4294967296}function N(){return Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U())}
 const trials=grades.flatMap(([g,s])=>Array.from({length:500},()=>({g,s:s*Math.exp(.05*N()),h:.2+1.5*U(),b:N(),t:N(),z:fs.map(N)})));
 const out=[];
 for(const [scenario,offset,drift,geom] of [["gain_only",0,0,0],["offset",.05,0,0],["offset_tilt",.05,.02,0],["offset_tilt_geometry",.05,.02,.1]])for(const noise of [.005,.02,.05]){
 const count=Object.fromEntries(methods.map(m=>[m,0]));
 for(const tr of trials){
 const gain=Math.exp(-2*tr.h/3);
 const y=fs.map((f,i)=>gain*response(tr.s*(1+geom)**2,f)+offset*tr.b+drift*tr.t*tilt[i]+noise*tr.z[i]);
 const cy=center(y),dy=detrend(y);
 for(const m of methods){
 const v=m==="affine"?cy:m==="affine_tilt"?dy:y;
 let best=Infinity,label="";
 for(const model of models){
 const p=m==="affine"?model.center:m==="affine_tilt"?model.detrend:model.v;
 const k=m==="raw"?1:Math.max(0,dot(v,p)/dot(p,p));
 const e=v.reduce((s,x,i)=>s+(x-k*p[i])**2,0);
 if(e<best){best=e;label=model.g}
 }
 count[m]+=label===tr.g;
 }
 }
 for(const m of methods)out.push([scenario,noise,m,trials.length,count[m]/trials.length])
 }
 return "scenario,noise_sd_normalized,method,condition_trials,top1\n"+out.map(r=>r.join(",")).join("\n")+"\n";
}
const csv=study();writeFileSync(new URL('MI-020_invariant_features.csv',import.meta.url),csv);console.log(csv);
