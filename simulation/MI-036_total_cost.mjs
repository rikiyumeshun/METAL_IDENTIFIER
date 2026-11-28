import {writeFileSync} from 'node:fs';
const plans=[
  {
    "n": "A_modules_handwired",
    "fixed": 0,
    "parts": 9000,
    "mechanical": 2000,
    "shipping": 600,
    "assembly": 120,
    "calibration": 45,
    "reworkRate": 0.2,
    "reworkMin": 40,
    "yield": 0.95
  },
  {
    "n": "B_modules_connectorized",
    "fixed": 12000,
    "parts": 10000,
    "mechanical": 1800,
    "shipping": 600,
    "assembly": 45,
    "calibration": 20,
    "reworkRate": 0.08,
    "reworkMin": 25,
    "yield": 0.98
  },
  {
    "n": "C_outsourced_PCBA",
    "fixed": 65000,
    "parts": 6500,
    "mechanical": 1800,
    "shipping": 600,
    "assembly": 20,
    "calibration": 15,
    "reworkRate": 0.04,
    "reworkMin": 20,
    "yield": 0.99
  }
];
function study(plans){
const rows=[];for(const qty of [1,5,10,20,50,100])for(const wage of [1500,3000,5000])for(const p of plans){
const minutes=p.assembly+p.calibration+p.reworkRate*p.reworkMin;
const cash=p.parts+p.mechanical+p.shipping;
const labor=minutes*wage/60;
const unit=(cash+labor)/p.yield+p.fixed/qty;
rows.push([p.n,qty,wage,cash,minutes,unit,p.fixed/qty,(cash)/p.yield+p.fixed/qty]);
}return "architecture,good_units,labor_yen_per_hour,recurring_cash_per_attempt_yen,expected_minutes_per_attempt,economic_cost_per_good_unit_yen,fixed_cost_allocated_yen,cash_only_per_good_unit_yen\n"+rows.map(r=>r.join(",")).join("\n")+"\n";
}
const csv=study(plans);writeFileSync(new URL('MI-036_total_cost.csv',import.meta.url),csv);console.log(csv);
