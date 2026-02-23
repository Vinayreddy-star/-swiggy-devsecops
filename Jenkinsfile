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
        sh """
          mkdir -p trivy-reports
          docker run --rm \\
            -v /var/run/docker.sock:/var/run/docker.sock \\
            -v \$(pwd):/work \\
            -w /work \\
            aquasec/trivy:latest image \\
            --severity HIGH,CRITICAL --no-progress \\
            --format json -o trivy-reports/trivy-report.json \\
            ${IMAGE_NAME}:\${BUILD_NUMBER}
        """
        archiveArtifacts artifacts: 'trivy-reports/trivy-report.json', allowEmptyArchive: true
        sh "cat trivy-reports/trivy-report.json | jq '.Results[] | select(.Vulnerabilities != null) | .Vulnerabilities | length' || echo 0"
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
    stage('SonarQube SAST') { 
      steps { 
        echo 'Install Sonar plugin/server + uncomment'
        // withSonarQubeEnv('Sonar') { sh 'sonar-scanner' }
      } 
    }
    stage('Deploy') { 
      steps { sh "docker run -d -p 3000:3000 ${IMAGE_NAME}:\${BUILD_NUMBER} && curl -f http://localhost:3000/health" } 
    }
  }
  post { always { sh 'docker system prune -f; docker logout || true' } }
}
