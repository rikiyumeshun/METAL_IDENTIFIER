"""Bounded-error elemental interval screening. No empirical accuracy claims."""
import csv,itertools
from pathlib import Path
P=Path(__file__).parent
with (P.parent/'data/MI-014_al_composition_ranges.csv').open() as f:
    rows=list(csv.DictReader(f))
grades=list(dict.fromkeys(r['grade'] for r in rows))
elements=list(dict.fromkeys(r['element'] for r in rows))
bounds={(r['grade'],r['element']):(float(r['min_wt_pct']),float(r['max_wt_pct'])) for r in rows}
def gap(a,b,e):
    x,y=bounds.get((a,e)),bounds.get((b,e))
    return None if x is None or y is None else max(0,x[0]-y[1],y[0]-x[1])
pairs=list(itertools.combinations(grades,2))
gaps={(a,b):[gap(a,b,e) for e in elements] for a,b in pairs}
with (P/'MI-014_element_pair_gaps.csv').open('w',newline='') as f:
    w=csv.writer(f);w.writerow(['grade_a','grade_b',*[e+'_gap_wt_pct' for e in elements]])
    for (a,b),v in gaps.items():w.writerow([a,b,*['' if x is None else f'{x:.4f}' for x in v]])
with (P/'MI-014_element_subset_results.csv').open('w',newline='') as f:
    w=csv.writer(f);w.writerow(['absolute_error_wt_pct','num_elements','max_pairs_separated','example_best_subsets'])
    for tol in [.005,.02,.05,.1,.25,.5,1]:
        for n in range(1,len(elements)+1):
            scores=[]
            for ix in itertools.combinations(range(len(elements)),n):
                score=sum(any(v[k] is not None and v[k]>2*tol+1e-10 for k in ix) for v in gaps.values())
                scores.append((score,ix))
            best=max(s for s,_ in scores)
            examples=['+'.join(elements[k] for k in ix) for s,ix in scores if s==best]
            w.writerow([tol,n,best,';'.join(examples[:5])])
            if n==3: print(tol,best,examples[:1])
assert len(pairs)==21
assert abs(gap('A6061','A6063','Cu')-.05)<1e-9
assert abs(gap('A7050','A7075','Cr')-.14)<1e-9
