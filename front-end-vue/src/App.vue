<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue';
import http from './util/http';
import { onMounted } from 'vue';

onMounted(() => {

})

const onTest = () => {
  http.get('/test').then((res: any) => {
    console.log(res)
  })
}

const onTestCacheControlMaxAge = (age?: any) => {
  http.get('/test/cache-control/max-age' + (age ? '/' + age : '')).then((res: any) => {
    console.log(res)
  })
}

const onTestExpires = () => {
  http.get('/test/expires').then((res: any) => {
    console.log(res)
  })
}

let lastModified = ''
let fileContent = ''
const onLastModified = () => {
  const headers = lastModified ? {
    "If-Modified-Since": lastModified
  } : {}
  http.get('/test/last-modified', { headers }).then((res: any) => {
    console.log(res)
    lastModified = res.headers['last-modified']
    fileContent = res.data.data.fileContent
    localStorage.setItem('fileContent', fileContent)
  }).catch((err: any) => {
    console.log('err', err)
    if(err.response.status === 304) {
      fileContent = '' + localStorage.getItem('fileContent')
    }
  })
}

let etag = ''
const onEtag = () => {
  // 前端需要显示的在请求中带上If-None-Match
  const headers = etag ? {
    "If-None-Match": etag
  } : {}
  http.get('/test/etag', { headers }).then((res: any) => {
    console.log(res)
    etag = res.headers['etag']
    fileContent = res.data.data.fileContent
    localStorage.setItem('fileContent', fileContent)
  }).catch((err: any) => {
    console.log('err', err)
    if(err.response.status === 304) {
      fileContent = '' + localStorage.getItem('fileContent')
    }
  })
}

const onTestDisableCacheControl = (type = 'no-cache') => {
  http.get('/test/cache-control/no-cache', {
    headers: {
      'Cache-Control': type
    }
  }).then((res: any) => {
    console.log(res)
  })
}

const onTestDisableCacheControlNoStore = () => {
  http.get('/test/cache-control/no-store', {
    // headers: {
    //   'Cache-Control': 'no-cache'
    // }
  }).then((res: any) => {
    console.log(res)
  })
}

const onComposeCache = () => {
  const headers = {} as any
  if(etag) headers["If-None-Match"] = etag;
  if(lastModified) headers["If-Modified-Since"] = lastModified;

  http.get('/test/compose-cache', {headers}).then((res: any) => {
    console.log(res)
    etag = res.headers['etag']
    lastModified = res.headers['last-modified']
  })
}

const onComposeCache1 = () => {
  http.get('/test/compose-cache/compose-1').then((res: any) => {
    console.log(res)
  })
}
</script>

<template>
  <div>
    <div class="btn-area">
      <h2>缓存类型</h2>
      <button @click="onTestCacheControlMaxAge()">Cache-Control: max-age</button>
      <button @click="onTestExpires">Expire</button>
      <button @click="onLastModified">If-Modified-Since / Last-Modified</button>
      <button @click="onEtag">If-None-Match / Etag</button>

      <h2>缓存组合</h2>
      <button @click="onComposeCache">Cache-Control + Expires / Last-Modified + Etag</button>
      <button @click="onComposeCache1">Cache-Control + Expires</button>

      <h2>禁用缓存</h2>
      <button @click="onTestCacheControlMaxAge('0')">Disable Cache-Control: max-age=0</button>
      <button @click="onTestDisableCacheControl('no-cache')">Disable Cache-Control: no-cache</button>
      <button @click="onTestDisableCacheControlNoStore">Disable Cache-Control: no-store</button>

    </div>
  </div>
  <!-- <HelloWorld msg="Vite + Vue" /> -->
</template>

<style scoped>
.btn-area {
  display: flex;
  flex-direction: column;
}
.btn-area button {
  margin: 20px 0;
}
</style>
