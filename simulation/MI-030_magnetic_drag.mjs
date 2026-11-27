import {writeFileSync} from 'node:fs';
function study(){
const mu=4*Math.PI*1e-7,m=.2,t=.0005,v=.2,K=3*mu**2*m**2/(64*Math.PI);
const rows=[["C1020",58],["A1050A",34.51],["A6061-T6",24.94],["A5052",20.3],["Ti Grade 2",1.82],["SUS304",1.37]];
const F=(s,d)=>K*s*1e6*t*v/d**4;
let seed=30027;function U(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return(seed+.5)/4294967296}function N(){return Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U())}
const trials=rows.flatMap(([g,s])=>Array.from({length:1000},()=>({g,s:s*Math.exp(.05*N()),z:N(),n1:N(),n2:N()})));
const out=[];
for(const gapSD of [.0001,.0005,.001])for(const noise of [.00001,.00005,.0002])for(const delta of [.002,.004])for(const method of ["fixed_gap","dual_gap"]){
 let errors=[],hit=0;
 for(const q of trials){
 const d=Math.max(.005,.008+gapSD*q.z),f1=F(q.s,d)+noise*q.n1,f2=F(q.s,d+delta)+noise*q.n2;
 let est;
 if(method==="fixed_gap"){if(f1>0)est=f1/F(1,.008)}
 else if(f1>3*noise&&f2>3*noise&&f1>f2){const dh=delta/(Math.pow(f1/f2,.25)-1);if(dh>=.004&&dh<=.016)est=f1/F(1,dh)}
 if(est===undefined||!Number.isFinite(est))continue;
 errors.push(Math.abs(est/q.s-1));const pred=rows.reduce((a,b)=>Math.abs(Math.log(est/a[1]))<Math.abs(Math.log(est/b[1]))?a:b)[0];hit+=pred===q.g;
 }
 errors.sort((a,b)=>a-b);out.push([gapSD*1000,noise*1000,delta*1000,method,trials.length,errors.length/trials.length,hit/trials.length,errors.length?hit/errors.length:"",errors[Math.floor(errors.length/2)]??"",errors[Math.floor(errors.length*.95)]??""])
}
return {signals:"grade,conductivity_MS_m,force_mN_at_8mm,force_mN_at_12mm\n"+rows.map(([g,s])=>[g,s,F(s,.008)*1000,F(s,.012)*1000].join(",")).join("\n")+"\n",results:"gap_sd_mm,force_noise_sd_mN,step_mm,method,trials,coverage,correct_all,correct_valid,median_relative_error,p95_relative_error\n"+out.map(r=>r.join(",")).join("\n")+"\n"};
}
for(const [k,v] of Object.entries(study()))writeFileSync(new URL('MI-030_'+k+'.csv',import.meta.url),v);
