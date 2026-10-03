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
  <section class="career-details-page">
    <div class="career-details-container">

      <!-- BACK TO HOME -->
      <RouterLink to="/careers" class="back-link">
        ← Back to Careers
      </RouterLink>

      <!-- LOADING -->
      <div v-if="loading" class="status-card">
        Loading career details...
      </div>

      <!-- ERROR -->
      <div v-else-if="error" class="status-card error-card">
        Error: {{ error }}
      </div>

      <!-- CAREER DETAILS -->
      <div v-else-if="career">

        <!-- CAREER HEADER -->
        <div class="career-header">
          <p class="section-label">CAREER EXPLORER</p>

          <h1>{{ career.title }}</h1>

          <div class="gold-divider"></div>

          <p class="soc-code">
            SOC Code: {{ career.soc_code }}
          </p>
        </div>

        <!-- KEY CAREER INFORMATION -->
        <div class="information-section">
          <h2>Career Information</h2>

          <div class="information-grid">

            <div class="information-card">
              <span class="information-label">Employment</span>
              <strong>
                {{ career.employment.toLocaleString() }}
              </strong>
            </div>

            <div class="information-card">
              <span class="information-label">Median Annual Wage</span>
              <strong>
                ${{ career.median_annual_wage.toLocaleString() }}
              </strong>
            </div>

            <div class="information-card">
              <span class="information-label">Mean Annual Wage</span>
              <strong>
                ${{ career.mean_annual_wage.toLocaleString() }}
              </strong>
            </div>

            <div class="information-card">
              <span class="information-label">Mean Hourly Wage</span>
              <strong>
                ${{ career.mean_hourly_wage.toFixed(2) }}
              </strong>
            </div>

          </div>
        </div>

        <!-- MONTHLY INCOME -->
        <div class="income-section">
          <div class="section-heading">
            <div>
              <p class="section-label">FINANCIAL BREAKDOWN</p>
              <h2>Monthly Income Breakdown</h2>
            </div>
          </div>

          <div v-if="incomeBreakdown" class="income-grid">

            <div class="income-card">
              <span>Gross Monthly Income</span>
              <strong>
                ${{ incomeBreakdown.monthlyGrossIncome.toFixed(2) }}
              </strong>
            </div>

            <div class="income-card deduction">
              <span>Federal Income Tax</span>
              <strong>
                ${{ incomeBreakdown.monthlyFederalTax.toFixed(2) }}
              </strong>
            </div>

            <div class="income-card deduction">
              <span>Social Security</span>
              <strong>
                ${{ incomeBreakdown.monthlySocialSecurityTax.toFixed(2) }}
              </strong>
            </div>

            <div class="income-card deduction">
              <span>Medicare</span>
              <strong>
                ${{ incomeBreakdown.monthlyMedicareTax.toFixed(2) }}
              </strong>
            </div>

            <div class="income-card deduction">
              <span>South Carolina Income Tax</span>
              <strong>
                ${{ incomeBreakdown.monthlySouthCarolinaTax.toFixed(2) }}
              </strong>
            </div>

            <div class="income-card">
              <span>Net After Taxes</span>
              <strong>
                ${{ incomeBreakdown.monthlyNetAfterTaxes.toFixed(2) }}
              </strong>
            </div>

            <div class="income-card">
              <span>Tithe</span>
              <strong>
                ${{ incomeBreakdown.monthlyTithe.toFixed(2) }}
              </strong>
            </div>

            <div class="income-card spendable">
              <span>Monthly Spendable Income</span>
              <strong>
                ${{ incomeBreakdown.monthlySpendableIncome.toFixed(2) }}
              </strong>
            </div>

          </div>

          <div v-else class="status-card">
            BLS annual wage data is not available for this career.
          </div>
        </div>

        <!-- WAGE DISTRIBUTION -->
        <div class="wage-section">
          <p class="section-label">BLS WAGE DATA</p>
          <h2>Wage Distribution</h2>

          <div class="wage-grid">

            <div class="wage-card">
              <span>10th Percentile</span>
              <strong>
                ${{ career.wage_10th_percentile.toLocaleString() }}
              </strong>
            </div>

            <div class="wage-card">
              <span>25th Percentile</span>
              <strong>
                ${{ career.wage_25th_percentile.toLocaleString() }}
              </strong>
            </div>

            <div class="wage-card">
              <span>Median</span>
              <strong>
                ${{ career.median_annual_wage.toLocaleString() }}
              </strong>
            </div>

            <div class="wage-card">
              <span>75th Percentile</span>
              <strong>
                ${{ career.wage_75th_percentile.toLocaleString() }}
              </strong>
            </div>

            <div class="wage-card">
              <span>90th Percentile</span>
              <strong>
                ${{ career.wage_90th_percentile.toLocaleString() }}
              </strong>
            </div>

          </div>
        </div>

        <!-- DATA SOURCE -->
        <div class="source-section">
          <p class="section-label">DATA SOURCE</p>

          <div class="source-card">
            <div>
              <span>Data Period</span>
              <strong>
                {{ career.data_period }} {{ career.data_year }}
              </strong>
            </div>

            <div>
              <span>Source</span>
              <strong>{{ career.source }}</strong>
            </div>

            <div>
              <span>SOC Code</span>
              <strong>{{ career.soc_code }}</strong>
            </div>
          </div>
        </div>

        <!-- RETURN HOME -->
        <div class="bottom-navigation">
          <RouterLink to="/careers" class="home-button">
            ← Return to Careers
          </RouterLink>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
