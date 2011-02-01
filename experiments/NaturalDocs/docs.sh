#! /bin/sh

NATURALDOCS="NaturalDocs"

NATURALDOCS_LOCATION=`which $NATURALDOCS`
if [ "$NATURALDOCS_LOCATION" = "" ]; then
	echo "executable '$NATURALDOCS' not found"
	echo "Please download from http://www.naturaldocs.org/"
	exit 1
fi

# Find the directory
SCRIPT_LOCATION=$(dirname $(readlink -f $0))

ND_PROJECT="$SCRIPT_LOCATION/project"
ND_OUTPUT="$SCRIPT_LOCATION/naturaldocs"
ND_SOURCE="$SCRIPT_LOCATION/../util"
ND_FORMAT=HTML

if [ ! -d "$ND_PROJECT" ]; then
	mkdir -p "$ND_PROJECT"
fi

if [ ! -d "$ND_OUTPUT" ]; then
	mkdir -p "$ND_OUTPUT"
fi

$NATURALDOCS --project $ND_PROJECT --input $ND_SOURCE --output $ND_FORMAT $ND_OUTPUT --rebuild-output
