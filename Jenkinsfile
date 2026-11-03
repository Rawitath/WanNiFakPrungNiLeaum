pipeline {
    agent {
        docker{
            image 'tuchsanai/devtools:2569_1'
            label 'docker-linux'
            args '--privileged --tmpfs /run -u 0:0'
        }
    }
    environment {
        // ตั้งชื่อ project name เพื่อไม่ให้ตีกับ build อื่นที่อาจรันพร้อมกัน
        COMPOSE_PROJECT_NAME = "build-${BUILD_NUMBER}"
    }
    stages{
        stage('build') {
            parallel {
                stage('backend - test & build'){
                    when{
                        anyOf{
                            changeset "backend/**"
                            changeset "Jenkinsfile"
                        }
                    }
                    stages{
                        stage('backend - test'){
                            steps{
                                withCredentials([
                                    string(credentialsId: 'POSTGRES_DB', variable: 'POSTGRES_DB'),
                                    string(credentialsId: 'POSTGRES_USER', variable: 'POSTGRES_USER'),
                                    string(credentialsId: 'POSTGRES_PASSWORD', variable: 'POSTGRES_PASSWORD')
                                ]) {
                                    sh "docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod run --rm --build backend-test"
                                }
                            }
                        }
                        stage('backend - build'){
                            steps{
                                withCredentials([
                                    string(credentialsId: 'POSTGRES_DB', variable: 'POSTGRES_DB'),
                                    string(credentialsId: 'POSTGRES_USER', variable: 'POSTGRES_USER'),
                                    string(credentialsId: 'POSTGRES_PASSWORD', variable: 'POSTGRES_PASSWORD')
                                ]) {
                                    sh "docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod build --target run backend"
                                }
                            }
                        }
                    }
                }
                stage('frontend - build'){
                    when{
                        anyOf{
                            changeset "frontend/**"
                            changeset "Jenkinsfile"
                        }
                    }
                    steps{
                        sh "docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod build frontend"
                    }
                }
            }
        }

        stage('run') {
            parallel {
                stage('backend - run'){
                    when{
                        allOf{
                            branch 'backend/**'
                        }
                    }
                    steps{
                        withCredentials([
                            string(credentialsId: 'POSTGRES_DB', variable: 'POSTGRES_DB'),
                            string(credentialsId: 'POSTGRES_USER', variable: 'POSTGRES_USER'),
                            string(credentialsId: 'POSTGRES_PASSWORD', variable: 'POSTGRES_PASSWORD')
                        ]) {
                            sh "docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod up -d backend"
                            sh '''
                                docker run --rm \
                                    --network host \
                                    curlimages/curl:latest \
                                    curl --fail --retry 5 --retry-delay 3 --retry-connrefused \
                                    http://localhost:3000/
                            '''
                        }
                    }
                }
                stage('frontend - run'){
                    when{
                        allOf{
                            branch 'frontend/**'
                        }
                    }
                    steps{
                        sh "docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod up -d frontend"
                        sh '''
                            docker run --rm \
                                --network host \
                                curlimages/curl:latest \
                                curl --fail --retry 5 --retry-delay 3 --retry-connrefused \
                                http://localhost:8081/
                        '''
                    }
                }
                stage('all - run'){
                    when{
                        not{
                            anyOf{
                                branch 'frontend/**'
                                branch 'backend/**'
                            }
                        }
                    }
                    steps{
                        withCredentials([
                            string(credentialsId: 'POSTGRES_DB', variable: 'POSTGRES_DB'),
                            string(credentialsId: 'POSTGRES_USER', variable: 'POSTGRES_USER'),
                            string(credentialsId: 'POSTGRES_PASSWORD', variable: 'POSTGRES_PASSWORD')
                        ]) {
                            sh "docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod up -d"
                            sh '''
                                docker run --rm \
                                    --network host \
                                    curlimages/curl:latest \
                                    sh -c '
                                        curl --fail --retry 5 --retry-delay 3 --retry-connrefused http://localhost:3000/ &&
                                        curl --fail --retry 5 --retry-delay 3 --retry-connrefused http://localhost:8081/
                                    '
                            '''
                        }
                    }
                }
            }
        }
    }
    post{
        always{
            withCredentials([
                string(credentialsId: 'POSTGRES_DB', variable: 'POSTGRES_DB'),
                string(credentialsId: 'POSTGRES_USER', variable: 'POSTGRES_USER'),
                string(credentialsId: 'POSTGRES_PASSWORD', variable: 'POSTGRES_PASSWORD')
            ]) {
                sh "docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod down -v --remove-orphans"
            }
        }
    }
}
