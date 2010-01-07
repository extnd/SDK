set extDocJarFile="../ext-doc/ext-doc.jar"
set extDocXMLFile="documentation.xml"
set extDocTemplate="../ext-doc/template/ext/template.xml"
set outputFolderOLD="C:/Program Files/lotus/notes/data/domino/html/extnd-docs"
set outputFolder="build/docs"

java -jar %extDocJarFile% -p %extDocXMLFile% -o %outputFolder% -t %extDocTemplate%  -verbose
