<template>
  <div class="authority">
    <CommonTable
        :rowKey="record => record.id"
        :columns="columns"
        :data-source="portList"
        :pagination="{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal : total => `总共 ${total} 条`
      }"
        :rowSelection="rowSelection"
        @change="handleTableChange"
    >
      <template #title>
        <div class="flex justify-between">
          端口列表
          <div class="flex">
            <a-input v-model:value="searchKeyword"
                     placeholder="搜索" style="width: 200px; margin-right: 10px;"
                     @keydown.enter="fetchPortList"
            />
            <a-dropdown-button :loading="loading" trigger="click">
              批量操作
              <template #overlay>
                <a-menu>
                  <a-menu-divider style="height: 2px;"/>
                  <a-menu-item key="modify1" @click="batchModify(1)">
                    <EditFilled/>
                    进行中
                  </a-menu-item>
                  <a-menu-item key="modify2" @click="batchModify(2)">
                    <LikeFilled/>
                    无风险
                  </a-menu-item>
                  <a-menu-item key="3" @click="batchModify(3)">
                    <DislikeFilled/>
                    有风险
                  </a-menu-item>
                  <a-menu-divider/>
<!--                  <a-menu-item key="delete" @click="batchDelete">-->
                  <a-menu-item key="delete" @click="showConfirm">
                    <DeleteFilled/>
                    批量删除
                  </a-menu-item>
                </a-menu>

              </template>
              <template #icon>
                <DownOutlined/>
              </template>
            </a-dropdown-button>
          </div>

        </div>
      </template>
      <template #bodyCell="{ column, text, record, index }">
        <template v-if="column.dataIndex === 'index'">
          {{ index + 1 }}
        </template>
        <template v-if="column.dataIndex === 'service'">
          <a-tag color="blue">{{ text }}</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'remake'">
          <a-select
              v-model:value="record.remake"
              :options="remakeOptions"
              @change="(value) => handleRemakeChange(record.id, value)"
          />
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <div class="operation-buttons">
            <a-popconfirm title="确认删除？" @confirm="() => handleDelete(record.id)">
              <a-button danger size="">删除</a-button>
            </a-popconfirm>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'update_time'">
          {{ formatDateTime(text) }}
        </template>

        <template v-else>
          {{ text }}
        </template>
      </template>
    </CommonTable>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, reactive, ref, createVNode} from 'vue';
import {message, TableProps, Modal} from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import CommonTable from '@components/table/CommonTable.vue'; // 引入通用Table组件
import {useLoadingStore} from '@/store';
import http from '@/store/http';
import {Response} from '@/types';

interface PortProps {
  id: number;
  index: number;
  host: string;
  port: number;
  protocol: string;
  service: string;
  remake: number;
  update_time: Date;
}

