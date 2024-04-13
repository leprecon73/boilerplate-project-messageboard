update:
	curl --compressed -o- -L https://yarnpkg.com/install.sh | bash
	npm install -g npm-check-updates
	npx browserslist --update-db && ncu -u && yarn
remove-lock-files:
	find . -name "package-lock.json" | xargs -I {} rm {}; \
	find . -name "yarn.lock" | xargs -I {} rm {};
