set extDocJarFile="../ext-doc/ext-doc.jar"
set extDocXMLFile="documentation.xml"
set extDocTemplate="../ext-doc/template/ext/template.xml"
set outputFolder="build/docs-all"

java -jar %extDocJarFile% -p %extDocXMLFile% -o %outputFolder% -t %extDocTemplate%  -verbose
