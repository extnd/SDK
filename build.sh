#!/bin/sh

java16_path=/System/Library/Frameworks/JavaVM.framework/Versions/1.6/Commands/java
jsbuilder_path=/Users/neflar/Documents/aps/JSBuilder2/JSBuilder2.jar
jsb2_path=/Users/neflar/Documents/aps/extnd/trunk/source/tbe.jsb2
output_path=/Users/neflar/Documents/aps/extnd/trunk/

$java16_path -jar $jsbuilder_path --projectFile $jsb2_path --homeDir $output_path