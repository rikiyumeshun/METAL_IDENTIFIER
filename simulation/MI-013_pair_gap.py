"""Closest-state pair separability, same magnetic class only. Not empirical."""
import csv, math, itertools
from pathlib import Path
from collections import defaultdict
P=Path(__file__).parent
groups=defaultdict(list)
with (P/'metal_properties_v01.csv').open(encoding='utf-8-sig') as f:
    for r in csv.DictReader(f):
        groups[r['grade']].append((r['state'],[math.log(float(r[k])) for k in ('density_g_cm3','conductivity_MS_m','thermal_W_mK')],r['magnetic_binary_assumed']))
vd=.005**2+.01**2; ve=.07**2+.05**2; vk=.07**2+.10**2
c=.65*.07**2; det=ve*vk-c*c
out=[]
for ga,gb in itertools.combinations(groups,2):
    candidates=[]
    for (sa,a,ma),(sb,b,mb) in itertools.product(groups[ga],groups[gb]):
        if ma!=mb: continue
        d,e,k=[x-y for x,y in zip(a,b)]
        D=math.sqrt(d*d/vd+(vk*e*e-2*c*e*k+ve*k*k)/det)
        candidates.append((D,sa,sb))
    if not candidates: continue
    D,sa,sb=min(candidates)
    gap=max(0,3.289707**2-D*D)
    out.append((ga,gb,sa,sb,D,math.sqrt(gap),math.ceil(gap)))
out.sort(key=lambda x:x[4])
with (P/'MI-013_pair_gap.csv').open('w',encoding='utf-8',newline='') as f:
    w=csv.writer(f);w.writerow(['grade_a','grade_b','state_a','state_b','baseline_mahalanobis','required_independent_effect_95','number_independent_d1_features'])
    for a,b,s,t,D,g,n in out: w.writerow([a,b,s,t,f'{D:.5f}',f'{g:.5f}',n])
print(len(out),sum(r[5]>0 for r in out))
