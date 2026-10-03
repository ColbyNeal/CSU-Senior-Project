function convertToMonthlyAmount(amount, frequency) {
  const value = Number(amount || 0);

  switch (frequency) {
    case "weekly":
      return (value * 52) / 12;

    case "biweekly":
      return (value * 26) / 12;

    case "monthly":
      return value;

    case "yearly":
      return value / 12;

    default:
      return value;
  }
}

/*
 * Converts an annual salary into monthly gross income.
 */
export function calculateMonthlyGrossIncome(annualSalary) {
  const salary = Number(annualSalary || 0);

  return salary / 12;
}

/*
 * 2026 Social Security:
 * 6.2% of wages up to the annual wage base.
 */
export function calculateSocialSecurityTax(annualSalary) {
  const salary = Math.max(Number(annualSalary || 0), 0);
  const socialSecurityWageBase = 184500;

  return Math.min(salary, socialSecurityWageBase) * 0.062;
}

/*
 * 2026 Medicare:
 * 1.45% of wages.
 */
export function calculateMedicareTax(annualSalary) {
  const salary = Math.max(Number(annualSalary || 0), 0);

  return salary * 0.0145;
}

/*
 * 2026 federal income tax for a single filer.
 * Uses the standard deduction and progressive tax brackets.
 */
export function calculateFederalIncomeTax(annualSalary) {
  const salary = Math.max(Number(annualSalary || 0), 0);

  const standardDeduction = 16100;
  const taxableIncome = Math.max(salary - standardDeduction, 0);

  const brackets = [
    { limit: 12400, rate: 0.10 },
    { limit: 50400, rate: 0.12 },
    { limit: 105700, rate: 0.22 },
    { limit: 201775, rate: 0.24 },
    { limit: 256225, rate: 0.32 },
    { limit: 640600, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ];

  let tax = 0;
  let previousLimit = 0;

  for (const bracket of brackets) {
    const taxableAtThisRate = Math.min(
      Math.max(taxableIncome - previousLimit, 0),
      bracket.limit - previousLimit,
    );

    tax += taxableAtThisRate * bracket.rate;

    if (taxableIncome <= bracket.limit) {
      break;
    }

    previousLimit = bracket.limit;
  }

  return tax;
}

/*
 * South Carolina income tax.
 * Uses the 2026 individual income tax structure.
 */
export function calculateSouthCarolinaTax(annualSalary) {
  const salary = Math.max(Number(annualSalary || 0), 0);

  if (salary <= 30000) {
    return salary * 0.0199;
  }

  return Math.max((salary * 0.0521) - 966, 0);
}

/*
 * Christian college game rule:
 * Tithe is 10% of gross income.
 */
export function calculateTithe(annualSalary) {
  const salary = Math.max(Number(annualSalary || 0), 0);

  return salary * 0.10;
}

/*
 * Calculates the complete annual income breakdown.
 */
export function calculateAnnualIncomeBreakdown(annualSalary) {
  const salary = Math.max(Number(annualSalary || 0), 0);

  const federalTax = calculateFederalIncomeTax(salary);

  const socialSecurityTax = calculateSocialSecurityTax(salary);

  const medicareTax = calculateMedicareTax(salary);

  const southCarolinaTax = calculateSouthCarolinaTax(salary);

  const totalTaxes =
    federalTax +
    socialSecurityTax +
    medicareTax +
    southCarolinaTax;

  const netAfterTaxes = salary - totalTaxes;

  // Tithe is calculated from net income after taxes.
  const tithe = calculateTithe(netAfterTaxes);

  const spendableIncome = netAfterTaxes - tithe;

  return {
    annualGrossIncome: salary,
    annualFederalTax: federalTax,
    annualSocialSecurityTax: socialSecurityTax,
    annualMedicareTax: medicareTax,
    annualSouthCarolinaTax: southCarolinaTax,
    annualTotalTaxes: totalTaxes,
    annualNetAfterTaxes: netAfterTaxes,
    annualTithe: tithe,
    annualSpendableIncome: spendableIncome,
  };
}

/*
 * Converts the annual income breakdown into monthly values.
 */
export function calculateMonthlyIncomeBreakdown(annualSalary) {
  const annual = calculateAnnualIncomeBreakdown(annualSalary);

  const monthlyGrossIncome = annual.annualGrossIncome / 12;
  const monthlyFederalTax = annual.annualFederalTax / 12;
  const monthlySocialSecurityTax =
    annual.annualSocialSecurityTax / 12;
  const monthlyMedicareTax = annual.annualMedicareTax / 12;
  const monthlySouthCarolinaTax =
    annual.annualSouthCarolinaTax / 12;
  const monthlyTotalTaxes = annual.annualTotalTaxes / 12;
  const monthlyNetAfterTaxes = annual.annualNetAfterTaxes / 12;

  const monthlyTithe = monthlyNetAfterTaxes * 0.10;
  const monthlySpendableIncome =
    monthlyNetAfterTaxes - monthlyTithe;

  return {
    monthlyGrossIncome,
    monthlyFederalTax,
    monthlySocialSecurityTax,
    monthlyMedicareTax,
    monthlySouthCarolinaTax,
    monthlyTotalTaxes,
    monthlyNetAfterTaxes,
    monthlyTithe,
    monthlySpendableIncome,
  };
}

/*
 * Existing budget calculation functions.
 */
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