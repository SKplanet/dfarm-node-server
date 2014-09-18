var ldap = require('ldapjs'),
    assert = require('assert'),
    client = ldap.createClient({
      url: 'ldap://10.40.29.172:389/OU=Person,DC=SKP,DC=AD'
    }),
    opts = {
      //filter: '(&(CN=1001*)(mail=s*))',
      filter: '(CN=1001968)',
      scope: 'sub',
      //attributes: ['displayName', 'mail', 'first_name', 'last_name', 'title', 'cell_phone', 'office_phone', 'mobile', 'phone' ]
    };

//ldap.Attribute.settings.guid_format = ldap.GUID_FORMAT_B; 

// login - 
client.bind('Confluence@skp.ad', '(!Conf0!)', function (err) {
  if(err){
    console.log([err.dn, err.code, err.name, err.message].join(" / "));
  }
  assert.ifError(err);

  client.search('OU=Person,DC=SKP,DC=AD', opts, function (err, res) {

    assert.ifError(err);


    res.on('searchEntry', function (entry) {
      var user = entry.object;
      console.log(user);

    });


    res.on('end', function(result) {
      console.log('status: ' + result.status);

      client.unbind(function(err) {
        assert.ifError(err);
      });
    });


  });

});



