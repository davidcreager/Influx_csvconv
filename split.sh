# !/bin/bash


if [[ -z $1 ]];
then 
    echo "No parameters passed."
	exit 1
fi
directory=${1%/*}
fname="$(basename "${1}")"
filename="${fname%.*}"
inputFile=$1
outputFile=""
if [[ -z $2 ]];
then 
    echo "Outputfile not set"
	outputFile=${directory}/TestTemp.txt
else
    outputFile=$2
fi

echo "filename is $filename, directory is $directory, inputfile is $inputFile, outputFile is $outputFile"
node index.js $inputFile $outputFile
split -l 100000 $outputFile ${filename}_part_ --verbose
#cp and mv dont work no idea why
echo Execute this move    mv ./${filename}_part_\* ${directory}/
#cp ./${filename}_part_\* ${directory}/