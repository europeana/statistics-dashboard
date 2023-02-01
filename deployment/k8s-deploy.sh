#!/bin/bash

# Set default context / delete / image / target
CONTEXT=minikube
DELETE=false
APP_IMAGE=
TARGET=local
UTILISATION_AVERAGE_PERCENT=50

# Set default replicas min / max
MIN_REPLICAS=3
MAX_REPLICAS=5

# Set files to modify
HPA_FILE=deployment/$TARGET/hpa.yaml
DEPLOYMENT_FILE=deployment/$TARGET/deployment.yaml

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
  echo "${REV}-u${NORM}  --Sets the desired resource ${BOLD}utilisation${NORM} average. The default is ${BOLD}${UTILISATION_AVERAGE_PERCENT}${NORM}(%)."
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
      APP_IMAGE=${OPTARG}
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
if [ -z "$APP_IMAGE" ];
then
  echo "usage: an image must be set with the -i parameter"
  exit 1;
fi

# Check for invalid min-max replicas or an invalid utilisation average
re='^[0-9]+$'
if ! [[ $MIN_REPLICAS =~ $re && $MAX_REPLICAS =~ $re ]] ; then
  echo "usage: the -r parameter should be two integers separated by a dash"
  exit 1;
fi
if ! [[ $UTILISATION_AVERAGE_PERCENT =~ $re ]] ; then
  echo "usage: the -u parameter should be an integer"
  exit 1;
fi

echo "Will run deploy with the parameters:"
echo "  - ${BOLD}CONTEXT${NORM} = ${CONTEXT}"
echo "  - ${BOLD}DELETE${NORM} = ${DELETE}"
echo "  - ${BOLD}APP_IMAGE${NORM} = ${APP_IMAGE}"
echo "  - ${BOLD}MAX_REPLICAS${NORM} = ${MAX_REPLICAS}"
echo "  - ${BOLD}MIN_REPLICAS${NORM} = ${MIN_REPLICAS}"
echo "  - ${BOLD}TARGET${NORM} = ${TARGET}"
echo "  - ${BOLD}UTILISATION_AVERAGE_PERCENT${NORM} = ${UTILISATION_AVERAGE_PERCENT}"

# Modify files deployment.yaml and hpa.yaml with variable data
sed -i "s,\$APP_IMAGE,$APP_IMAGE,g" $DEPLOYMENT_FILE
cat $DEPLOYMENT_FILE

REPLACEMENTS=(MAX_REPLICAS MIN_REPLICAS UTILISATION_AVERAGE_PERCENT)
for REPLACE in "${REPLACEMENTS[@]}"
do
  sed -i "s,\$${REPLACE},${!REPLACE},g" $HPA_FILE
done
cat $HPA_FILE

# Delete or apply
if $DELETE;
then
  kubectl --context $CONTEXT delete -k deployment/$TARGET/
else
  kubectl --context $CONTEXT apply -k deployment/$TARGET/
fi

# Restore files deployment.yaml and hpa.yaml
#git checkout $HPA_FILE
#git checkout $DEPLOYMENT_FILE
