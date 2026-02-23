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
 mkdir -p /data/trivy-report
          docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v /data/trivy-cache:/root/.cache/trivy \
            aquasec/trivy:latest image \
            --exit-code 0 --no-progress --format json \
            vinayreddy99/swiggy-devsecops:${BUILD_NUMBER} \
            > /data/trivy-report/trivy-${BUILD_NUMBER}.json
          docker run --rm \
            -v /data/trivy-report:/data/trivy-report \
            aquasec/trivy:latest image \
            --format template --template "@/usr/share/trivy/templates/html.tpl" \
            --input /data/trivy-report/trivy-${BUILD_NUMBER}.json \
            -o /data/trivy-report/trivy-${BUILD_NUMBER}.html
          ls -la /data/trivy-report/
        '''
      }
      post { 
        always { 
 archiveArtifacts artifacts: '**/trivy-*.json trivy-*.html', allowEmptyArchive: true 
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
