function convertToMonthlyAmount(amount, frequency) {
  const value = Number(amount || 0);

  switch (frequency) {
    case "weekly":
      return value * 52 / 12;

    case "biweekly":
      return value * 26 / 12;

    case "monthly":
      return value;

    case "yearly":
      return value / 12;

    default:
      return value;
  }
}

export function calculateMonthlyIncome(income) {
  return income.reduce((total, item) => {
    return total + convertToMonthlyAmount(item.amount, item.frequency);
  }, 0);
}

export function calculateMonthlyExpenses(expenses) {
  return expenses.reduce((total, item) => {
    return total + convertToMonthlyAmount(item.amount, item.frequency);
  }, 0);
}

export function calculateRemainingIncome(income, expenses) {
  const monthlyIncome = calculateMonthlyIncome(income);
  const monthlyExpenses = calculateMonthlyExpenses(expenses);

  return monthlyIncome - monthlyExpenses;
}