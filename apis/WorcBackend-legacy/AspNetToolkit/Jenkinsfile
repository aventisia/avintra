pipeline {
    agent any
    stages {
        stage('Restore Packages') {
            steps {
                echo 'Restoring packages...'
                sh 'dotnet restore'
            }
        }
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'dotnet build'
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
            deleteDir()
        }
        success {
            echo 'Build succeeded!'
        }
        failure {
            echo 'Build failed!'
        }
    }
}