// Define a function to get the target servers based on the branch name
def getTargetServers(branchName) {
    switch(branchName) {
        case 'uat':
            return ['avuat.aventisia.com']
        case 'main':
            return ['avweb1.aventisia.com']
        default:
            error "Unsupported branch: ${branchName}"
    }
}

// Define a function to get the build mode based on the branch name (for Node.js apps)
def getBuildMode(branchName) {
    switch(branchName) {
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
        string(name: 'REPOS_TO_BUILD', defaultValue: '', description: 'Comma-separated list of repo names to build on manual build (e.g., accounts_api,workspace_api,globaladmin_api,llmpipeline_api,apachecamel_api,corsair_api,docs,web_apps,runner_app). web_apps covers accounts, workspace, global-admin, and studio apps (desktop-app excluded).')
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
                        env.BUILD_GLOBALADMIN_API = reposToBuild.contains('globaladmin_api') ? 'true' : 'false'
                        env.BUILD_LLMPIPELINE_API = reposToBuild.contains('llmpipeline_api') ? 'true' : 'false'
                        env.BUILD_APACHECAMEL_API = reposToBuild.contains('apachecamel_api') ? 'true' : 'false'
                        env.BUILD_CORSAIR_API = reposToBuild.contains('corsair_api') ? 'true' : 'false'
                        env.BUILD_DOCS_CLIENT = reposToBuild.contains('docs') ? 'true' : 'false'
                        env.BUILD_WEB_APPS = (reposToBuild.contains('web_apps') || reposToBuild.contains('accounts') || reposToBuild.contains('workspace') || reposToBuild.contains('global-admin') || reposToBuild.contains('studio')) ? 'true' : 'false'
                        env.BUILD_RUNNER_APP = reposToBuild.contains('runner_app') ? 'true' : 'false'
                    } else {
                        echo 'Automatic build - detecting changes...'
                        
                        // Detect changes in each component
                        def aspnetToolkitChanged = hasChangesInPath('apis/WorcBackend-legacy/AspNetToolkit')
                        
                        // If AspNetToolkit changed, all .NET APIs need to be rebuilt
                        env.BUILD_ACCOUNTS_API = (hasChangesInPath('apis/WorcBackend-legacy/AccountsAPIs') || aspnetToolkitChanged) ? 'true' : 'false'
                        env.BUILD_WORKSPACE_API = (hasChangesInPath('apis/WorcBackend-legacy/WorkspaceAPIs') || aspnetToolkitChanged) ? 'true' : 'false'
                        env.BUILD_GLOBALADMIN_API = (hasChangesInPath('apis/WorcBackend-legacy/GlobalAdminAPIs') || aspnetToolkitChanged) ? 'true' : 'false'
                        env.BUILD_LLMPIPELINE_API = hasChangesInPath('apis/llmpipeline') ? 'true' : 'false'
                        env.BUILD_APACHECAMEL_API = hasChangesInPath('apis/apache-camel') ? 'true' : 'false'
                        env.BUILD_CORSAIR_API = hasChangesInPath('apis/corsair') ? 'true' : 'false'
                        env.BUILD_DOCS_CLIENT = hasChangesInPath('clients/docs') ? 'true' : 'false'
                        env.BUILD_WEB_APPS = hasChangesInPath('clients/web-apps') ? 'true' : 'false'
                        env.BUILD_RUNNER_APP = hasChangesInPath('clients/RunnerApp') ? 'true' : 'false'
                    }
                    
                    echo """
                    Changed components:
                    - Accounts API: ${env.BUILD_ACCOUNTS_API}
                    - Workspace API: ${env.BUILD_WORKSPACE_API}
                    - Global Admin API: ${env.BUILD_GLOBALADMIN_API}
                    - LLM Pipeline API: ${env.BUILD_LLMPIPELINE_API}
                    - Apache Camel API: ${env.BUILD_APACHECAMEL_API}
                    - Corsair API: ${env.BUILD_CORSAIR_API}
                    - Docs Client: ${env.BUILD_DOCS_CLIENT}
                    - Web Apps: ${env.BUILD_WEB_APPS}
                    - Runner App: ${env.BUILD_RUNNER_APP}
                    """.stripIndent()
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
        // Apache Camel API Build Stage
        // ======================
        
        stage('Apache Camel API') {
            when {
                expression { env.BUILD_APACHECAMEL_API == 'true' }
            }
            stages {
                stage('Build - Apache Camel API') {
                    steps {
                        dir('apis/apache-camel') {
                            echo 'Building Apache Camel API...'
                            withEnv(['JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64']) {
                                sh '/opt/maven/bin/mvn clean package -DskipTests'
                            }
                        }
                    }
                }
                stage('Deploy - Apache Camel API') {
                    steps {
                        script {
                            sshagent(credentials: ['aventisia_vps_ssh']) {
                                def targetServers = getTargetServers(env.BRANCH_NAME)
                                echo "Deploying Apache Camel API to ${targetServers.size()} server(s)..."
                                
                                targetServers.each { server ->
                                    sh "rsync -avz --delete ${WORKSPACE}/apis/apache-camel/target/camel-connector-harness-*.jar admin@${server}:/var/www/aventisia.com/apis/apachecamel/camel-connector-harness-staging.jar"
                                    sh "ssh admin@${server} 'mv /var/www/aventisia.com/apis/apachecamel/camel-connector-harness-staging.jar /var/www/aventisia.com/apis/apachecamel/camel-connector-harness.jar'"
                                    sh "ssh admin@${server} 'sudo systemctl restart apachecamel_apis.service'"
                                    echo "Successfully deployed Apache Camel API to ${server}"
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // ======================
        // Corsair Sidecar Build Stage
        // ======================

        stage('Corsair API') {
            when {
                expression { env.BUILD_CORSAIR_API == 'true' }
            }
            agent any
            tools {
                nodejs 'NodeJS 22.18.0'
            }
            stages {
                stage('Install - Corsair API') {
                    steps {
                        dir('apis/corsair') {
                            echo 'Installing Corsair dependencies...'
                            // --force: @corsair-dev/onepassword pins zod@4.1.13 while
                            // other plugins require ^4.1.13; force resolves the conflict.
                            sh 'npm ci --force'
                        }
                    }
                }
                stage('Build - Corsair API') {
                    steps {
                        dir('apis/corsair') {
                            echo 'Building Corsair API...'
                            sh 'npm run build'
                        }
                    }
                }
                stage('Generate - Corsair Configs') {
                    steps {
                        dir('apis/corsair') {
                            echo 'Generating Corsair config artifacts...'
                            // The small sibling artifacts (action map, integration catalog, vault credential
                            // type map) are written into the Workspace API codebase ConfigFiles folder and
                            // committed. The Corsair action-selector mapping file and the thousands of
                            // per-plugin configs are written to CORSAIR_CONFIG_DIR (a build-local dir)
                            // and are rsynced to the shared server files path in the Corsair Deploy
                            // stage, so they do not bloat the codebase.
                            sh 'CORSAIR_CONFIG_DIR=${WORKSPACE}/apis/corsair/generated-configs npm run generate:configs'
                        }
                    }
                }
                stage('Deploy - Corsair API') {
                    steps {
                        script {
                            sshagent(credentials: ['aventisia_vps_ssh']) {
                                def targetServers = getTargetServers(env.BRANCH_NAME)
                                echo "Deploying Corsair API to ${targetServers.size()} server(s)..."

                                targetServers.each { server ->
                                    def deployPath = '/home/admin/corsair'

                                    // Push the whole project, excluding local artifacts
                                    // and secrets so each server keeps its own .env.local.
                                    // Include dist/ so seed:tools:prod can run without rebuilding on the server.
                                    echo "Transferring to ${server}..."
                                    sh "rsync -avz --exclude 'node_modules' --exclude '.env.local' --exclude '.git' --exclude 'Jenkinsfile' --delete ${WORKSPACE}/apis/corsair/ admin@${server}:${deployPath}/"

                                    // The thousands of per-plugin Corsair configs are generated into
                                    // apis/corsair/generated-configs (see the Generate - Corsair Configs
                                    // stage) and are transferred with the project above. Rsync them to
                                    // the shared server files path so the Workspace API can serve them
                                    // without bloating the codebase.
                                    sh "ssh admin@${server} 'mkdir -p /var/www/aventisia.com/files/configs/Corsair'"
                                    sh "ssh admin@${server} 'rsync -avz --delete ${deployPath}/generated-configs/ /var/www/aventisia.com/files/configs/Corsair/'"

                                    echo "Installing production dependencies..."
                                    // --force: same zod peer conflict as the build step.
                                    sh "ssh admin@${server} 'cd ${deployPath} && npm ci --omit=dev --force'"

                                    echo "Running Corsair database migration..."
                                    // Idempotent: creates CorsairDb + applies migration.sql. Explicit here
                                    // so migration is deterministic regardless of the systemd ExecStart.
                                    sh "ssh admin@${server} 'cd ${deployPath} && npm run migrate:prod'"

                                    echo "Seeding Corsair tools into Workspace database..."
                                    sh "ssh admin@${server} 'cd ${deployPath} && npm run seed:tools:prod'"

                                    echo "Restarting the service..."
                                    sh "ssh admin@${server} 'sudo systemctl restart corsair_apis.service'"

                                    echo "Successfully deployed Corsair API to ${server}"
                                }
                            }
                        }
                    }
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

                                            echo "Copying default platform skills metadata to shared files directory..."
                                            sh "ssh admin@${server} 'mkdir -p /var/www/aventisia.com/files/skills'"
                                            sh "rsync -avz --delete ${WORKSPACE}/apis/llmpipeline/app/features/langgraph/skills/ admin@${server}:/var/www/aventisia.com/files/skills/"

                                            sh "ssh admin@${server} 'sudo systemctl restart workspace_apis.service'"
                                            echo "Successfully deployed Workspace API to ${server}"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                stage('Global Admin API') {
                    when {
                        expression { env.BUILD_GLOBALADMIN_API == 'true' }
                    }
                    stages {
                        stage('Restore - Global Admin API') {
                            steps {
                                dir('apis/WorcBackend-legacy/GlobalAdminAPIs') {
                                    echo 'Restoring Global Admin API packages...'
                                    sh 'dotnet restore'
                                    echo 'Restoring Global Admin API tools...'
                                    sh 'dotnet tool restore'
                                }
                            }
                        }
                        stage('Build - Global Admin API') {
                            steps {
                                dir('apis/WorcBackend-legacy/GlobalAdminAPIs') {
                                    echo 'Building Global Admin API...'
                                    sh 'dotnet build --configuration Release'
                                }
                            }
                        }
                        stage('Database migration - Global Admin API') {
                            steps {
                                script {
                                    sshagent(credentials: ['aventisia_vps_ssh']) {
                                        def targetServers = getTargetServers(env.BRANCH_NAME)
                                        echo "Database migration to ${targetServers.size()} server(s): ${targetServers.join(', ')}..."

                                        targetServers.each { server ->
                                            def remoteEnv = sh(
                                                script: "ssh admin@${server} 'cat /etc/environment'",
                                                returnStdout: true
                                            )
                                            def migrationEnvVars = remoteEnv.readLines()
                                                .collect { it.trim() }
                                                .findAll { it ==~ /^POSTGRESQL_[A-Z_]+=.*/ }
                                                .collect { line ->
                                                    def (name, value) = line.split('=', 2)
                                                    "${name}=${value.replaceAll(/^(["'])(.*)\1$/, '$2')}"
                                                }

                                            // IMPORTANT NOTE: the design-time factory falls back to localhost
                                            // when the host is missing, so fail here instead of migrating the wrong DB.
                                            if (migrationEnvVars.isEmpty()) {
                                                error "No POSTGRESQL_* variables in /etc/environment on ${server}"
                                            }

                                            withEnv(migrationEnvVars) {
                                                dir('apis/WorcBackend-legacy/GlobalAdminAPIs') {
                                                    echo "Migrating database schema on ${server}..."
                                                    sh 'ASPNETCORE_ENVIRONMENT=Production dotnet ef database update --context=GlobalAdminDbContext'
                                                }
                                            }

                                            echo "Successfully migrated database schema on ${server}"
                                        }
                                    }
                                }
                            }
                        }
                        stage('Publish - Global Admin API') {
                            steps {
                                dir('apis/WorcBackend-legacy/GlobalAdminAPIs') {
                                    echo 'Publishing Global Admin API...'
                                    sh 'dotnet publish -c Release --property:PublishDir=./Published'
                                }
                            }
                        }
                        stage('Deploy - Global Admin API') {
                            steps {
                                script {
                                    sshagent(credentials: ['aventisia_vps_ssh']) {
                                        // Get target servers based on branch
                                        def targetServers = getTargetServers(env.BRANCH_NAME)

                                        echo """Deploying Global Admin API to ${targetServers.size()} server(s)...
Required environment variables on each target (systemd unit for globaladmin_apis.service):
  POSTGRESQL_HOST, POSTGRESQL_USERNAME, POSTGRESQL_PASSWORD, JWT_SECRET_KEY (= AccountsAPIs secret)
  POSTGRESQL_* must also be present in /etc/environment, which the CI migration stage reads.
Optional environment variables (defaults in brackets):
  POSTGRESQL_PORT [5432], SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD,
  SMTP_MAIL_FROM_NAME, SMTP_MAIL_FROM_ADDRESS
Migrations run in the CI stage above and again on boot, so Postgres and database GlobalAdminDb must be
reachable from both the agent and the target."""

                                        // Do deployment on each target server
                                        targetServers.each { server ->
                                            echo "Deploying to ${server}..."

                                            // Deploy and restart service
                                            sh "rsync -avz --delete ${WORKSPACE}/apis/WorcBackend-legacy/GlobalAdminAPIs/Published/* admin@${server}:/var/www/aventisia.com/apis/globaladmin/"
                                            sh "ssh admin@${server} 'sudo systemctl restart globaladmin_apis.service'"

                                            echo "Successfully deployed to ${server}"
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
                                    sh "npx turbo run build --filter=accounts --filter=workspace --filter=global-admin --filter=studio -- --mode=${getBuildMode(env.BRANCH_NAME)}"
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
                        stage('Deploy - Global Admin App') {
                            steps {
                                script {
                                    sshagent(credentials: ['aventisia_vps_ssh']) {
                                        def targetServers = getTargetServers(env.BRANCH_NAME)
                                        echo "Deploying Global Admin App to ${targetServers.size()} server(s)..."

                                        targetServers.each { server ->
                                            sh "rsync -avz --delete ${WORKSPACE}/clients/web-apps/apps/global-admin/dist/* admin@${server}:/var/www/aventisia.com/clients/globaladmin/"
                                            echo "Successfully deployed Global Admin App to ${server}"
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
        // Runner App Build Stage
        // ================================
        
        stage('Runner App') {
            when {
                expression { env.BUILD_RUNNER_APP == 'true' }
            }
            agent any
            steps {
                script {
                    echo 'Publishing RunnerApp...'
                    sh "set -e; bash ${WORKSPACE}/clients/RunnerApp/RunnerApp.Linux/publish-ci.sh"

                    sshagent(credentials: ['aventisia_vps_ssh']) {
                        def targetServers = getTargetServers(env.BRANCH_NAME)
                        echo "Uploading RunnerApp to ${targetServers.size()} server(s)..."
                        def targetDir = '/var/www/aventisia.com/files/binaries'
                        def scriptsDir = '/var/www/aventisia.com/files/scripts'

                        targetServers.each { server ->
                            def zipPath = sh(
                                script: "ls -t ${WORKSPACE}/clients/RunnerApp/artifacts/AvintraRunnerApp_*.zip | head -n1",
                                returnStdout: true
                            ).trim()
                            sh "ssh admin@${server} 'mkdir -p ${targetDir} ${scriptsDir}'"
                            sh "rsync -avz --timeout=300 ${zipPath} admin@${server}:${targetDir}/"
                            sh "rsync -avz --timeout=300 ${WORKSPACE}/clients/RunnerApp/RunnerApp.Windows/Install-AvintraRunnerService.ps1 admin@${server}:${scriptsDir}/"
                            echo "Successfully uploaded RunnerApp to ${server}"
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