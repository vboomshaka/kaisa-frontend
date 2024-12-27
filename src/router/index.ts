import {createRouter, createWebHashHistory} from 'vue-router';
import {shallowReactive} from 'vue';
import routes from './routes';
import guards from './guards';

const router = createRouter(
    shallowReactive({
        //配置了路由的历史模式为哈希模式（URL 中的 `#` 符号
        history: createWebHashHistory(),
        routes,
    })
);

// 注册导航守卫
guards.before.forEach(router.beforeEach);
guards.after.forEach(router.afterEach);

export default router;
