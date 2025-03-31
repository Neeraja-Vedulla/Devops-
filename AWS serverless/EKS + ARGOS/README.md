# 🚀 EKS + ArgoCD Guestbook Deployment


This project demonstrates a complete GitOps-based Kubernetes deployment using Amazon EKS, ArgoCD, and Terraform. The popular Guestbook application is deployed and managed through ArgoCD, showcasing automated synchronization and infrastructure-as-code principles.

---

## 🧱 Tech Stack

Amazon EKS – Managed Kubernetes cluster on AWS
Terraform – Infrastructure provisioning (EKS cluster, IAM roles, etc.)
ArgoCD – GitOps continuous deployment tool for Kubernetes
Kubernetes – Container orchestration platform
Guestbook App – Sample frontend app to demonstrate K8s deployments

 1. Provision EKS Cluster
cd terraform
terraform init
terraform apply

2. Install ArgoCD in Cluster

kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

3. Port Forward ArgoCD UI

kubectl port-forward svc/argocd-server -n argocd 8080:443

4.Login via CLI

argocd login localhost:8080

5. Apply ArgoCD App Manifest


kubectl apply -f k8s-manifests/argocd-app.yaml

6. Access the Guestbook App

kubectl port-forward svc/guestbook-ui 8081:80



