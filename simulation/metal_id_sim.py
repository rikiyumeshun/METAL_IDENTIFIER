import numpy as np, pandas as pd
from scipy.special import logsumexp
from pathlib import Path
P=Path(__file__).parent
rows=[]
def add(grade,state,d,s,k,m,src): rows.append((grade,state,d,s,k,m,src))
AL='https://www.alumeco.com/aluminium/data/physical-properties/ | https://www.easaluminium.eu/katalog/hesaplama/'
MI='https://jp.meviy.misumi-ec.com/help/ja/technical_info/mpb_shape-material/33685/'
BS='https://bssa.org.uk/bssa_articles/ambient-temperature-physical-properties-of-stainless-steels-to-bs-en-10088-1/'
TI='https://www.nbk1560.com/en-US/resources/specialscrew/article/technical-28-titanium-tokusei/?SelectedLanguage=en-US'
for g,d,states in [('A1050A',2.71,[('O/H',59.5,229)]),('A2024',2.78,[('T3',30,121),('T8',38.5,151)]),('A5052',2.68,[('O/H',35,138)]),('A5083',2.66,[('O/H',28.5,117)]),('A6061',2.70,[('O',46.5,180),('T4',40,155),('T6',43,166)]),('A6063',2.70,[('O',57.5,218),('T4',49.5,197),('T5',55.5,209),('T6',52,201)]),('A7075',2.81,[('O',45.5,175),('T6',33,134),('T7',39.5,155)])]:
 for st,s,k in states: add(g,st,d,s*.58,k,0,AL)
for g,d,s,k,m in [('A2017',2.79,20,130,0),('A7050',2.83,19,130,0),('ADC12',2.74,13,96,0),('S45C',7.87,6,45,1),('S50C相当',7.8,6,44,1),('SCM440',7.85,6,42.7,1),('SKD11',7.8,4,20,1),('NAK55相当',7.8,5,30,1),('C1020',8.94,58,391,0),('C1100',8.94,58,391,0),('C2801',8.39,16.2,159,0),('C3604低鉛',8.43,15.1,117,0)]: add(g,'unspecified',d,s,k,m,MI if g!='S45C' else 'https://jp.meviy.misumi-ec.com/help/ja/technical_info/tup_shape-material/33691/')
for g,d,r,k,m in [('SUS304',7.9,.73,15,0),('SUS316',8,.75,15,0),('SUS430',7.7,.7,25,1),('SUS410',7.7,.60,30,1),('SUS630',7.8,.71,16,1)]: add(g,'reference',d,1/r,k,m,BS)
for g,d,r,k in [('Ti Grade 2',4.51,.55,17.16),('Ti Grade 5',4.43,1.7,7.5)]: add(g,'reference',d,1/r,k,0,TI)
add('C51000','reference',8.86,8.7,71,0,'https://www.copper.org/publications/pub_list/pdf/a1360.pdf')
df=pd.DataFrame(rows,columns=['grade','state','density_g_cm3','conductivity_MS_m','thermal_W_mK','magnetic_binary_assumed','source']); df.to_csv(P/'metal_properties_v01.csv',index=False,encoding='utf-8-sig')
labels,inv=np.unique(df.grade,return_inverse=True); G=len(labels); n=3000; rng=np.random.default_rng(20261127)
mu=np.log(df.iloc[:,2:5].to_numpy(float)); mag=df.iloc[:,5].to_numpy(int); idx=np.concatenate([rng.choice(np.where(inv==g)[0],n) for g in range(G)]); truth=inv[idx]; base=rng.standard_normal((len(idx),3)); noise=rng.standard_normal((len(idx),3)); u=rng.random(len(idx)); R=np.array([[1,0,0],[0,1,.65],[0,.65,1]])
# nominal relative 1-sigma in log space, material and instruments; not empirical
scenarios={'ideal':([.002,.03,.03],[.002,.01,.02],.005),'bench':([.005,.07,.07],[.01,.05,.10],.02),'rough':([.01,.12,.12],[.03,.15,.25],.08)}
combos={'mag':['m'],'density':['d'],'conductivity':['s'],'thermal':['k'],'density+mag':['d','m'],'conductivity+mag':['s','m'],'density+conductivity':['d','s'],'density+conductivity+mag':['d','s','m'],'conductivity+thermal+mag':['s','k','m'],'all':['d','s','k','m']}
res=[]; per=[]
for scenario,(mat,meas,flip) in scenarios.items():
 D=np.diag(mat); C=D@R@D+np.diag(np.array(meas)**2); X=mu[idx]+base@np.linalg.cholesky(D@R@D).T+noise*np.array(meas); M=mag[idx]^(u<flip)
 for name,features in combos.items():
  cols=[i for i,k in enumerate('dsk') if k in features]; ll=np.zeros((len(idx),len(df)))
  if cols:
   delta=X[:,None,cols]-mu[None,:,cols]; ll-=.5*np.einsum('nsi,ij,nsj->ns',delta,np.linalg.inv(C[np.ix_(cols,cols)]),delta)
  if 'm' in features: ll+=np.where(M[:,None]==mag[None,:],np.log(1-flip),np.log(flip))
  score=np.column_stack([logsumexp(ll[:,inv==g],axis=1)-np.log(np.sum(inv==g)) for g in range(G)]); probs=np.exp(score-logsumexp(score,axis=1)[:,None]); pred=score.argmax(1); correct=pred==truth; ties=(np.abs(score-score.max(1)[:,None])<1e-10); top1=np.mean(ties[np.arange(len(idx)),truth]/ties.sum(1)); accept=probs.max(1)>=.90
  res.append((scenario,name,top1,accept.mean(),correct[accept].mean() if accept.any() else np.nan))
  if name=='all' and scenario=='bench':
   for g in range(G):
    mask=truth==g; counts=np.bincount(pred[mask],minlength=G); counts[g]=0; per.append((labels[g],np.mean(ties[mask,g]/ties[mask].sum(1)),labels[counts.argmax()]))
