# MI-019 — Reference-coupon self calibration
Date: 2026-11-27.
## Design
27 grades, 60 batches, 6 synthetic samples per grade per batch = 9,720 samples, shared across 30 conditions = 291,600 condition-trials (not independent samples). Nominal v0.1 property data, not certified measurements. Material scatter log SD density .005, conductivity .07, thermal .07; conductivity/thermal correlation .65. Sample sensor noise SD .01/.05/.10, one reading; magnetic error 2%. Reference certificate offsets are redrawn per batch with SD .002/.01/.02, shared across repetitions within batch. Actual reference certificate error may persist across batches.
Forward model for each property in log units: y=x+b+s*(x-center)+q*(x-center)^2+noise. Batch offset SD .015/.08/.08, slope SD 0 or .06, quadratic coefficient SD 0 or .025. Center log(5,10,60). Reference materials nominal A1050A, C1020, Ti Grade 5; one-point uses A1050A, two-point chooses property-specific extrema among three (may require access to all three materials across modalities), three-point linear least squares. Reference repeat counts 1,4,16. Two/three-point fits are affine, not quadratic. The classifier uses fixed v0.1 nominal covariance and does not propagate residual calibration uncertainty. Equal class and within-class state priors. Top1 fractional ties; acceptance posterior >=.9, no unknown rejection.
## Results
At four reference repetitions:
| Model | none | one | two | three |
|---|---:|---:|---:|---:|
| offset |65.82%|71.42%|71.92%|72.40%|
| offset+scale |57.98%|61.48%|71.87%|72.31%|
| offset+scale+curvature |57.48%|61.13%|67.41%|69.30%|
Offset+scale, 2-point: conductivity log RMSE .10935 -> .05650, accepted accuracy 77.24% -> 97.87%, coverage 42.18% ->34.86%. These are closed-set synthetic outcomes, not a safe confidence guarantee.
Offset+scale, 3-point, 4->16 repetitions: top1 72.31->72.62%; limited benefit. Curvature remains a systematic residual. One-point calibration is not sufficient for slope drift and may worsen individual property RMSE. Reference material range may fail to span all grades.
## Engineering decisions
Use reference coupons with independently measured property values, not merely grade labels. Consider per-property extreme standards, thermal equilibrium, geometry/contact repeatability, temperature tracking, drift check and rejection if calibration is unstable. Validate on real independent material lots. Next simulate explicit residual covariance and reference certificate persistence, nonlinear holdout checks and unknown grade rejection. Optimize reference and measurement time only after empirical timing. No claim that low-cost hardware has achieved these precisions.
Reproduce: node simulation/MI-019_self_calibration.mjs. Exact study function executed in JS before commit; standalone file not executed here. Public repository, generic models and public reference data only.
