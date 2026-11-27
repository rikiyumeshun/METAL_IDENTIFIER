import {readFileSync,writeFileSync} from 'node:fs';
function study(data){
const rows=data.trim().split(/\r?\n/).slice(1).map(l=>{const [g,s,d,e,k,m]=l.split(",");return {g,v:[+d,+e,+k].map(Math.log),m:+m}});
const gs=[...new Set(rows.map(r=>r.g))],groups=gs.map(g=>rows.filter(r=>r.g===g));
let seed=35027;function U(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return(seed+.5)/4294967296}function N(){return Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U())}
const trials=groups.flatMap(g=>Array.from({length:500},()=>({r:g[Math.floor(U()*g.length)],z:[N(),N(),N()],n:[N(),N(),N()],u:U()})));
const configs=[["magnet",[],true],["density_magnet",[0],true],["conductivity_magnet",[1],true],["density_conductivity_magnet",[0,1],true],["all",[0,1,2],true]];
const out=[];
for(const mass of [20,100,300])for(const scale of [.01,.1,1])for(const eSD of [.05,.15,.30]){
// air and submerged weighing errors independently equal SD; first-order log density propagation
const sig=r=>Math.hypot(.005,scale*Math.hypot(1-Math.exp(r.v[0]),Math.exp(r.v[0]))/mass);
const sdE=Math.hypot(.07,eSD),sdK=Math.hypot(.07,.15);
const obs=trials.map(t=>{const r=t.r;return {g:r.g,v:[r.v[0]+sig(r)*t.z[0],r.v[1]+sdE*t.z[1],r.v[2]+.07*(.65*t.z[1]+Math.sqrt(1-.65**2)*t.z[2])+.15*t.n[2]],m:r.m^(t.u<.02)}});
for(const [name,ix,mag] of configs){let hit=0,accepted=0,right=0,familyHit=0;
const family=g=>g.startsWith("A")?"Al":g.startsWith("C")?"Cu":g.startsWith("Ti")?"Ti":"steel";
for(const o of obs){const scores=groups.map(g=>g.reduce((p,r)=>{let l=mag?(r.m===o.m?.98:.02):1;
for(const i of ix){const s=i===0?sig(r):i===1?sdE:sdK;l*=Math.exp(-.5*((o.v[i]-r.v[i])/s)**2)/s}return p+l},0)/g.length);
const max=Math.max(...scores),total=scores.reduce((a,b)=>a+b,0),ties=scores.map((p,i)=>Math.abs(p-max)<=1e-12*Math.max(max,1e-300)?i:-1).filter(i=>i>=0);const c=ties.includes(gs.indexOf(o.g))?1/ties.length:0;hit+=c;
const fam={};scores.forEach((s,i)=>{const k=family(gs[i]);fam[k]=(fam[k]??0)+s});const fp=Object.keys(fam).sort((a,b)=>fam[b]-fam[a])[0];familyHit+=fp===family(o.g);
if(total>0&&max/total>=.9){accepted++;right+=c}}
out.push([mass,scale,eSD,name,trials.length,hit/trials.length,familyHit/trials.length,accepted/trials.length,accepted?right/accepted:""])}
}
return "sample_mass_g,weighing_sd_g,conductivity_log_readout_sd,protocol,trials,grade_top1,family_top1,coverage_p90,accepted_accuracy\n"+out.map(r=>r.join(",")).join("\n")+"\n"
}
const csv=study(readFileSync(new URL('metal_properties_v01.csv',import.meta.url),'utf8'));writeFileSync(new URL('MI-035_minimum_cost.csv',import.meta.url),csv);console.log(csv);
