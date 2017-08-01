function main(params) {
  if (!params._id) {
    Promise.reject(new Error('id cannot be null'));
  }
  const Cloudant = require('cloudant');
  const username = params.CLOUDANT_USERNAME;
  const password = params.CLOUDANT_PASSWORD;

  var dbname = 'owtextbotdb';
  var owdb = null;
  //connect to Cloudant
  var cloudant = Cloudant({
    account: username,
    password: password
  });

  try {
    owdb = cloudant.db.create(dbname);
    if (owdb != null) {
      owdb = cloudant.db.use(dbname);
    }
  } catch(e) {
    owdb = cloudant.db.use(dbname);
  }

  return new Promise(function(resolve, reject) {
    owdb.get(params._id, function(err, body) {
      if (err) {
        return reject(err);
      }
      var output = Object.assign({}, {conversation: params.conversation}, {_id: params._id}, {_rev: params._rev});
      output.conversation.context = body.context;

      return resolve(output);
    });
  });
}

module.exports.main = main;
