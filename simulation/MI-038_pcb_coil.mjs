import {writeFileSync} from 'node:fs';
function study(){
 const mu=4*Math.PI*1e-7,rhoCu=1.724e-8,thick=35e-6;
 const coils=[];
 for(const D of [6,10,16,24,32])for(const w of [.2,.3,.5])for(const N of [4,8,12,16,20]){
 const s=.2,di=D-2*(N*w+(N-1)*s);if(di<2)continue;
 const dav=(D+di)/2*1e-3,p=(D-di)/(D+di);
 const L=mu*N*N*dav/2*(Math.log(2.46/p)+.2*p*p);
 const length=Math.PI*N*dav;
 const R=rhoCu*length/(w*1e-3*thick);
 coils.push({D,w,N,di,L,R,length});
 }
 const freqs=[100,300,1000,3000,10000,30000,100000,300000,1000000];
 const metals=[["C1020",58],["A6061",24.94],["A5052",20.3],["SUS304",1.37]];
 // Single spatial mode reflection factor for nonmagnetic conductive half-space; not integrated PCB response.
 function reflection(k,f,sigma){const x=k*k,y=2*Math.PI*f*mu*sigma*1e6,r=Math.hypot(x,y),a=Math.sqrt((r+x)/2),b=y/(2*a),den=(a+k)**2+b*b;return [(a*a+b*b-k*k)/den,2*k*b/den]}
 const out=[];
 for(const c of coils)for(const f of freqs){
 const k=2/((c.D+c.di)/2*1e-3),Q=2*Math.PI*f*c.L/c.R,cap=1/((2*Math.PI*f)**2*c.L);
 const vals=metals.map(([g,s])=>reflection(k,f,s));
 const contrast=Math.hypot(vals[1][0]-vals[2][0],vals[1][1]-vals[2][1]);
 const h=.0005,atten=Math.exp(-2*k*h);
 const signal=2*Math.PI*f*c.L*atten*contrast; // normalized unit-coupling impedance proxy, not actual voltage
 out.push([c.D,c.w,c.N,c.di,c.L*1e6,c.R,c.length*1000,f,Q,cap*1e9,contrast,signal*1000,...metals.map(([g,s])=>1e3*Math.sqrt(1/(Math.PI*f*mu*s*1e6)))])
 }
 const header="outer_mm,trace_mm,turns,inner_mm,L_uH,Rdc_ohm,trace_length_mm,frequency_Hz,Q_dc_upper_estimate,resonance_C_nF,Al_pair_reflection_contrast,unit_coupling_deltaZ_proxy_mOhm,skin_Cu_mm,skin_A6061_mm,skin_A5052_mm,skin_SUS304_mm\n";
 return {csv:header+out.map(r=>r.join(",")).join("\n")+"\n",coils,out};
}
const r=study();if(r.out.some(a=>!a.every(Number.isFinite)))throw Error('nonfinite');writeFileSync(new URL('MI-038_pcb_coil.csv',import.meta.url),r.csv);
