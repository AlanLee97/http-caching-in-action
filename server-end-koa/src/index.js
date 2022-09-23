const Koa = require('koa');
const app = new Koa();

const cors = require('@koa/cors');
app.use(cors());

const Router = require('@koa/router');
const router = new Router();

app.use(router.routes()).use(router.allowedMethods());

router.get('/test/cache-control/max-age', ctx => {
  ctx.set('Cache-Control', 'max-age=86400');
  ctx.body = {
    code: 0,
    msg: 'ok',
    data: {
      ctx,
      msg: 'Test Cache-Control'
    }
  }
});

router.get('/test/cache-control/max-age/:age', ctx => {
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

router.get('/test/expires', ctx => {
  // new Date(new Date().getTime() + 5 * 1000) 表示5秒之后过期
  ctx.set('Expires', new Date(new Date().getTime() + 5 * 1000).toGMTString());
  ctx.body = {
    code: 0,
    msg: 'ok',
    data: {
      msg: 'Test Expires',
      expires: new Date('2022-09-21').toGMTString()
    }
  }
});

router.get('/test/last-modified', ctx => {
  const fs = require('fs')
  const file =  fs.readFileSync(__dirname + '/test.txt', 'utf-8');
  const fileStat =  fs.statSync(__dirname + '/test.txt');
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
  const file =  fs.readFileSync(__dirname + '/test.txt', 'utf-8');
  const { getFileHash } = require('./util/index');
  const etag = getFileHash({file}).slice(0, 8);
  const ifNoneMatch = ctx.request.header['if-none-match'];
  const body = {
    code: 0,
    msg: 'ok',
    data: {
      msg: 'Test ETag',
      fileContent: '123',
      etag,
      ifNoneMatch
    }
  };
  // 需要控制暴露的ETag响应头，否则浏览器里读不到ETag响应头（参考文章：https://www.cnblogs.com/codesyofo/p/14142197.html）
  ctx.set("Access-Control-Expose-Headers", "ETag");
  ctx.set('ETag', etag);
  if(ifNoneMatch === etag) {
    // TODO 这里有问题，指定返回状态码为304，但还是返回了200，并且还返回了body（问题已解决，是因为需要控制暴露的响应头，并且前端需要显示的在请求中带上If-None-Match）
    ctx.status = 304;
  } else {
    ctx.body = body;
  }
});

router.get('/test/cache-control/no-cache', ctx => {
  ctx.set('Cache-Control', 'no-cache');
  ctx.body = {
    code: 0,
    msg: 'ok',
    data: {
      msg: 'Test Cache-Control: no-cache'
    }
  }
});

router.get('/test/cache-control/no-store', ctx => {
  ctx.set('Cache-Control', 'no-store');
  ctx.body = {
    code: 0,
    msg: 'ok',
    data: {
      msg: 'Test Cache-Control: no-store'
    }
  }
});

// todo
router.get('/test/compose-cache', ctx => {
  ctx.set('Cache-Control', 'max-age=3600');
  ctx.set('Expires', new Date(new Date().getTime() + 5 * 1000).toGMTString());

  const fs = require('fs');
  const file =  fs.readFileSync(__dirname + '/test.txt', 'utf-8');
  const { getFileHash } = require('./util/index');
  const etag = getFileHash({file}).slice(0, 8);
  const ifNoneMatch = ctx.request.header['if-none-match'];
  ctx.set('ETag', etag);

  const fileStat =  fs.statSync(__dirname + '/test.txt');
  const lastModified = new Date(fileStat.mtime).toGMTString();
  ctx.set('Last-Modified', lastModified);
  const body = {
    code: 0,
    msg: 'ok',
    data: {
      msg: 'Test compose-cache'
    }
  }
  ctx.set("Access-Control-Expose-Headers", "ETag");
  if(ifNoneMatch === etag) {
    // TODO 这里有问题，指定返回状态码为304，但还是返回了200，并且还返回了body（问题已解决，是因为需要控制暴露的响应头，并且前端需要显示的在请求中带上If-None-Match）
    ctx.status = 304;
  } else {
    ctx.body = body;
  }
});

app.listen(3000, () => {
  console.log('server start successfully');
});
