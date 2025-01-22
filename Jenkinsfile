pipeline {
    agent any
    tools {
        nodejs 'NodeJS 20.18.1'
    }
    stages {
        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm ci'
            }
        }
        stage('Build') {
            steps {
                echo 'Building...'
                script {
                    // Set build mode based on branch
                    def buildMode = ''
                    switch(env.BRANCH_NAME) {
                        case 'dev':
                            buildMode = 'development'
                            break
                        case 'uat':
                            buildMode = 'staging'
                            break
                        case 'main':
                            buildMode = 'production'
                            break
                        default:
                            error "Unsupported branch: ${env.BRANCH_NAME}"
                    }
                    // Build
                    sh "npm run build -- --mode=${buildMode}"
                }
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
                        sh "rsync -avz --delete ${WORKSPACE}/dist/* admin@${targetServer}:/var/www/aventisia.com/clients/workspace/"
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