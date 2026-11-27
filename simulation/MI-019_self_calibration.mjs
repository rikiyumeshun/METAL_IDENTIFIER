import {readFileSync,writeFileSync} from 'node:fs';
function study(data){
 const rows=data.trim().split(/\r?\n/).slice(1).map(l=>{const [g,s,d,e,k,m]=l.split(",");return {g,s,v:[+d,+e,+k].map(Math.log),m:+m}});
 const grades=[...new Set(rows.map(r=>r.g))],groups=grades.map(g=>rows.filter(r=>r.g===g)),refs=["A1050A","C1020","Ti Grade 5"].map(g=>rows.find(r=>r.g===g));
 const center=[Math.log(5),Math.log(10),Math.log(60)], M=[.005,.07,.07],S=[.01,.05,.1],cert=[.002,.01,.02],corr=.65;
 let seed=19027;function U(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return (seed+.5)/4294967296}function N(){return Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U())}
 const batches=Array.from({length:60},()=>({b:[N(),N(),N()],s:[N(),N(),N()],q:[N(),N(),N()],ref:refs.map(()=>Array.from({length:3},()=>({z:N(),noise:Array.from({length:16},N)}))), samples:groups.flatMap(group=>Array.from({length:6},()=>({r:group[Math.floor(U()*group.length)],z:[N(),N(),N()],n:[N(),N(),N()],flip:U()})))}));
 const scenarios=[["offset",0,0],["offset_scale",.06,0],["offset_scale_curve",.06,.025]];
 const configs=[["none",0],["one",1],["one",4],["one",16],["two",1],["two",4],["two",16],["three",1],["three",4],["three",16]];
 const C=M.map((m,i)=>M.map((n,j)=>i===j?m*m+S[i]**2:i&&j?corr*m*n:0));
 const det=C[1][1]*C[2][2]-C[1][2]**2;
 const d2=(a,b)=>{const [x,y,z]=a.map((v,i)=>v-b[i]);return x*x/C[0][0]+(C[2][2]*y*y-2*C[1][2]*y*z+C[1][1]*z*z)/det};
 const out=[];
 for(const [scenario,scale,curve] of scenarios)for(const [mode,n] of configs){
 let total=0,right=0,accept=0,acceptRight=0,err=[0,0,0];
 for(const batch of batches){
 const forward=(x,i)=>{const v=x-center[i];return x+[.015,.08,.08][i]*batch.b[i]+scale*batch.s[i]*v+curve*batch.q[i]*v*v};
 const fits=center.map((_,i)=>{
 if(mode==="none")return [0,1];
 let idx=[0,1,2].sort((a,b)=>refs[a].v[i]-refs[b].v[i]);if(mode==="one")idx=[0];if(mode==="two")idx=[idx[0],idx[2]];
 const pts=idx.map(j=>{const x=refs[j].v[i];const rr=batch.ref[j][i];return [x,forward(x+cert[i]*rr.z,i)+S[i]*rr.noise.slice(0,n).reduce((a,b)=>a+b,0)/n]});
 if(pts.length===1)return [pts[0][1]-pts[0][0],1];
 const xm=pts.reduce((s,p)=>s+p[0],0)/pts.length,ym=pts.reduce((s,p)=>s+p[1],0)/pts.length;
 const slope=pts.reduce((s,p)=>s+(p[0]-xm)*(p[1]-ym),0)/pts.reduce((s,p)=>s+(p[0]-xm)**2,0);
 return [ym-slope*xm,Math.max(.1,slope)]
 });
 for(const t of batch.samples){
 const z=t.z;const mat=[M[0]*z[0],M[1]*z[1],M[2]*(corr*z[1]+Math.sqrt(1-corr**2)*z[2])];
 const truth=t.r.v.map((v,i)=>v+mat[i]);const x=truth.map((v,i)=>(forward(v,i)+S[i]*t.n[i]-fits[i][0])/fits[i][1]);
 for(let i=0;i<3;i++)err[i]+=(x[i]-truth[i])**2;
 const mag=t.r.m^(t.flip<.02);
 const scores=groups.map(group=>{let p=0;for(const r of group)p+=Math.exp(-.5*d2(x,r.v))*(mag===r.m?.98:.02);return {g:group[0].g,p:p/group.length}});
 const max=Math.max(...scores.map(s=>s.p)),sum=scores.reduce((a,b)=>a+b.p,0),ties=scores.filter(s=>Math.abs(s.p-max)<1e-14*Math.max(max,1e-300));
 right+=ties.some(s=>s.g===t.r.g)?1/ties.length:0;total++;
 if(sum>0&&max/sum>=.9){accept++;acceptRight+=ties[0].g===t.r.g}
 }
 }
 out.push([scenario,mode,n,total,right/total,accept/total,accept?acceptRight/accept:null,...err.map(v=>Math.sqrt(v/total))])
 }
 return "scenario,calibration,reference_repeats_per_property,condition_trials,top1,coverage_p90,accepted_accuracy,log_rmse_density,log_rmse_conductivity,log_rmse_thermal\n"+out.map(r=>r.join(",")).join("\n")+"\n";
}
const csv=study(readFileSync(new URL('metal_properties_v01.csv',import.meta.url),'utf8'));writeFileSync(new URL('MI-019_self_calibration.csv',import.meta.url),csv);console.log(csv);
