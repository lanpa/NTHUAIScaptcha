#!/bin/bash

dst="../main.js"

echo "// ==UserScript==
// @name        NTHUAIScaptcha
// @description De captcha for ccxp
// @match       *//www.ccxp.nthu.edu.tw/ccxp/INQUIRE/
// ==/UserScript==

//{{{
var jsonObj = " > $dst
cat network.json >> $dst
sed -i'.bak' -e "$ s/$/;/" $dst

echo -e "//}}}\n\n//{{{" >> $dst
cat convnet-min.js >> $dst
echo "//}}}" >> $dst

cat AISdecap.js >> $dst

rm $dst.bak
