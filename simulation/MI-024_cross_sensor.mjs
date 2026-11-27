import {writeFileSync} from 'node:fs';
function study(){
 const grades=[["SUS304",1.37,7.9],["Ti Gr2",1.82,4.51],["C51000",8.7,8.86],["ADC12",13,2.74],["A5083",16.53,2.66],["A6061-T6",24.94,2.70],["A1050A",34.51,2.71],["C1020",58,8.94]];
 const fs=[100,300,1000,3000,10000,30000,100000,300000],a=.003;
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),mean=v=>v.reduce((s,x)=>s+x,0)/v.length;
 const center=v=>{const m=mean(v);return v.map(x=>x-m)};
 const t=center(fs.map(Math.log10)),tt=dot(t,t);
 const project=v=>{const c=center(v),k=dot(c,t)/tt;return c.map((x,i)=>x-k*t[i])};
 const response=(s,f)=>{const x=f*Math.PI*4*Math.PI*1e-7*s*1e6*a*a;return x/(1+x*x)};
 const grid=Array.from({length:320},(_,i)=>Math.exp(Math.log(.3)+i/319*Math.log(500)));
 const templates=grid.map(s=>{const p=project(fs.map(f=>response(s,f)));return {l:Math.log(s),p,pp:dot(p,p)}});
 let seed=20260124;function U(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed+.5)/4294967296}function N(){return Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U())}
 const trials=grades.flatMap(([g,s,d])=>Array.from({length:400},()=>({g,s,d,mat:N(),md:N(),geom:N(),proxy:N(),res:N(),den:N(),h:.2+1.5*U(),b:N(),tilt:N(),z:fs.map(N)})));
 const out=[];
 for(const noise of [.005,.02,.05])for(const geomSD of [.05,.10,.20]){
  const obs=trials.map(v=>{
   const la=geomSD*v.geom, ls=Math.log(v.s)+.05*v.mat, gain=Math.exp(-2*v.h/3);
   const y=project(fs.map((f,i)=>gain*response(Math.exp(ls+2*la),f)+.05*v.b+.02*v.tilt*t[i]+noise*v.z[i]));
   let best=Infinity,l=0;
   for(const m of templates){const k=Math.max(0,dot(y,m.p)/m.pp);const e=y.reduce((s,x,i)=>s+(x-k*m.p[i])**2,0);if(e<best){best=e;l=m.l}}
   return {...v,la,ls,l,ld:Math.log(v.d)+.005*v.md+.015*v.den};
  });
  for(const proxySD of [null,.01,.03,.08])for(const density of [false,true]){
   let hit=0,sum=0,err=[];
   for(const v of obs){
    // Directly observable proxy is assumed to measure effective length only imperfectly; residual independent SD .025.
    const proxy=proxySD===null?0:v.la+proxySD*v.proxy+.025*v.res;
    const pvar=proxySD===null?geomSD**2:proxySD**2+.025**2;
    const weight=proxySD===null?0:geomSD**2/(geomSD**2+pvar);
    const corrected=v.l-2*weight*proxy;
    const residual=proxySD===null?geomSD**2:geomSD**2*pvar/(geomSD**2+pvar);
    // Fixed heuristic spectrum SD by noise level, no true specimen label used.
    const variance=.05**2+4*residual+({".005":.04,".02":.12,".05":.30}[String(noise).replace(/^0/,"")])**2;
    const winner=grades.reduce((best,[g,s,d])=>{const score=(corrected-Math.log(s))**2/variance+(density?(v.ld-Math.log(d))**2/(.005**2+.015**2):0);return score<best.score?{g,score}:best},{score:Infinity,g:""});
    hit+=winner.g===v.g;const e=corrected-v.ls;sum+=e*e;err.push(Math.abs(Math.exp(e)-1))
   }
   err.sort((a,b)=>a-b);out.push([noise,geomSD,proxySD===null?"none":proxySD,density?1:0,trials.length,hit/trials.length,Math.sqrt(sum/trials.length),err[Math.floor(.5*err.length)],err[Math.floor(.95*err.length)]])
  }
 }
 return "noise_sd,geometry_log_sd,proxy_log_sd,density_added,trials,top1,log_conductivity_rmse,median_relative_error,p95_relative_error\n"+out.map(r=>r.join(",")).join("\n")+"\n";
}
const csv=study();writeFileSync(new URL('MI-024_cross_sensor.csv',import.meta.url),csv);console.log(csv);