out=pd.DataFrame(res,columns=['scenario','sensors','top1','coverage_p90','accuracy_accepted']);out.to_csv(P/'metal_sim_results_v01.csv',index=False,encoding='utf-8-sig'); print('grades',G,'states',len(df),'per scenario',len(idx));print(out.pivot(index='sensors',columns='scenario',values='top1').round(3));print(out[out.scenario=='bench'].round(3));print(pd.DataFrame(per,columns=['grade','top1','most_confused']).round(3).to_string(index=False))
# Sensitivity to alternate reference means (not a real independent test dataset).
mat,meas,flip=scenarios['bench']; D=np.diag(mat); C=D@R@D+np.diag(np.array(meas)**2)
alt={'A5052':(2.68,25,138),'A5083':(2.66,25,121),'A6061':(2.7,25,167),'A6063':(2.7,25,201),'A7075':(2.8,20,130)}
rng2=np.random.default_rng(77); stress=[]
for g,vals in alt.items():
 X=np.log(vals)+rng2.multivariate_normal(np.zeros(3),C,size=10000); delta=X[:,None,:]-mu[None,:,:]; ll=-.5*np.einsum('nsi,ij,nsj->ns',delta,np.linalg.inv(C),delta)+np.where(mag==0,np.log(1-flip),np.log(flip)); scores=np.column_stack([logsumexp(ll[:,inv==j],axis=1)-np.log(np.sum(inv==j)) for j in range(G)]); pred=scores.argmax(1); stress.append((g,(pred==np.where(labels==g)[0][0]).mean(),labels[np.bincount(pred,minlength=G).argmax()]))
print('alternative source stress',stress)
pd.DataFrame(per,columns=['grade','top1','most_confused_ties_arbitrary']).to_csv(P/'metal_grade_results_v01.csv',index=False,encoding='utf-8-sig')
