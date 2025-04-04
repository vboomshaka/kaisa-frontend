import { defineStore } from 'pinia';
import http from './http';
import router from '@/router';
import { Response } from '@/types';
import { useMenuStore } from './menu';
import { useAuthStore } from '@/plugins';
import { useLoadingStore } from './loading';

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
      return http
          .request<TokenResult, Response<TokenResult>>('/login', 'post_json', { username, password })
          .then(async (response) => {
            if (response.code === 200) {
              this.logged = true;
              http.setAuthorization(`Bearer ${response.data.token}`, new Date(response.data.expires));
              await useMenuStore().getMenuList();
              console.log('login success', response.data);
              return response.data;
            } else {
              return Promise.reject(response);
            }
          });
    },
    async logout() {
      return new Promise<boolean>((resolve) => {
        localStorage.removeItem('stepin-menu');
        http.removeAuthorization();
        this.logged = false;
        resolve(true);
      });
    },
    async profile() {
      const { setAuthLoading } = useLoadingStore();
      setAuthLoading(true);
      return http
          .request<Account, Response<Profile>>('/api/account', 'get')
          .then((response) => {
            if (response.code === 200) {
              const { setAuthorities } = useAuthStore();
              const { account, permissions, role } = response.data;
              console.log('profile', permissions);
              this.account = account;
              this.permissions = permissions;
              this.role = role;
              setAuthorities(permissions);
              return response.data;
            } else if (response.code === 401) {
              console.log('login failed', response);
              this.logged = false;
              this.logout();
              router.push('/login');
            }
            else {
              return Promise.reject(response);
            }
          })
          .finally(() => setAuthLoading(false));
    },
    setLogged(logged: boolean) {
      this.logged = logged;
    },
  },
});
