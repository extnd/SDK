
echo "Build Bootstrap..."
sh buildBootstrap.sh 

echo "Create extnd-all*.js files..."
sencha -sdk ../extjs/WebContent compile -classpath=../ODP/WebContent/src \
  exclude -not -namespace Extnd and \
  concat ../ODP/WebContent/extnd-all-debug-w-comments.js and \
  concat --strip-comments ../ODP/WebContent/extnd-all-debug.js and \
  concat --yui ../ODP/WebContent/extnd-all.js

echo "Copying resources and src...."
rm -rf ../builds/extnd4/resources
rm -rf ../builds/extnd4/src
mkdir -p ../builds/extnd4/resources
mkdir -p ../builds/extnd4/src
cp -R ../ODP/WebContent/src/ ../builds/extnd4/src/
cp -R ../ODP/WebContent/resources/ ../builds/extnd4/resources/

cp ../ODP/WebContent/bootstrap.js ../builds/extnd4/
cp ../ODP/WebContent/extnd-all-debug-w-comments.js ../builds/extnd4/
cp ../ODP/WebContent/extnd-all-debug.js ../builds/extnd4/
cp ../ODP/WebContent/extnd-all.js ../builds/extnd4/
cp ../ODP/WebContent/extnd-dev.js ../builds/extnd4/

echo "BUILD COMPLETE"
