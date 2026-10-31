pipeline {
    agent {
        docker{
            image 'tuchsanai/devtools:2569_1'
            args '--privileged --tmpfs /run'
        }
    }
    environment {
        // ตั้งชื่อ project name เพื่อไม่ให้ตีกับ build อื่นที่อาจรันพร้อมกัน
        COMPOSE_PROJECT_NAME = "build-${BUILD_NUMBER}"
    }
    stages{
        stage('backend - build'){
            when{
                allOf{
                    changeset "backend/**"
                    branch 'backend/**'
                }
            }
            steps{
                sh "docker compose -p ${COMPOSE_PROJECT_NAME} --profile prod run --rm --build backend node -e 'require(\"./src/index.js\"); process.exit(0);'"
            }
        }
        stage('frontend - build'){
            when{
                allOf{
                    changeset "frontend/**"
                    branch 'frontend/**'
                }
            }
            steps{
                sh "docker compose -p ${COMPOSE_PROJECT_NAME} --profile prod build frontend"
            }
        }
        stage('all - build'){
            when{
                not{
                    anyOf{
                        branch 'frontend/**'
                        branch 'backend/**'
                    }
                }
            }
            steps{
                sh "docker compose -p ${COMPOSE_PROJECT_NAME} --profile prod up -d --build"
            }
        }
    }
    post{
        always{
            sh "docker compose -p ${COMPOSE_PROJECT_NAME} --profile prod down -v --remove-orphans"
        }
    }
}