<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  career: {
    type: Object,
    required: true,
  },
  incomeBreakdown: {
    type: Object,
    required: true,
  },
})

const stage = ref(1)
const savings = ref(0)
const eventHistory = ref([])
const message = ref('Welcome! Make your first financial decision.')
const finished = ref(false)

// Read the calculated spendable income from the existing utility.
// Adjust this field mapping to match budgetCalculations.js.
const monthlyIncome = computed(() => {
  return Number(
    props.incomeBreakdown.monthlySpendableIncome ?? 0
  )
})

const initialExpenses = [
  { id: 'housing', name: 'Housing', amount: 1200, category: 'Needs' },
  { id: 'food', name: 'Food', amount: 350, category: 'Needs' },
  { id: 'utilities', name: 'Utilities', amount: 160, category: 'Needs' },
  { id: 'transport', name: 'Transportation', amount: 250, category: 'Needs' },
  { id: 'fun', name: 'Entertainment', amount: 100, category: 'Wants' },
]

const expenses = ref(initialExpenses.map(item => ({ ...item })))

const totalExpenses = computed(() =>
  expenses.value.reduce((total, item) => total + item.amount, 0),
)

const remaining = computed(() =>
  monthlyIncome.value - totalExpenses.value - savings.value,
)

const money = value =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)

const stages = [
  'First Paycheck',
  'Housing & Essentials',
  'Unexpected Events',
  'Savings Goals',
  'End-of-Month Review',
]

const lifeEvents = [
  {
    title: 'Car Repair',
    description: 'Your car needs an unexpected repair.',
    cost: 450,
    choices: [
      { label: 'Pay for the repair', cost: 450 },
      { label: 'Use a cheaper temporary fix', cost: 150 },
    ],
  },
  {
    title: 'Medical Bill',
    description: 'You receive an unexpected medical bill.',
    cost: 300,
    choices: [
      { label: 'Pay the full bill', cost: 300 },
      { label: 'Arrange a smaller payment', cost: 100 },
    ],
  },
  {
    title: 'Extra Work',
    description: 'You are offered a small paid extra shift.',
    cost: -200,
    choices: [
      { label: 'Accept the shift', cost: -200 },
      { label: 'Decline and rest', cost: 0 },
    ],
  },
  {
    title: 'Utility Increase',
    description: 'Your utility bill is higher than expected.',
    cost: 125,
    choices: [
      { label: 'Pay the bill', cost: 125 },
      { label: 'Reduce other spending', cost: 125 },
    ],
  },
]

const currentEvent = ref(null)

function adjustExpense(id, delta) {
  const item = expenses.value.find(expense => expense.id === id)
  if (!item) return

  item.amount = Math.max(0, item.amount + delta)
  message.value = `${item.name} updated to ${money(item.amount)}.`
}

function addSavings(amount) {
  if (amount > remaining.value) {
    message.value = 'That savings contribution exceeds your available budget.'
    return
  }

  if (amount < 0) return

  savings.value += amount
  message.value = `You set aside ${money(amount)} for savings.`
}

function triggerRandomEvent() {
  if (eventHistory.value.length >= lifeEvents.length) {
    message.value = 'You have experienced all available events.'
    return
  }

  const available = lifeEvents.filter(
    event => !eventHistory.value.includes(event.title),
  )

  currentEvent.value =
    available[Math.floor(Math.random() * available.length)]
}

function resolveEvent(choice) {
  if (!currentEvent.value) return

  const event = currentEvent.value
  const amount = choice.cost

  if (amount > 0) {
    // Add event expenses to the budget so the impact remains visible.
    expenses.value.push({
      id: `event-${eventHistory.value.length}`,
      name: event.title,
      amount,
      category: 'Unexpected',
    })
  } else if (amount < 0) {
    // Extra income is represented as a negative expense.
    // This keeps the balance calculation simple.
    expenses.value.push({
      id: `event-${eventHistory.value.length}`,
      name: event.title,
      amount,
      category: 'Extra income',
    })
  }

  eventHistory.value.push(event.title)
  message.value = `${event.title}: ${choice.label}. Budget updated.`
  currentEvent.value = null
}

