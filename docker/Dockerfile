# 使用 Nginx 镜像作为最终镜像
FROM nginx:alpine

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 复制文件
COPY ./avue-data/dist/ /usr/share/nginx/html/

# 暴露端口
EXPOSE 80

# 将 nginx 配置复制到容器中
COPY ./avue-data/docker/nginx.conf /etc/nginx/conf.d/default.conf

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]