import {writeFileSync} from 'node:fs';
const coils=[["16mm",0.0000014114056722537679,0.6313631827982378,0.006537913856],["24mm",0.000004876046667343612,1.464927646361924,0.017467088385]];
function study(coils){
const resonance=[],sync=[];
for(const [name,L,R,dz] of coils){
for(const f of [.5,1,2,3,4,5,8,10])for(const loss of [1,1.5,2,3])for(const lm of [1,.7]){
const l=L*lm,r=R*loss,x=2*Math.PI*f*1e6*l,Q=x/r,rp=r+x*x/r,c=l/(r*r+x*x)*1e12;resonance.push([name,f,loss,lm,Q,rp,c,+(rp>=1000),+(rp>=1250&&rp<=90000&&Q>=10)]);
}
for(const I of [.02,.05,.1])for(const k of [.03,.1,.3])for(const noise of [.0002,.001,.002])for(const n of [1000,10000,100000]){
const delta=I*k*dz,sd=noise*Math.sqrt(2/n),z=Math.hypot(R,2*Math.PI*1e5*L),dt=k*dz/(3.289707*2*Math.PI*1e5*z);
sync.push([name,I*1000,k,delta*1e6,noise*1000,n,sd*1e6,delta/sd,dt*1e9])
}}
if(resonance.length!==128||sync.length!==162||Math.abs((2*Math.PI*1e6*coils[1][1])**2/coils[1][2]-640.75)>1)throw Error("regression");
return {resonance:"coil,frequency_MHz,loss_multiplier,inductance_multiplier,Q,Rp_ohm,C_pF,LDC1612_Rp_gate,LDC1101_Rp_Q_gate\n"+resonance.map(r=>r.join(",")).join("\n")+"\n",sync_budget:"coil,current_mA_peak,coupling_assumption,deltaV_uV_peak,sample_noise_mV_input,samples_per_channel,ideal_IQ_sd_uV,ideal_pair_SNR,phase_error_budget_ns_at_100kHz\n"+sync.map(r=>r.join(",")).join("\n")+"\n"}}
for(const [k,v] of Object.entries(study(coils)))writeFileSync(new URL('MI-039_'+k+'.csv',import.meta.url),v);
