# MI-011 — Sensing principle catalog (2026-11-27)

Purpose: collect even pair-specific discrimination methods; do not require every sensor to classify every alloy. Evidence labels: A = existing material sorting/verification method; B = demonstrated measurement or related discrimination; C = proposed transfer, not verified. Cost tiers are qualitative engineering estimates, not quotes. No real hardware trials yet.

| ID | Principle / feature | Candidate target | Evidence | Cost | Key confounders | Source |
|---|---|---|---|---|---|---|
| P01 | Thermoelectric voltage / Seebeck slope | Alloy sorting; tool steel, Ti, Al candidates | A | low | tip alloy, junction temperature, temper, oxidation; commercial manual excludes 304 vs 316 | https://store.astm.org/e0977-05.html ; https://device.report/m/0b7d6e5e0d366017a1ab113ab57d95b3235e5811820729d5d937ef1bca34216e |
| P02 | Magnetic Barkhausen pulse spectrum / peak field | Ferromagnetic microstructure and carbon-related differences; S45C/S50C hypothesis | B | low-medium | stress, hardness, texture, heat treatment | https://www.jstage.jst.go.jp/article/isijinternational1989/44/6/44_6_1033/_article/-char/en ; https://www.sciencedirect.com/science/article/abs/pii/S030488531731795X |
| P03 | Molybdenum selective spot test | 304-family vs 316-family, restricted candidate set | A | low recurring | also positive for other Mo-bearing alloys; surface marks | https://bssa.org.uk/bssa_articles/2-on-site-methods-for-stainless-steel-grade-product-sorting/ ; https://www.assda.asn.au/publications/technical-faqs/testing-for-grade-confirmation |
| P04 | Mn / other element-selective commercial spot tests | 200-series stainless vs alternatives; Al alloy family candidates | A/B | low recurring | reagent selectivity, surface condition, qualified controls | https://www.assda.asn.au/publications/technical-faqs/testing-for-grade-confirmation ; https://manualzz.com/doc/7416675/koslow-deluxe-1899-metal-detective-lab-instruction-manual |
| P05 | Chemically induced optical color | Cast vs wrought Al; alloy-family grouping | A | low-medium | chemical handling, coatings, not grade-wide accuracy; reported >95% sorted stream purity, not top-1 accuracy | https://www.pnnl.gov/available-technologies/optical-sorting-aluminum-scrap ; https://www.sciencedirect.com/science/article/pii/S0921344925003787 |
| P06 | Electrochemical impedance spectroscopy | Similar 3005 Al compositions / corrosion susceptibility; sorting transfer | B | low-medium | oxide film, electrolyte, surface prep, history | https://chemistry-europe.onlinelibrary.wiley.com/doi/full/10.1002/celc.202300374 |
| P07 | Contact thermal effusivity | Broad families / complementary thermal signature | B | low | pressure, roughness, contact resistance, finite thickness | https://www.jstage.jst.go.jp/article/jjtp/11/3/11_3_89/_article |
| P08 | Resonant ultrasound / modal frequencies | Same-geometry parts; purity and substitution | A | low-medium prototype | geometry, support, density, anisotropy | https://store.astm.org/e2985_e2985m-14r19.html |
| P09 | Resistivity temperature coefficient | Complement to conductivity; Cu alloys / Al states | B | low | accurate temperature, geometry drift, shared physical origin with conductivity | https://archive.copper.org/applications/marine/cuni/properties/DKI_booklet.html ; https://www.iieta.org/journals/acsm/paper/10.18280/acsm.440301 |
| P10 | Magnetic coercivity, hysteresis, harmonics | Ferromagnetic grade/state candidates | B | low-medium | demagnetizing field, stress, heat treatment | https://link.springer.com/chapter/10.1007/978-3-032-35104-3_45 |
| P11 | Multispectral visible/NIR reflectance | Broad nonferrous families | A/B | low-medium | paint, roughness, oxidation, geometry | https://www.vision-systems.com/home/article/16737584/multisensor-imaging-aids-non-ferrous-scrap-metal-sorting |
| P12 | Grinding spark imagery | Carbon steel families | A | low | operator/conditions, abrasion, ignition hazard; only guarded qualified lab | https://www.standards.iteh.ai/catalog/standards/astm/edca61da-1505-4639-8db2-144d39c0388a/astm-e1476-04-2022 |
| P13 | Multi-frequency eddy-current amplitude and phase | Conductivity, permeability, coatings | A | low-medium | shape, lift-off, temperature, thickness | https://ietresearch.onlinelibrary.wiley.com/doi/10.1049/tje2.12346 |
| P14 | Hydrostatic density | Broad metal families, some alloys | A | low | bubbles, porosity, composite parts, immersed volume | elementary Archimedes principle |
| P15 | Four-wire resistance / current reversal | Known-geometry coupons | A | low | geometry, thermal EMF, temperature | https://www.standards.iteh.ai/catalog/standards/iec/c9224fc6-dbd8-442e-b490-9c70c7bf6547/sist-en-iec-62812-2019 (verify link) |
| P16 | Ultrasonic longitudinal/shear velocity ratio | Elastic properties independent of thickness if paths coincide | C | medium | anisotropy, coupling, timing, mode conversion | continuum elastic wave theory |
| P17 | Thermal diffusivity / pulse transit time | Broad families / thermal state | C | low-medium | geometry, emissivity, heat loss | heat diffusion equation |
| P18 | Thermal expansion | Broad families | C | low-medium | fixture expansion, temperature uniformity | continuum thermoelasticity |
| P19 | Rebound / indentation hardness | Known temper grade sets | B | low-medium | heat treatment and surface hardness; marks | ASTM E1476 context above |
| P20 | Open circuit potential / electrochemical polarization | Alloy-family / oxide behavior | C | low | surface, electrolyte, history; no universal composition mapping | P06 related research |
| P21 | Thermoelectric slope vs temperature | Extend P01 across temperatures | C | low | probe drift and correlated features | ASTM E977 related |
| P22 | Magnetic relaxation / remanence | Ferromagnetic states | C | low | geometry, prior magnetization, stress | P02/P10 related |
| P23 | Contact acoustic damping / Q | Same geometry and support, state differences | C | low | mounting and geometry dominate | ASTM E2001 https://store.astm.org/e2001-24.html |