function nextStage() {
  if (stage.value === 1 && monthlyIncome.value <= 0) {
    message.value = 'A valid spendable income is needed to start gameplay.'
    return
  }

  if (stage.value === 3 && eventHistory.value.length === 0) {
    message.value = 'Resolve at least one financial event before continuing.'
    return
  }

  if (stage.value < stages.length) {
    stage.value += 1
    message.value = `Stage ${stage.value}: ${stages[stage.value - 1]}`
  } else {
    finished.value = true
    message.value = 'Month complete! Review your financial results.'
  }
}

function restartGame() {
  stage.value = 1
  savings.value = 0
  eventHistory.value = []
  expenses.value = initialExpenses.map(item => ({ ...item }))
  currentEvent.value = null
  finished.value = false
  message.value = 'New game started.'
}
</script>

<template>
  <main class="game">
    <header class="game-header">
      <div>
        <p class="eyebrow">BLS CAREER EXPLORER</p>
        <h1>Financial Life Simulator</h1>
        <p>
          Career: <strong>{{ career.title || career.name || 'Selected career' }}</strong>
        </p>
      </div>
      <div class="stage-pill">Stage {{ stage }} of 5</div>
    </header>

    <section class="stage-progress" aria-label="Game progress">
      <div
        v-for="(name, index) in stages"
        :key="name"
        :class="{ active: index + 1 <= stage }"
        class="stage-dot"
        :title="name"
      ></div>
    </section>

    <section class="budget-grid">
      <article class="stat-card income">
        <span>Monthly spendable income</span>
        <strong>{{ money(monthlyIncome) }}</strong>
      </article>
      <article class="stat-card">
        <span>Expenses</span>
        <strong>{{ money(totalExpenses) }}</strong>
      </article>
      <article class="stat-card">
        <span>Savings</span>
        <strong>{{ money(savings) }}</strong>
      </article>
      <article class="stat-card" :class="{ negative: remaining < 0 }">
        <span>Money remaining</span>
        <strong>{{ money(remaining) }}</strong>
      </article>
    </section>

    <section class="game-panel">
      <p class="eyebrow">CURRENT CHALLENGE</p>
      <h2>{{ stages[stage - 1] }}</h2>

      <p v-if="stage === 1">
        Review your available income. Your monthly budget starts with the
        spendable amount calculated from your selected career.
      </p>
      <p v-else-if="stage === 2">
        Balance essential expenses with the money you have available.
      </p>
      <p v-else-if="stage === 3">
        Life happens. Resolve a surprise event and see how it affects your budget.
      </p>
      <p v-else-if="stage === 4">
        Build savings without spending more than you can afford.
      </p>
      <p v-else>
        Review your final expenses, savings, and remaining money for the month.
      </p>

      <div v-if="stage === 2 || stage === 1" class="expense-list">
        <div v-for="expense in expenses" :key="expense.id" class="expense-row">
          <div>
            <strong>{{ expense.name }}</strong>
            <small>{{ expense.category }}</small>
          </div>
          <div class="expense-controls">
            <button
              type="button"
              :aria-label="`Decrease ${expense.name}`"
              @click="adjustExpense(expense.id, -25)"
            >−</button>
            <strong>{{ money(expense.amount) }}</strong>
            <button
              type="button"
              :aria-label="`Increase ${expense.name}`"
              @click="adjustExpense(expense.id, 25)"
            >+</button>
          </div>
        </div>
      </div>

      <div v-if="stage === 3" class="event-actions">
        <button
          v-if="!currentEvent"
          type="button"
          class="primary"
          @click="triggerRandomEvent"
        >
          Generate a life event
        </button>

        <article v-if="currentEvent" class="event-card">
          <h3>{{ currentEvent.title }}</h3>
          <p>{{ currentEvent.description }}</p>
          <button
            v-for="choice in currentEvent.choices"
            :key="choice.label"
            type="button"
            class="choice-button"
            @click="resolveEvent(choice)"
          >
            {{ choice.label }}
            <span>
              {{ choice.cost > 0 ? '−' : choice.cost < 0 ? '+' : '' }}
              {{ money(Math.abs(choice.cost)) }}
            </span>
          </button>
        </article>

        <p>Events resolved: {{ eventHistory.length }} / {{ lifeEvents.length }}</p>
      </div>

      <div v-if="stage === 4" class="savings-actions">
        <p>Choose a savings contribution from your remaining budget.</p>
        <button
          v-for="amount in [50, 100, 250]"
          :key="amount"
          type="button"
          class="choice-button"
          @click="addSavings(amount)"
        >
          Save {{ money(amount) }}
        </button>
      </div>

      <div v-if="stage === 5 || finished" class="summary">
        <h3>{{ finished ? 'Month complete!' : 'Your monthly summary' }}</h3>
        <p>Total spendable income: {{ money(monthlyIncome) }}</p>
        <p>Total expenses: {{ money(totalExpenses) }}</p>
        <p>Total savings: {{ money(savings) }}</p>
        <p :class="{ deficit: remaining < 0 }">
          {{ remaining < 0 ? 'Budget deficit' : 'Money remaining' }}:
          {{ money(remaining) }}
        </p>
        <p v-if="remaining < 0">
          Your planned spending exceeds your available income. Revisit your
          expenses to find where you can make adjustments.
        </p>
        <button type="button" @click="restartGame">Restart game</button>
      </div>

      <p class="feedback" role="status" aria-live="polite">{{ message }}</p>

      <footer class="game-footer">
        <button
          type="button"
          :disabled="stage === 1 || finished"
          @click="stage -= 1"
        >
          Previous stage
        </button>
        <button
          v-if="!finished"
          type="button"
          class="primary"
          @click="nextStage"
        >
          {{ stage === 5 ? 'Finish month' : 'Continue' }}
        </button>
      </footer>
    </section>
    <p class="disclaimer">
      Educational simulation only. Example expense amounts and event outcomes
      are illustrative, not personalized financial advice.
    </p>
  </main>
