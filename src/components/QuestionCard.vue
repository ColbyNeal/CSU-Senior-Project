
<script setup>
defineProps({
  option: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  selectable: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["select"]);
</script>

<template>
  <article
    class="question-card"
    :class="{ 'question-card-selected': selected }"
  >
    <img
      v-if="option.image"
      class="question-card-image"
      :src="option.image"
      :alt="option.title || option.label"
    />

    <h3 class="question-card-title">
      {{ option.title || option.label }}
    </h3>

    <div v-if="option.priceLabel" class="question-card-price">
      {{ option.priceLabel }}
    </div>
    <div
      v-else-if="option.cost !== undefined && option.cost > 0"
      class="question-card-price"
    >
      ${{ option.cost.toLocaleString() }}/month
    </div>

    <ul v-if="option.details?.length" class="question-card-details">
      <li v-for="detail in option.details" :key="detail">
        {{ detail }}
      </li>
    </ul>

  </article>
</template>
