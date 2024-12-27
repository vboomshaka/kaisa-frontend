<template>
  <div class="authority">
    <a-table
        :columns="columns"
        :row-key="record => record.login.uuid"
        :data-source="dataSource"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
    >
      <template #title>
        <div class="flex justify-between">
          端口列表
          <div class="flex">
            <a-button type="primary" @click="">
              <template #icon>
                <PlusOutlined/>
              </template>
              新增
            </a-button>
          </div>
        </div>
      </template>
      <template #bodyCell="{ column, text, record, index }">
        <template v-if="column.dataIndex === 'name'">{{ text.first }} {{ text.last }}</template>
        <template v-if="column.dataIndex === 'operation'">
          <div class="operation-buttons">
            <a-button type="primary" size="" @click="">编辑</a-button>
            <a-popconfirm title="确认删除？" @confirm="">
              <a-button v-auth:delete danger size="">删除</a-button>
            </a-popconfirm>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'icon'">
          <component :is="record.icon"/>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import type {TableProps} from 'ant-design-vue';
import {usePagination} from 'vue-request';
import axios from 'axios';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: true,
    width: '20%',
  },
  {
    title: 'Gender',
    dataIndex: 'gender',
    filters: [
      {text: 'Male', value: 'male'},
      {text: 'Female', value: 'female'},
    ],
    width: '20%',
  },
  {
    title: 'Email',
    dataIndex: 'email',
  },
  {
    width: 200,
    title: '操作',
    align: 'center',
    dataIndex: 'operation',
  },
];

type APIParams = {
  results: number;
  page?: number;
  sortField?: string;
  sortOrder?: number;
  [key: string]: any;
};
type APIResult = {
  results: {
    gender: 'female' | 'male';
    name: string;
    email: string;
  }[];
};

const queryData = async (params: APIParams) => {
  const response = await axios.get<APIResult>('https://randomuser.me/api?noinfo', {params});
  console.log(response.data);
  return response.data.results; // 直接返回结果数组
};

const {
  data: dataSource,
  run,
  loading,
  current,
  pageSize,
} = usePagination(queryData, {
  formatResult: res => res.data.results,
  pagination: {
    currentKey: 'page',
    pageSizeKey: 'results',
  },
});

const pagination = computed(() => ({
  total: 200,
  current: current.value,
  pageSize: pageSize.value,
}));

const handleTableChange: TableProps['onChange'] = (
    pag: { pageSize: number; current: number },
    filters: any,
    sorter: any,
) => {
  run({
    results: pag.pageSize,
    page: pag?.current,
    sortField: sorter.field,
    sortOrder: sorter.order,
    ...filters,
  });
};
</script>

<style scoped>
.flex {
  display: flex;
  justify-content: space-between;
}

.operation-buttons {
  display: flex;
  gap: 10px; /* 设置按钮之间的间距为 10px */
  flex-wrap: wrap; /* 允许按钮换行 */
  justify-content: center; /* 居中对齐按钮 */
}
</style>
