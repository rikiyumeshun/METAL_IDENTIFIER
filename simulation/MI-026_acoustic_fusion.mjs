import {writeFileSync} from 'node:fs';
function study(){
 const rows=[["A5052-H32",2680,70.3,20.3],["A6061-T6",2700,68.9,24.94],["A7075-T6",2810,71.7,19.14],["SUS304_proxy",7900,200,1.37],["SUS316_proxy",8000,200,1.33],["C1100_proxy",8910,117.2,58],["Ti Grade 5",4430,113.8,.59]];
 let seed=26027;function U(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return(seed+.5)/4294967296}function N(){return Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U())}
 const K=4.7300407449**2/(2*Math.PI*Math.sqrt(12));
 const trials=rows.flatMap(([g,r,E,s])=>Array.from({length:600},()=>({g,r:r*Math.exp(.005*N()),E:E*Math.exp(.02*N()),s:s*Math.exp(.07*N()),L:.18+.06*U(),h:.002+.004*U(),z:Array.from({length:7},N)})));
 const out=[];
 for(const geomSD of [.002,.01,.03])for(const freqSD of [.001,.005,.02]){
 const methods=["conductivity","density+conductivity","raw_bend","bend_normalized","longitudinal","density+conductivity+bend","density+conductivity+longitudinal"];
 const hits=methods.map(()=>0),errors=[[],[]];
 for(const t of trials){
 const c=Math.sqrt(t.E*1e9/t.r),fb=K*t.h*c/t.L**2,fl=c/(2*t.L);
 const Lm=t.L*Math.exp(.002*t.z[0]),hm=t.h*Math.exp(geomSD*t.z[1]);
 const fBm=fb*Math.exp(Math.hypot(freqSD,.005)*t.z[2]),fLm=fl*Math.exp(Math.hypot(freqSD,.003)*t.z[3]);
 const cb=fBm*Lm**2/(K*hm),cl=2*Lm*fLm;
 const d=Math.log(t.r)+.01*t.z[4],s=Math.log(t.s)+.05*t.z[5];
 errors[0].push(Math.abs(cb/c-1));errors[1].push(Math.abs(cl/c-1));
 const vb=geomSD**2+4*.002**2+freqSD**2+.005**2,vl=.002**2+freqSD**2+.003**2,vd=.005**2+.01**2,vs=.07**2+.05**2;
 // Acoustic log speed is correlated with density; joint conditional likelihood includes covariance -0.5*material density variance.
 const cov=-.5*.005**2;
 for(let i=0;i<methods.length;i++){
 const m=methods[i];let best=Infinity,label="";
 for(const [g,r,E,S] of rows){
 const dr=d-Math.log(r),ds=s-Math.log(S),c0=Math.sqrt(E*1e9/r);
 const dc=Math.log((m==="raw_bend"?fBm/(K*.004/.21**2):m.includes("longitudinal")?cl:cb)/c0);
 const va=.25*(.02**2+.005**2)+(m.includes("longitudinal")?vl:vb);
 let v=0;
 if(m==="raw_bend")v=dc*dc;
 else if(m==="bend_normalized"||m==="longitudinal")v=dc*dc/va;
 else {v=ds*ds/vs;if(m.includes("density")){if(m.includes("bend")||m.includes("longitudinal"))v+=(va*dr*dr-2*cov*dr*dc+vd*dc*dc)/(vd*va-cov*cov);else v+=dr*dr/vd}}
 if(v<best){best=v;label=g}
 }
 hits[i]+=label===t.g;
 }
 }
 for(let i=0;i<methods.length;i++)out.push([geomSD,freqSD,methods[i],trials.length,hits[i]/trials.length]);
 errors.forEach((e,i)=>{e.sort((a,b)=>a-b);out.push([geomSD,freqSD,i?"longitudinal_speed_median_error":"bend_speed_median_error",trials.length,e[Math.floor(e.length/2)]])});
 }
 return "thickness_log_sd,frequency_log_sd,metric,trials,value\n"+out.map(r=>r.join(",")).join("\n")+"\n";
}
const csv=study();writeFileSync(new URL('MI-026_acoustic_fusion.csv',import.meta.url),csv);console.log(csv);
