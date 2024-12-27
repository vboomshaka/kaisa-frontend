declare module 'vue-request' {
    import { Ref } from 'vue';

    interface PaginationOptions {
        currentKey?: string;
        pageSizeKey?: string;
    }

    interface UsePaginationOptions {
        formatResult?: (data: any) => any;
        pagination?: PaginationOptions;
    }

    export function usePagination<T>(
        query: (params: any) => Promise<T>,
        options?: UsePaginationOptions
    ): {
        data: Ref<T>;
        run: (params: any) => void;
        loading: Ref<boolean>;
        current: Ref<number>;
        pageSize: Ref<number>;
    };
}