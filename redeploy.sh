#!/bin/bash

echo "========================================"
echo "   REDÉPLOIEMENT MERN GCP - DÉMARRAGE"
echo "========================================"

PROJECT_ID="mern-devops-nouveau"     # ← nouveau projet
CLUSTER="mern-cluster"
ZONE="europe-west1-b"
REGISTRY="europe-west1-docker.pkg.dev/mern-devops-nouveau/mern-repo"

# Étape 1 — Configurer GCP
echo ">>> Étape 1/7 : Configuration GCP..."
gcloud config set project $PROJECT_ID

# Étape 2 — Créer le cluster
echo ">>> Étape 2/7 : Création du cluster GKE..."
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

# Étape 3 — Credentials kubectl
echo ">>> Étape 3/7 : Configuration kubectl..."
gcloud container clusters get-credentials $CLUSTER --zone=$ZONE

# Étape 4 — Déployer Kubernetes
echo ">>> Étape 4/7 : Déploiement Kubernetes..."
kubectl apply -f k8s/namespace.yaml
sleep 3
kubectl apply -f k8s/secrets.yaml
sleep 3
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/service-items.yaml
kubectl apply -f k8s/service-auth.yaml
kubectl apply -f k8s/service-health.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml

# Étape 5 — Attendre les pods
echo ">>> Étape 5/7 : Attente des pods..."
kubectl rollout status deployment/backend -n mern-prod
kubectl rollout status deployment/frontend -n mern-prod
kubectl rollout status deployment/service-items -n mern-prod
kubectl rollout status deployment/service-auth -n mern-prod
kubectl rollout status deployment/service-health -n mern-prod

# Étape 6 — Attendre l'IP
echo ">>> Étape 6/7 : Attente IP publique..."
for i in $(seq 1 30); do
  IP=$(kubectl get ingress mern-ingress -n mern-prod \
    -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
  if [ -n "$IP" ]; then break; fi
  echo "    Tentative $i/30 — attente 20s..."
  sleep 20
done

# Étape 7 — Résumé
echo ""
echo "========================================"
echo "   DÉPLOIEMENT TERMINÉ !"
echo "========================================"
echo "  Frontend  : http://$IP"
echo "  API Items : http://$IP/api/items/"
echo "  Auth      : http://$IP/auth/register"
echo "  Health    : http://$IP/health/"
echo "========================================"

kubectl get pods -n mern-prod
