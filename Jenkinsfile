pipeline {
    agent any
    stages {
        stage('Checkout') { steps { checkout scm } }
        stage('NPM Install') { steps { sh 'npm ci' } }
        stage('Test') { steps { sh 'npm test || true' } }
        stage('Docker Build') {
            steps {
                sh 'docker build -t vinayreddy99/swiggy-devsecops:$BUILD_NUMBER .'
                sh 'docker tag vinayreddy99/swiggy-devsecops:$BUILD_NUMBER vinayreddy99/swiggy-devsecops:latest'
            }
        }
stage('Trivy Security Scan') {
            steps {
                sh 'docker run --rm aquasec/trivy:latest image --exit-code 0 --no-progress vinayreddy99/swiggy-devsecops:$BUILD_NUMBER'
            }
        }
        stage('Docker Login & Push') {
            steps {
withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh 'docker push vinayreddy99/swiggy-devsecops:$BUILD_NUMBER'
                    sh 'docker push vinayreddy99/swiggy-devsecops:latest'
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
