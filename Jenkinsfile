pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                echo 'Cloning repo...'
                checkout scm
            }
        }
        stage('NPM Install & Test') {
            steps {
                sh 'npm install'
                sh 'npm test || true'
            }
        }
        stage('Docker Build') {
            steps {
                sh 'docker build -t vinayreddy99/swiggy-devsecops:${BUILD_NUMBER} .'
            }
        }
        stage('Docker Push') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
                        sh "docker tag vinayreddy99/swiggy-devsecops:${BUILD_NUMBER} vinayreddy99/swiggy-devsecops:latest"
                        sh "docker push vinayreddy99/swiggy-devsecops:${BUILD_NUMBER}"
                        sh 'docker push vinayreddy99/swiggy-devsecops:latest'
                    }
                }
            }
        }
    }
    post {
        success {
            echo 'Pipeline SUCCESS! Check DockerHub.'
        }
    }
}
