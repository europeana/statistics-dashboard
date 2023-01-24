#!/bin/bash
export IMAGE_FULL_VALUE=andyjmaclean/statistics-dashboard-app-image:v3.0

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

# Update deployment.yaml with IMAGE variable
sed -i "s,IMAGE_FULL_VALUE,$IMAGE_FULL_VALUE,g" deployment/$TARGET/deployment.yaml

# Run deployment.yaml
kubectl --context $CONTEXT apply -k deployment/$TARGET/

# Restore deployment.yaml
git checkout deployment/$TARGET/deployment.yaml
