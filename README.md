# Device Test Farm Full-Stack Node Server
Device Test Farm 서버는 Test Farm Clinet(Jenkins Plugin)가 단말을 요청할때 


 Device Test Farm Jenkins Client 에서 요청한 


# 개발환경 설정

아래 주소에서 소스를 체크아웃 받는다.
http://yobi.skplanet.com/SQE/devicefarm

    ```bash
    $> git clone http://[USER]@yobi.skplanet.com/SQE/devicefarm
    $> cd devicefarm
    $> npm install
    $> bower install
    $> grunt serve
    ```
서버를 실행 시키기전에 반드시 MongoDB 인스턴스가 실행되어 있어야한다.

# 자동 배포 시스템

## 서버에서 grunt build를 위한 모듈
"connect-livereload": "~0.4.0",
"grunt": "~0.4.4",
"jit-grunt": "^0.5.0",
"jshint-stylish": "~0.1.5",
"grunt-contrib-clean": "~0.5.0",
"grunt-asset-injector": "^0.1.0",
"grunt-concurrent": "~1.0.0",
"grunt-wiredep": "~1.8.0",
"grunt-usemin": "~2.1.1",
"grunt-contrib-imagemin": "~0.7.1",
"grunt-svgmin": "~0.4.0",
"grunt-autoprefixer": "~0.7.2",
"grunt-angular-templates": "^0.5.4",
"grunt-contrib-concat": "~0.4.0",
"grunt-contrib-copy": "~0.5.0",
"grunt-google-cdn": "~0.4.0",
"grunt-contrib-cssmin": "~0.9.0",
"grunt-contrib-uglify": "~0.4.0",
"grunt-rev": "~0.1.0",

## 빌드 스크립트
    ```
    $ /app/devicefarm> ./start.sh
    ```
[참고 문서](http://coffeenix.net/doc/shell/introbashscript.htm)

## 서버 데몬 실행
    ```
    $> forever start -l /app/devicefarm/logs/forever/access.log -o /app/devicefarm/logs/forever/out.log -e /app/devicefarm/logs/forever/err.log dist/server/app.js
    ```

## 자동 배포 모니터링
    ```
    $> forever start -l /app/devicefarm/logs/git2dist.log git2distd.js
    ```

## FAQ
Q1. **npm install** 명령을 실행했는데 devDependencies 모듈이 설치되지 않습니다. 
> NODE_ENV 환경이 production일 경우 devDependencies 모듈이 설치되지 않습니다. 따라서 아래와 같이 모듈설치시 아래와 같이 환경을 변경후 실행하세요. 
    ```
    NODE_EVN=development npm install
    ```
