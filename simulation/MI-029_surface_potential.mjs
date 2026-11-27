import {writeFileSync} from 'node:fs';
function study(){
let seed=29027;function U(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return(seed+.5)/4294967296}function N(){return Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U())}
const grades=[["AA6061-O",-741],["AA2024-O",-659]];
const trials=grades.flatMap(([g,v])=>Array.from({length:10000},()=>({g,v,z:N(),n:Array.from({length:16},N),p:N()})));
const out=[];
for(const state of [10,25,50,100])for(const read of [5,20])for(const n of [1,4,16])for(const proxy of [null,20,50]){
let hit=0,err=0;
const w=proxy===null?0:state**2/(state**2+proxy**2);
for(const t of trials){const b=state*t.z;const noise=read*t.n.slice(0,n).reduce((a,b)=>a+b,0)/n;const x=t.v+b+noise-w*(b+(proxy??0)*t.p);hit+=(x< -700?"AA6061-O":"AA2024-O")===t.g;err+=(x-t.v)**2}
out.push([state,read,n,proxy??"none",trials.length,hit/trials.length,Math.sqrt(err/trials.length)])
}
const kp=[];
for(const diameter of [3,5,10])for(const gap of [.1,.3,.5,1])for(const f of [50,100,200]){
const area=Math.PI*(diameter/2000)**2, d=gap/1000, amp=d*.1;
const g=8.8541878128e-12*area*amp*2*Math.PI*f/d**2;
kp.push([diameter,gap,amp*1000,f,g*1e12,g*.05*1e12,g*.1*1e12,g*.1*1e6*1e6])
}
return {ec:"state_sd_mV,readout_sd_mV,repeats,proxy_sd_mV,trials,top1,rmse_mV\n"+out.map(r=>r.join(",")).join("\n")+"\n",kp:"diameter_mm,gap_mm,vibration_amplitude_mm,frequency_Hz,pA_per_V,pA_at_50mV,pA_at_100mV,uV_output_at_100mV_1Mohm\n"+kp.map(r=>r.join(",")).join("\n")+"\n"};
}
const r=study();for(const [k,v] of Object.entries(r))writeFileSync(new URL('MI-029_'+k+'.csv',import.meta.url),v);
