import { defineStore } from 'pinia';
import http from './http';
import { Response } from '@/types';
import { useMenuStore } from './menu';
import { useAuthStore } from '@/plugins';
import { useLoadingStore } from './loading';
import { alert } from "stepin";

export interface Profile {
  account: Account;
  permissions: string[];
  role: string;
}
export interface Account {
  username: string;
  avatar: string;
  gender: number;
}

export type TokenResult = {
  token: string;
  expires: number;
};

export const useAccountStore = defineStore('account', {
  state() {
    return {
      account: {} as Account,
      permissions: [] as string[],
      role: '',
      logged: true,
    };
  },
  actions: {
    async login(username: string, password: string) {
      try {
        const response = await http.request<TokenResult, Response<TokenResult>>('/login', 'post_json', { username, password });
        if (response.code === 200) {
          this.logged = true;
          http.setAuthorization(`Bearer ${response.data.token}`, new Date(response.data.expires));
          console.log('login success', response.data);
          // 设置定时器，在expires时间到达时调用logout()
          return response.data;
        } else if (response.code === 401) {
          return alert.error("账号或密码错误");
        } else {
          return Promise.reject(response);
        }
      } catch (error) {
        console.error('Login error:', error);
        return Promise.reject(error);
      }
    },
    async logout() {
      try {
        localStorage.removeItem('stepin-menu');
        http.removeAuthorization();
        this.logged = false;
        return true;
      } catch (error) {
        console.error('Logout error:', error);
        return false;
      }
    },
    async profile() {
      const { setAuthLoading } = useLoadingStore();
      setAuthLoading(true);
      try {
        const response = await http.request<Account, Response<Profile>>('/api/account', 'get');
        if (response.code === 200) {
          const { setAuthorities } = useAuthStore();
          const { account, permissions, role } = response.data;
          console.log('profile', permissions);
          this.account = account;
          this.permissions = permissions;
          this.role = role;
          setAuthorities(permissions);
          return response.data;
        } else {
          return Promise.reject(response);
        }
      } catch (error) {
        console.error('Profile error:', error);
        return Promise.reject(error);
      } finally {
        setAuthLoading(false);
      }
    },
    setLogged(logged: boolean) {
      this.logged = logged;
    },
  },
});
