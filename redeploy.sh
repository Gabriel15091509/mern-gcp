#!/bin/bash

echo "========================================"
echo "   REDÉPLOIEMENT MERN GCP - DÉMARRAGE"
echo "========================================"

# ── Variables ────────────────────────────────
PROJECT_ID="mern-devops-1774711262"
CLUSTER="mern-cluster"
ZONE="europe-west1-b"
REGION="europe-west1"

# ── Étape 1 : Configurer le projet GCP ───────
echo ""
echo ">>> Étape 1/7 : Configuration GCP..."
gcloud config set project $PROJECT_ID

# ── Étape 2 : Recréer le cluster GKE ─────────
echo ""
echo ">>> Étape 2/7 : Création du cluster GKE (8-10 min)..."
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

# ── Étape 3 : Récupérer les credentials ──────
echo ""
echo ">>> Étape 3/7 : Configuration kubectl..."
gcloud container clusters get-credentials $CLUSTER \
  --zone=$ZONE

# ── Étape 4 : Déployer les manifestes K8s ────
echo ""
echo ">>> Étape 4/7 : Déploiement Kubernetes..."
kubectl apply -f k8s/namespace.yaml
sleep 3
kubectl apply -f k8s/secrets.yaml
sleep 3
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml

# ── Étape 5 : Attendre que les pods démarrent
echo ""
echo ">>> Étape 5/7 : Attente des pods..."
kubectl rollout status deployment/backend -n mern-prod
kubectl rollout status deployment/frontend -n mern-prod

# ── Étape 6 : Attendre l'IP publique ─────────
echo ""
echo ">>> Étape 6/7 : Attente de l'IP publique (3-5 min)..."
echo "    Patienter..."
for i in $(seq 1 30); do
  IP=$(kubectl get ingress mern-ingress -n mern-prod \
    -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
  if [ -n "$IP" ]; then
    break
  fi
  echo "    Tentative $i/30 — pas encore d'IP, attente 20s..."
  sleep 20
done

# ── Étape 7 : Résumé final ───────────────────
echo ""
echo "========================================"
echo "   DÉPLOIEMENT TERMINÉ !"
echo "========================================"
echo ""
echo "  IP publique    : http://$IP"
echo "  Frontend       : http://$IP"
echo "  Backend API    : http://$IP/api/health"
echo ""
echo "  Cluster        : $CLUSTER"
echo "  Zone           : $ZONE"
echo "  Projet GCP     : $PROJECT_ID"
echo ""
kubectl get pods -n mern-prod
echo ""
kubectl get hpa -n mern-prod
echo ""
echo "  Bonne démonstration !"
echo "========================================"
