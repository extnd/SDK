jsduck \
  ../src \
  ../extjs-4.1.3/src \
  -o ../builds/docs \
  --title="Extnd SDK for ExtJS 4.x" \
  --welcome="../doc_src/welcome.html"

rm -rf ../../ExtndDocs/docs/docs4
cp -R ../builds/docs ../../ExtndDocs/docs/docs4
