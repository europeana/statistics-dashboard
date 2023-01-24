#!/bin/bash

# Set default context / delete / image / target
export CONTEXT=minikube
export DELETE=false
export IMAGE_FULL_VALUE=
export TARGET=local

# Track numnber of arguments supplied
export NUMARGS=$#

# Set variables for help
SCRIPT=`basename ${BASH_SOURCE[0]}`
NORM=`tput sgr0`
BOLD=`tput bold`
REV=`tput smso`

function HELP {
  echo -e \\n"Help documentation for ${BOLD}${SCRIPT}.${NORM}"\\n
  echo -e "${REV}Basic usage:${NORM} ${BOLD}$SCRIPT -i image${NORM}"\\n
  echo "The following optional parameters are recognised:"
  echo "${REV}-c${NORM}  --Sets the ${BOLD}context${NORM}. The default is ${BOLD}${CONTEXT}${NORM}."
  echo "${REV}-d${NORM}  --Sets the ${BOLD}delete${NORM} flag. The default is ${BOLD}${DELETE}${NORM}."
  echo "${REV}-t${NORM}  --Sets the ${BOLD}target${NORM}. The default is ${BOLD}${TARGET}${NORM}."
  echo -e "${REV}-h${NORM}  --Displays this help message. No further functions are performed."\\n
  echo -e "Example: ${BOLD}$SCRIPT -i dockerhub/myImage:version -d -c myCluster -t acceptance${NORM}"\\n
  exit 1
}

if [ $NUMARGS -eq 0 ]; then
  HELP
fi

# Check for missing parameter values
while getopts "c:dhi:t:" opt; do
  case $opt in
    d) ;;
    h) ;;
    *)
      if [ -z "$OPTARG" ];
      then
        # missing option
        exit 1;
      fi
    ;;
  esac
done

# Reset args and override default context / delete / target / image
OPTIND=1
while getopts ":c:dhi:t:" o; do
  case "${o}" in
    c)
      CONTEXT=${OPTARG}
      ;;
    d)
      DELETE=true
      ;;
    h)
      HELP
      ;;
    i)
      IMAGE_FULL_VALUE=${OPTARG}
      ;;
    t)
      TARGET=${OPTARG}
      ;;
  esac
done

shift $((OPTIND-1))

# Check for unset image
if [ -z "$IMAGE_FULL_VALUE" ];
then
  echo "usage: an image must be set with the -i parameter"
  exit 0;
fi

echo "Will run deploy with the parameters:"
echo "  - ${BOLD}CONTEXT${NORM} = ${CONTEXT}"
echo "  - ${BOLD}DELETE${NORM} = ${DELETE}"
echo "  - ${BOLD}IMAGE_FULL_VALUE${NORM} = ${IMAGE_FULL_VALUE}"
echo "  - ${BOLD}TARGET${NORM} = ${TARGET}"

# Update deployment.yaml with IMAGE variable
sed -i "s,IMAGE_FULL_VALUE,$IMAGE_FULL_VALUE,g" deployment/$TARGET/deployment.yaml

if $DELETE;
then
  # If deleting then delete
  kubectl --context $CONTEXT delete -k deployment/$TARGET/
else
  # Run deployment.yaml
  kubectl --context $CONTEXT apply -k deployment/$TARGET/
fi

# Restore deployment.yaml
git checkout deployment/$TARGET/deployment.yaml
