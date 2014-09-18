var exec = require('child_process').exec,
    config = require('./git2distConfig.json'),
    cmd = "git ls-remote --heads",
    moment = require("moment"),
    timer, fs = require('fs');
 
function getTime(){
  return moment().format("YYYY-MM-DD mm:hh:ss");
}
 
function rewriteConfig(){
  fs.writeFile("./git2distConfig.json", JSON.stringify(config, null, 2), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("[",getTime(),"]", "DONE.");
    }
  });  
}
 
function exectueScript(){
  console.log("[",getTime(),"]", "distribute HEAD: ", config.git.HEAD);
  var sh = config.dist;
 
  exec(sh.command, {cwd:sh.cwd}, function (error, stdout, stderr) {
    console.log(stdout);
    rewriteConfig();
  });
}
 
console.log("[", getTime(),"]", "start git2dist demon...");
(function chkHashChanged(){
  var git = config.git;
 
  //console.log("[", getTime(),"]", "Check '", git.branch,"' Hash Changed...");
  exec([cmd, git.repository].join(" "), function (error, stdout, stderr) {
    var data = stdout.split("\n");

    for(var i=0, len=data.length; i<len; ++i){
 
      var heads = data[i].split("\t"), head;
      var regx = new RegExp(git.branch);
 
      if ( regx.test(heads[1]) ){
        head = heads[0];
        break;
      }
    }
 
    if(!head){
      clearTimeout(timer);
      console.error("[", getTime(),"]", "There is no", git.branch, "branch");
    }else{
 
      if(git.HEAD != head ) {
        git.HEAD = head;
        exectueScript();
      }
    }
  });
 
  timer = setTimeout(chkHashChanged, config.intervalTime);  
})();
