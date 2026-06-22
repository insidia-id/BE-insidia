set -e

if [ "$NODE_ENV" = "development" ]; then
  npx prisma generate
  npm run start:dev
else
  npm run start:prod
fi