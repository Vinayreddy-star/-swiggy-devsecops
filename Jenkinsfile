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
      steps {
        sh """
          docker build -t ${IMAGE_NAME}:\${BUILD_NUMBER} .
          docker tag ${IMAGE_NAME}:\${BUILD_NUMBER} ${IMAGE_NAME}:latest
        """
      }
    }
    stage('Trivy SCA') {
      steps {
        sh """
          mkdir -p ${TRIVY_REPORT}
          docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v ${TRIVY_CACHE}:/root/.cache/ \
            -v ${TRIVY_REPORT}:/out/ \
            aquasec/trivy:latest image \
            --severity HIGH,CRITICAL \
            --exit-code 1 \
            --format json -o /out/trivy-report-\${BUILD_NUMBER}.json \
            --format template --template "@/usr/share/trivy/templates/html_report.tpl" -o /out/trivy-report-\${BUILD_NUMBER}.html \
            ${IMAGE_NAME}:\${BUILD_NUMBER} || true
        """
        publishHTML([
          allowMissing: false,
          alwaysLinkToLastBuild: true,
 keepAll: true,
          reportDir: "${TRIVY_REPORT}",
          reportFiles: "trivy-report-\${BUILD_NUMBER}.html",
          reportName: "Trivy HTML Report"
        ])
        archiveArtifacts artifacts: "${TRIVY_REPORT}/trivy-report-\${BUILD_NUMBER}.json", allowEmptyArchive: true
      }
    }
    stage('DockerHub Push') {
      steps {
        withDockerRegistry([credentialsId: 'dockerhub', url: '']) {
          sh """
            docker login -u ${DOCKERHUB_CREDENTIALS_USR} -p ${DOCKERHUB_CREDENTIALS_PSW}
            docker push ${IMAGE_NAME}:\${BUILD_NUMBER}
            docker push ${IMAGE_NAME}:latest
          """
        }
      }
    }
    stage('SAST - SonarQube') {
      // steps {
      //   withSonarQubeEnv('SonarQube') {
      //     sh 'sonar-scanner -Dsonar.projectKey=swiggy-devsecops -Dsonar.sources=.'
      //   }
      //   timeout(time: 1, unit: 'HOURS') {
      //     waitForQualityGate abortPipeline: true
      //   }
      // }
      steps { echo 'SonarQube: Install plugin + server, uncomment, re-run' }
    }
    stage('Deploy') {
      steps { 
        sh """
          echo 'Deploy stub: e.g., docker run -d -p 3000:3000 ${IMAGE_NAME}:\${BUILD_NUMBER}'
          echo 'Next: AWS ECR/ECS or Kubernetes via Terraform'
        """
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
