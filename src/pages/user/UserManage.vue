<template>
  <div class="authority">
    <CommonTable
        :rowKey="record => record.id"
        :columns="columns"
        :dataSource="filteredUsers"
        :pagination="{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
      }"
        @change="handleTableChange"
    >
      <template #title>
        <div class="flex justify-between">
          用户管理
          <div class="flex">
            <a-input v-model:value="searchKeyword" placeholder="搜索用户" style="width: 200px; margin-right: 10px;" />
            <a-button type="primary" @click="handleAdd">
              <template #icon>
                <PlusOutlined />
              </template>
              新增
            </a-button>
          </div>
        </div>
      </template>
      <template #bodyCell="{ text, record, index, column }">
        <template v-if="column.dataIndex === 'permissions'">
          <a-tag v-for="permission in record.permissions" :key="permission" color="blue">
            {{ permission }}
          </a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <div class="operation-buttons">
            <a-button type="primary" size="" @click="handleEdit(record)">编辑</a-button>
            <a-popconfirm title="确认删除？" @confirm="() => handleDelete(record)">
              <a-button danger size="">删除</a-button>
            </a-popconfirm>
          </div>
        </template>
        <template v-else>
          {{ text }}
        </template>
      </template>
    </CommonTable>

    <Modal v-model:visible="showModal" title="用户信息" @ok="handleSave" @cancel="showModal=false">
      <Form layout="vertical">
        <Form.Item label="用户名" required>
          <a-input v-model:value="formData.username" />
        </Form.Item>
        <Form.Item label="姓名" required>
          <a-input v-model:value="formData.name" />
        </Form.Item>
        <Form.Item label="密码" required>
          <a-input v-model:value="formData.password" />
        </Form.Item>
        <Form.Item label="邮箱">
          <a-input v-model:value="formData.email" />
        </Form.Item>
        <Form.Item label="角色">
          <a-select v-model:value="formData.role" placeholder="请选择角色">
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="user">用户</a-select-option>
          </a-select>
        </Form.Item>
        <Form.Item label="权限">
          <a-checkbox-group v-model:value="formData.permissions">
            <a-checkbox v-for="permission in permissions" :key="permission" :value="permission">
              {{ permission }}
            </a-checkbox>
          </a-checkbox-group>
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { Form, message, Modal } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import CommonTable from '@components/table/CommonTable.vue'; // 引入通用Table组件
import { useLoadingStore } from '@/store';
import http from '@/store/http';
import { Response } from '@/types';

interface UserProps {
  id: number;
  name: string;
  username: string;
  password?: string;
  email: string;
  age?: number;
  gender?: string;
  role: string;
  permissions?: string[];
  loginTime?: Date;
}

const userList = ref<UserProps[]>([]);
const searchKeyword = ref<string>('');
const showModal = ref<boolean>(false);
const isEdit = ref<boolean>(false);
const formData = reactive<Partial<UserProps>>({});
const permissions = reactive<string[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
type Result = {
  code: number;
  data: UserProps[];
  total: number;
}

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    align: 'center',
  },
  {
    title: '用户名',
    dataIndex: 'username',
    align: 'center',
  },
  {
    title: '姓名',
    dataIndex: 'name',
    align: 'center',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    align: 'center',
  },
  {
    title: '角色',
    dataIndex: 'role',
    align: 'center',
  },
  {
    title: '权限',
    dataIndex: 'permissions',
    align: 'center',
    width: 300,
  },
  {
    title: '最近登录时间',
    dataIndex: 'loginTime',
    align: 'center',
  },
  {
    title: '操作',
    align: 'center',
    dataIndex: 'operation',
    width: 200,
  },
];

const fetchUsers = async () => {
  // 模拟获取用户数据
  const getUserList = async (page: number, pageSize: number) => {
    const { setPageLoading } = useLoadingStore();
    setPageLoading(true);
    try {
      const res = await http.request<UserProps[], Response<Result>>(
          `/api/user/getUsers?page=${page}&pageSize=${pageSize}`,
          'GET'
      );
      const { data } = res;
      pagination.total = data.total; // 假设后端返回数据中有总数
      return data;
    } finally {
      setPageLoading(false);
    }
  };
  const page = pagination.current;
  const pageSize = pagination.pageSize;
  const allUsers = await getUserList(page, pageSize);
  userList.value = allUsers.data;
};

const handleAdd = () => {
  formData.id = undefined;
  formData.username = '';
  formData.name = '';
  formData.password = '';
  formData.email = '';
  formData.role = '';
  formData.permissions = [];
  isEdit.value = false;
  showModal.value = true;
};

const handleEdit = (user: UserProps) => {
  formData.id = user.id;
  formData.username = user.username;
  formData.name = user.name;
  formData.password = user.password;
  formData.email = user.email;
  formData.role = user.role;
  formData.permissions = user.permissions;
  isEdit.value = true;
  showModal.value = true;
};

const handleDelete = (user: UserProps) => {
  Modal.confirm({
    title: '确认删除？',
    content: `确定要删除用户 ${user.name} 吗？`,
    onOk: () => {
      userList.value = userList.value.filter(u => u.id !== user.id);
      message.success('删除成功');
      fetchUsers(); // 重新获取用户数据以更新分页
    },
  });
};

const handleSave = () => {
  if (isEdit.value) {
    const index = userList.value.findIndex(user => user.id === formData.id);
    if (index !== -1) {
      userList.value[index] = { ...formData } as UserProps;
      message.success('编辑成功');
    }
  } else {
    formData.id = Date.now();
    userList.value.push({ ...formData } as UserProps);
    message.success('添加成功');
  }
  showModal.value = false;
  fetchUsers(); // 重新获取用户数据以更新分页
};

const filteredUsers = computed(() => {
  const keyword = searchKeyword.value.toLowerCase();
  return userList.value.filter(user =>
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.username.toLowerCase().includes(keyword)
  );
});

const handleTableChange = (paginationConfig: any) => {
  pagination.current = paginationConfig.current;
  pagination.pageSize = paginationConfig.pageSize;
  fetchUsers();
};

watch(() => formData.role, (newRole) => {
  if (newRole === 'admin') {
    permissions.splice(0, permissions.length, 'admin:edit', 'admin:add', 'admin:delete');
    formData.permissions = ['admin:edit', 'admin:add', 'admin:delete'];
  } else if (newRole === 'user') {
    permissions.splice(0, permissions.length, 'user:edit', 'user:add', 'user:delete');
    formData.permissions = ['user:edit', 'user:add', 'user:delete'];
  } else {
    permissions.splice(0, permissions.length);
    formData.permissions = [];
  }
});

onMounted(() => {
  fetchUsers();
});
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