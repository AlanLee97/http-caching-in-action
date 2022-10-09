<script setup lang="ts">

import http from './util/http';


// 强缓存
const onCacheControlMaxAge = () => {
  http.get('/test/cache-control/max-age/86400').then((res: any) => {
    console.log(res)
  })
}

const onExpires = () => {
  http.get('/test/expires').then((res: any) => {
    console.log(res)
  })
}


// 协商缓存
let lastModified = ''
let fileContent = ''
let etag = ''

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


// 禁用缓存
const onDisableCacheControlNoCache = () => {
  http.get('/test/disable/cache-control/no-cache', {
    headers: {
      'Cache-Control': "no-cache"
    }
  }).then((res: any) => {
    console.log(res)
  })
}

const onDisableCacheControlNoStore = () => {
  http.get('/test/disable/cache-control/no-store', {
    headers: {
      'Cache-Control': 'no-store'
    }
  }).then((res: any) => {
    console.log(res)
  })
}

const onDisableCacheControlMaxAgeZero = () => {
  http.get('/test/cache-control/max-age/0').then((res: any) => {
    console.log(res)
  })
}


// 缓存组合
// 组合1：Cache-Control + Expires
const onComposeCache1 = () => {
  http.get('/test/compose-cache/compose-1').then((res: any) => {
    console.log(res)
  })
}

// 组合2：Cache-Control + Expires / Last-Modified + Etag
const onComposeCache2 = () => {
  const headers = {
    "Cache-Control": "max-age=60"
  } as any
  if(etag) headers["If-None-Match"] = etag;
  if(lastModified) headers["If-Modified-Since"] = lastModified;

  http.get('/test/compose-cache/compose-2', {headers}).then((res: any) => {
    console.log(res)
    etag = res.headers['etag']
    lastModified = res.headers['last-modified']
  })
}

</script>

<template>
  <div>
    <div class="btn-area">
      <h2>缓存类型</h2>
      <h4>强缓存</h4>
      <button @click="onCacheControlMaxAge">Cache-Control: max-age</button>
      <button @click="onExpires">Expire</button>
      <h4>协商缓存</h4>
      <button @click="onLastModified">If-Modified-Since / Last-Modified</button>
      <button @click="onEtag">If-None-Match / Etag</button>

      <h2>缓存组合</h2>
      <button @click="onComposeCache1">Cache-Control + Expires</button>
      <button @click="onComposeCache2">Cache-Control + Expires / Last-Modified + Etag</button>

      <h2>禁用缓存</h2>
      <button @click="onDisableCacheControlMaxAgeZero">Disable Cache-Control: max-age=0</button>
      <button @click="onDisableCacheControlNoCache">Disable Cache-Control: no-cache</button>
      <button @click="onDisableCacheControlNoStore">Disable Cache-Control: no-store</button>

    </div>
  </div>
</template>

<style scoped>
.btn-area {
  display: flex;
  flex-direction: column;
}
.btn-area button {
  margin: 20px 0;
}

h2 {
  margin-top: 100px;
}
</style>
