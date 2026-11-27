import {writeFileSync} from 'node:fs';
function study(){
const grades=[["A6061-T6",2700,167,896],["A5052-H32",2680,138,880],["AISI1045_proxy",7870,49.8,486],["SUS304_proxy",7900,15,500],["SUS316_proxy",8000,15,500],["Ti Grade 2",4510,16,520]];
const fs=[.02,.05,.1,.2],L=.01;
let seed=25027;function U(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed+.5)/4294967296}function N(){return Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U())}
const trials=grades.flatMap(([g,r,k,c])=>Array.from({length:500},()=>({g,alpha:k/(r*c)*Math.exp(.05*N()),loss:U(),tau1:U(),tau2:U(),amp:.8+1.2*U(),noise:fs.map(()=>[N(),N(),N(),N()])})));
const results=[];
for(const lossMax of [0,.08])for(const tauMax of [0,.5])for(const noise of [.01,.05,.1])for(const set of [[1],[0,1,2,3]]){
const stat={phase:{e:[],hit:0,invalid:0},joint:{e:[],hit:0,invalid:0}};
for(const t of trials){
const estimates={phase:[],joint:[]};
for(const i of set){
const w=2*Math.PI*fs[i],b=t.loss*lossMax,R=Math.hypot(b,w);
const u=Math.sqrt((R+b)/(2*t.alpha)),v=Math.sqrt((R-b)/(2*t.alpha));
const h1=w*t.tau1*tauMax,h2=w*t.tau2*tauMax;
const A=t.amp/Math.hypot(1,h1),B=t.amp*Math.exp(-u*L)/Math.hypot(1,h2);
const p1=-Math.atan(h1),p2=-v*L-Math.atan(h2),z=t.noise[i];
const x=A*Math.cos(p1)+noise*z[0],y=A*Math.sin(p1)+noise*z[1],X=B*Math.cos(p2)+noise*z[2],Y=B*Math.sin(p2)+noise*z[3];
const a=Math.hypot(x,y),bb=Math.hypot(X,Y);
if(Math.min(a,bb)<5*noise)continue;
const phase=Math.atan2(y*X-x*Y,x*X+y*Y),att=Math.log(a/bb);
if(phase>.08&&phase<Math.PI-.05){const p=w*L*L/(2*phase*phase);estimates.phase.push(p);if(att>.08)estimates.joint.push(w*L*L/(2*att*phase))}
}
for(const m of ["phase","joint"]){const e=estimates[m];if(!e.length){stat[m].invalid++;continue}e.sort((a,b)=>a-b);const a=e.length%2?e[(e.length-1)/2]:.5*(e[e.length/2-1]+e[e.length/2]);
stat[m].e.push(Math.abs(a/t.alpha-1));let pred=grades.reduce((best,g)=>Math.abs(Math.log(a/(g[2]/(g[1]*g[3]))))<Math.abs(Math.log(a/(best[2]/(best[1]*best[3]))))?g:best);stat[m].hit+=pred[0]===t.g}
}
for(const m of ["phase","joint"]){const s=stat[m];s.e.sort((a,b)=>a-b);results.push([lossMax,tauMax,noise,set.map(i=>fs[i]).join(";"),m,trials.length,s.e.length/trials.length,s.hit/trials.length,s.hit/s.e.length,s.e[Math.floor(s.e.length*.5)],s.e[Math.floor(s.e.length*.95)]])}
}
return "loss_max_s_inv,sensor_tau_max_s,complex_noise_sd_K,frequencies_Hz,method,trials,coverage,top1_all,top1_valid,median_relative_alpha_error,p95_relative_alpha_error\n"+results.map(r=>r.join(",")).join("\n")+"\n";
}
const csv=study();writeFileSync(new URL('MI-025_thermal_wave.csv',import.meta.url),csv);console.log(csv);
