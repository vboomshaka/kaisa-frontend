<template>
  <a-table
      :rowKey="rowKey"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="pagination"
      @change="handleChange"
  >
    <template #title>
      <slot name="title"></slot>
    </template>
    <template #bodyCell="{ text, record, index, column }">
      <slot name="bodyCell" :text="text" :record="record" :index="index" :column="column"></slot>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  rowKey: {
    type: Function,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
  dataSource: {
    type: Array,
    required: true,
  },
  pagination: {
    type: Object,
    required: true,
  },
});

const emits = defineEmits(['change']);

const handleChange = (paginationConfig: any, filters: any, sorter: any) => {
  emits('change', paginationConfig, filters, sorter);
};
</script>