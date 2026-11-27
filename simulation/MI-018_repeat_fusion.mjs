import {readFileSync,writeFileSync} from 'node:fs';
function study(data){
 const rows=data.trim().split(/\r?\n/).slice(1).map(l=>{const [g,s,d,e,k,m]=l.split(",");return {g,s,v:[+d,+e,+k].map(Math.log),m:+m}});
 const grades=[...new Set(rows.map(r=>r.g))],groups=grades.map(g=>rows.filter(r=>r.g===g));
 let seed=18027;function U(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return (seed+.5)/4294967296}function N(){return Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U())}
 const protocols=[[0,4,0,0],[0,16,0,0],[1,1,0,0],[2,2,0,0],[4,4,0,0],[1,1,1,1],[2,2,2,1],[4,4,4,1],[1,4,1,1],[4,1,1,1],[0,2,2,1],[1,1,0,1]];
 const scenarios=[["matched",0,0],["bias",.015,.08],["rough_bias",.03,.15]];
 const M=[.005,.07,.07],S=[.01,.05,.10],corr=.65;
 const unknownGroups=groups.filter(g=>["A2017","A7050","SUS316","C1100"].includes(g[0].g));
 const trials=[];for(const group of groups)for(let i=0;i<450;i++){const row=group[Math.floor(U()*group.length)];const z=[N(),N(),N()],noise=Array.from({length:3},()=>Array.from({length:16},N));trials.push({row,z,noise,flip:U()})}
 const result=[];
 function inv(A){let n=A.length,B=A.map((r,i)=>[...r,...Array.from({length:n},(_,j)=>i===j?1:0)]);for(let i=0;i<n;i++){const p=B[i][i];B[i]=B[i].map(v=>v/p);for(let j=0;j<n;j++)if(j!==i){const q=B[j][i];B[j]=B[j].map((v,k)=>v-q*B[i][k])}}return B.map(r=>r.slice(n))}
 for(const [scenario,bd,be] of scenarios)for(const ns of protocols){
  const cols=[0,1,2].filter(i=>ns[i]), C=cols.map(i=>cols.map(j=>i===j?M[i]**2+S[i]**2/ns[i]:i&&j?corr*M[i]*M[j]:0)),I=inv(C);
  let right=0,accept=0,aright=0,unknownAccept=0,unknownN=0,knownN=0,knownRight=0;
  const unknownSet=new Set(unknownGroups.map(g=>g[0].g));
  for(const t of trials){
   const {row,z,noise}=t;
   const material=[M[0]*z[0],M[1]*z[1],M[2]*(corr*z[1]+Math.sqrt(1-corr**2)*z[2])];
   const x=cols.map(i=>row.v[i]+material[i]+[bd,be,-be][i]+S[i]*noise[i].slice(0,ns[i]).reduce((a,b)=>a+b,0)/ns[i]);
   const mag=row.m^(t.flip<.02);
   const scores=groups.map(group=>{let p=0,min=Infinity;for(const r of group){const d=cols.map((i,j)=>x[j]-r.v[i]);let d2=0;for(let i=0;i<d.length;i++)for(let j=0;j<d.length;j++)d2+=d[i]*I[i][j]*d[j];const l=Math.exp(-.5*d2)*(ns[3]?(mag===r.m?.98:.02):1);p+=l;min=Math.min(min,d2)}return {g:group[0].g,p:p/group.length,min}});
   const sorted=scores.slice().sort((a,b)=>b.p-a.p);const best=sorted[0],total=scores.reduce((a,b)=>a+b.p,0);
   const ties=sorted.filter(s=>Math.abs(s.p-best.p)<1e-14*Math.max(best.p,1e-300));right+=ties.some(s=>s.g===row.g)?1/ties.length:0;
   const threshold=[0,6.635,9.210,11.345][cols.length];const accepted=total>0&&best.p/total>=.90&&best.min<=threshold;
   if(accepted){accept++;aright+=best.g===row.g}
   const retained=sorted.filter(s=>!unknownSet.has(s.g)), b=retained[0],sum=retained.reduce((a,s)=>a+s.p,0);
   const a2=sum>0&&b.p/sum>=.90&&b.min<=threshold;
   if(unknownSet.has(row.g)){unknownN++;unknownAccept+=a2}else{knownN++;knownRight+=a2&&b.g===row.g}
  }
  // Arbitrary measurement time model, seconds; no claim of actual cycle time.
  const time=ns[0]*15+ns[1]*3+ns[2]*12+ns[3]*2;
  result.push([scenario,...ns,time,trials.length,right/trials.length,accept/trials.length,accept?aright/accept:null,unknownAccept/unknownN,knownRight/knownN])
 }
 return "scenario,density_repeats,conductivity_repeats,thermal_repeats,magnet_test,assumed_seconds,n,top1,coverage_p90_and_distance,accepted_accuracy,heldout_grade_false_accept,retained_grade_correct_accept\n"+result.map(r=>r.join(",")).join("\n")+"\n";
}
const result=study(readFileSync(new URL('metal_properties_v01.csv',import.meta.url),'utf8'));writeFileSync(new URL('MI-018_repeat_fusion.csv',import.meta.url),result);console.log(result);
