import {writeFileSync} from 'node:fs';
function study(){
const grades=[["C1020",58],["A1050A",34.51],["A6061-T6",24.94],["A5052",20.3],["S45C",6],["SUS304",1.36986]];
const dc=[];for(const [g,s] of grades)for(const pitch of [1,2,5])for(const current of [.1,.5,1]){
const rho=1/(s*1e6),bulk=current*rho/(2*Math.PI*pitch*.001)*1e6;
dc.push([g,pitch,current,bulk,current*rho*Math.log(2)/(Math.PI*.0005)*1e6,bulk/7.8125]);
}
const results=[];for(const a of [2,3,5])for(const tol of [.025,.05,.1,.2])for(const n of [1,3,5]){
// uniform bounded independent stack terms; compare RMS and worst case. Amplitude exp(-2h/a), hypothetical.
const sd=Math.sqrt(n)*tol/Math.sqrt(3);const worst=n*tol;
results.push([a,tol,n,sd,worst,100*(Math.exp(2*worst/a)-1),100*Math.sqrt(Math.exp(4*sd*sd/(a*a))-1)]);
}
return {dc:"grade,pitch_mm,current_A,halfspace_voltage_uV,thin_sheet_0p5mm_asymptotic_voltage_uV,halfspace_nominal_ADC_counts\n"+dc.map(r=>r.join(",")).join("\n")+"\n",stack:"effective_decay_length_mm,term_half_tolerance_mm,independent_terms,gap_sd_mm,worst_gap_mm,max_positive_amplitude_error_pct,approx_amplitude_cv_pct\n"+results.map(r=>r.join(",")).join("\n")+"\n"};
}
for(const [k,v] of Object.entries(study()))writeFileSync(new URL('MI-037_'+k+'.csv',import.meta.url),v);
