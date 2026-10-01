import {
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateRemainingIncome,
  calculateMonthlyIncomeBreakdown,
} from "./budgetCalculations.js";

const income = [
  {
    id: 1,
    source: "Monthly Salary",
    amount: 4000,
    frequency: "monthly",
  },
  {
    id: 2,
    source: "Weekly Income",
    amount: 500,
    frequency: "weekly",
  },
  {
    id: 3,
    source: "Yearly Income",
    amount: 12000,
    frequency: "yearly",
  },
];

const expenses = [
  {
    id: 1,
    name: "Housing",
    category: "Housing",
    amount: 1500,
    frequency: "monthly",
  },
  {
    id: 2,
    name: "Utilities",
    category: "Utilities",
    amount: 500,
    frequency: "monthly",
  },
  {
    id: 3,
    name: "Insurance",
    category: "Insurance",
    amount: 1200,
    frequency: "yearly",
  },
];

const monthlyIncome = calculateMonthlyIncome(income);
const monthlyExpenses = calculateMonthlyExpenses(expenses);
const remainingIncome = calculateRemainingIncome(income, expenses);

console.log("Monthly Income:", monthlyIncome.toFixed(2));
console.log("Monthly Expenses:", monthlyExpenses.toFixed(2));
console.log("Remaining Income:", remainingIncome.toFixed(2));

const testSalary = 60000;

const incomeBreakdown = calculateMonthlyIncomeBreakdown(testSalary);

console.log("\n--- Income Breakdown Test ---");
console.log(
  "Annual Gross Income:",
  incomeBreakdown.monthlyGrossIncome * 12
);
console.log(
  "Monthly Gross Income:",
  incomeBreakdown.monthlyGrossIncome.toFixed(2)
);
console.log(
  "Federal Tax:",
  incomeBreakdown.monthlyFederalTax.toFixed(2)
);
console.log(
  "Social Security:",
  incomeBreakdown.monthlySocialSecurityTax.toFixed(2)
);
console.log(
  "Medicare:",
  incomeBreakdown.monthlyMedicareTax.toFixed(2)
);
console.log(
  "South Carolina Tax:",
  incomeBreakdown.monthlySouthCarolinaTax.toFixed(2)
);
console.log(
  "Total Taxes:",
  incomeBreakdown.monthlyTotalTaxes.toFixed(2)
);
console.log(
  "Net After Taxes:",
  incomeBreakdown.monthlyNetAfterTaxes.toFixed(2)
);
console.log(
  "Tithe:",
  incomeBreakdown.monthlyTithe.toFixed(2)
);
console.log(
  "Monthly Spendable Income:",
  incomeBreakdown.monthlySpendableIncome.toFixed(2)
);