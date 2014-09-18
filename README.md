# 개발환경 설정

아래 주소에서 소스를 체크아웃 받는다.
http://yobi.skplanet.com/SQE/devicefarm

```bash
$> git clone http://[USER]@yobi.skplanet.com/SQE/devicefarm
$> cd devicefarm
$> npm install 
$> grunt serve
```
서버를 실행 시키기전에 반드시 MongoDB 인스턴스가 실행되어 있어야한다.

# 자동 배포 시스템
## 빌드 스크립트
```
$ /app/devicefarm> ./start.sh
```
[참고 문서](http://coffeenix.net/doc/shell/introbashscript.htm)

## 서버 데몬 실행
```
$> forever start -l /app/devicefarm/logs/forever/access.log -o /app/devicefarm/logs/forever/out.log -e /app/devicefarm/logs/forever/err.log dist/server/app.js
```

