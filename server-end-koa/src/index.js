const Koa = require('koa');
const app = new Koa();

const cors = require('@koa/cors');
app.use(cors());

const Router = require('@koa/router');
const router = new Router();

app.use(router.routes()).use(router.allowedMethods());


// 强缓存
router.get('/test/cache-control/max-age/:age', ctx => {
  const { age } = ctx.params;
  ctx.set('Cache-Control', 'max-age=' + (age ? age : 86400)); // 1天
  ctx.body = {
    code: 0,
    msg: 'ok',
    data: {
      ctx,
      msg: 'Test Cache-Control'
    }
  }
});

router.get('/test/expires', ctx => {
  // new Date(new Date().getTime() + 5 * 1000) 表示5秒之后过期
  ctx.set('Expires', new Date(new Date().getTime() + 5 * 1000).toGMTString());
  ctx.body = {
    code: 0,
    msg: 'ok',
    data: {
      msg: 'Test Expires',
      expires: new Date(new Date().getTime() + 5 * 1000).toGMTString()
    }
  }
});


// 协商缓存
router.get('/test/last-modified', ctx => {
  const fs = require('fs')
  const file =  fs.readFileSync(__dirname + '/style.css', 'utf-8');
  const fileStat =  fs.statSync(__dirname + '/style.css');
  const lastModified = new Date(fileStat.mtime).toGMTString();
  const ifModifiedSince = ctx.request.header['if-modified-since'];
  ctx.set('Last-Modified', lastModified);
  if(ifModifiedSince && (new Date(ifModifiedSince) >= new Date(lastModified))) {
    ctx.status = 304
  } else {
    ctx.body = {
      code: 0,
      msg: 'ok',
      data: {
        msg: 'Test Last-Modified',
        fileContent: file,
        lastModified: lastModified,
        ifModifiedSince
      }
    }
  }
});

router.get('/test/etag', ctx => {
  const fs = require('fs');
  const file =  fs.readFileSync(__dirname + '/style.css', 'utf-8');
  const { getFileHash } = require('./util/index');
  const etag = getFileHash({file}).slice(0, 8);
  const ifNoneMatch = ctx.request.header['if-none-match'];
  const body = {
    code: 0,
    msg: 'ok',
    data: {
      msg: 'Test ETag',
      fileContent: file,
      etag,
      ifNoneMatch
    }
  };
  // 需要控制暴露的ETag响应头，否则浏览器里读不到ETag响应头（参考文章：https://www.cnblogs.com/codesyofo/p/14142197.html）
  ctx.set("Access-Control-Expose-Headers", "ETag");
  ctx.set('ETag', etag);
  if(ifNoneMatch === etag) {
    ctx.status = 304;
  } else {
    ctx.body = body;
  }
});


// 缓存组合
// Cache-Control + Expires
router.get('/test/compose-cache/compose-1', ctx => {
  ctx.set('Expires', new Date(new Date().getTime() + 5 * 1000).toGMTString()); // 5秒过期
  ctx.set('Cache-Control', 'max-age=10'); // 10秒过期

  const body = {
    code: 0,
    msg: 'ok',
    data: {
      msg: 'Test compose-cache/compose-1'
    }
  }
  ctx.body = body;
});

// Cache-Control + Expires + ETag + Last-Modified
router.get('/test/compose-cache/compose-2', ctx => {
  const fs = require('fs');
  const file =  fs.readFileSync(__dirname + '/style.css', 'utf-8');
  const { getFileHash } = require('./util/index');
  const etag = getFileHash({file}).slice(0, 8);
  const ifNoneMatch = ctx.request.header['if-none-match'];
  ctx.set('ETag', etag);

  const fileStat =  fs.statSync(__dirname + '/style.css');
  const lastModified = new Date(fileStat.mtime).toGMTString();
  const ifModifiedSince = ctx.request.header['if-modified-since'];

  ctx.set('Last-Modified', lastModified);

  const body = {
    code: 0,
    msg: 'ok',
    data: {
      msg: 'Test compose-cache/compose-2'
    }
  }

  ctx.set("Access-Control-Expose-Headers", "ETag");

  // 优先校验etag
  if(ifNoneMatch === etag) {
    console.log('走协商缓存');
    ctx.status = 304;
  } else if(lastModified === ifModifiedSince) {
    ctx.status = 304;
  } else {
    ctx.body = body;
  }
});


// 禁用缓存
router.get('/test/disable/cache-control/no-cache', ctx => {
  ctx.set('Cache-Control', 'no-cache');
  ctx.body = {
    code: 0,
    msg: 'ok',
    data: {
      msg: 'Test Cache-Control: no-cache'
    }
  }
});

router.get('/test/disable/cache-control/no-store', ctx => {
  ctx.set('Cache-Control', 'no-store');
  ctx.body = {
    code: 0,
    msg: 'ok',
    data: {
      msg: 'Test Cache-Control: no-store'
    }
  }
});

router.get('/test/disable/cache-control/max-age/:age', ctx => {
  console.log('params', ctx.params)
  const { age } = ctx.params;
  ctx.set('Cache-Control', 'max-age=' + (age ? age : 86400));
  ctx.body = {
    code: 0,
    msg: 'ok',
    data: {
      ctx,
      msg: 'Test Cache-Control'
    }
  }
});

app.listen(3000, () => {
  console.log('server start successfully');
});
