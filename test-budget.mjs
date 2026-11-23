
import assert from "node:assert/strict";

import {
  calculateMonthlyGrossIncome,
  calculateFederalIncomeTax,
  calculateSocialSecurityTax,
  calculateMedicareTax,
  calculateSouthCarolinaTax,
  calculateMonthlyIncomeBreakdown,
} from "./src/utils/budgetCalculations.js";

const results = [];

function runTest(id, description, test) {
  try {
    test();
    results.push({ id, description, status: "PASS" });
    console.log(`PASS ${id}: ${description}`);
  } catch (error) {
    results.push({ id, description, status: "FAIL" });
    console.error(`FAIL ${id}: ${description}`);
    console.error(`     ${error.message}`);
  }
}

function assertClose(actual, expected, tolerance = 0.01) {
  assert.ok(
    Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `Expected ${expected}, received ${actual}`
  );
}

const salary = 60000;

// UT-01: Monthly gross income conversion
runTest("UT-01", "Monthly gross income conversion", () => {
  assertClose(calculateMonthlyGrossIncome(salary), 5000);
});

// UT-02: Federal income tax calculation
runTest("UT-02", "Federal income tax calculation", () => {
  // Taxable income: $60,000 - $16,100 = $43,900
  // Tax: ($12,400 x 10%) + ($31,500 x 12%) = $5,020
  assertClose(calculateFederalIncomeTax(salary), 5020);
});

// UT-03: Social Security and Medicare calculations
runTest("UT-03", "Social Security and Medicare calculations", () => {
  assertClose(calculateSocialSecurityTax(salary), 3720);
  assertClose(calculateMedicareTax(salary), 870);
});

// UT-04: South Carolina income tax calculation
runTest("UT-04", "South Carolina income tax calculation", () => {
  // $60,000 x 5.21% - $966 = $2,160
  assertClose(calculateSouthCarolinaTax(salary), 2160);
});

// UT-05: Total taxes and net income
runTest("UT-05", "Total taxes and net income", () => {
  const result = calculateMonthlyIncomeBreakdown(salary);

  const expectedAnnualTaxes = 5020 + 3720 + 870 + 2160;
  const expectedAnnualNetIncome = salary - expectedAnnualTaxes;

  assertClose(result.monthlyTotalTaxes, expectedAnnualTaxes / 12);
  assertClose(result.monthlyNetAfterTaxes, expectedAnnualNetIncome / 12);
});

// UT-06: Tithe and spendable income
runTest("UT-06", "Tithe and spendable income", () => {
  const result = calculateMonthlyIncomeBreakdown(salary);

  const expectedMonthlyTithe = 500;
  const expectedSpendableIncome =
    result.monthlyNetAfterTaxes - expectedMonthlyTithe;

  assertClose(result.monthlyTithe, expectedMonthlyTithe);
  assertClose(result.monthlySpendableIncome, expectedSpendableIncome);
});

// UT-07: Invalid and unavailable salary handling
runTest("UT-07", "Invalid and unavailable salary handling", () => {
  const invalidInputs = [undefined, null, 0, -1000, "not a number"];

  for (const input of invalidInputs) {
    const result = calculateMonthlyIncomeBreakdown(input);

    assert.ok(
      Object.values(result).every(
        value => Number.isFinite(value) && value === 0
      ),
      `Invalid input ${String(input)} did not produce safe zero values`
    );
  }
});

// UT-08: Annual salary input contract
runTest("UT-08", "Annual salary is converted to monthly income once", () => {
  const annualSalary = 94750;
  const result = calculateMonthlyIncomeBreakdown(annualSalary);

  assertClose(result.monthlyGrossIncome, annualSalary / 12);
  assertClose(result.monthlyGrossIncome, 7895.833333333333);
});

// Final test summary
const passed = results.filter(result => result.status === "PASS").length;
const failed = results.filter(result => result.status === "FAIL").length;

console.log("\n========== UNIT TEST SUMMARY ==========");
console.log(`Total Tests: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log("=======================================");

if (failed > 0) {
  process.exitCode = 1;
}