.career-details-page {
  min-height: calc(100vh - 150px);
  background: #f5f7fa;
  padding: 2rem;
}

.career-details-container {
  width: min(1200px, 100%);
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 1.5rem;
  color: #123f73;
  font-size: 1rem;
  font-weight: 800;
  text-decoration: none;
}

.back-link:hover {
  color: #b88922;
  text-decoration: underline;
}

.career-header {
  padding: 3rem 2rem;
  background: #123f73;
  border-radius: 18px;
  color: #ffffff;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.section-label {
  margin: 0 0 0.5rem;
  color: #d6a84f;
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.career-header h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
}

.gold-divider {
  width: 120px;
  height: 7px;
  margin: 1.25rem auto;
  background: #d6a84f;
}

.soc-code {
  margin: 0;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
}

.information-section,
.income-section,
.wage-section,
.source-section {
  margin-top: 2rem;
}

.information-section h2,
.income-section h2,
.wage-section h2 {
  margin: 0 0 1.25rem;
  color: #123f73;
  font-size: 2rem;
  font-weight: 900;
}

.information-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.information-card,
.income-card,
.wage-card {
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 14px;
  border-top: 5px solid #d6a84f;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.information-card span,
.income-card span,
.wage-card span,
.source-card span {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  font-weight: 700;
}

.information-card strong,
.income-card strong,
.wage-card strong {
  display: block;
  color: #123f73;
  font-size: 1.5rem;
  font-weight: 900;
}

.income-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.income-card.deduction {
  border-top-color: #999;
}

.income-card.spendable {
  grid-column: span 2;
  background: #123f73;
  border-top-color: #d6a84f;
}

.income-card.spendable span,
.income-card.spendable strong {
  color: #ffffff;
}

.wage-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}

.wage-card {
  text-align: center;
}

.source-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.source-card strong {
  display: block;
  color: #123f73;
  font-size: 1.05rem;
}

.bottom-navigation {
  margin: 2.5rem 0;
  text-align: center;
}

.home-button {
  display: inline-block;
  padding: 1rem 2rem;
  border: 3px solid #b88922;
  border-radius: 12px;
  background: #d6a84f;
  color: #123f73;
  font-size: 1.1rem;
  font-weight: 900;
  text-decoration: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.home-button:hover {
  background: #e2b961;
  transform: translateY(-2px);
}

.status-card {
  padding: 3rem;
  background: #ffffff;
  border-radius: 16px;
  color: #123f73;
  text-align: center;
  font-size: 1.2rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.error-card {
  color: #b00020;
}

/* TABLET */
@media (max-width: 1000px) {
  .information-grid,
  .income-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .wage-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* PHONE */
@media (max-width: 650px) {
  .career-details-page {
    padding: 1rem;
  }

  .career-header {
    padding: 2rem 1rem;
  }

  .information-grid,
  .income-grid,
  .wage-grid,
  .source-card {
    grid-template-columns: 1fr;
  }

  .income-card.spendable {
    grid-column: span 1;
  }

  .information-card strong,
  .income-card strong,
  .wage-card strong {
    font-size: 1.3rem;
  }
}
</style>