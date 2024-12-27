<template>
  <div v-if="!loading">
    <div>
      <a-result status="404" title="404" sub-title="Sorry, you don't have access to this page.">
        <template #extra>
          <a-button type="primary" @click="toHome">
            Back Home
          </a-button>
        </template>
      </a-result>
    </div>
  </div>
  <div v-else class="loading flex items-center justify-center">
    <ReadingLoader/>
  </div>
</template>
<script lang="ts" setup>
import ReadingLoader from '@/components/loaders/ReadingLoader.vue';
import {configPage} from 'stepin/es/tabs-view';
import {useRoute, useRouter} from 'vue-router';
import {storeToRefs, useLoadingStore} from '@/store';
import {watch} from 'vue';

const props = defineProps({
  loading: Boolean,
});
const route = useRoute();

const {pageLoading} = storeToRefs(useLoadingStore());

const router = useRouter();

function toHome() {
  router.push('/')
}

if (props.loading) {
  if (!pageLoading.value) {
    router.push(route.fullPath);
  } else {
    watch(pageLoading, () => {
      router.push(route.fullPath);
    });
  }
  configPage(route, {title: 'loading'});
  configPage(route, {title: undefined});
}
</script>
<style scoped>
.loading {
  min-height: calc(100vh - theme(height.header) - 182px);
}
</style>
