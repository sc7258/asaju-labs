#!/bin/bash
set -e

echo "1. Configuring packages/saju-core"
mkdir -p packages/saju-core/src
cat << 'PKGJSON' > packages/saju-core/package.json
{
  "name": "@repo/saju-core",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^22.15.3",
    "eslint": "^9.39.1",
    "typescript": "5.9.2"
  }
}
PKGJSON

cat << 'TSCONFIG' > packages/saju-core/tsconfig.json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
TSCONFIG

echo "2. Moving core logic files..."
mv apps/sajucube-mweb/src/lib/korean-lunisolar* packages/saju-core/src/ || true
mv apps/sajucube-mweb/src/lib/manselyeok* packages/saju-core/src/ || true
mv apps/sajucube-mweb/src/lib/chasam-manselyeok* packages/saju-core/src/ || true
mv apps/sajucube-mweb/src/lib/birth-text* packages/saju-core/src/ || true

echo "export * from './korean-lunisolar';" > packages/saju-core/src/index.ts
echo "export * from './manselyeok';" >> packages/saju-core/src/index.ts
echo "export * from './chasam-manselyeok';" >> packages/saju-core/src/index.ts
echo "export * from './birth-text';" >> packages/saju-core/src/index.ts

echo "3. Updating sajucube-mweb dependencies..."
sed -i 's/"dependencies": {/"dependencies": {\n    "@repo\/saju-core": "workspace:*",/g' apps/sajucube-mweb/package.json
sed -i 's/"name": "sajucube-webapp"/"name": "sajucube-mweb"/g' apps/sajucube-mweb/package.json

echo "4. Installing dependencies..."
pnpm install

echo "Migration script completed."
