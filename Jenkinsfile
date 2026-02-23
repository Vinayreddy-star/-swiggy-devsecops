pipeline {
  agent any
  tools { nodejs 'Node18' }
  environment {
    IMAGE_NAME = 'vinayreddy99/swiggy-devsecops'
    DOCKERHUB_CREDENTIALS = credentials('dockerhub')
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('NPM Install') { steps { sh 'npm ci' } }
    stage('Test') { steps { sh 'npm test' } }
    stage('Docker Build') {
      steps { sh "docker build -t ${IMAGE_NAME}:\${BUILD_NUMBER} . && docker tag ${IMAGE_NAME}:\${BUILD_NUMBER} ${IMAGE_NAME}:latest" }
    }
 stage('Trivy SCA') {
      steps {
        sh '''
          docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v /data/trivy-cache:/root/.cache/trivy \
            aquasec/trivy:latest image \
            --exit-code 0 --no-progress --format table \
            vinayreddy99/swiggy-devsecops:${BUILD_NUMBER} \
            -o trivy-report.txt
          cat trivy-report.txt
        '''
      }
      post { 
        always { 
          archiveArtifacts 'trivy-report.txt'
          
                      keepAll: true, reportDir: '.', reportFiles: 'trivy-report.txt'])
 }
      }
    }
    stage('DockerHub Push') {
      steps {
        sh '''
          echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
          docker push vinayreddy99/swiggy-devsecops:${BUILD_NUMBER}
          docker push vinayreddy99/swiggy-devsecops:latest
        '''
      }
    }
  }
  post { always { sh 'docker system prune -f; docker logout || true' } }
}
