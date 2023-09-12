urlbase = /llm/
prod:
	ng build --outputHashing=all --prod --aot --base-href $(urlbase) --deploy-url $(urlbase) --configuration production
	tar -cvf dist.tar.gz dist
dev:
	ng build  --outputHashing=all --prod --aot --base-href $(urlbase) --deploy-url $(urlbase) --configuration remote-dev
	tar -cvf dist.tar.gz dist
run:
	ng serve --open --configuration local
build:
	ng build --outputHashing=all --prod --aot --base-href $(urlbase) --deploy-url $(urlbase) --configuration production
instr:
	ng build --outputHashing=all --prod --aot --base-href $(urlbase) --deploy-url $(urlbase) --configuration production --stats-json
send:
	scp dist.tar.gz mdorgiakis@esperos.di.uoa.gr:~
opt:
	ng build --outputHashing=all --prod --aot --base-href $(urlbase) --deploy-url $(urlbase) --configuration remote-dev --build-optimizer
test:
	ng test --include="**\ll-update\*.ts"