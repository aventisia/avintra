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

// Define a function to get the build mode based on the branch name (for Node.js apps)
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

// Function to check if a directory has changes
def hasChangesInPath(path) {
    if (env.CHANGE_ID) {
        // For pull requests
        def changes = sh(script: "git diff --name-only origin/${env.CHANGE_TARGET}...HEAD | grep '^${path}/' || true", returnStdout: true).trim()
        return changes != ''
    } else {
        // For regular commits - compare with previous commit
        def changes = sh(script: "git diff --name-only HEAD~1 HEAD | grep '^${path}/' || true", returnStdout: true).trim()
        return changes != ''
    }
}

pipeline {
    agent any
    parameters {
        string(name: 'REPOS_TO_BUILD', defaultValue: '', description: 'Comma-separated list of repo names to build on manual build (e.g., accounts_api,worc_api,llmpipeline_api,docs,accounts,worc,agentbuilder,aspnet_toolkit)')
    }
    stages {
        stage('Detect Changes') {
            steps {
                script {
                    echo 'Detecting changes in monorepo...'
                    
                    // Check if this is a manual/retry build
                    def isManualBuild = currentBuild.getBuildCauses('hudson.model.Cause$UserIdCause').size() > 0
                    
                    if (isManualBuild) {
                        echo 'Manual build detected - using REPOS_TO_BUILD parameter'
                        def reposToBuild = params.REPOS_TO_BUILD.tokenize(',').collect { it.trim().toLowerCase() }
                        env.BUILD_ACCOUNTS_API = reposToBuild.contains('accounts_api') ? 'true' : 'false'
                        env.BUILD_WORC_API = reposToBuild.contains('worc_api') ? 'true' : 'false'
                        env.BUILD_LLMPIPELINE_API = reposToBuild.contains('llmpipeline_api') ? 'true' : 'false'
                        env.BUILD_DOCS_CLIENT = reposToBuild.contains('docs') ? 'true' : 'false'
                        env.BUILD_ACCOUNTS_CLIENT = reposToBuild.contains('accounts') ? 'true' : 'false'
                        env.BUILD_WORC_CLIENT = reposToBuild.contains('worc') ? 'true' : 'false'
                        env.BUILD_AGENTBUILDER_CLIENT = reposToBuild.contains('agentbuilder') ? 'true' : 'false'
                        env.BUILD_ASPNET_TOOLKIT = reposToBuild.contains('aspnet_toolkit') ? 'true' : 'false'
                    } else {
                        echo 'Automatic build - detecting changes...'
                        
                        // Detect changes in each component
                        def aspnetToolkitChanged = hasChangesInPath('apis/WorcBackend-legacy/AspNetToolkit')
                        
                        // If AspNetToolkit changed, all .NET APIs need to be rebuilt
                        env.BUILD_ACCOUNTS_API = (hasChangesInPath('apis/WorcBackend-legacy/AccountsAPIs') || aspnetToolkitChanged) ? 'true' : 'false'
                        env.BUILD_WORC_API = (hasChangesInPath('apis/WorcBackend-legacy/WorkspaceAPIs') || aspnetToolkitChanged) ? 'true' : 'false'
                        env.BUILD_LLMPIPELINE_API = hasChangesInPath('apis/llmpipeline') ? 'true' : 'false'
                        env.BUILD_DOCS_CLIENT = hasChangesInPath('clients/docs') ? 'true' : 'false'
                        env.BUILD_ACCOUNTS_CLIENT = hasChangesInPath('clients/worc-web-legacy/accounts') ? 'true' : 'false'
                        env.BUILD_WORC_CLIENT = hasChangesInPath('clients/worc-web-legacy/workspace') ? 'true' : 'false'
                        env.BUILD_AGENTBUILDER_CLIENT = hasChangesInPath('clients/worc-web-legacy/studio') ? 'true' : 'false'
                        env.BUILD_ASPNET_TOOLKIT = aspnetToolkitChanged ? 'true' : 'false'
                    }
                    
                    echo """
                    Changed components:
                    - AspNetToolkit: ${env.BUILD_ASPNET_TOOLKIT}
                    - Accounts API: ${env.BUILD_ACCOUNTS_API}
                    - Worc API: ${env.BUILD_WORC_API}
                    - LLM Pipeline API: ${env.BUILD_LLMPIPELINE_API}
                    - Docs Client: ${env.BUILD_DOCS_CLIENT}
                    - Accounts Client: ${env.BUILD_ACCOUNTS_CLIENT}
                    - Worc Client: ${env.BUILD_WORC_CLIENT}
                    - Agent Builder Client: ${env.BUILD_AGENTBUILDER_CLIENT}
                    """.stripIndent()
                }
            }
        }
        
        // ======================
        // .NET APIs Build Stages
        // ======================
        
        stage('Build .NET APIs') {
            parallel {
                stage('Accounts API') {
                    when {
                        expression { env.BUILD_ACCOUNTS_API == 'true' }
                    }
                    stages {
                        stage('Restore - Accounts API') {
                            steps {
                                dir('apis/WorcBackend-legacy/AccountsAPIs') {
                                    echo 'Restoring Accounts API packages...'
                                    sh 'dotnet restore'
                                }
                            }
                        }
                        stage('Build - Accounts API') {
                            steps {
                                dir('apis/WorcBackend-legacy/AccountsAPIs') {
                                    echo 'Building Accounts API...'
                                    sh 'dotnet build --configuration Release'
                                }
                            }
                        }
                        stage('Publish - Accounts API') {
                            steps {
                                dir('apis/WorcBackend-legacy/AccountsAPIs') {
                                    echo 'Publishing Accounts API...'
                                    sh 'dotnet publish -c Release --property:PublishDir=./Published'
                                }
                            }
                        }
                        stage('Deploy - Accounts API') {
                            steps {
                                script {
                                    sshagent(credentials: ['aventisia_vps_ssh']) {
                                        def targetServers = getTargetServers(env.BRANCH_NAME)
                                        echo "Deploying Accounts API to ${targetServers.size()} server(s)..."
                                        
                                        targetServers.each { server ->
                                            sh "rsync -avz --delete ${WORKSPACE}/apis/WorcBackend-legacy/AccountsAPIs/Published/* admin@${server}:/var/www/aventisia.com/apis/accounts/"
                                            sh "ssh admin@${server} 'sudo systemctl restart accounts_apis.service'"
                                            echo "Successfully deployed Accounts API to ${server}"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                stage('Worc API') {
                    when {
                        expression { env.BUILD_WORC_API == 'true' }
                    }
                    stages {
                        stage('Restore - Worc API') {
                            steps {
                                dir('apis/WorcBackend-legacy/WorkspaceAPIs') {
                                    echo 'Restoring Worc API packages...'
                                    sh 'dotnet restore'
                                }
                            }
                        }
                        stage('Build - Worc API') {
                            steps {
                                dir('apis/WorcBackend-legacy/WorkspaceAPIs') {
                                    echo 'Building Worc API...'
                                    sh 'dotnet build --configuration Release'
                                }
                            }
                        }
                        stage('Publish - Worc API') {
                            steps {
                                dir('apis/WorcBackend-legacy/WorkspaceAPIs') {
                                    echo 'Publishing Worc API...'
                                    sh 'dotnet publish -c Release --property:PublishDir=./Published'
                                }
                            }
                        }
                        stage('Deploy - Worc API') {
                            steps {
                                script {
                                    sshagent(credentials: ['aventisia_vps_ssh']) {
                                        def targetServers = getTargetServers(env.BRANCH_NAME)
                                        echo "Deploying Worc API to ${targetServers.size()} server(s)..."
                                        
                                        targetServers.each { server ->
                                            sh "rsync -avz --delete ${WORKSPACE}/apis/WorcBackend-legacy/WorkspaceAPIs/Published/* admin@${server}:/var/www/aventisia.com/apis/worc/"
                                            sh "ssh admin@${server} 'sudo systemctl restart worc_apis.service'"
                                            echo "Successfully deployed Worc API to ${server}"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // ======================
        // Python API Build Stage
        // ======================
        
        stage('LLM Pipeline API') {
            when {
                expression { env.BUILD_LLMPIPELINE_API == 'true' }
            }
            steps {
                dir('apis/llmpipeline') {
                    script {
                        sshagent(credentials: ['aventisia_vps_ssh']) {
                            def targetServers = getTargetServers(env.BRANCH_NAME)
                            echo "Deploying LLM Pipeline to ${targetServers.size()} server(s)..."
                            
                            targetServers.each { server ->
                                def deployPath = '/home/admin/fastapis/llmpipeline/'
                                
                                echo "Transferring to ${server}..."
                                sh "rsync -avz --exclude 'venv' --exclude '.gitignore' --exclude 'base.pt' --exclude 'Jenkinsfile' --exclude '.git' --delete . admin@${server}:${deployPath}"
                                
                                echo "Installing required packages..."
                                sh "ssh admin@${server} 'cd ${deployPath} && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt'"
                                
                                echo "Restarting the service..."
                                sh "ssh admin@${server} 'sudo systemctl restart llmpipeline_apis.service'"
                                
                                echo "Successfully deployed LLM Pipeline to ${server}"
                            }
                        }
                    }
                }
            }
        }
        
        // ======================
        // Client Apps Build Stages
        // ======================
        
        stage('Build Client Apps') {
            parallel {
                stage('Docs') {
                    when {
                        expression { env.BUILD_DOCS_CLIENT == 'true' }
                    }
                    agent any
                    tools {
                        nodejs 'NodeJS 20.18.1'
                    }
                    stages {
                        stage('Install - Docs') {
                            steps {
                                dir('clients/docs') {
                                    echo 'Installing Docs dependencies...'
                                    sh 'npm ci'
                                }
                            }
                        }
                        stage('Build - Docs') {
                            steps {
                                dir('clients/docs') {
                                    echo 'Building Docs...'
                                    sh "npm run build:${getBuildMode(env.BRANCH_NAME)}"
                                }
                            }
                        }
                        stage('Deploy - Docs') {
                            steps {
                                script {
                                    sshagent(credentials: ['aventisia_vps_ssh']) {
                                        def targetServers = getTargetServers(env.BRANCH_NAME)
                                        echo "Deploying Docs to ${targetServers.size()} server(s)..."
                                        
                                        targetServers.each { server ->
                                            sh "rsync -avz --delete ${WORKSPACE}/clients/docs/out/* admin@${server}:/var/www/aventisia.com/clients/docs/"
                                            echo "Successfully deployed Docs to ${server}"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                stage('Accounts Client') {
                    when {
                        expression { env.BUILD_ACCOUNTS_CLIENT == 'true' }
                    }
                    agent any
                    tools {
                        nodejs 'NodeJS 20.18.1'
                    }
                    stages {
                        stage('Install - Accounts Client') {
                            steps {
                                dir('clients/worc-web-legacy/accounts') {
                                    echo 'Installing Accounts Client dependencies...'
                                    sh 'npm ci'
                                }
                            }
                        }
                        stage('Build - Accounts Client') {
                            steps {
                                dir('clients/worc-web-legacy/accounts') {
                                    echo 'Building Accounts Client...'
                                    sh "npm run build -- --mode=${getBuildMode(env.BRANCH_NAME)}"
                                }
                            }
                        }
                        stage('Deploy - Accounts Client') {
                            steps {
                                script {
                                    sshagent(credentials: ['aventisia_vps_ssh']) {
                                        def targetServers = getTargetServers(env.BRANCH_NAME)
                                        echo "Deploying Accounts Client to ${targetServers.size()} server(s)..."
                                        
                                        targetServers.each { server ->
                                            sh "rsync -avz --delete ${WORKSPACE}/clients/worc-web-legacy/accounts/dist/* admin@${server}:/var/www/aventisia.com/clients/accounts/"
                                            echo "Successfully deployed Accounts Client to ${server}"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                stage('Worc Client') {
                    when {
                        expression { env.BUILD_WORC_CLIENT == 'true' }
                    }
                    agent any
                    tools {
                        nodejs 'NodeJS 20.18.1'
                    }
                    stages {
                        stage('Install - Worc Client') {
                            steps {
                                dir('clients/worc-web-legacy/workspace') {
                                    echo 'Installing Worc Client dependencies...'
                                    sh 'npm ci'
                                }
                            }
                        }
                        stage('Build - Worc Client') {
                            steps {
                                dir('clients/worc-web-legacy/workspace') {
                                    echo 'Building Worc Client...'
                                    sh "npm run build -- --mode=${getBuildMode(env.BRANCH_NAME)}"
                                }
                            }
                        }
                        stage('Deploy - Worc Client') {
                            steps {
                                script {
                                    sshagent(credentials: ['aventisia_vps_ssh']) {
                                        def targetServers = getTargetServers(env.BRANCH_NAME)
                                        echo "Deploying Worc Client to ${targetServers.size()} server(s)..."
                                        
                                        targetServers.each { server ->
                                            sh "rsync -avz --delete ${WORKSPACE}/clients/worc-web-legacy/workspace/dist/* admin@${server}:/var/www/aventisia.com/clients/worc/"
                                            echo "Successfully deployed Worc Client to ${server}"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                stage('Agent Builder Client') {
                    when {
                        expression { env.BUILD_AGENTBUILDER_CLIENT == 'true' }
                    }
                    agent any
                    tools {
                        nodejs 'NodeJS 20.18.1'
                    }
                    stages {
                        stage('Install - Agent Builder Client') {
                            steps {
                                dir('clients/worc-web-legacy/studio') {
                                    echo 'Installing Agent Builder Client dependencies...'
                                    sh 'npm ci'
                                }
                            }
                        }
                        stage('Build - Agent Builder Client') {
                            steps {
                                dir('clients/worc-web-legacy/studio') {
                                    echo 'Building Agent Builder Client...'
                                    sh "npm run build -- --mode=${getBuildMode(env.BRANCH_NAME)}"
                                }
                            }
                        }
                        stage('Deploy - Agent Builder Client') {
                            steps {
                                script {
                                    sshagent(credentials: ['aventisia_vps_ssh']) {
                                        def targetServers = getTargetServers(env.BRANCH_NAME)
                                        echo "Deploying Agent Builder Client to ${targetServers.size()} server(s)..."
                                        
                                        targetServers.each { server ->
                                            sh "rsync -avz --delete ${WORKSPACE}/clients/worc-web-legacy/studio/dist/* admin@${server}:/var/www/aventisia.com/clients/agentbuilder/"
                                            echo "Successfully deployed Agent Builder Client to ${server}"
                                        }
                                    }
                                }
                            }
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