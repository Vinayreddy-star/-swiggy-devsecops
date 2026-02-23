pipeline {
  agent any
  tools {
    nodejs 'Node18'  // Configure in Manage Jenkins > Tools if needed
  }
  environment {
    DOCKERHUB_CREDENTIALS = credentials('dockerhub')  // Add in Jenkins Credentials
    IMAGE_NAME = 'vinayreddy99/swiggy-devsecops'
    SONAR_TOKEN = credentials('sonarqube-token')  // For later
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
        sh 'npm test'
      }
    }
    stage('Docker Build') {
      steps {
        sh """
          docker build -t ${IMAGE_NAME}:\${BUILD_NUMBER} .
          docker tag ${IMAGE_NAME}:\${BUILD_NUMBER} ${IMAGE_NAME}:latest
        """
      }
    }
    stage('Trivy: Download DB') {
      steps {
        sh """
          mkdir -p ~/.cache/trivy
          docker run --rm \\
            -v ~/.cache/trivy:/root/.cache/trivy \\
            aquasec/trivy:latest image --download-db-only --no-progress
        """
      }
    }
    stage('Trivy Security Scan') {
      steps {
        sh """
          docker run --rm \\
            -v /var/run/docker.sock:/var/run/docker.sock \\
            -v ~/.cache/trivy:/root/.cache/trivy \\
            aquasec/trivy:latest image \\
            --exit-code 0 --no-progress --format table \\
            --skip-db-update --skip-java-db-update \\
            ${IMAGE_NAME}:\${BUILD_NUMBER} \\
            -o trivy-report.txt
          cat trivy-report.txt
        """
      }
      post {
        always {
          archiveArtifacts artifacts: 'trivy-report.txt', allowEmptyArchive: true
        }
      }
    }
    stage('Docker Login & Push') {
      steps {
        sh """
          echo \$DOCKERHUB_CREDENTIALS_PSW | docker login -u \$DOCKERHUB_CREDENTIALS_USR --password-stdin
          docker push ${IMAGE_NAME}:\${BUILD_NUMBER}
          docker push ${IMAGE_NAME}:latest
        """
      }
    }
    // Uncomment after SonarQube setup
    /*
    stage('SAST - SonarQube') {
      steps {
        withSonarQubeEnv('SonarServer') {
          sh 'sonar-scanner -Dsonar.projectKey=swiggy-devsecops -Dsonar.sources=.'
        }
      }
    }
    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }
    */
  }
  post {
    always {
      sh 'docker system prune -f'
      sh 'docker logout'
    }
  }
}
