// ==============================================================================
// Helper Functions for GitHub Checks API
// Designed for private Jenkins instances to display full details in GitHub PR Checks
// ==============================================================================

def safePublishChecks(Map args) {
    try {
        publishChecks(args)
    } catch (Exception e) {
        echo "[ChecksAPI] Warning: Failed to publish check '${args.name}': ${e.getMessage()}"
    }
}

def stripAnsi(String input) {
    if (!input) return ""
    return input.replaceAll('\u001B\\[[;?0-9]*[a-zA-Z]', '')
}

def formatDuration(long durationSec) {
    if (durationSec < 60) {
        return "${durationSec}s"
    }
    long mins = (durationSec / 60) as long
    long secs = durationSec % 60
    return "${mins}m ${secs}s"
}

def getTimestamp() {
    return new Date().format('yyyy-MM-dd HH:mm:ss')
}

def getCommitShort() {
    if (env.GIT_COMMIT) {
        return env.GIT_COMMIT.length() > 7 ? env.GIT_COMMIT.substring(0, 7) : env.GIT_COMMIT
    }
    return "N/A"
}

def getBranchName() {
    return env.BRANCH_NAME ?: env.GIT_BRANCH ?: "N/A"
}

def sanitizeLog(String log, int maxChars = 50000) {
    if (!log) return ""
    String clean = stripAnsi(log)
    if (clean.length() > maxChars) {
        return "... [Log truncated: showing last ${maxChars} characters] ...\n" + clean.substring(clean.length() - maxChars)
    }
    return clean
}

def getLogTail(String log, int maxLines = 25) {
    if (!log) return "(No logs recorded)"
    def lines = log.split("\r?\n")
    if (lines.size() <= maxLines) {
        return log
    }
    def result = []
    int start = lines.size() - maxLines
    for (int i = start; i < lines.size(); i++) {
        result.add(lines[i])
    }
    return result.join("\n")
}

def generateStepSummary(String checkName, String status, long durationSec) {
    String icon = status == 'SUCCESS' ? '🟢' : (status == 'FAILURE' ? '🔴' : '🟡')
    String durationText = durationSec > 0 ? formatDuration(durationSec) : 'In progress...'
    String commit = getCommitShort()
    String branch = getBranchName()
    String timestamp = getTimestamp()

    return """### ${icon} ${checkName} &mdash; ${status}

| Metric | Value |
| :--- | :--- |
| **Status** | `${status}` |
| **Duration** | `${durationText}` |
| **Step** | `${checkName}` |
| **Branch** | `${branch}` |
| **Commit** | `${commit}` |
| **Build** | `#${env.BUILD_NUMBER ?: 'N/A'}` |
| **Compose Project** | `${env.COMPOSE_PROJECT_NAME ?: 'N/A'}` |
| **Timestamp** | `${timestamp}` |

> 🔒 **Jenkins Internal Server Notice:** Jenkins is hosted in a private network and cannot be accessed externally. All execution logs, command outputs, and diagnostics for this step are published directly in this check run below.
""".trim()
}

def generateStepDetailsText(String cmd, String logContent, boolean isSuccess) {
    String cleanLog = sanitizeLog(logContent)
    String cleanCmd = cmd.trim()

    if (isSuccess) {
        return """#### 💻 Executed Command
```bash
${cleanCmd}
```

#### 📋 Execution Logs
<details>
<summary><b>Click to expand console log</b></summary>

```text
${cleanLog ?: '(No output recorded)'}
```
</details>
""".trim()
    } else {
        String failureTail = getLogTail(cleanLog, 25)
        return """### ⚠️ Failure Summary (Last 25 lines)
```text
${failureTail ?: '(No output recorded)'}
```

#### 💻 Executed Command
```bash
${cleanCmd}
```

#### 📋 Full Execution Logs
<details open>
<summary><b>Click to collapse full console log</b></summary>

```text
${cleanLog ?: '(No output recorded)'}
```
</details>
""".trim()
    }
}

