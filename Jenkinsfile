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
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v \$(pwd):/work -w /work \\
            aquasec/trivy:latest image --severity HIGH,CRITICAL --no-progress --format json -o trivy-reports/trivy-report.json \\
            ${IMAGE_NAME}:\${BUILD_NUMBER}
        """
        archiveArtifacts artifacts: 'trivy-reports/trivy-report.json'
        sh "jq '.Results[] | select(.Vulnerabilities != null) | .Vulnerabilities | length' trivy-reports/trivy-report.json"
      }
    }
    stage('DockerHub Push') {
      steps {
        sh """
          echo \${DOCKERHUB_CREDENTIALS_PSW} | docker login -u \${DOCKERHUB_CREDENTIALS_USR} --password-stdin
          docker push ${IMAGE_NAME}:\${BUILD_NUMBER} && docker push ${IMAGE_NAME}:latest
        """
      }
    }
    stage('SonarQube SAST') { steps { echo 'Setup: docker run -p9000:9000 sonarsource/sonar-community' } }
    stage('Deploy') {
      steps {
sh '''
  docker stop $(docker ps -q --filter ancestor=vinayreddy99/swiggy-devsecops:latest) || true
  docker rm $(docker ps -aq --filter ancestor=vinayreddy99/swiggy-devsecops:latest) || true
  docker run -d --name swiggy-app --restart unless-stopped --memory=512m -p 3000:3000 \\
    -e PORT=3000 -e BUILD_NUMBER=${BUILD_NUMBER} vinayreddy99/swiggy-devsecops:${BUILD_NUMBER}
  sleep 10 && curl -f http://localhost:3000/health || echo "Startup ongoing"
'''
      }
    }
  }
  post { always { sh 'docker system prune -f; docker logout || true' } }
}

    stage('SonarQube SAST') {
      steps {
        withSonarQubeEnv('Sonar') {
          sh '''
            wget -q -O - https://downloads.sonarsource.com/cli/sonar-scanner-cli-5.0.1.3006-linux.zip | sh -x
            unzip sonar-scanner*.zip
            ./sonar-scanner-*/bin/sonar-scanner -Dsonar.projectKey=swiggy-devsecops -Dsonar.sources=.
          '''
        }
      }
    }
