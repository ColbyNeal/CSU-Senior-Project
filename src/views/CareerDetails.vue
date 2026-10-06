<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getCareerDetails } from "../utils/careerDetailsApi";
import { calculateMonthlyIncomeBreakdown } from "../utils/budgetCalculations";

const route = useRoute();

const career = ref(null);
const loading = ref(true);
const error = ref("");
const incomeBreakdown = ref(null);

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
  <section class="bg-light min-vh-100 py-4 py-md-5">
    <div class="container">

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
                    Employment
                  </span>

                  <strong class="d-block text-primary fs-4 mt-2">
                    {{ career.employment.toLocaleString() }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    Median Annual Wage
                  </span>

                  <strong class="d-block text-primary fs-4 mt-2">
                    ${{ career.median_annual_wage.toLocaleString() }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    Mean Annual Wage
                  </span>

                  <strong class="d-block text-primary fs-4 mt-2">
                    ${{ career.mean_annual_wage.toLocaleString() }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    Mean Hourly Wage
                  </span>

                  <strong class="d-block text-primary fs-4 mt-2">
                    ${{ career.mean_hourly_wage.toFixed(2) }}
                  </strong>
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
              style="color: #b88922;"
            >
              Financial Breakdown
            </p>

            <h2 class="text-primary fw-bold mb-0">
              Monthly Income Breakdown
            </h2>
          </div>

          <div
            v-if="incomeBreakdown"
            class="row g-3"
          >

            <!-- GROSS -->
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    Gross Monthly Income
                  </span>

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
                  <span class="text-secondary small fw-bold">
                    Federal Income Tax
                  </span>

                  <strong class="d-block text-primary fs-4 mt-2">
                    -${{ Number(incomeBreakdown.monthlyFederalTax).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>
                </div>
              </div>
            </div>

            <!-- SOCIAL SECURITY -->
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    Social Security
                  </span>

                  <strong class="d-block text-primary fs-4 mt-2">
                    -${{ Number(incomeBreakdown.monthlySocialSecurityTax).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>
                </div>
              </div>
            </div>

            <!-- MEDICARE -->
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    Medicare
                  </span>

                  <strong class="d-block text-primary fs-4 mt-2">
                    -${{ Number(incomeBreakdown.monthlyMedicareTax).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>
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

                  <strong class="d-block text-primary fs-4 mt-2">
                    -${{ Number(incomeBreakdown.monthlySouthCarolinaTax).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>
                </div>
              </div>
            </div>

            <!-- NET -->
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    Net After Taxes
                  </span>

                  <strong class="d-block text-primary fs-4 mt-2">
                    ${{ Number(incomeBreakdown.monthlyNetAfterTaxes).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>
                </div>
              </div>
            </div>

            <!-- TITHE -->
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card border-0 border-top border-5 shadow-sm h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    Tithe
                  </span>

                  <strong class="d-block text-primary fs-4 mt-2">
                    -${{ Number(incomeBreakdown.monthlyTithe).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>
                </div>
              </div>
            </div>

            <!-- SPENDABLE -->
            <div class="col-12 col-lg-6">
              <div
                class="card border-0 shadow-sm h-100 text-white"
                style="background-color: #123f73;"
              >
                <div class="card-body">
                  <span class="small fw-bold">
                    Monthly Spendable Income
                  </span>

                  <strong class="d-block fs-2 mt-2">
                    ${{ Number(incomeBreakdown.monthlySpendableIncome).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) }}
                  </strong>
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
            style="color: #b88922;"
          >
            BLS Wage Data
          </p>

          <h2 class="text-primary fw-bold mb-3">
            Wage Distribution
          </h2>

          <div class="row g-3">

            <div class="col-12 col-sm-6 col-lg">
              <div class="card border-0 shadow-sm text-center h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    10th Percentile
                  </span>

                  <strong class="d-block text-primary fs-5 mt-2">
                    ${{ career.wage_10th_percentile.toLocaleString() }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg">
              <div class="card border-0 shadow-sm text-center h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    25th Percentile
                  </span>

                  <strong class="d-block text-primary fs-5 mt-2">
                    ${{ career.wage_25th_percentile.toLocaleString() }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg">
              <div class="card border-0 shadow-sm text-center h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    Median
                  </span>

                  <strong class="d-block text-primary fs-5 mt-2">
                    ${{ career.median_annual_wage.toLocaleString() }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg">
              <div class="card border-0 shadow-sm text-center h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    75th Percentile
                  </span>

                  <strong class="d-block text-primary fs-5 mt-2">
                    ${{ career.wage_75th_percentile.toLocaleString() }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg">
              <div class="card border-0 shadow-sm text-center h-100">
                <div class="card-body">
                  <span class="text-secondary small fw-bold">
                    90th Percentile
                  </span>

                  <strong class="d-block text-primary fs-5 mt-2">
                    ${{ career.wage_90th_percentile.toLocaleString() }}
                  </strong>
                </div>
              </div>
            </div>

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