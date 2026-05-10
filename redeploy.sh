#!/bin/bash

echo "========================================"
echo "   REDÉPLOIEMENT MERN GCP"
echo "========================================"

PROJECT_ID="mern-devops-nouveau"
CLUSTER="mern-cluster"
ZONE="europe-west1-b"
REGISTRY="europe-west1-docker.pkg.dev/mern-devops-nouveau/mern-repo"

# Étape 1 — Configurer GCP
echo ""
echo ">>> Étape 1/8 : Configuration GCP..."
gcloud config set project $PROJECT_ID

# Étape 2 — Créer le cluster seulement s'il n'existe pas
echo ""
echo ">>> Étape 2/8 : Vérification du cluster GKE..."
CLUSTER_EXISTS=$(gcloud container clusters list \
  --zone=$ZONE \
  --filter="name=$CLUSTER" \
  --format="value(name)" 2>/dev/null)

if [ -z "$CLUSTER_EXISTS" ]; then
  echo "    Cluster inexistant — création en cours (8-10 min)..."
  gcloud container clusters create $CLUSTER \
    --zone=$ZONE \
    --num-nodes=3 \
    --min-nodes=2 \
    --max-nodes=10 \
    --enable-autoscaling \
    --machine-type=e2-medium \
    --disk-size=50GB \
    --enable-autorepair \
    --enable-autoupgrade \
    --quiet
else
  echo "    Cluster déjà existant — on continue..."
fi

# Étape 3 — Credentials kubectl
echo ""
echo ">>> Étape 3/8 : Configuration kubectl..."
gcloud container clusters get-credentials $CLUSTER --zone=$ZONE

# Étape 4 — Builder et pusher les images
echo ""
echo ">>> Étape 4/8 : Build et Push des images Docker..."
gcloud auth configure-docker europe-west1-docker.pkg.dev --quiet

docker build -t $REGISTRY/frontend:latest ~/mern-gcp/client
docker push $REGISTRY/frontend:latest

docker build -t $REGISTRY/backend:latest ~/mern-gcp/server
docker push $REGISTRY/backend:latest

docker build -t $REGISTRY/service-items:latest ~/mern-gcp/services/service-items
docker push $REGISTRY/service-items:latest

docker build -t $REGISTRY/service-auth:latest ~/mern-gcp/services/service-auth
docker push $REGISTRY/service-auth:latest

docker build -t $REGISTRY/service-health:latest ~/mern-gcp/services/service-health
docker push $REGISTRY/service-health:latest

# Étape 5 — Déployer Kubernetes
echo ""
echo ">>> Étape 5/8 : Déploiement Kubernetes..."
kubectl apply -f ~/mern-gcp/k8s/namespace.yaml
sleep 5
kubectl apply -f ~/mern-gcp/k8s/secrets.yaml
sleep 3
kubectl apply -f ~/mern-gcp/k8s/frontend-deployment.yaml
kubectl apply -f ~/mern-gcp/k8s/backend-deployment.yaml
kubectl apply -f ~/mern-gcp/k8s/service-items.yaml
kubectl apply -f ~/mern-gcp/k8s/service-auth.yaml
kubectl apply -f ~/mern-gcp/k8s/service-health.yaml
kubectl apply -f ~/mern-gcp/k8s/hpa.yaml
kubectl apply -f ~/mern-gcp/k8s/ingress.yaml

# Étape 6 — Attendre les pods
echo ""
echo ">>> Étape 6/8 : Attente des pods..."
kubectl rollout status deployment/frontend -n mern-prod --timeout=300s
kubectl rollout status deployment/backend -n mern-prod --timeout=300s
kubectl rollout status deployment/service-items -n mern-prod --timeout=300s
kubectl rollout status deployment/service-auth -n mern-prod --timeout=300s
kubectl rollout status deployment/service-health -n mern-prod --timeout=300s

# Étape 7 — Attendre l'IP publique
echo ""
echo ">>> Étape 7/8 : Attente IP publique (3-5 min)..."
IP=""
for i in $(seq 1 30); do
  IP=$(kubectl get ingress mern-ingress -n mern-prod \
    -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
  if [ -n "$IP" ]; then
    echo "    IP obtenue : $IP"
    break
  fi
  echo "    Tentative $i/30 — attente 20s..."
  sleep 20
done

# Étape 8 — Résumé
echo ""
echo "========================================"
echo "   DÉPLOIEMENT TERMINÉ !"
echo "========================================"
echo ""
echo "  Frontend    : http://$IP"
echo "  API Items   : http://$IP/api/items/"
echo "  Auth        : http://$IP/auth/register"
echo "  Health      : http://$IP/health/"
echo ""
kubectl get pods -n mern-prod
echo ""
kubectl get ingress -n mern-prod
echo "========================================"