def executeStepWithCheck(Map args) {
    String checkName = args.name
    String checkTitle = args.title ?: checkName
    String cmd = args.command
    boolean useCredentials = args.useCredentials ?: false
    boolean failOnError = args.containsKey('failOnError') ? args.failOnError : true

    String safeName = checkName.replaceAll('[^a-zA-Z0-9_-]', '_')
    String logFile = "${WORKSPACE}/check_${safeName}.log"

    // 1. Initial Check: IN_PROGRESS
    safePublishChecks(
        name: checkName,
        title: "${checkTitle} &mdash; In Progress",
        status: 'IN_PROGRESS',
        conclusion: 'NONE',
        summary: generateStepSummary(checkName, 'IN_PROGRESS', 0),
        text: "#### 💻 Executed Command\n```bash\n${cmd.trim()}\n```\n\n*Logs will appear here once the step completes.*",
        detailsURL: env.BUILD_URL ?: ''
    )

    long startTime = System.currentTimeMillis()
    int exitCode = 0

    Closure runShell = {
        sh(
            script: """#!/bin/bash
                set -o pipefail 2>/dev/null || true
                rm -f "${logFile}"
                (
                    ${cmd}
                ) 2>&1 | tee "${logFile}"
                exit \${PIPESTATUS[0]:-\$?}
            """,
            returnStatus: true
        )
    }

    if (useCredentials) {
        withCredentials([
            string(credentialsId: 'POSTGRES_DB', variable: 'POSTGRES_DB'),
            string(credentialsId: 'POSTGRES_USER', variable: 'POSTGRES_USER'),
            string(credentialsId: 'POSTGRES_PASSWORD', variable: 'POSTGRES_PASSWORD'),
            string(credentialsId: 'PASSWORD_ENDEC_SALT', variable: 'PASSWORD_ENDEC_SALT'),
            string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
            string(credentialsId: 'JWT_EXPIRATION', variable: 'JWT_EXPIRATION'),
            string(credentialsId: 'GOOGLE_CLIENT_ID', variable: 'GOOGLE_CLIENT_ID'),
            string(credentialsId: 'GOOGLE_CLIENT_SECRET', variable: 'GOOGLE_CLIENT_SECRET')
        ]) {
            exitCode = runShell()
        }
    } else {
        exitCode = runShell()
    }

    // แก้ไขตรงนี้: ใช้ .intdiv(1000) ป้องกัน Groovy แปลงผลหารเป็น BigDecimal
    long durationSec = (System.currentTimeMillis() - startTime).intdiv(1000)
    boolean isSuccess = (exitCode == 0)

    String logContent = ""
    if (fileExists(logFile)) {
        logContent = readFile(file: logFile)
    }

    // 2. Final Check: COMPLETED with SUCCESS or FAILURE and rich logs
    safePublishChecks(
        name: checkName,
        title: isSuccess ? "${checkTitle} &mdash; Passed (${formatDuration(durationSec)})" : "${checkTitle} &mdash; Failed (exit code ${exitCode})",
        status: 'COMPLETED',
        conclusion: isSuccess ? 'SUCCESS' : 'FAILURE',
        summary: generateStepSummary(checkName, isSuccess ? 'SUCCESS' : 'FAILURE', durationSec),
        text: generateStepDetailsText(cmd, logContent, isSuccess),
        detailsURL: env.BUILD_URL ?: ''
    )

    if (!isSuccess && failOnError) {
        error("Step '${checkName}' failed with exit code ${exitCode}")
    }
}

def publishOverallSummary(String conclusion, String message) {
    String icon = conclusion == 'SUCCESS' ? '🟢' : '🔴'
    safePublishChecks(
        name: 'pipeline - summary',
        title: conclusion == 'SUCCESS' ? 'CI Pipeline Succeeded' : 'CI Pipeline Failed',
        status: 'COMPLETED',
        conclusion: conclusion,
        summary: """### ${icon} Overall CI Pipeline &mdash; ${conclusion}

| Metric | Value |
| :--- | :--- |
| **Overall Result** | `${conclusion}` |
| **Branch** | `${getBranchName()}` |
| **Commit** | `${getCommitShort()}` |
| **Build** | `#${env.BUILD_NUMBER ?: 'N/A'}` |
| **Timestamp** | `${getTimestamp()}` |

> **Summary:** ${message}

🔒 *Note: Jenkins is hosted privately. Step-level outputs and command logs can be found in each check run listed on this commit/PR.*
""".trim(),
        detailsURL: env.BUILD_URL ?: ''
    )
}

