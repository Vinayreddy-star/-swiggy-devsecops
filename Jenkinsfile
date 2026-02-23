pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "vinayreddy99/swiggy-devsecops:\${BUILD_NUMBER}"
        DOCKER_REPO = "vinayreddy99/swiggy-devsecops"
        DOCKER_CREDS = credentials('dockerhub')
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('NPM Install') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test || true'
            }
        }
        stage('Docker Build') {
            steps {
                sh "docker build -t \${DOCKER_IMAGE} ."
                sh "docker tag \${DOCKER_IMAGE} \${DOCKER_REPO}:latest"
            }
        }
        stage('Docker Login & Push') {
            steps {
                sh 'echo \$DOCKER_CREDS_PSW | docker login -u \$DOCKER_CREDS_USR --password-stdin'
                sh "docker push \${DOCKER_IMAGE}"
                sh "docker push \${DOCKER_REPO}:latest"
            }
        }
    }
    post {
        always {
            sh 'docker system prune -f || true'
            sh 'docker logout || true'
        }
    }
}
