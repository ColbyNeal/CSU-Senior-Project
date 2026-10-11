<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getCareerDetails } from "../utils/careerDetailsApi";
import { calculateMonthlyIncomeBreakdown } from "../utils/budgetCalculations";

const route = useRoute();

const career = ref(null);
const loading = ref(true);
const error = ref("");
const incomeBreakdown = ref(null);

const circumference = 2 * Math.PI * 78;

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value ?? 0);

const moneyChartSegments = computed(() => {
  if (!incomeBreakdown.value) return [];

  const b = incomeBreakdown.value;

  const segments = [
    {
      label: "Federal Income Tax",
      value: b.monthlyFederalTax,
      color: "#3977c3",
    },
    {
      label: "Social Security",
      value: b.monthlySocialSecurityTax,
      color: "#54b8c5",
    },
    {
      label: "Medicare",
      value: b.monthlyMedicareTax,
      color: "#8b78cf",
    },
    {
      label: "South Carolina Income Tax",
      value: b.monthlySouthCarolinaTax,
      color: "#e0a44b",
    },
    {
      label: "Tithe (10% of gross income)",
      value: b.monthlyTithe,
      color: "#d66b54",
    },
    {
      label: "Spendable Income",
      value: b.monthlySpendableIncome,
      color: "#2b9876",
    },
  ];

  let offset = 0;

  return segments.map((item) => {
    const length =
      (Math.max(0, item.value ?? 0) / b.monthlyGrossIncome) *
      circumference;

    const segment = { ...item, length, offset };
    offset += length;

    return segment;
  });
});

