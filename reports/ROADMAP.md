# Research roadmap
## v0.1 findings
Bench, four features: top-1 73.3%; posterior >= 0.9: coverage 35.4%, accepted accuracy 98.2% within the assumed closed-set simulation. Not an empirical or out-of-distribution guarantee. Copper C1020/C1100 share identical model inputs; S45C, S50C and SCM440 remain confusable. Most-confused labels for perfect classifications and ties are not meaningful.
## Next steps
1. Verify every property with grade-specific sources; record measurement temperature, material condition, range, uncertainty and provenance. Distinguish nominal values from assumptions.
2. Sweep sensor errors independently, including systematic bias, unknown grades and unseen heat treatment. Report grade-family accuracy, top-k, rejection rate and per-grade confusion. Separate training and validation sources.
3. Compare low-cost density (hydrostatic weighing), electrical conductivity (four-wire resistance on known geometry or eddy-current response), magnetic response (magnet and force/Hall sensor), and thermal transient response. Evaluate thermoelectric voltage as a complementary feature.
4. Build frequency-dependent induction forward models, including geometry, lift-off, temperature and finite thickness. Test parameter identifiability before purchasing hardware.
5. Compare costs and measurement time; establish a controlled coupon validation set. Evaluate independent real samples before claiming material identification accuracy.
6. Preserve each run's data, code, seed, metrics and limitations. No exact material verdict when observations overlap.
