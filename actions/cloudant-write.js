console.log('reading from cloudant');
function main(params) {
    if (!params._id) {
        Promise.reject(new Error('id cannot be null'))
    }
    
    const Cloudant = require('cloudant');
    const username = params.CLOUDANT_USERNAME;
    const password = params.CLOUDANT_PASSWORD;
    var dbname = 'owtextbotdb';
    var owdb = null;
    
    const cloudant = Cloudant({
        account: username,
        password: password
    });
    
    console.log("checking if exists");
    try {
        console.log("creating");
        owdb = cloudant.db.create(dbname);
        if (db != null) {
            console.log("db exists");
            owdb = cloudant.db.use(dbname);
        }
    } catch(e) {
        console.log("catching");    
        owdb = cloudant.db.use(dbname);
    }
    
    return new Promise(function(resolve, reject) {
        console.log('writing');
        var doc = Object.assign({}, {context: params.conversation.context}, {_id: params._id}, {_rev: params._rev});

        owdb.insert(doc, function(err, body) {
            if (err) {
                console.log('[db.insert]', err.message);
                return reject(err);
            }
            console.log('You have updated the doc.');

            var output = Object.assign({}, {conversation: params.conversation}, {_id: params._id}, {_rev: body.rev});
            return resolve(output);
        });
    });
}
