import {writeFileSync} from 'node:fs';
function study(){
 const B=[.1,.2,.3,.4],mu=4*Math.PI*1e-7,g=9.80665;
 // hypothetical field gradient scale proportional to B^2, 20 T^2/m at .4 T.
 const k=B.map(b=>20*(b/.4)**2*1e-6/(2*mu*g)); // mg per ppm, 1 cm3
 let seed=32027;function U(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return(seed+.5)/4294967296}function N(){return Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U())}
 const trials=Array.from({length:10000},()=>({chi:-9.65+.5*N(),c:16*U(),z:B.map(N)}));
 const records=[];
 for(const bs of [0,.05,.15,.3])for(const sd of [.1,.5,1])for(const ix of [[3],[1,3],[0,1,2,3]]){
 let err=[],cont=[],bias=0,flag=0;
 for(const t of trials){
 const ys=B.map((b,i)=>k[i]*(t.chi-.36+t.c/b*(bs===0?1:Math.tanh(b/bs)))+sd*t.z[i]);
 let chi,c=0;
 if(ix.length===1)chi=ys[3]/k[3]+.36;
 else{
 let aa=0,ab=0,bb=0,ay=0,by=0;
 for(const i of ix){const a=k[i],b=k[i]/B[i],y=ys[i]+.36*k[i];aa+=a*a;ab+=a*b;bb+=b*b;ay+=a*y;by+=b*y}
 const det=aa*bb-ab*ab;chi=(ay*bb-by*ab)/det;c=(by*aa-ay*ab)/det;
 if(ix.length>2){const r=ix.reduce((s,i)=>s+((ys[i]-k[i]*(chi-.36+c/B[i]))/sd)**2,0);flag+=r>5.991}
 }
 err.push(Math.abs(chi-t.chi));bias+=chi-t.chi;cont.push(Math.abs(c-t.c))
 }
 err.sort((a,b)=>a-b);cont.sort((a,b)=>a-b);records.push([bs,sd,ix.map(i=>B[i]).join(";"),trials.length,bias/trials.length,err[5000],err[9500],cont[5000],ix.length>2?flag/trials.length:""]);
 }
 return "saturation_scale_T,force_noise_sd_mg,fields_T,trials,intrinsic_chi_bias_ppm,median_abs_chi_error_ppm,p95_abs_chi_error_ppm,median_impurity_parameter_error_ppm_T,lack_of_fit_flag_rate\n"+records.map(r=>r.join(",")).join("\n")+"\n";
}
const csv=study();writeFileSync(new URL('MI-032_field_sweep.csv',import.meta.url),csv);console.log(csv);
