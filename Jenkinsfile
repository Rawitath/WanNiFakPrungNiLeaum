pipeline {
    agent {
        docker{
            image 'tuchsanai/devtools:2569_1'
            label 'docker-linux'
            args '--privileged --tmpfs /run'
        }
    }
    environment {
        // ตั้งชื่อ project name เพื่อไม่ให้ตีกับ build อื่นที่อาจรันพร้อมกัน
        COMPOSE_PROJECT_NAME = "build-${BUILD_NUMBER}"
    }
    stages{
        stage('tuchsanai - setup') {
            steps {
                sh '''
                    # 1. เคลียร์และเตรียม Directory สำหรับ /run และ /var/run
                    mkdir -p /run/docker /var/run
                    
                    # 2. รัน dockerd ใน background โดยบังคับใช้ storage-driver vfs (หรือ overlay2) 
                    # พร้อมดู log เพื่อ debug หากมีปัญหา
                    dockerd --storage-driver=vfs > /tmp/dockerd.log 2>&1 &
                    
                    # 3. วนรอเช็คพร้อมตั้ง Timeout (ไม่ให้รันวนค้างตลอดไป)
                    TRY_COUNT=0
                    MAX_TRIES=30
                    
                    while ! docker info > /dev/null 2>&1; do
                        echo "Waiting for internal dockerd to start... ($TRY_COUNT/$MAX_TRIES)"
                        sleep 1
                        TRY_COUNT=$((TRY_COUNT+1))
                        
                        if [ $TRY_COUNT -ge $MAX_TRIES ]; then
                            echo "ERROR: Docker daemon failed to start within time!"
                            echo "=== DOCKERD LOGS ==="
                            cat /tmp/dockerd.log
                            exit 1
                        fi
                    done
                    
                    echo "Internal dockerd started successfully!"
                '''
            }
        }

        stage('build') {
            parallel {
                stage('backend - build'){
                    when{
                        changeset "backend/**"
                    }
                    steps{
                        sh "docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod build backend"
                    }
                }
                stage('frontend - build'){
                    when{
                        changeset "frontend/**"
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
    post{
        always{
            sh "docker compose -p ${env.COMPOSE_PROJECT_NAME} --profile prod down -v --remove-orphans"
        }
    }
}
