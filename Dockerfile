FROM node:20.2-alpine3.17 as base

RUN apk add -f --update --no-cache --virtual .gyp nano bash libc6-compat python3 make g++ \
      && yarn global add turbo@1.9.0 \
      && apk del .gyp

FROM base AS pruned
WORKDIR /app
ARG APP

COPY . .

RUN turbo prune --scope=$APP --docker

FROM base AS installer
WORKDIR /app
ARG APP

COPY --from=pruned /app/out/json/ .
COPY --from=pruned /app/out/yarn.lock /app/yarn.lock

COPY apps/${APP}/package.json /app/apps/${APP}/package.json

RUN \
      --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=locked \
      yarn --prefer-offline --frozen-lockfile

COPY --from=pruned /app/out/full/ .
COPY turbo.json turbo.json

RUN turbo run build --no-cache --filter=${APP}^...

RUN \
      --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=locked \
      yarn --prefer-offline --frozen-lockfile

FROM base AS runner
WORKDIR /app
ARG APP
ARG START_COMMAND=dev

COPY --from=installer /app .

CMD yarn workspace ${APP} ${START_COMMAND}