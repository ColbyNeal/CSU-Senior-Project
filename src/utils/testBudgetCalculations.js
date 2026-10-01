import {
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateRemainingIncome,
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