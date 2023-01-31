#!/bin/bash

# Set default context / delete / image / target
CONTEXT=minikube
DELETE=false
IMAGE_FULL_VALUE=
TARGET=local
UTILISATION_AVERAGE_PERCENT=50

# Set replicas min / max
MIN_REPLICAS=3
MAX_REPLICAS=5

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
  echo "${REV}-r${NORM}  --Sets the ${BOLD}replica${NORM} ${BOLD}min-max${NORM}. The default is ${BOLD}${MIN_REPLICAS}-${MAX_REPLICAS}${NORM}."
  echo "${REV}-t${NORM}  --Sets the ${BOLD}target${NORM}. The default is ${BOLD}${TARGET}${NORM}."
  echo "${REV}-t${NORM}  --Sets the desired resource ${BOLD}utilisation${NORM} average. The default is ${BOLD}${UTILISATION_AVERAGE_PERCENT}${NORM}(%)."
  echo -e "${REV}-h${NORM}  --Displays this ${BOLD}help${NORM} message. No further functions are performed."\\n
  echo -e "Example: ${BOLD}$SCRIPT -i dockerhub/myImage:version -d -c myCluster -r 3-12 -t acceptance${NORM}"\\n
  exit 1
}

if [ $NUMARGS -eq 0 ]; then
  HELP
fi

# Check for missing parameter values
while getopts "c:dhr:i:t:u:" opt; do
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
while getopts ":c:dhr:i:t:u:" o; do
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
    r)
      ARR=(${OPTARG//-/ })
      MIN_REPLICAS="${ARR[0]}"
      MAX_REPLICAS="${ARR[1]}"
      ;;
    t)
      TARGET=${OPTARG}
      ;;
    u)
      UTILISATION_AVERAGE_PERCENT=${OPTARG}
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
echo "  - ${BOLD}MAX_REPLICAS${NORM} = ${MAX_REPLICAS}"
echo "  - ${BOLD}MIN_REPLICAS${NORM} = ${MIN_REPLICAS}"
echo "  - ${BOLD}TARGET${NORM} = ${TARGET}"
echo "  - ${BOLD}UTILISATION_AVERAGE_PERCENT${NORM} = ${UTILISATION_AVERAGE_PERCENT}"

# Update deployment.yaml with IMAGE variable
sed -i "s,IMAGE_FULL_VALUE,$IMAGE_FULL_VALUE,g" deployment/$TARGET/deployment.yaml

# Update hda.yaml with MAX / MIN replicas
sed -i "s,MAX_REPLICAS,$MAX_REPLICAS,g" deployment/$TARGET/hpa.yaml
sed -i "s,MIN_REPLICAS,$MIN_REPLICAS,g" deployment/$TARGET/hpa.yaml

# Update hda.yaml with UTILISATION_AVERAGE_PERCENT
sed -i "s,UTILISATION_AVERAGE_PERCENT,$UTILISATION_AVERAGE_PERCENT,g" deployment/$TARGET/hpa.yaml

if $DELETE;
then
  # If deleting then delete
  kubectl --context $CONTEXT delete -k deployment/$TARGET/
else
  # Run deployment.yaml
  kubectl --context $CONTEXT apply -k deployment/$TARGET/
fi

# Restore deployment.yaml /  hpa.yaml
git checkout deployment/$TARGET/deployment.yaml
git checkout deployment/$TARGET/hpa.yaml
