cd frontend
pnpm build
cp -r out/* ../build/static/
git rev-parse HEAD > ../build/commit
cd ..
scp -r build/static/* root@hetzner:/data/www/
cat build/commit > build-commits.txt
scp build/commit root@hetzner:/usr/local/bin/what-to-eat/