onMounted(async () => {
  try {
    career.value = await getCareerDetails(route.params.socCode);

    if (career.value?.mean_annual_wage) {
      incomeBreakdown.value = calculateMonthlyIncomeBreakdown(
        career.value.mean_annual_wage,
      );
    }
  } catch (err) {
    error.value = err.message || "Unable to load career details.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="career-details-page min-vh-100 py-4 py-md-5">
    <div class="container career-details-container">

      <!-- BACK TO CAREERS -->
      <RouterLink
        to="/careers"
        class="text-primary fw-bold text-decoration-none d-inline-block mb-4"
      >
        ← Back to Careers
      </RouterLink>

      <!-- LOADING -->
      <div
        v-if="loading"
        class="card border-0 shadow-sm text-center p-5"
      >
        <div
          class="spinner-border text-primary mx-auto"
          role="status"
        >
          <span class="visually-hidden">
            Loading career details...
          </span>
        </div>

        <p class="mt-3 mb-0 text-secondary">
          Loading career details...
        </p>
      </div>

      <!-- ERROR -->
      <div
        v-else-if="error"
        class="alert alert-danger"
        role="alert"
      >
        Error: {{ error }}
      </div>

      <!-- CAREER DETAILS -->
      <div v-else-if="career">

        <!-- CAREER HEADER -->
        <div
          class="text-center text-white rounded-4 shadow p-4 p-md-5 mb-4"
          style="background-color: #123f73;"
        >
          <p class="text-uppercase fw-bold mb-2" style="color: #d6a84f;">
            Career Explorer
          </p>

          <h1 class="display-5 fw-bold mb-3">
            {{ career.title }}
          </h1>

          <div
            class="mx-auto mb-3"
            style="width: 120px; height: 7px; background-color: #d6a84f;"
          ></div>

          <p class="mb-0">
            SOC Code: {{ career.soc_code }}
          </p>
        </div>

        <!-- CAREER INFORMATION -->
        <section class="mb-4">
          <h2 class="text-primary fw-bold mb-3">
            Career Information
          </h2>

          <div class="row g-3">

            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    People Employed
                  </span>

                  <strong class="d-block text-primary fs-4 mt-2">
                    {{ career.employment.toLocaleString() }}
                  </strong>

                  <p class="text-secondary small mb-0 mt-2">
                    Estimated total.
                  </p>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    Typical Yearly Pay
                  </span>

                  <strong class="d-block text-primary fs-4 mt-2">
                    ${{ career.median_annual_wage.toLocaleString() }}
                  </strong>

                  <p class="text-secondary small mb-0 mt-2">
                    Half of workers earn more, and half earn less.
                  </p>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    Average Yearly Pay
                  </span>

                  <strong class="d-block text-primary fs-4 mt-2">
                    ${{ career.mean_annual_wage.toLocaleString() }}
                  </strong>

                  <p class="text-secondary small mb-0 mt-2">
                    Average earnings per year across workers.
                  </p>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    Average Hourly Pay
                  </span>

                  <strong class="d-block text-primary fs-4 mt-2">
                    ${{ career.mean_hourly_wage.toFixed(2) }}
                  </strong>

                  <p class="text-secondary small mb-0 mt-2">
                    Average earnings for each hour worked.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        <!-- MONTHLY INCOME -->
        <section class="mb-4">
          <div class="mb-3">
            <p
              class="text-uppercase fw-bold mb-1"
              style="color: #d6a84f;"
            >
              YOUR MONTHLY MONEY
            </p>

            <h2 class="text-white fw-bold mb-2">
              Where Your Money Goes
            </h2>

            <p class="text-light mb-0">
              See how much you earn, what comes out for taxes, and how much money you have left.
            </p>
          </div>

          <!-- MONTHLY MONEY DONUT CHART -->
          <div class="card border-0 rounded-4 shadow-lg mb-4 p-4">
            <div class="row align-items-center g-4">
              <!-- DONUT CHART -->
              <div class="col-12 col-md-5 text-center">
                <svg
                  viewBox="0 0 220 220"
                  class="money-donut"
                  role="img"
                  aria-label="Monthly income breakdown chart"
                >
                  <circle
                    cx="110"
                    cy="110"
                    r="78"
                    fill="none"
                    stroke="#e9ecef"
                    stroke-width="28"
                  />
                  <circle
                    v-for="(item, index) in moneyChartSegments"
                    :key="item.label"
                    cx="110"
                    cy="110"
                    r="78"
                    fill="none"
                    :stroke="item.color"
                    stroke-width="28"
                    :stroke-dasharray="`${item.length} ${circumference - item.length}`"
                    :stroke-dashoffset="-item.offset"
                    transform="rotate(-90 110 110)"
                  />
                  <text
                    x="110"
                    y="103"
                    text-anchor="middle"
                    font-size="13"
                    fill="#64748b"
                  >
                    Monthly income
                  </text>
                  <text
                    x="110"
                    y="127"
                    text-anchor="middle"
                    font-size="19"
                    font-weight="700"
                    fill="#12345a"
                  >
                    {{ formatMoney(incomeBreakdown?.monthlyGrossIncome ?? 0) }}
                  </text>
                </svg>
              </div>

              <!-- CHART LEGEND -->
              <div class="col-12 col-md-7">
                <h3 class="h5 fw-bold mb-3" style="color: #12345a;">
                  Your money at a glance
                </h3>

                <div
                  v-for="item in moneyChartSegments"
                  :key="item.label"
                  class="d-flex align-items-center justify-content-between gap-3 py-2 border-bottom"
                >
                  <div class="d-flex align-items-center gap-2">
                    <span
                      class="money-chart-dot"
                      :style="{ backgroundColor: item.color }"
                    ></span>
                    <span class="text-dark">{{ item.label }}</span>
                  </div>

                  <strong class="text-nowrap" style="color: #12345a;">
                    {{ formatMoney(item.value) }}
                  </strong>
                </div>

                <p class="small text-secondary mt-3 mb-0">
                  This chart shows how your estimated monthly gross income is
                  divided between taxes, tithe, and money remaining after them.
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="incomeBreakdown"
            class="row g-3 align-items-stretch money-breakdown-grid"
          >

            <!-- GROSS -->
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="income-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor"
                        stroke-width="1.8" stroke-linecap="round"
                        stroke-linejoin="round" aria-hidden="true">
                        <ellipse cx="8" cy="6" rx="5" ry="2.5" />
                        <path d="M3 6v4c0 1.4 2.2 2.5 5 2.5" />
                        <path d="M13 6v2" />
                        <ellipse cx="16" cy="14" rx="5" ry="2.5" />
                        <path d="M11 14v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4" />
                        <path d="M11 18c0 1.4 2.2 2.5 5 2.5" />
                        <path d="M3 10v4c0 1.4 2.2 2.5 5 2.5 1 0 1.9-.2 2.7-.5" />
                      </svg>
                    </div>
                    <span class="text-secondary small fw-bold">
                      Gross Monthly Income
                    </span>
                  </div>

                  <strong class="d-block text-primary fs-4 mt-2">
                    ${{ Number(incomeBreakdown.monthlyGrossIncome).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>
                </div>
              </div>
            </div>

            <!-- FEDERAL TAX -->
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="income-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor"
                        stroke-width="1.8" stroke-linecap="round"
                        stroke-linejoin="round" aria-hidden="true">
                        <path d="M3 10h18L12 4 3 10Z" />
                        <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
                        <path d="M3 21h18M4 18h16" />
                      </svg>
                    </div>
                    <span class="text-secondary small fw-bold">Federal Income Tax</span>
                  </div>

                  <strong class="d-block text-danger fs-4 mt-2">
                    -${{ Number(incomeBreakdown.monthlyFederalTax).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>

                  <p class="text-secondary small mb-0 mt-2">
                    Money paid to the federal government to help fund public srvices.
                  </p>
                </div>
              </div>
            </div>

            <!-- SOCIAL SECURITY -->
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="income-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24"
                        aria-hidden="true">
                        <path
                          d="M12 2 20 5v6c0 5.2-3.4 9.1-8 11-4.6-1.9-8-5.8-8-11V5l8-3Z"
                          fill="#123f73"
                        />
                        <path
                          d="M12 7v10M7 12h10"
                          fill="none"
                          stroke="#ffffff"
                          stroke-width="2.2"
                          stroke-linecap="round"
                        />
                      </svg>
                    </div>
                    <span class="text-secondary small fw-bold">Social Security Tax</span>
                  </div>

                  <strong class="d-block text-danger fs-4 mt-2">
                    -${{ Number(incomeBreakdown.monthlySocialSecurityTax).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>

                  <p class="text-secondary small mb-0 mt-2">
                    Helps fund retirement, survivor, and disability benefits.
                  </p>
                </div>
              </div>
            </div>

            <!-- MEDICARE -->
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="income-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24"
                        aria-hidden="true">
                        <path
                        d="M8 1h8v7h7v8h-7v7H8v-7H1V8h7V1Z"
                        fill="#123f73"
                      />
                        <path
                        d="M12 8v8M8 12h8"
                        fill="none"
                        stroke="#ffffff"
                        stroke-width="3"
                        stroke-linecap="square"
                      />
                      </svg>
                    </div>
                    <span class="text-secondary small fw-bold">Medicare Tax</span>
                  </div>

                  <strong class="d-block text-danger fs-4 mt-2">
                    -${{ Number(incomeBreakdown.monthlyMedicareTax).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>

                  <p class="text-secondary small mb-0 mt-2">
                    Helps fund health insurance for eligible people.
                  </p>
                </div>
              </div>
            </div>

            <!-- SOUTH CAROLINA -->
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    South Carolina Income Tax
                  </span>

                  <strong class="d-block text-danger fs-4 mt-2">
                    -${{ Number(incomeBreakdown.monthlySouthCarolinaTax).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>

                  <p class="text-secondary small mb-0 mt-2">
                    State tax on income, based on applicable tax rules.
                  </p>
                </div>
              </div>
            </div>

            <!-- NET -->
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="income-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24"
                        aria-hidden="true">
                        <rect x="5" y="2" width="14" height="20" rx="2"
                          fill="#123f73" />
                        <rect x="8" y="5" width="8" height="5" rx="0.5"
                          fill="#ffffff" />
                        <g fill="#ffffff">
                          <circle cx="8.5" cy="13.5" r="1" />
                          <circle cx="12" cy="13.5" r="1" />
                          <circle cx="15.5" cy="13.5" r="1" />
                          <circle cx="8.5" cy="17.5" r="1" />
                          <circle cx="12" cy="17.5" r="1" />
                          <circle cx="15.5" cy="17.5" r="1" />
                        </g>
                      </svg>
                    </div>
                    <span class="text-secondary small fw-bold">Net After Taxes</span>
                  </div>

                  <strong class="d-block text-primary fs-4 mt-2">
                    ${{ Number(incomeBreakdown.monthlyNetAfterTaxes).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>

                  <p class="text-secondary small mb-0 mt-2">
                    Your estimated money left after taxes,
                    before your tithe and living expenses.
                  </p>
                </div>
              </div>
            </div>

            <!-- TITHE -->
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="income-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24"
                        aria-hidden="true">
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
                          fill="#123f73"
                        />
                      </svg>
                    </div>
                    <span class="text-secondary small fw-bold">Tithe (10% of Gross Income)</span>
                  </div>

                  <strong class="d-block text-danger fs-4 mt-2">
                    -${{ Number(incomeBreakdown.monthlyTithe).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>

                  <p class="text-secondary small mb-0 mt-2">
                    The amount set aside for giving, based on a 10% rate.
                  </p>
                </div>
              </div>
            </div>

            <!-- SPENDABLE -->
            <div class="col-12 col-sm-6 col-lg-3">
              <div
                class="card spendable-income-card border-0 shadow-sm h-100 text-white"
              >
                <div class="card-body">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="income-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24"
                        aria-hidden="true">
                        <path
                          d="M3 6.5A2.5 2.5 0 0 1 5.5 4H19a2 2 0 0 1 2 2v1H6a3 3 0 0 0-3 3v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2h-6a3 3 0 0 1 0-6h6V8H6a3 3 0 0 0-3 3Z"
                          fill="#123f73"
                        />
                        <path
                          d="M15 11h6v5h-6a2.5 2.5 0 0 1 0-5Z"
                          fill="#123f73"
                        />
                        <circle cx="16" cy="13.5" r="0.8" fill="#ffffff" />
                      </svg>
                    </div>
                    <span class="text-secondary small fw-bold">Monthly Spendable Income</span>
                  </div>

                  <strong class="d-block fs-2 mt-2">
                    ${{ Number(incomeBreakdown.monthlySpendableIncome).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>

                  <p class="small mt-2 mb-0">
                    Your estimated money left after taxes and tithe, before paying your living expenses.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div
            v-else
            class="alert alert-secondary"
          >
            BLS annual wage data is not available for this career.
          </div>
        </section>

        <!-- WAGE DISTRIBUTION -->
        <section class="mb-4">
          <p
            class="text-uppercase fw-bold mb-1"
            style="color: #d6a84f;"
          >
            BLS WAGE DATA
          </p>

          <h2 class="text-white fw-bold mb-2">
            Wage Distribution
          </h2>

          <p class="text-light mb-3">
            See how yearly pay differs across workers in this career.
          </p>

          <div class="card border-0 rounded-4 shadow-lg p-4">
            <div
              v-for="item in [
                { label: '10th Percentile', value: career.wage_10th_percentile },
                { label: '25th Percentile', value: career.wage_25th_percentile },
                { label: 'Median Pay', value: career.median_annual_wage },
                { label: '75th Percentile', value: career.wage_75th_percentile },
                { label: '90th Percentile', value: career.wage_90th_percentile },
              ]"
              :key="item.label"
              class="mb-4"
            >
              <div class="d-flex justify-content-between align-items-center gap-3 mb-2">
                <span class="fw-semibold text-dark">
                  {{ item.label }}
                </span>

                <strong class="text-nowrap" style="color: #123f73;">
                  {{ formatMoney(item.value).replace('.00', '') }}
                </strong>
              </div>

              <div
                class="progress"
                style="height: 14px; background-color: #e9eef5;"
                role="progressbar"
                :aria-label="item.label"
                aria-valuemin="0"
                :aria-valuemax="career.wage_90th_percentile"
                :aria-valuenow="item.value"
              >
                <div
                  class="progress-bar"
                  :style="{
                    width: `${Math.max(0, Number(item.value || 0)) / Math.max(1, Number(career.wage_90th_percentile || 1)) * 100}%`,
                    backgroundColor: '#3977c3'
                  }"
                ></div>
              </div>
            </div>

            <p class="small text-secondary mb-0">
              The median is the midpoint: half of workers earn more and half earn less.
              Percentiles show how pay varies across workers in this occupation.
            </p>
          </div>
        </section>

        <!-- WHAT THIS MEANS -->
        <section class="mb-4">
          <p
            class="text-uppercase fw-bold mb-1"
            style="color: #d6a84f;"
          >
            UNDERSTANDING YOUR PAY
          </p>

          <h2 class="text-white fw-bold mb-3">
            What This Means
          </h2>

          <div class="card border-0 rounded-4 shadow-lg p-4">
            <div class="row g-4">
              <div class="col-12 col-md-6">
                <h3 class="h5 fw-bold" style="color: #123f73;">
                  <span class="me-2">💵</span> Your Gross Income
                </h3>
                <p class="text-secondary mb-0">
                  This is your estimated pay before taxes or other deductions.
                  Your monthly estimate is based on the average yearly pay for this career.
                </p>
              </div>

              <div class="col-12 col-md-6">
                <h3 class="h5 fw-bold" style="color: #123f73;">
                  <span class="me-2">🏛️</span> Taxes
                </h3>
                <p class="text-secondary mb-0">
                  Federal, Social Security, Medicare, and South Carolina taxes
                  reduce the amount of your paycheck available to spend.
                </p>
              </div>

              <div class="col-12 col-md-6">
                <h3 class="h5 fw-bold" style="color: #123f73;">
                  <span class="me-2">❤️</span> Your Tithe
                </h3>
                <p class="text-secondary mb-0">
                  The estimate sets aside 10% of gross income for giving.
                  This is a personal choice, not a government tax.
                </p>
              </div>

              <div class="col-12 col-md-6">
                <h3 class="h5 fw-bold" style="color: #123f73;">
                  <span class="me-2">🏠</span> Spendable Income
                </h3>
                <p class="text-secondary mb-0">
                  This is what remains after the estimated taxes and tithe.
                  It is the amount available for housing, food, transportation,
                  savings, and other expenses.
                </p>
              </div>
            </div>

            <hr class="my-4" />

            <p class="small text-secondary mb-0">
              <strong>Remember:</strong> These are estimates, not a guarantee of
              take-home pay. Actual taxes depend on your individual circumstances,
              and this estimate does not include benefits, insurance, retirement
              contributions, or other paycheck deductions.
            </p>
          </div>
        </section>
        <!-- DATA SOURCE -->
        <section class="mb-4">
          <p
            class="text-uppercase fw-bold mb-1"
            style="color: #b88922;"
          >
            Data Source
          </p>

          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="row g-3">

                <div class="col-12 col-md-4">
                  <span class="text-secondary small fw-bold d-block">
                    Data Period
                  </span>

                  <strong class="text-primary">
                    {{ career.data_period }} {{ career.data_year }}
                  </strong>
                </div>

                <div class="col-12 col-md-4">
                  <span class="text-secondary small fw-bold d-block">
                    Source
                  </span>

                  <strong class="text-primary">
                    {{ career.source }}
                  </strong>
                </div>

                <div class="col-12 col-md-4">
                  <span class="text-secondary small fw-bold d-block">
                    SOC Code
                  </span>

                  <strong class="text-primary">
                    {{ career.soc_code }}
                  </strong>
                </div>

              </div>
            </div>
          </div>
        </section>

        <!-- RETURN TO CAREERS -->
        <div class="text-center py-3">
          <RouterLink
            to="/careers"
            class="btn btn-warning btn-lg fw-bold px-4"
          >
            ← Return to Careers
          </RouterLink>
        </div>

      </div>
    </div>
  </section>
</template>


<style scoped>
.money-donut {
  width: 100%;
  max-width: 280px;
  height: auto;
  overflow: visible;
}

.money-chart-dot {
  display: inline-block;
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.career-details-container {
  max-width: 1180px;
}

.career-details-page {
  padding-bottom: 4rem;
}

.career-details-page h2 {
  letter-spacing: -0.02em;
}

.career-details-page .card {
  border-radius: 1rem;
}

.career-details-page .shadow-lg {
  box-shadow: 0 12px 30px rgba(5, 25, 50, 0.16) !important;
}

.career-details-page .border-top {
  border-top-color: #d6a84f !important;
}

.spendable-income-card {
  background: linear-gradient(135deg, #f5c75e, #e8a927);
  border-radius: 1rem;
  min-height: 145px;
}

.spendable-income-card .card-body {
  padding: 1.25rem;
}

.spendable-income-card strong,
.spendable-income-card span, 
.spendable-income-card p {
  color: #12345a;
}

.money-breakdown-grid > div {
  display: flex;
}

.money-breakdown-grid .card {
  width: 100%;
  min-height: 145px;
}

.money-breakdown-grid .card-body {
  padding: 1.25rem;
}

.income-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  color: #123f73;
  background-color: #edf3fa;
}
</style>