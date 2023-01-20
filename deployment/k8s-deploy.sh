#!/bin/bash
export IMAGE_TAG=v3.0
export IMAGE_ORGANISATION=andyjmaclean
export IMAGE_NAME=statistics-dashboard-app-image
# TODO override with command line
export CONTEXT=minikube
export TARGET=local

# Utility to read command line arguments
has_param() {
  local term="$1"
  shift
  for arg; do
    if [[ $arg == "$term" ]]; then
      return 0
    fi
  done
  return 1
}

if has_param '-target=test' "$@"; then
  TARGET=test
elif has_param '-target=acceptance' "$@"; then
  TARGET=acceptance
elif has_param '-target=production' "$@"; then
  TARGET=production
  echo "in production"
elif ! has_param '-target=test' "$@"; then
  echo "in local"
fi

# If deleting then delete and exit
if has_param '--delete' "$@"; then
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