</template>

<style scoped>
.game {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  color: #182230;
}
.game-header, .game-footer, .expense-row, .expense-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.game-header { margin-bottom: 24px; }
h1 { margin: 4px 0; font-size: clamp(1.6rem, 4vw, 2.2rem); }
h2 { margin-top: 8px; }
.eyebrow { font-size: .75rem; font-weight: 700; letter-spacing: .1em; color: #52647a; }
.stage-pill { padding: 8px 12px; border-radius: 999px; background: #e8eef7; }
.stage-progress { display: flex; gap: 8px; margin: 20px 0; }
.stage-dot { height: 6px; flex: 1; border-radius: 10px; background: #dce3eb; }
.stage-dot.active { background: #276749; }
.budget-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.stat-card, .game-panel, .event-card { padding: 18px; border: 1px solid #dce3eb; border-radius: 14px; background: white; }
.stat-card { display: flex; flex-direction: column; gap: 10px; }
.stat-card span, .expense-row small { color: #52647a; font-size: .85rem; }
.stat-card strong { font-size: 1.25rem; overflow-wrap: anywhere; }
.stat-card.income { background: #eef8f1; }
.negative, .deficit { color: #b42318; }
.game-panel { margin-top: 18px; }
.expense-list { margin-top: 20px; }
.expense-row { padding: 14px 0; border-bottom: 1px solid #e6ebf1; }
.expense-row > div:first-child { display: flex; flex-direction: column; gap: 4px; }
.expense-controls button, .game button { cursor: pointer; border: 1px solid #cbd5e1; border-radius: 8px; padding: 9px 12px; background: white; }
.expense-controls strong { min-width: 88px; text-align: right; }
.primary { background: #174c35 !important; color: white; border-color: #174c35 !important; }
.event-actions, .savings-actions { display: grid; gap: 12px; margin-top: 16px; }
.choice-button { display: flex; justify-content: space-between; gap: 12px; width: 100%; margin-top: 8px; text-align: left; }
.feedback { padding: 12px; margin-top: 18px; border-radius: 8px; background: #f2f5f9; }
.game-footer { margin-top: 20px; }
.game button:disabled { cursor: not-allowed; opacity: .5; }
.disclaimer { margin-top: 16px; color: #52647a; font-size: .8rem; }
@media (max-width: 700px) {
  .game { padding: 14px; }
  .budget-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .game-header { align-items: flex-start; flex-direction: column; }
  .expense-controls { flex-wrap: wrap; }
}
</style>
