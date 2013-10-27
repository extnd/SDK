jsduck \
  ../src \
  ../extjs/src \
  -o ../builds/docs \
  --title="Extnd SDK for ExtJS 4.x" \
  --welcome="../doc_src/welcome.html" \
  --eg-iframe="../doc_src/eg-iframe.html" \
  --images ../extjs/docs/images \
  --images ../doc_src/images \
  --builtin-classes \
  --external XMLHttpRequest \

rm -rf ../builds/docs/extnd
mkdir -p ../builds/docs/extnd
cp -R ../builds/extnd-all.js ../builds/docs/extnd/
cp -R ../builds/resources ../builds/docs/extnd/resources

rm -rf ../../ExtndDocs/docs/docs4
cp -R ../builds/docs ../../ExtndDocs/docs/docs4
