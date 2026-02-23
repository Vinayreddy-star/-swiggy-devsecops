pipeline {
  agent any
  tools { nodejs 'Node18' }
  environment {
    IMAGE_NAME = 'vinayreddy99/swiggy-devsecops'
    DOCKERHUB_CREDENTIALS = credentials('dockerhub')
    TRIVY_CACHE = '/data/trivy-cache'
    TRIVY_REPORT = '/data/trivy-report'
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
        sh """
          mkdir -p ${TRIVY_REPORT}
          docker run --rm \\
            -v /var/run/docker.sock:/var/run/docker.sock \\
            -v ${TRIVY_CACHE}:/root/.cache/ \\
            aquasec/trivy:latest image \\
            --severity HIGH,CRITICAL --no-progress \\
            --format json -o ${TRIVY_REPORT}/trivy-report-\${BUILD_NUMBER}.json \\
            ${IMAGE_NAME}:\${BUILD_NUMBER}
        """
        archiveArtifacts artifacts: "${TRIVY_REPORT}/trivy-report-*.json", allowEmptyArchive: true
        sh """
          cat ${TRIVY_REPORT}/trivy-report-\${BUILD_NUMBER}.json | jq '.Results[] | select(.Vulnerabilities != null) | length' || echo 'No HIGH/CRIT vulns'
        """
      }
    }
    stage('DockerHub Push') {
      steps {
        sh """
          echo \${DOCKERHUB_CREDENTIALS_PSW} | docker login -u \${DOCKERHUB_CREDENTIALS_USR} --password-stdin
          docker push ${IMAGE_NAME}:\${BUILD_NUMBER}
          docker push ${IMAGE_NAME}:latest
        """
      }
    }
    stage('SAST - SonarQube') { steps { echo 'SonarQube: Uncomment after setup' } }
    stage('Deploy') { steps { echo 'Deploy: docker run -p 3000:3000 ...' } }
  }
  post { always { sh 'docker system prune -f; docker logout || true' } }
}
