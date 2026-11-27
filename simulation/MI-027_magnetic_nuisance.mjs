import {writeFileSync} from 'node:fs';
function study(){
const grades=[["S45C",.42,.48],["S50C",.47,.53]];
let seed=27027;function U(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed+.5)/4294967296}function N(){return Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U())}
const trials=grades.flatMap(([g,lo,hi])=>Array.from({length:20000},()=>({g,c:lo+(hi-lo)*U(),z:N(),p:N(),n:Array.from({length:16},N)})));
const out=[];
for(const stateSD of [0,.025,.05,.10])for(const sensorSD of [.005,.02,.05])for(const n of [1,4,16])for(const mode of ["single","opposite","proxy"]){
let hit=0,err=0,accept=0,aright=0;
const proxySD=.02;
for(const t of trials){
const s=stateSD*t.z;
let e=0;
if(mode==="single"||mode==="proxy"){
 e=s+sensorSD*t.n.slice(0,n).reduce((a,b)=>a+b,0)/n;
 if(mode==="proxy"){const w=stateSD**2/(stateSD**2+proxySD**2);e-=w*(s+proxySD*t.p)}
}else{
 // Equal total n readings, two channels with opposed state sensitivity; n=1 unavailable.
 if(n===1)continue;
 e=sensorSD*t.n.slice(0,n).reduce((a,b)=>a+b,0)/n;
}
const sd=Math.sqrt(sensorSD**2/n+(mode==="single"?stateSD**2:mode==="proxy"?stateSD**2*proxySD**2/(stateSD**2+proxySD**2):0));
const x=t.c+e;const pred=x<.475?"S45C":"S50C";hit+=pred===t.g;err+=e*e;
 // Likelihood of uniform carbon range convolved with Gaussian.
 function cdf(z){const a=Math.abs(z),p=1/(1+.2316419*a),q=1-Math.exp(-a*a/2)/Math.sqrt(2*Math.PI)*(.319381530*p-.356563782*p**2+1.781477937*p**3-1.821255978*p**4+1.330274429*p**5);return z<0?1-q:q}
 const l=grades.map(([,lo,hi])=>Math.max(0,(cdf((hi-x)/sd)-cdf((lo-x)/sd))/(hi-lo)));
 const sum=l[0]+l[1];if(sum>0&&Math.max(...l)/sum>=.9){accept++;aright+=pred===t.g}
}
if(mode==="opposite"&&n===1)continue;
out.push([stateSD,sensorSD,n,mode,trials.length,hit/trials.length,Math.sqrt(err/trials.length),accept/trials.length,accept?aright/accept:""]);
}
return "state_sd_carbon_equivalent_wt_pct,sensor_sd_carbon_equivalent_wt_pct,total_readings,method,trials,top1,carbon_rmse_wt_pct,coverage_p90,accepted_accuracy\n"+out.map(r=>r.join(",")).join("\n")+"\n";
}
const csv=study();writeFileSync(new URL('MI-027_magnetic_nuisance.csv',import.meta.url),csv);console.log(csv);
