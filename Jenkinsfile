pipeline {
    agent any
    stages {
        stage('Clone AspNetToolkit') {
            steps {
                echo 'Cloning AspNetToolkit...'
                sh 'rm -rf ../AspNetToolkit'
                withCredentials([usernamePassword(credentialsId: 'gitea_jenkins_user', usernameVariable: 'GITEA_USER', passwordVariable: 'GITEA_PAT')]) {
                    sh 'git clone https://${GITEA_USER}:${GITEA_PAT}@gitea.aventisia.com/Aventisia/AspNetToolkit.git ../AspNetToolkit'
                }
            }
        }
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
        stage('Publish') {
            steps {
                echo 'Publishing...'
                sh 'dotnet publish -c Release --property:PublishDir=./Published'
            }
        }
        stage('Deploy') {
            steps {
                script {
                    sshagent(credentials: ['aventisia_vps_ssh']) {
                        // Set target server based on branch
                        def targetServer = ''
                        switch(env.BRANCH_NAME) {
                            case 'dev':
                                targetServer = 'avdev.aventisia.com'
                                break
                            case 'uat':
                                targetServer = 'avuat.aventisia.com'
                                break
                            case 'main':
                                targetServer = 'avweb.aventisia.com'
                                break
                            default:
                                error "Unsupported branch: ${env.BRANCH_NAME}"
                        }
                        // Log target server
                        echo "Deploying to ${targetServer}..."
                        // Deploy
                        sh "rsync -avz --delete ${WORKSPACE}/Published/* admin@${targetServer}:/var/www/aventisia.com/apis/accounts/"
                        // Restart service
                        sh "ssh admin@${targetServer} 'sudo systemctl restart accounts_apis.service'"
                    }
                }
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