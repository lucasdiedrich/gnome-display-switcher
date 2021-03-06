#!/bin/bash

#
# This scripts install an aewsome display switcher for Gnome 
# shell 3.12+. Read the specs over: 
# https://github.com/lucasdiedrich/gnome-display-switcher/
# Created by: Lucas Diedrich
# Date: 21/01/15
#
clear
#
# Variables
#
v_extfolder=~/.local/share/gnome-shell/extensions/
v_file="display-switcher-latest.tar.gz"

#
# Install Area
#
mkdir -p $v_extfolder
echo "Entering local Gnome Shell Extensions folder..."
cd $v_extfolder

echo "Downloading zip file..."
wget -O $v_file https://github.com/lucasdiedrich/gnome-display-switcher/raw/master/$v_file

echo "Extracting extension..."
tar -zxvf $v_file
rm -f $v_file

rm -- "$0"
echo "Done!"
