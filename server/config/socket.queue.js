var clients = [];

var service = {
  put : function (socket) {

    var index = clients.indexOf(socket);
    if (index === -1) {
      clients.push(socket);
    }

    socket.on('disconnect', function(){
      var index = clients.indexOf(socket);
      if (index != -1) {
          clients.splice(index, 1);
          console.info('Client gone (id=' + socket.id + ').');
          console.info("Remain clients:", clients.length);
      }
    });
  },

  get : function(){
   return clients.shift();
  },

  state : function(){
    
    console.log("\n\n==== QUEUE State ====\nclients", clients.length); 
    
    if( clients.length ){

      clients.forEach(function(client, i){
        console.log('| seq | %d | %s |', i, client.id)
      });

      console.log("--------------\n\n"); 

    }else{
      
      console.log("--------------\n\n"); 

    }
  }
}

module.exports = service;