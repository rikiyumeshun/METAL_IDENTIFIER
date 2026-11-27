# MI-012 — Weak sensor fusion

## Question
Can many inexpensive, low-resolution measurements jointly discriminate two similar alloys? Pair-specific features are acceptable.

## Analytic toy model (not empirical alloy data)
Two equally likely classes, multivariate normal with identical covariance. Every feature has a mean separation of one within-class standard deviation. All pairs of feature errors have correlation r. The optimal Bayes accuracy is Phi(0.5*sqrt(n/(1+(n-1)*r))). For n=1, 2, 4, 8, 16, 32:
| n | r=0 | r=.2 | r=.5 | r=.9 |
|---|---|---|---|---|
|1|69.15%|69.15%|69.15%|69.15%|
|2|76.02%|74.07%|71.81%|69.60%|
|4|84.13%|78.54%|73.65%|69.84%|
|8|92.14%|81.93%|74.75%|69.97%|
|16|97.72%|84.13%|75.36%|70.03%|
|32|99.77%|85.41%|75.69%|70.06%|

Reproduce with Python standard library:
    from math import sqrt, erf
    for n in [1,2,4,8,16,32]:
        print(n, [(1+erf(sqrt(n/(1+(n-1)*r))/(2*sqrt(2))))/2 for r in [0,.2,.5,.9]])

## Design implications
- Optimize conditional information gain per marginal cost/time rather than sensor count; full covariance or validated joint model is required.
- Repeat measurements reduces independent random noise but not calibration drift, grade overlap, surface or heat-treatment systematic shifts.
- Use shared hardware (coil sweep, temperature sweep, current reversal, pulse response) but count only independently informative features.
- Fit measurement likelihoods to certified samples, then validate on unseen lots and conditions; include unknown materials and abstention.
- Target first: broad alloy family, then candidate-pair tests. Define false acceptance limits separately from coverage.
- Collect candidate-pair effect size and covariance for all MI-011 principles, with nuisance variables. Never treat hypothetical standardized effect size as real metal performance.

Prior v0.1 closed-set rough scenario: conductivity 31.3%, density+conductivity 45.3%, all four features 53.2%. Increasing sensor count does not automatically deliver reliable exact grade classification. No new hardware tests or empirical features in MI-012.
