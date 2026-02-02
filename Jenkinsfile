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

    environment {
        DEPLOY_PATH = '/home/admin/fastapis/llmpipeline/'  // Path on the server
    }

    stages {
        stage('Deploy') {
            steps {
                script {
                    sshagent(credentials: ['aventisia_vps_ssh']) {
                        // Get target servers based on branch
                        def targetServers = getTargetServers(env.BRANCH_NAME)

                        echo "Deploying to ${targetServers.size()} server(s): ${targetServers.join(', ')}..."

                        // Do deployment on each target server
                        targetServers.each { server ->
                            echo "Transfering to ${server}..."
                        
                            sh "rsync -avz --exclude 'venv' --exclude '.gitignore' --exclude 'base.pt' --exclude 'Jenkinsfile' --exclude '.git' --delete . admin@${server}:${DEPLOY_PATH}"

                            echo "Installing required packages..."
                            sh "ssh admin@${server} 'cd ${DEPLOY_PATH} && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt'"

                            echo "Restarting the service..."
                            sh "ssh admin@${server} 'sudo systemctl restart llmpipeline_apis.service'"
                            
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