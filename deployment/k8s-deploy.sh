#!/bin/bash
export IMAGE_TAG=v3.0
export IMAGE_ORGANISATION=andyjmaclean
export IMAGE_NAME=statistics-dashboard-app-image
# TODO override with command line
export CONTEXT=minikube

if echo $* | grep -e "--delete" -q
then
  kubectl --context $CONTEXT delete -k deployment/local/
  exit 0;
fi

# Update deployment.yaml with IMAGE variables
sed -i "s/IMAGE_TAG/$IMAGE_TAG/g" deployment/local/deployment.yaml
sed -i "s/IMAGE_ORGANISATION/$IMAGE_ORGANISATION/g" deployment/local/deployment.yaml
sed -i "s/IMAGE_NAME/$IMAGE_NAME/g" deployment/local/deployment.yaml

kubectl --context $CONTEXT apply -k deployment/local/

# TODO parameterise namespace
#   by changing in kustomize.yaml files under test / acceptance / production 
git checkout deployment/local/deployment.yaml
