#!/bin/sh

jsbuilder=../jsbuilder/JSBuilder.sh
jsb3_path=../build/extnd.jsb3
output_path=../builds/

$jsbuilder -p $jsb3_path -d $output_path

tstamp=`date +%Y.%m.%d.%H%M`
echo "Build Completed: "$tstamp