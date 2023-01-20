#!/bin/bash
export IMAGE_TAG=v3.0
export IMAGE_ORGANISATION=andyjmaclean
export IMAGE_NAME=statistics-dashboard-app-image

#IMAGE_NAME
sed -i "s/IMAGE_TAG/$IMAGE_TAG/g" deployment/local/deployment.yaml
sed -i "s/IMAGE_ORGANISATION/$IMAGE_ORGANISATION/g" deployment/local/deployment.yaml
sed -i "s/IMAGE_NAME/$IMAGE_NAME/g" deployment/local/deployment.yaml

# TODO conditional delete
# TODO parameterise context
# TODO parameterise namespace
# TODO duplicate all this in test / acceptance / production folders

#kubectl --context minikube delete -k deployment/local/
kubectl --context minikube apply -k deployment/local/

git checkout deployment/local/deployment.yaml
