
import { calculateMonthlyIncomeBreakdown } from "./src/utils/budgetCalculations.js";

const result = calculateMonthlyIncomeBreakdown(94750);

console.log("Monthly income breakdown:");
console.log(JSON.stringify(result, null, 2));
