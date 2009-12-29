set extDocJarFile="../ext-doc/ext-doc.jar"
set extDocXMLFile="documentation.xml"
set extDocTemplate="../ext-doc/template/ext/template.xml"
set outputFolder="C:/Program Files/lotus/notes/data/domino/html/extnd-docs"

java -jar %extDocJarFile% -p %extDocXMLFile% -o %outputFolder% -t %extDocTemplate%  -verbose
