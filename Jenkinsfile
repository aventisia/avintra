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
    stages {
        stage('Clone AspNetToolkit') {
            steps {
                echo 'Cloning AspNetToolkit...'
                sh 'rm -rf ../AspNetToolkit'
                withCredentials([usernamePassword(credentialsId: 'gitea_jenkins_user', usernameVariable: 'GITEA_USER', passwordVariable: 'GITEA_PAT')]) {
                    sh 'git clone -b ' + env.BRANCH_NAME + ' https://${GITEA_USER}:${GITEA_PAT}@gitea.aventisia.com/aventisia/AspNetToolkit.git ../AspNetToolkit'
                }
            }
        }
        stage('Restore tools & Packages') {
            steps {
                echo 'Restoring packages...'
                sh 'dotnet restore'
                echo 'Restoring tools...'
                sh 'dotnet tool restore'
            }
        }
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'dotnet build'
            }
        }
        stage('Database migration') {
            steps {
                script {
                    sshagent(credentials: ['aventisia_vps_ssh']) {
                        // Set target server based on branch
                        def targetServer = getTargetServer(env.BRANCH_NAME)
                        
                        echo "Fetching env from ${targetServer}..."

                        // Fetch the environment variables from the target server
                        sh "ssh -o StrictHostKeyChecking=no admin@${targetServer} 'cat /etc/environment' > remote_env_vars"
                        
                        // Read the fetched environment variables into a list
                        def envVars = readFile('remote_env_vars').split('\n').findAll { it.contains('=') }
                        
                        // Export the variables in the current Jenkins environment
                        withEnv(envVars) {
                            echo 'Migrating database schema...'
                            sh '''
                                export ASPNETCORE_ENVIRONMENT=Production
                                dotnet ef database update --context=MLModelBuilderDbContext
                            '''
                        }
                    }
                }
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
                        def targetServer = getTargetServer(env.BRANCH_NAME)
                        
                        echo "Deploying to ${targetServer}..."
                        
                        // Deploy and restart service
                        sh "rsync -avz --delete ${WORKSPACE}/Published/* admin@${targetServer}:/var/www/aventisia.com/apis/mlmodelbuilder/"
                        sh "ssh admin@${targetServer} 'sudo systemctl restart mlmodelbuilder_apis.service'"
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