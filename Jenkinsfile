// Define a function to get the target server based on the branch name
def getTargetServer(branchName) {
    switch(branchName) {
        case 'dev':
            return 'avdev.aventisia.com'
        case 'uat':
            return 'avuat.aventisia.com'
        case 'main':
            return 'avweb.aventisia.com'
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
                        // Set target server based on branch
                        def targetServer = getTargetServer(env.BRANCH_NAME)
                        
                        echo "Transfering to ${targetServer}..."
                        sh "rsync -avz --exclude 'venv' --exclude '.git' --delete . admin@${targetServer}:${DEPLOY_PATH}"

                        echo "Installing required packages..."
                        sh "ssh admin@${targetServer} 'cd ${DEPLOY_PATH} && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt'"

                        echo "Restarting the service..."
                        sh "ssh admin@${targetServer} 'sudo systemctl restart llmpipeline_apis.service'"
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