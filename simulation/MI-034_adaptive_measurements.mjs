import {readFileSync,writeFileSync} from 'node:fs';
function study(data){
const rows=data.trim().split(/\r?\n/).slice(1).map(l=>{const [g,s,d,e,k,m]=l.split(",");return {g,v:[+d,+e,+k].map(Math.log).concat(+m)}});
const grades=[...new Set(rows.map(r=>r.g))],groups=grades.map(g=>rows.filter(r=>r.g===g));
const mat=[.005,.07,.07],sens=[.01,.05,.10],sd=mat.map((v,i)=>Math.hypot(v,sens[i]));
const costs=[15,3,12,2],names=["density","conductivity","thermal","magnet"];
const edges=sd.map((s,i)=>{const v=rows.map(r=>r.v[i]),lo=Math.min(...v)-4*s,hi=Math.max(...v)+4*s;return Array.from({length:Math.ceil((hi-lo)/s)},(_,j)=>lo+j*s)});
function cdf(x){const a=Math.abs(x),t=1/(1+.2316419*a),p=1-Math.exp(-a*a/2)/Math.sqrt(2*Math.PI)*(.319381530*t-.356563782*t*t+1.781477937*t**3-1.821255978*t**4+1.330274429*t**5);return x<0?1-p:p}
const likelihood=rows.map(r=>[...sd.map((s,i)=>{const p=[0,...edges[i].map(b=>cdf((b-r.v[i])/s)),1];return p.slice(1).map((v,j)=>Math.max(0,v-p[j]));}),[r.v[3]===0?.98:.02,r.v[3]===1?.98:.02]]);
const prior=rows.map(r=>1/grades.length/groups[grades.indexOf(r.g)].length),gindex=rows.map(r=>grades.indexOf(r.g));
function gradeP(p){const q=grades.map(()=>0);p.forEach((v,i)=>q[gindex[i]]+=v);return q}
function H(p){return -p.reduce((s,v)=>s+(v>0?v*Math.log(v):0),0)}
function choose(p,left){const h=H(gradeP(p));let best=-Infinity,m=-1;for(const i of left){let e=0;for(let b=0;b<likelihood[0][i].length;b++){const q=p.map((v,j)=>v*likelihood[j][i][b]),z=q.reduce((a,b)=>a+b,0);if(z>1e-14)e+=z*H(gradeP(q).map(x=>x/z))}const score=(h-e)/costs[i];if(score>best){best=score;m=i}}return m}
let seed=34027;function U(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return(seed+.5)/4294967296}function N(){return Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U())}
const trials=groups.flatMap(g=>Array.from({length:180},()=>({r:g[Math.floor(U()*g.length)],z:[N(),N(),N()],n:[N(),N(),N()],u:U()})));
const result=[];
for(const [scenario,corr,bias] of [["matched_independent",0,[0,0,0]],["correlated",.65,[0,0,0]],["correlated_bias",.65,[.015,.08,-.08]]]){
const observations=trials.map(t=>{const m=[t.z[0],t.z[1],corr*t.z[1]+Math.sqrt(1-corr*corr)*t.z[2]];return {g:t.r.g,b:sd.map((s,i)=>{const x=t.r.v[i]+mat[i]*m[i]+sens[i]*t.n[i]+bias[i];const j=edges[i].findIndex(v=>x<v);return j<0?edges[i].length:j}).concat(t.r.v[3]^(t.u<.02))}})
for(const method of ["all","fixed","adaptive"]){
const histories=observations.map(t=>{let p=prior.slice(),left=[0,1,2,3],time=0,history=[];while(left.length){const i=method==="adaptive"?choose(p,left):[3,1,0,2].find(j=>left.includes(j));left=left.filter(j=>j!==i);time+=costs[i];p=p.map((v,j)=>v*likelihood[j][i][t.b[i]]);const sum=p.reduce((a,b)=>a+b,0);if(sum<=0)break;p=p.map(v=>v/sum);const q=gradeP(p),max=Math.max(...q),ties=q.map((v,j)=>Math.abs(v-max)<1e-12?j:-1).filter(j=>j>=0);history.push({time,max,correct:ties.includes(grades.indexOf(t.g))?1/ties.length:0,i});}return history});
for(const threshold of [.8,.9,.95]){
let time=0,accept=0,right=0,allright=0,tests=0;
for(const h of histories){const a=(method==="all"?h.at(-1):h.find(v=>v.max>=threshold))??h.at(-1);if(!a)continue;time+=a.time;tests+=h.indexOf(a)+1;allright+=a.correct;if(a.max>=threshold){accept++;right+=a.correct}}
result.push([scenario,method,threshold,trials.length,time/trials.length,tests/trials.length,accept/trials.length,accept?right/accept:"",allright/trials.length])
}}
}
return "scenario,method,posterior_threshold,trials,mean_assumed_seconds,mean_tests,coverage,accepted_accuracy,top1_at_stop\n"+result.map(r=>r.join(",")).join("\n")+"\n"
}
const csv=study(readFileSync(new URL('metal_properties_v01.csv',import.meta.url),'utf8'));writeFileSync(new URL('MI-034_adaptive_measurements.csv',import.meta.url),csv);console.log(csv);