const portList = ref<PortProps[]>([]);
const searchKeyword = ref<string>('');
const loading = ref(false);
const selectedRowKeys = ref<number[]>([]);
const sortOrders = ref<{ field: string, order: string }[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

type Result = {
  code: number;
  data: PortProps[];
  total: number;
}
const remakeOptions = [
  {label: '未评估', value: 0},
  {label: '进行中', value: 1},
  {label: '无风险', value: 2},
  {label: '有风险', value: 3},
];
const columns = [
  {width: 100, title: '序号', dataIndex: 'index', align: 'center'},
  {title: '主机', dataIndex: 'host', align: 'center'},
  {title: '端口', dataIndex: 'port', sorter: true, align: 'center'},
  {title: '协议', dataIndex: 'protocol', align: 'center'},
  {title: '服务名称', dataIndex: 'service', align: 'center'},
  {title: '更新时间', dataIndex: 'update_time', align: 'center', sorter: true},
  {width: 200, title: '备注', dataIndex: 'remake', align: 'center'},
  {width: 150, title: '操作', align: 'center', dataIndex: 'operation'},
];

const rowSelection: TableProps['rowSelection'] = {
  selectedRowKeys: computed(() => selectedRowKeys.value),  // Use computed to ensure reactivity
  onChange: (keys: number[], selectedRows: PortProps[]) => {
    selectedRowKeys.value = keys;  // Update selectedRowKeys
  },
  getCheckboxProps: (record: PortProps) => ({
    name: record.id.toString(),
  }),
};
// 通用修改函数
const modifyItems = async (ids: number[], remakeValue: number) => {
  if (ids.length === 0) {
    message.warning('请先选择要修改的项目');
    return;
  }
  loading.value = true;
  try {
    const response = await http.request<PortProps[], Response<Result>>(
        '/api/port/batchModifyRemake', // 假设批量和单个修改使用同一个接口
        'POST_JSON',
        {ids, remake: remakeValue},
    );
    if (response.code === 200) {
      message.success('修改成功');
      await fetchPortList();
    } else {
      message.error('修改失败');
    }
  } catch (error) {
    message.error('网络错误，请重试');
  } finally {
    loading.value = false;
  }
};

// 批量修改调用
const batchModify = (remakeValue: number) => {
  modifyItems(selectedRowKeys.value, remakeValue);
};

// 单个修改调用
const handleRemakeChange = (id: number, value: number) => {
  modifyItems([id], value);
};

// 通用删除函数
const deleteItems = async (ids: number[]) => {
  if (ids.length === 0) {
    message.warning('请先选择要删除的项目');
    return;
  }
  loading.value = true;
  try {
    const response = await http.request<PortProps[], Response<Result>>(
        '/api/port/batchDelete',
        'POST_JSON',
        {ids}
    );
    if (response.code === 200) {
      message.success('删除成功');
      await fetchPortList();
    } else {
      message.error('删除失败');
    }
  } catch (error) {
    message.error('网络错误，请重试');
  } finally {
    loading.value = false;
  }
};

// 批量删除调用
const batchDelete = () => {
  deleteItems(selectedRowKeys.value);
};

// 单个删除调用
const handleDelete = (recordId: number) => {
  deleteItems([recordId]);
};

const fetchPortList = async () => {
  const {setPageLoading} = useLoadingStore();
  setPageLoading(true);
  try {
    const sortParams = sortOrders.value.map(s => `sortField=${s.field}&sortOrder=${s.order}`).join('&');
    const res = await http.request<PortProps[], Response<Result>>(
        `/api/port/getPortList?page=${pagination.current}&pageSize=${pagination.pageSize}&keyword=${encodeURIComponent(searchKeyword.value)}&${sortParams}`,
        'GET'
    );
    const {data} = res;
    pagination.total = data.total;
    portList.value = data.data;
  } finally {
    setPageLoading(false);
  }
};

const showConfirm = () => {
  Modal.confirm({
    title: '确认删除所选项目？',
      icon: createVNode(ExclamationCircleOutlined),
    onOk() {
      batchDelete();
    },
    onCancel() {
    }
  });
};

const handleTableChange = (paginationConfig, filters, sorter) => {
  pagination.current = paginationConfig.current;
  pagination.pageSize = paginationConfig.pageSize;
  // 更新多列排序状态
  if (Array.isArray(sorter)) {
    sortOrders.value = sorter.map(s => ({
      field: s.field,
      order: s.order === 'ascend' ? 'asc' : 'desc'
    }));
  } else {
    // 查找是否已经存在此列的排序
    const existingIndex = sortOrders.value.findIndex(s => s.field === sorter.field);
    if (existingIndex !== -1) {
      // 更新已有列的排序
      sortOrders.value[existingIndex] = {
        field: sorter.field,
        order: sorter.order === 'ascend' ? 'asc' : 'desc'
      };
    } else {
      // 添加新的排序列
      sortOrders.value.push({
        field: sorter.field,
        order: sorter.order === 'ascend' ? 'asc' : 'desc'
      });
    }
  }
  // 移除无效排序（order为空时）
  sortOrders.value = sortOrders.value.filter(s => s.order);
  fetchPortList();
};

onMounted(() => {
  fetchPortList();
});

const formatDateTime = (dateTime: string): string => {
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
