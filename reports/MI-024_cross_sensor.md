# MI-024 — Cross-sensor correction
## Experiment
8 nonmagnetic nominal grades (SUS304, Ti Grade 2, C51000, ADC12, A5083, A6061-T6, A1050A, C1020). 400 simulated specimens each = 3,200 shared draws. 3 noise × 3 geometry scatter × 4 proxy configurations × 2 density configurations = 72 conditions, 230,400 condition-trials, not independent specimens. No empirical results.
MI-020 single-relaxation surrogate x/(1+x²), x=f*pi*mu0*sigma*a², eight frequencies 100–300000 Hz, a=.003 m. Material log conductivity SD .05, log density SD .005; density readout log SD .015. Log effective scale l_a ~ N(0, geometrySD²) with SD .05/.10/.20, not measured physical dimensions. Offset and log-frequency slope projected out; unknown positive gain fitted; 320-point effective-conductivity grid. Normalized noise SD .005/.02/.05.
Proxy z=l_a+e with independent noise SD hypot(proxySD,.025), proxySD=.01/.03/.08. The .025 is assumed irreducible proxy-model scatter. No proxy equivalent weight=0. Gaussian conditional estimate E[l_a|z]=geometrySD²/(geometrySD²+proxy variance)*z. Corrected log sigma=estimated log effective sigma-2*E[l_a|z]. Classifier uses residual geometry uncertainty, assumed material scatter and heuristic spectral SD (.04/.12/.30) plus density likelihood when enabled; equal class priors. No unknown grades, uncertainty calibration, full finite plate Maxwell solution, correlation between density and geometry errors, or real hardware.
## Main results at normalized noise .02
| Geometry log SD | No proxy, no density | Proxy .03 only | Density only | Proxy .03 + density | Proxy .01 + density |
|---|---:|---:|---:|---:|---:|
|.10|64.34%|80.97%|85.44%|91.88%|93.22%|
|.20|48.19%|80.63%|79.66%|91.50%|93.09%|
At geometry SD .10, proxy .03: median relative conductivity error 15.70% -> 9.25%, p95 49.07% -> 28.70%. Density alone does not improve conductivity estimation, only class discrimination. Proxy .08 plus density gives 88.81%. These are idealized closed-set results; the 8 classes differ much more than many grades in the original 27-grade database.
## Validation plan
1. Start with thick flat coupons; physically constrain lift-off with a known nonconductive spacer and spring force rather than relying on nominally precise optical distance sensing. Log temperature, thickness, width, edge distance and coil geometry.
2. Fit actual effective-length proxy relation using certified conductivity coupons over multiple dimensions and independently held-out geometries. Caliper resolution is NOT equivalent to proxy accuracy. Check residual bias and covariance with density.
3. Compare hydrostatic weighing, known geometry and displacement measurements for removable, nonporous samples. Density is unavailable for installed parts; report separate operating modes.
4. Use a finite-thickness electromagnetic forward model, real complex impedance and phase calibration before selecting excitation frequencies or promising hardware accuracy.
5. Compare measured incremental gain against cost, speed and applicability. Continue open-set testing and reference calibration.
Reproduce: node simulation/MI-024_cross_sensor.mjs. Exact study function executed in JS before committing; standalone Node file not independently executed. Public repository, generic models only.
