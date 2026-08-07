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
        string(name: 'REPOS_TO_BUILD', defaultValue: '', description: 'Comma-separated list of repo names to build on manual build (e.g., accounts_api,workspace_api,llmpipeline_api,docs,web_apps,desktop_executor). web_apps covers accounts, workspace, and studio apps.')
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
                        env.BUILD_WORKSPACE_API = reposToBuild.contains('workspace_api') ? 'true' : 'false'
                        env.BUILD_LLMPIPELINE_API = reposToBuild.contains('llmpipeline_api') ? 'true' : 'false'
                        env.BUILD_DOCS_CLIENT = reposToBuild.contains('docs') ? 'true' : 'false'
                        env.BUILD_WEB_APPS = (reposToBuild.contains('web_apps') || reposToBuild.contains('accounts') || reposToBuild.contains('workspace') || reposToBuild.contains('studio')) ? 'true' : 'false'
                        env.BUILD_DESKTOP_EXECUTOR = reposToBuild.contains('desktop_executor') ? 'true' : 'false'
                    } else {
                        echo 'Automatic build - detecting changes...'
                        
                        // Detect changes in each component
                        def aspnetToolkitChanged = hasChangesInPath('apis/WorcBackend-legacy/AspNetToolkit')
                        
                        // If AspNetToolkit changed, all .NET APIs need to be rebuilt
                        env.BUILD_ACCOUNTS_API = (hasChangesInPath('apis/WorcBackend-legacy/AccountsAPIs') || aspnetToolkitChanged) ? 'true' : 'false'
                        env.BUILD_WORKSPACE_API = (hasChangesInPath('apis/WorcBackend-legacy/WorkspaceAPIs') || aspnetToolkitChanged) ? 'true' : 'false'
                        env.BUILD_LLMPIPELINE_API = hasChangesInPath('apis/llmpipeline') ? 'true' : 'false'
                        env.BUILD_DOCS_CLIENT = hasChangesInPath('clients/docs') ? 'true' : 'false'
                        env.BUILD_WEB_APPS = hasChangesInPath('clients/web-apps') ? 'true' : 'false'
                        env.BUILD_DESKTOP_EXECUTOR = hasChangesInPath('clients/DesktopExecutor') ? 'true' : 'false'
                    }
                    
                    echo """
                    Changed components:
                    - Accounts API: ${env.BUILD_ACCOUNTS_API}
                    - Workspace API: ${env.BUILD_WORKSPACE_API}
                    - LLM Pipeline API: ${env.BUILD_LLMPIPELINE_API}
                    - Docs Client: ${env.BUILD_DOCS_CLIENT}
                    - Web Apps: ${env.BUILD_WEB_APPS}
                    - Desktop Executor: ${env.BUILD_DESKTOP_EXECUTOR}
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
                
                stage('Workspace API') {
                    when {
                        expression { env.BUILD_WORKSPACE_API == 'true' }
                    }
                    stages {
                        stage('Restore - Workspace API') {
                            steps {
                                dir('apis/WorcBackend-legacy/WorkspaceAPIs') {
                                    echo 'Restoring Workspace API packages...'
                                    sh 'dotnet restore'
                                }
                            }
                        }
                        stage('Build - Workspace API') {
                            steps {
                                dir('apis/WorcBackend-legacy/WorkspaceAPIs') {
                                    echo 'Building Workspace API...'
                                    sh 'dotnet build --configuration Release'
                                }
                            }
                        }
                        stage('Publish - Workspace API') {
                            steps {
                                dir('apis/WorcBackend-legacy/WorkspaceAPIs') {
                                    echo 'Publishing Workspace API...'
                                    sh 'dotnet publish -c Release --property:PublishDir=./Published'
                                }
                            }
                        }
                        stage('Deploy - Workspace API') {
                            steps {
                                script {
                                    sshagent(credentials: ['aventisia_vps_ssh']) {
                                        def targetServers = getTargetServers(env.BRANCH_NAME)
                                        echo "Deploying Workspace API to ${targetServers.size()} server(s)..."
                                        
                                        targetServers.each { server ->
                                            sh "rsync -avz --delete ${WORKSPACE}/apis/WorcBackend-legacy/WorkspaceAPIs/Published/* admin@${server}:/var/www/aventisia.com/apis/workspace/"
                                            sh "ssh admin@${server} 'sudo systemctl restart workspace_apis.service'"
                                            echo "Successfully deployed Workspace API to ${server}"
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
                        nodejs 'NodeJS 22.18.0'
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
                
                stage('Web Apps') {
                    when {
                        expression { env.BUILD_WEB_APPS == 'true' }
                    }
                    agent any
                    tools {
                        nodejs 'NodeJS 22.18.0'
                    }
                    stages {
                        stage('Install - Web Apps') {
                            steps {
                                dir('clients/web-apps') {
                                    echo 'Installing web-apps dependencies...'
                                    sh 'npm ci'
                                }
                            }
                        }
                        stage('Build - Web Apps') {
                            steps {
                                dir('clients/web-apps') {
                                    echo 'Building web-apps...'
                                    sh "npm run build -- -- --mode=${getBuildMode(env.BRANCH_NAME)}"
                                }
                            }
                        }
                        stage('Deploy - Accounts App') {
                            steps {
                                script {
                                    sshagent(credentials: ['aventisia_vps_ssh']) {
                                        def targetServers = getTargetServers(env.BRANCH_NAME)
                                        echo "Deploying Accounts App to ${targetServers.size()} server(s)..."
                                        
                                        targetServers.each { server ->
                                            sh "rsync -avz --delete ${WORKSPACE}/clients/web-apps/apps/accounts/dist/* admin@${server}:/var/www/aventisia.com/clients/accounts/"
                                            echo "Successfully deployed Accounts App to ${server}"
                                        }
                                    }
                                }
                            }
                        }
                        stage('Deploy - Workspace App') {
                            steps {
                                script {
                                    sshagent(credentials: ['aventisia_vps_ssh']) {
                                        def targetServers = getTargetServers(env.BRANCH_NAME)
                                        echo "Deploying Workspace App to ${targetServers.size()} server(s)..."
                                        
                                        targetServers.each { server ->
                                            sh "rsync -avz --delete ${WORKSPACE}/clients/web-apps/apps/workspace/dist/* admin@${server}:/var/www/aventisia.com/clients/workspace/"
                                            echo "Successfully deployed Workspace App to ${server}"
                                        }
                                    }
                                }
                            }
                        }
                        stage('Deploy - Studio App') {
                            steps {
                                script {
                                    sshagent(credentials: ['aventisia_vps_ssh']) {
                                        def targetServers = getTargetServers(env.BRANCH_NAME)
                                        echo "Deploying Studio App to ${targetServers.size()} server(s)..."
                                        
                                        targetServers.each { server ->
                                            sh "rsync -avz --delete ${WORKSPACE}/clients/web-apps/apps/studio/dist/* admin@${server}:/var/www/aventisia.com/clients/studio/"
                                            echo "Successfully deployed Studio App to ${server}"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // ================================
        // Desktop Executor Build Stage
        // ================================
        
        stage('Desktop Executor') {
            when {
                expression { env.BUILD_DESKTOP_EXECUTOR == 'true' }
            }
            agent any
            steps {
                script {
                    echo 'Publishing DesktopExecutor...'
                    sh "set -e; bash ${WORKSPACE}/clients/DesktopExecutor/publish.sh"

                    sshagent(credentials: ['aventisia_vps_ssh']) {
                        def targetServers = getTargetServers(env.BRANCH_NAME)
                        echo "Uploading DesktopExecutor to ${targetServers.size()} server(s)..."
                        def targetDir = '/var/www/aventisia.com/files/binaries'
                        def scriptsDir = '/var/www/aventisia.com/files/scripts'

                        targetServers.each { server ->
                            def zipPath = sh(
                                script: "ls -t ${WORKSPACE}/clients/DesktopExecutor/artifacts/AvintraDesktopRunner_*.zip | head -n1",
                                returnStdout: true
                            ).trim()
                            sh "ssh admin@${server} 'mkdir -p ${targetDir} ${scriptsDir}'"
                            sh "rsync -avz --timeout=300 ${zipPath} admin@${server}:${targetDir}/"
                            sh "rsync -avz --timeout=300 ${WORKSPACE}/clients/DesktopExecutor/artifacts/Install-AvintraDesktopRunner.ps1 admin@${server}:${scriptsDir}/"
                            sh "rsync -avz --timeout=300 ${WORKSPACE}/clients/DesktopExecutor/artifacts/Download-AvintraDesktopRunner.ps1 admin@${server}:${scriptsDir}/"
                            echo "Successfully uploaded DesktopExecutor to ${server}"
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