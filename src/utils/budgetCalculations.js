export function calculateMonthlyIncome(income) {
  return income.reduce((total, item) => {
    return total + Number(item.amount || 0);
  }, 0);
}

export function calculateMonthlyExpenses(expenses) {
  return expenses.reduce((total, item) => {
    return total + Number(item.amount || 0);
  }, 0);
}

export function calculateRemainingIncome(income, expenses) {
  const monthlyIncome = calculateMonthlyIncome(income);
  const monthlyExpenses = calculateMonthlyExpenses(expenses);

  return monthlyIncome - monthlyExpenses;
}