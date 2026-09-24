import {
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateRemainingIncome,
} from "./budgetCalculations.js";

const income = [
  {
    id: 1,
    source: "Salary",
    amount: 4000,
    frequency: "monthly",
  },
  {
    id: 2,
    source: "Other Income",
    amount: 500,
    frequency: "monthly",
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
];

console.log("Monthly Income:", calculateMonthlyIncome(income));
console.log("Monthly Expenses:", calculateMonthlyExpenses(expenses));
console.log("Remaining Income:", calculateRemainingIncome(income, expenses));