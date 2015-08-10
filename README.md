# Test Device Farm Full-Stack Node Server
Test Device Farm 서버는 Jenkins Plugin인이 요청한 단말 정보를 반환해주는 역할을 한다. 


# 개발환경 설정

    $> git clone 저장소
    $> cd devicefarm
    $> npm install
    $> bower install
    $> grunt serve
    
서버를 실행 시키기전에 반드시 MongoDB 인스턴스가 실행되어 있어야한다.

## ADBKit 수정
ADBKit의 인증 문제를 해결하기 위해서는 간단한 코드 수정이 필요하다. 
ADBKit이 설치되어 있는 node_modules 폴더에 들어가서 socket.js 파일을 찾아 205번 라인 근처에서 아래와 같이 수정한다. 

    // node_modules/adbkit/lib/adb/tcpusb/socket.js
    // AS IS
    
    })(this)).then((function(_this) {
      return function(key) {
        return _this.options.auth(key)["catch"](function(err) {
          throw new Socket.AuthError("Rejected by user-defined handler");
        });
      };
    
    // TO BE
    })(this)).then((function(_this) {
      return function(key) {
        return true;
      };

# 배포방법
현재 DFarm은 스탑워치와 같은 물리 리눅서 서버에서 돌아가고 있다. 따라서 배포하려면 물리서버에 접근해야한다. 
배포는 간단하다 git 으로 최신 내용을 업데이트 받고 필요하다면 노드모듈을 설치한다. 
    
    $> git pull
    $> npm install
    
그리고 Forever를 실행한다. 

## Forever 실행 스크립트

    $ /app/devicefarm-node-server> ./restart.sh
    
[참고 문서](http://coffeenix.net/doc/shell/introbashscript.htm)


## FAQ
Q1. **npm install** 명령을 실행했는데 devDependencies 모듈이 설치되지 않습니다. 

> NODE_ENV 환경이 production일 경우 devDependencies 모듈이 설치되지 않습니다. 따라서 아래와 같이 모듈설치시 아래와 같이 환경을 변경후 실행하세요. 

    NODE_EVN=development npm install
