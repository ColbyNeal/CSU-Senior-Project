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
        career.value.mean_annual_wage
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
  <div>
    <h2>Career Details</h2>

    <p>
      <RouterLink to="/">
        Back to Career Explorer
      </RouterLink>
    </p>

    <p v-if="loading">
      Loading career details...
    </p>

    <p v-else-if="error">
      Error: {{ error }}
    </p>

    <div v-else-if="career">
      <h3>{{ career.title }}</h3>

            <h4>Monthly Income Breakdown</h4>

      <div v-if="incomeBreakdown">
        <p>
          <strong>BLS Annual Salary:</strong>
          ${{ career.mean_annual_wage.toLocaleString() }}
        </p>

        <p>
          <strong>Monthly Gross Income:</strong>
          ${{incomeBreakdown.monthlyGrossIncome.toFixed(2) }}
        </p>

        <p>
          <strong>Federal Income Tax:</strong>
          ${{incomeBreakdown.monthlyFederalTax.toFixed(2) }}
        </p>

        <p>
          <strong>Social Security:</strong>
          ${{incomeBreakdown.monthlySocialSecurityTax.toFixed(2) }}
        </p>

        <p>
          <strong>Medicare:</strong>
          ${{incomeBreakdown.monthlyMedicareTax.toFixed(2) }}
        </p>

        <p>
          <strong>South Carolina Income Tax:</strong>
          ${{incomeBreakdown.monthlySouthCarolinaTax.toFixed(2) }}
        </p>

        <p>
          <strong>Net After Taxes:</strong>
          ${{incomeBreakdown.monthlyNetAfterTaxes.toFixed(2) }}
        </p>

        <p>
          <strong>Tithe:</strong>
          ${{incomeBreakdown.monthlyTithe.toFixed(2) }}
        </p>

        <p>
          <strong>Monthly Spendable Income:</strong>
          ${{incomeBreakdown.monthlySpendableIncome.toFixed(2) }}
        </p>
      </div>

      <p v-else>
        BLS annual wage data is not available for this career.
      </p>

      <p>
        <strong>SOC Code:</strong>
        {{ career.soc_code }}
      </p>

      <p>
        <strong>Employment:</strong>
        {{ career.employment.toLocaleString() }}
      </p>

      <p>
        <strong>Median Annual Wage:</strong>
        ${{ career.median_annual_wage.toLocaleString() }}
      </p>

      <p>
        <strong>Mean Annual Wage:</strong>
        ${{ career.mean_annual_wage.toLocaleString() }}
      </p>

      <p>
        <strong>Mean Hourly Wage:</strong>
        ${{ career.mean_hourly_wage.toFixed(2) }}
      </p>

      <p>
        <strong>10th Percentile:</strong>
        ${{ career.wage_10th_percentile.toLocaleString() }}
      </p>

      <p>
        <strong>25th Percentile:</strong>
        ${{ career.wage_25th_percentile.toLocaleString() }}
      </p>

      <p>
        <strong>75th Percentile:</strong>
        ${{ career.wage_75th_percentile.toLocaleString() }}
      </p>

      <p>
        <strong>90th Percentile:</strong>
        ${{ career.wage_90th_percentile.toLocaleString() }}
      </p>

      <p>
        <strong>Data:</strong>
        {{ career.data_period }} {{ career.data_year }}
      </p>

      <p>
        <strong>Source:</strong>
        {{ career.source }}
      </p>
    </div>
  </div>
</template>