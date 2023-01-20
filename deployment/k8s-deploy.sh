#!/bin/bash
export IMAGE_TAG=v3.0
export IMAGE_ORGANISATION=andyjmaclean
export IMAGE_NAME=statistics-dashboard-app-image

# Default context / delete / target
export CONTEXT=minikube
export DELETE=false
export TARGET=local

# Override default context / delete / target
while getopts ":c:dt:" o; do
  case "${o}" in
    c)
      CONTEXT=${OPTARG}
      ;;
    d)
      DELETE=true
      ;;
    t)
      TARGET=${OPTARG}
      ;;
  esac
done
shift $((OPTIND-1))
echo "CONTEXT = ${CONTEXT}, DELETE = ${DELETE}, TARGET = ${TARGET}"

# If deleting then delete and exit
if $DELETE;
then
  kubectl --context $CONTEXT delete -k deployment/$TARGET/
  exit 0;
fi

# Update deployment.yaml with IMAGE variables
sed -i "s/IMAGE_TAG/$IMAGE_TAG/g" deployment/$TARGET/deployment.yaml
sed -i "s/IMAGE_ORGANISATION/$IMAGE_ORGANISATION/g" deployment/$TARGET/deployment.yaml
sed -i "s/IMAGE_NAME/$IMAGE_NAME/g" deployment/$TARGET/deployment.yaml

# Run deployment.yaml
kubectl --context $CONTEXT apply -k deployment/$TARGET/

# Restore deployment.yaml
git checkout deployment/$TARGET/deployment.yaml
