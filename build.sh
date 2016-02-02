#!/bin/bash

#
# Compile script
# Created by: Lucas Diedrich
#

VER="unstable"
EXT="./display-switcher@lucas.diedrich.gmail.com"
SCHEMA="$EXT/schemas"
LOCALE="$EXT/locale"
LOCALES=$(ls ./locale/ | egrep .po$ | cut -d '.' -f1)

if [[ ! -z $1 ]]; then
	VER=$1
fi

echo "Compiling schema..."
rm -f SCHEMA/*.compiled
glib-compile-schemas $SCHEMA

echo "Compiling translations"

for i in $LOCALES; do
	msgfmt -v ./locale/$i.po -o $LOCALE/$i/LC_MESSAGES/gnome-shell-extension-display-switcher.mo
done

echo "Compacting in tar.gz and zip"
filename="display-switcher-$VER"
tar -zcvf $filename.tar.gz $EXT
zip -r $filename.zip $EXT/*
echo "Done"