#制定node镜像的版本
FROM node:16.17-alpine3.15

#安装依赖
RUN npm install

#对外暴露的端口
EXPOSE 3000

#程序启动脚本
CMD ["npm", "start"]