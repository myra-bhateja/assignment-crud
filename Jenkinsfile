pipeline {
  agent any
  options {
    timestamps()
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Backend Install') {
      steps {
        dir('backend') {
          script {
            def npmCmd = isUnix() ? 'npm' : 'npm.cmd'
            if (isUnix()) {
              sh "${npmCmd} install"
            } else {
              bat "${npmCmd} install"
            }
          }
        }
      }
    }
    stage('Frontend Install') {
      steps {
        dir('frontend') {
          script {
            def npmCmd = isUnix() ? 'npm' : 'npm.cmd'
            if (isUnix()) {
              sh "${npmCmd} install"
            } else {
              bat "${npmCmd} install"
            }
          }
        }
      }
    }
    stage('Frontend Build') {
      steps {
        dir('frontend') {
          script {
            def npmCmd = isUnix() ? 'npm' : 'npm.cmd'
            if (isUnix()) {
              sh "${npmCmd} run build"
            } else {
              bat "${npmCmd} run build"
            }
          }
        }
      }
    }
    stage('Docker Compose Up') {
      steps {
        script {
          if (isUnix()) {
            sh 'docker compose up -d --build'
            sh 'docker compose ps'
          } else {
            bat 'docker compose up -d --build'
            bat 'docker compose ps'
          }
        }
      }
    }
  }
}
