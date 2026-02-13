// Define a function to get the target servers based on the branch name
def getTargetServers(branchName) {
    switch(branchName) {
        case 'dev':
            return ['avdev.aventisia.com']
        case 'uat':
            return ['avuat.aventisia.com']
        case 'main':
            return ['avweb1.aventisia.com', 'avweb2.aventisia.com']
        default:
            error "Unsupported branch: ${branchName}"
    }
}

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
                    sh "npm run build"
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    sshagent(credentials: ['aventisia_vps_ssh']) {
                        // Get target servers based on branch
                        def targetServers = getTargetServers(env.BRANCH_NAME)

                        echo "Deploying to ${targetServers.size()} server(s): ${targetServers.join(', ')}..."
                        
                        // Deploy to each target server
                        targetServers.each { server ->
                            echo "Deploying to ${server}..."
                            sh "rsync -avz --delete ${WORKSPACE}/out/* admin@${server}:/var/www/aventisia.com/clients/docs/"
                            echo "Successfully deployed to ${server}"
                        }
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