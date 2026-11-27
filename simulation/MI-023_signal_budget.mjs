import {writeFileSync} from 'node:fs';
function study(){
 const grades=[["C1020",58,8.94],["A6061-T6",24.94,2.7],["A5052",20.3,2.68],["S45C",6,7.87],["SUS304",1.37,7.9],["SUS316",1.33,8]];
 const out=[];
 for(const [g,s,d] of grades)for(const area of [1,10,100])for(const I of [.1,.5,1]){
 const R=.05/(s*1e6*area*1e-6),V=I*R*1e6;
 out.push([g,area,I,R*1e6,V,7.8125/V*100,Math.sqrt(2)*10/2/V*100,I*I*R]);
 }
 const density=[];
 for(const m of [5,20,100,500])for(const sd of [.01,.1,1])for(const [g,s,d] of grades){
 const buoy=m/d;const dm=(1-d)/buoy, dw=d/buoy;
 const sigma=sd*Math.hypot(dm,dw);density.push([g,m,sd,buoy,sigma,sigma/d*100])
 }
 const csv=(h,r)=>h+"\n"+r.map(x=>x.join(",")).join("\n")+"\n";
 return {voltage:csv("grade,area_mm2,current_A,resistance_uohm,voltage_uV,one_lsb_relative_pct,random_sd_pct_single_reversal_assumed_10uV_each,joule_W_sample_only",out),density:csv("grade,air_mass_g,each_weighing_sd_g,buoyancy_g,density_sd_g_cm3,relative_sd_pct",density)};
}
const r=study();for(const [k,v] of Object.entries(r))writeFileSync(new URL('MI-023_'+k+'.csv',import.meta.url),v);