## Pair-wise logic
For each grade pair, store observed separation, within-grade variation, systematic nuisance shifts, measurement cost/time, surface damage, applicability and provenance. Never invent numerical separation without measured data. A positive Mo spot is a Mo-bearing-family indicator, not unique grade confirmation. Unknown grades must remain eligible for rejection. Use conditional expected information gain (account for correlated sensors) per cost, not unconditional accuracy. Exact grades with overlapping specifications may be unidentifiable.

## First experiments proposed
- P01: temperature difference sweeps with reference probes, multiple coupons and repeated contact; estimate slope, offset, repeatability. Example: 1 microvolt/K difference gives 30 microvolts at 30 K; illustrative, not grade-specific data.
- P09: four-wire resistance at multiple stabilized temperatures on known coupons; estimate slope/R0 and systematic geometry drift; test incremental benefit beyond conductivity.
- P02/P10: paired measurements on steels of documented grade and heat treatment, including different stress states. Test whether grade remains separable after conditioning on hardness.
- P07/P01: shared temperature-control fixture for thermal transient and thermoelectric signal; thermal effusivity e=sqrt(k*rho*cp) is not simply thermal conductivity.
- P03/P04: only commercially documented kits with appropriate chemical handling and known-positive/negative standards; avoid DIY hazardous chemistry.

Current limitation: qualitative evidence mapping only. No verified per-grade measurement ranges for new features yet; prior v0.1 simulation does not test them. No patentability claim. Public repository: only public literature and generic hypotheses.
