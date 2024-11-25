FROM node:20-bullseye-slim AS builder

ENV NODE_OPTIONS=--max-old-space-size=8192

RUN corepack enable

RUN corepack prepare pnpm@9.9.0 --activate   

WORKDIR /app

COPY . /app

RUN pnpm i --ignore-scripts

RUN pnpm build

RUN echo "Builder Success 🎉"

FROM nginx:stable-alpine AS production

RUN echo "types { application/javascript js mjs; }" > /etc/nginx/conf.d/mjs.conf

COPY --from=builder /app/dist /usr/share/nginx/html

COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

# start nginx
CMD ["nginx", "-g", "daemon off;"]
