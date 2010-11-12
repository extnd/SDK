#!/bin/sh

jsbuilder=/Users/neflar/Documents/aps/Extnd/jsbuilder/JSBuilder.sh
jsb3_path=/Users/neflar/Documents/aps/Extnd/source/extnd.jsb3
output_path=/Users/neflar/Documents/aps/Extnd/build/

$jsbuilder -p $jsb3_path -d $output_path

tstamp=`date +%Y.%m.%d.%H%M`
echo "Build Completed: "$tstamp