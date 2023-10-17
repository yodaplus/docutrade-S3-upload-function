rm -rf ./dist
rm -rf ./dist.zip
# execute tsc
tsc
# copy package.json to dist
cp ./package-lambda.json ./dist/package.json
cp ./package-lock-lambda.json ./dist/package-lock.json

# install dependencies
cd ./dist
npm install 

# zip dist
zip -r ../dist.zip .