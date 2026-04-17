pipeline {
  agent any

  environment {
    IMAGE_NAME = "sriganesh15/nextjs-app"
    IMAGE_TAG = "${BUILD_NUMBER}"
    
  }

  stages {

    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/sri-ganesh15/Blissmet.git'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG .'
      }
    }

    stage('Login to Docker Registry') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'Ganesh_DockerId',
          usernameVariable: 'USER',
          passwordVariable: 'PASS'
        )]) {
          sh 'echo $PASS | docker login -u $USER --password-stdin'
        }
      }
    }

    stage('Push Image') {
      steps {
        sh 'docker push $IMAGE_NAME:$IMAGE_TAG'
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
         sh """
          kubectl apply -f K8s/Secrets.yaml
          envsubst < K8s/Deployment.yaml  | kubectl apply -f -
          kubectl apply -f K8s/Service.yaml
        """
      }
    }
  }
}
