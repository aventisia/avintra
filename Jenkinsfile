// Define a function to get the build mode based on the branch name
def getBuildMode(branchName) {
    switch(branchName) {
        case 'dev':
            return 'testing'
        case 'uat':
            return 'staging'
        case 'main':
            return 'production'
        default:
            error "Unsupported branch: ${branchName}"
    }
}

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
    tools {
        nodejs 'NodeJS 20.18.1'
    }
    stages {
        stage('Update Gitea npm registry') {
            steps {
                echo 'Updating Gitea npm registry...'

                // Note: if we wrap below sh lines in double quotes, it will throw an error
                sh 'npm config set @aventisia:registry=https://gitea.aventisia.com/api/packages/aventisia-public/npm/'
            }
        }
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
                    sh "npm run build -- --mode=${getBuildMode(env.BRANCH_NAME)}"
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    sshagent(credentials: ['aventisia_vps_ssh']) {
                        // Set target server based on branch
                        def targetServer = getTargetServer(env.BRANCH_NAME)

                        echo "Deploying to ${targetServer}..."
                        
                        // Deploy to target server  
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