// ==============================================================================
// Declarative Pipeline Definition
// ==============================================================================

pipeline {
    agent {
        docker {
            image 'tuchsanai/devtools:2569_1'
            label 'docker-linux'
            args '--privileged --tmpfs /run -u 0:0'
        }
    }
    environment {
        // ตั้งชื่อ project name เพื่อไม่ให้ตีกับ build อื่นที่อาจรันพร้อมกัน
        COMPOSE_PROJECT_NAME = "build-${BUILD_NUMBER}"
    }
    stages {
        stage('build') {
            parallel {
                stage('backend - test & build') {
                    when {
                        anyOf {
                            changeset "backend/**"
                            changeset "Jenkinsfile"
                        }
                    }
                    stages {
                        stage('backend - test') {
                            steps {
                                script {
                                    executeStepWithCheck(
                                        name: 'backend - test',
                                        title: 'Backend Test',
                                        command: "docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod run --rm --build backend-test",
                                        useCredentials: true
                                    )
                                }
                            }
                        }
                        stage('backend - build') {
                            steps {
                                script {
                                    executeStepWithCheck(
                                        name: 'backend - build',
                                        title: 'Backend Build',
                                        command: "docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod build backend",
                                        useCredentials: true
                                    )
                                }
                            }
                        }
                    }
                }
                stage('frontend - build') {
                    when {
                        anyOf {
                            changeset "frontend/**"
                            changeset "Jenkinsfile"
                        }
                    }
                    steps {
                        script {
                            executeStepWithCheck(
                                name: 'frontend - build',
                                title: 'Frontend Build',
                                command: "docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod build frontend",
                                useCredentials: false
                            )
                        }
                    }
                }
            }
        }

        stage('run') {
            parallel {
                stage('backend - run') {
                    when {
                        allOf {
                            branch 'backend/**'
                        }
                    }
                    steps {
                        script {
                            executeStepWithCheck(
                                name: 'backend - run',
                                title: 'Backend Run & Healthcheck',
                                command: """
                                    docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod up -d backend
                                    docker run --rm \\
                                        --network host \\
                                        curlimages/curl:latest \\
                                        curl --fail --retry 5 --retry-delay 3 --retry-connrefused \\
                                        http://localhost:3000/api/docs
                                """,
                                useCredentials: true
                            )
                        }
                    }
                }
                stage('frontend - run') {
                    when {
                        allOf {
                            branch 'frontend/**'
                        }
                    }
                    steps {
                        script {
                            executeStepWithCheck(
                                name: 'frontend - run',
                                title: 'Frontend Run & Healthcheck',
                                command: """
                                    docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod up -d frontend
                                    docker run --rm \\
                                        --network host \\
                                        curlimages/curl:latest \\
                                        curl --fail --retry 5 --retry-delay 3 --retry-connrefused \\
                                        http://localhost:8081/
                                """,
                                useCredentials: false
                            )
                        }
                    }
                }
                stage('all - run') {
                    when {
                        not {
                            anyOf {
                                branch 'frontend/**'
                                branch 'backend/**'
                            }
                        }
                    }
                    steps {
                        script {
                            executeStepWithCheck(
                                name: 'all - run',
                                title: 'Full Stack Run & Healthcheck',
                                command: """
                                    docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod up -d
                                    docker run --rm \\
                                        --network host \\
                                        curlimages/curl:latest \\
                                        sh -c '
                                            curl --fail --retry 5 --retry-delay 3 --retry-connrefused http://localhost:3000/api/docs &&
                                            curl --fail --retry 5 --retry-delay 3 --retry-connrefused http://localhost:8081/
                                        '
                                """,
                                useCredentials: true
                            )
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                executeStepWithCheck(
                    name: 'cleanup',
                    title: 'Docker Cleanup',
                    command: "docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod down -v --remove-orphans",
                    useCredentials: true,
                    failOnError: false
                )
            }
        }
        success {
            script {
                publishOverallSummary('SUCCESS', 'All executed stages passed successfully.')
            }
        }
        failure {
            script {
                publishOverallSummary('FAILURE', 'One or more stages failed. Check individual step check runs above for error traces.')
            }
        }
    }
}
