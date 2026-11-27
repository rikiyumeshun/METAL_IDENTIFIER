import {readFileSync,writeFileSync} from 'node:fs';
function study(data){
let seed=28027;function U(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return(seed+.5)/4294967296}function N(){return Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U())}
const trials=data.flatMap(d=>Array.from({length:1000},()=>({g:d.g,R:d.v.map(x=>x.R),gain:.35+.65*U(),tilt:N(),z:Array.from({length:5},N)})));
const out=[];
for(const tilt of [0,.05,.15])for(const noise of [.005,.02,.05])for(const ix of [[0,1,2],[0,1,2,3,4]])for(const method of ["raw","gain","gain_tilt"]){
let hit=0;
const t=ix.map(i=>(data[0].v[i].w-650)/250);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
for(const tr of trials){
const y=ix.map((j,i)=>tr.gain*tr.R[j]*Math.exp(tilt*tr.tilt*t[i])+noise*tr.z[j]);
let best=Infinity,label="";
for(const d of data){const p=ix.map(j=>d.v[j].R);
for(const k of method==="gain_tilt"?[-.45,-.3,-.15,0,.15,.3,.45]:[0]){
const v=p.map((x,i)=>x*Math.exp(k*t[i]));const a=method==="raw"?1:Math.max(0,dot(y,v)/dot(v,v));const e=y.reduce((s,x,i)=>s+(x-a*v[i])**2,0);
if(e<best){best=e;label=d.g}
}}
hit+=label===tr.g;
}
out.push([tilt,noise,ix.length,method,trials.length,hit/trials.length])
}
return "surface_spectral_tilt_sd,noise_sd,bands,method,trials,top1\n"+out.map(r=>r.join(",")).join("\n")+"\n";
}
const d=new Map();for(const line of readFileSync(new URL('../data/MI-028_optical_reference.csv',import.meta.url),'utf8').trim().split('\n').slice(1)){const [g,w,n,k,R]=line.split(',');if(!d.has(g))d.set(g,{g,v:[]});d.get(g).v.push({w:+w,R:+R});}const csv=study([...d.values()]);writeFileSync(new URL('MI-028_optical_fusion.csv',import.meta.url),csv);
