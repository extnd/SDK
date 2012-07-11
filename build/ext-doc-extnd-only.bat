set extDocJarFile="../ext-doc/ext-doc.jar"
set extDocXMLFile="documentation-extnd-only.xml"
set extDocTemplate="../ext-doc/template/ext/template.xml"
set outputFolder="build/docs-extnd-only"

java -jar %extDocJarFile% -p %extDocXMLFile% -o %outputFolder% -t %extDocTemplate%  -verbose
