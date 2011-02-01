#!/bin/sh

jsbuilder=jsbuilder/JSBuilder.sh
jsb3_path=source/extnd.jsb3
output_path=build/

$jsbuilder -p $jsb3_path -d $output_path

tstamp=`date +%Y.%m.%d.%H%M`
echo "Build Completed: "$tstamp