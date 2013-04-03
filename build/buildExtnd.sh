sencha -sdk ../extjs compile -classpath=../src \
  exclude -not -namespace Extnd and \
  concat ../builds/extnd4/extnd-all-debug-w-comments.js and \
  concat --strip-comments ../builds/extnd4/extnd-all-debug.js and \
  concat --yui ../builds/extnd4/extnd-all.js

echo "Copying resources and src...."
rm -rf ../builds/extnd4/resources
rm -rf ../builds/extnd4/src
mkdir -p ../builds/extnd4/resources
mkdir -p ../builds/extnd4/src
cp -R ../src/ ../builds/extnd4/src/
cp -R ../resources/ ../builds/extnd4/resources/

echo "BUILD COMPLETE"
