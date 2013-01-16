sencha -sdk ../extjs compile -classpath=../src \
  exclude -not -namespace Extnd and \
  concat ../builds/extnd4/extnd-all-debug-w-comments.js and \
  concat -strip ../builds/extnd4/extnd-all-debug.js and \
  concat -yui ../builds/extnd4/extnd-all.js