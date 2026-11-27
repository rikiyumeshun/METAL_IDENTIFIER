// MI-016: illustrative single-relaxation eddy-current loss model, NOT a Maxwell coil solution.
// Run: node simulation/MI-016_frequency_sweep.mjs
import {writeFileSync} from 'node:fs';
const grades=[['SUS304',1.37],['Ti Gr2',1.82],['C51000',8.7],['ADC12',13],['A5083',16.53],['A6061-T6',24.94],['A1050A',34.51],['C1020',58]];
const sets=[[1000],[1000,10000],[100,1000,10000,100000],[100,300,1000,3000,10000,30000,100000,300000]];
const mu=4*Math.PI*1e-7,a=.003;
const peak=s=>1/(Math.PI*mu*s*1e6*a*a);
const response=(s,f)=>{const x=f/peak(s);return x/(1+x*x)};
let seed=162026;function rand(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return (seed+.5)/4294967296}
function gauss(){return Math.sqrt(-2*Math.log(rand()))*Math.cos(2*Math.PI*rand())}
const grid=Array.from({length:350},(_,i)=>Math.exp(Math.log(.5)+i/349*Math.log(160)));
const trials=grades.flatMap(([g,s])=>Array.from({length:200},()=>({g,s,h:.2+1.5*rand(),z:Array.from({length:8},gauss)})));
const records=[];
for(const fs of sets){
 const models=grid.map(s=>{const v=fs.map(f=>response(s,f));return {s,v,n:v.reduce((t,x)=>t+x*x,0)}});
 for(const noise of [.005,.02,.05])for(const radiusShift of [0,.1]){
  let errors=[],correct=0,unidentifiable=0;
  for(const t of trials){
   const gain=Math.exp(-2*t.h/3);
   const y=fs.map((f,i)=>gain*response(t.s*(1+radiusShift)**2,f)+noise*t.z[i]);
   // Unknown gain fitted analytically; one frequency is rank deficient.
   if(fs.length===1){unidentifiable++;continue}
   let best=Infinity,estimate=0;
   for(const m of models){
    const g=Math.max(0,y.reduce((sum,x,i)=>sum+x*m.v[i],0)/m.n);
    const e=y.reduce((sum,x,i)=>sum+(x-g*m.v[i])**2,0);
    if(e<best){best=e;estimate=m.s}
   }
   errors.push(Math.abs(estimate/t.s-1));
   const label=grades.reduce((p,q)=>Math.abs(Math.log(q[1]/estimate))<Math.abs(Math.log(p[1]/estimate))?q:p)[0];
   correct+=label===t.g;
  }
  errors.sort((a,b)=>a-b);
  records.push([fs.join(';'),noise,radiusShift,trials.length,unidentifiable,errors.length?errors[Math.floor(errors.length*.5)]:null,errors.length?errors[Math.floor(errors.length*.95)]:null,errors.length?correct/errors.length:null]);
 }
}
const csv='frequencies_Hz,absolute_noise_sd_fullscale,radius_fractional_bias,trials,unidentifiable,median_relative_error,p95_relative_error,closed_set_nominal_accuracy\n'+records.map(r=>r.join(',')).join('\n')+'\n';
writeFileSync(new URL('MI-016_frequency_sweep.csv',import.meta.url),csv);
console.log(csv);
