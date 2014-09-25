'use strict';

exports.generate = function(query, data){

  var tags;

  if( !data.id ){
    console.log("[jenkins-scheduler] It is not a vaild jenkins client!!");
    return false;
  }

  if( data.tag ){
    tags = data.tag.split(",");
    tags.forEach(function(s, i){
      tags[i] = s.replace(/^\s+|\s+$/g, '')
    });
    query.tags = {$elemMatch: {$in: tags} };  
  } 
  
  console.log("[jenkins-scheduler][quest]", data);
  return true;
}