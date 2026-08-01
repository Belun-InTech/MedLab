# ---- build -----------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# devDependencies are required here: vite, tsc and drizzle-kit all live there.
# NODE_ENV must NOT be production at this point or `npm ci` skips them and the build dies.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runtime ---------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=3001

# node_modules is copied wholesale instead of reinstalled with --omit=dev on purpose:
# drizzle-kit (db:migrate) and tsx (db:seed) are devDependencies, and both need to be
# runnable inside this container from the Dokploy terminal.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
COPY package.json drizzle.config.ts ./
COPY server/migrations ./server/migrations
COPY server/src ./server/src
COPY shared ./shared

EXPOSE 3001

# /api/health already returns 503 when MySQL is unreachable, so this is a real dependency
# check, not just a liveness ping.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.API_PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Migrations stay opt-in — this repo never applies them at boot. Set RUN_MIGRATIONS=true
# in Dokploy only for the deploy that carries a schema change, then unset it again.
CMD ["sh", "-c", "if [ \"$RUN_MIGRATIONS\" = \"true\" ]; then npx drizzle-kit migrate; fi; exec node dist-server/server/src/index.js"]
