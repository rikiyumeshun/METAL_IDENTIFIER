import {readFileSync,writeFileSync} from 'node:fs';
function study(rows){
const mu=4*Math.PI*1e-7,g=9.80665,air=.36;
const pairs=[["C10100","C11000"],["C10100","C51000"],["A92024","A96061H"],["A96061H","A97075H"],["A95083H","A97075H"]];
const factor=(V,G)=>V*1e-6*G/(2*mu*g); // mg per ppm
let seed=31027;function U(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return(seed+.5)/4294967296}function N(){return Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U())}
const signals=[];for(const r of rows)for(const V of [.1,1,5])for(const G of [5,20,50])signals.push([r[0],V,G,(r[3]-air)*factor(V,G)]);
const results=[];for(const [a,b] of pairs){const x=rows.find(r=>r[0]===a)[3],y=rows.find(r=>r[0]===b)[3];const trials=[x,y].flatMap((m,i)=>Array.from({length:10000},()=>({i,m,z:N(),n:N(),c:N()})));
for(const scatter of [.1,.25,.5])for(const noise of [1,5,10])for(const V of [.1,1,5]){
let hit=0;
const k=factor(V,20);
const sd=m=>Math.hypot(Math.abs(m)*scatter,noise/k,Math.abs(m-air)*.03);
for(const t of trials){const obs=(t.m-air+Math.abs(t.m)*scatter*t.z)*(1+.03*t.c)+air+noise/k*t.n;
const score=m=>((obs-m)/sd(m))**2+2*Math.log(sd(m));hit+=(score(x)<score(y)?0:1)===t.i}
results.push([a,b,scatter,noise,V,20,trials.length,hit/trials.length,Math.abs(x-y)*k,Math.abs(x-y)*k/3.289707])
}}
return {signals:"sample,volume_cm3,mean_grad_B2_T2_m,apparent_mass_shift_mg\n"+signals.map(r=>r.join(",")).join("\n")+"\n",results:"sample_a,sample_b,relative_material_sd,force_readout_sd_mg,volume_cm3,mean_grad_B2_T2_m,trials,top1,nominal_mass_difference_mg,ideal_equal_sd_95_limit_mg\n"+results.map(r=>r.join(",")).join("\n")+"\n"}
}
const rows=readFileSync(new URL('../data/MI-031_susceptibility.csv',import.meta.url),'utf8').trim().split('\n').slice(1).map(l=>{const [id,n,d,c]=l.split(',');return [id,n,+d,+c]});for(const [k,v] of Object.entries(study(rows)))writeFileSync(new URL('MI-031_'+k+'.csv',import.meta.url),v);
