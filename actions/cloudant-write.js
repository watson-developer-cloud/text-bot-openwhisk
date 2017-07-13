console.log('reading from cloudant');
function main(params) {
    
    if (!params._id) {
        Promise.reject(new Error('id cannot be null'))
    }
    //load the package
    var Cloudant = require('cloudant');
        
    var username = params.CLOUDANT_USERNAME;
    var password = params.CLOUDANT_PASSWORD;
    var dbname = 'owtextbotdb';
    var owdb = null;
    //connect to Cloudant
    var cloudant = Cloudant({
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
        var doc = Object.assign({}, {context: params.conversation.context});
        doc._id = params._id;
        doc._rev = params._rev;
        console.log(doc);
        
        var output = Object.assign({}, {conversation: params.conversation});
        
        owdb.insert(doc, function(err, body) {
            if (err) {
                console.log('[db.insert]', err.message);
                return reject(err);
            }
            console.log('You have updated the doc.');
            console.log(body);
            
            output._rev = body.rev;
            output._id = params._id;
            return resolve(output);
        });
    });
}
