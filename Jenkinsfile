pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "vinayreddy99/swiggy-devsecops:\${env.BUILD_NUMBER}"
        DOCKER_REPO = "vinayreddy99/swiggy-devsecops"
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
                script {
                    def image = "vinayreddy99/swiggy-devsecops:\${env.BUILD_NUMBER}"
                    sh "docker build -t \${image} ."
                    sh "docker tag \${image} ${DOCKER_REPO}:latest"
                }
            }
        }
        stage('Docker Login & Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push \${DOCKER_IMAGE}"
                    sh "docker push ${DOCKER_REPO}:latest"
                }
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
