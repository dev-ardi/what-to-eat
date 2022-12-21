cd backend
cargo build -r
cp target/release/what-to-eat ../build/server/
cp data.db ../build/server/
cd ../frontend
pnpm build
cp -r out/* ../build/static/
git rev-parse HEAD > ../build/commit
scp -r ../build/ root@hetzner:/usr/local/bin/what-to-eat