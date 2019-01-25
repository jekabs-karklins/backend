module.exports = function (app) {
    var dataSource = app.datasources.mongo;
    console.log("Datasource host %s, database %s", dataSource.connector.settings.host, dataSource.connector.settings.database)
    dataSource.isActual(function (err, actual) {
        // console.log("Database actual:", actual)
        // if (!actual) {
        dataSource.autoupdate(function (err, result) {
            if (err) {
                console.log("Database Autoupdate error: %s", err)
            } else {
                console.log("Database Autoupdate result: %s", result)

            }
        });
        //}
    });

    var loopback = require('loopback');
    var DataModel = loopback.PersistedModel;

    console.log("Adding ACLS for UserIdentity")

    DataModel.extend('UserIdentity', null, {
        acls: [{
                principalType: 'ROLE',
                principalId: '$everyone',
                permission: 'DENY'
            },
            {
                accessType: 'READ',
                principalType: 'ROLE',
                principalId: '$authenticated',
                permission: 'ALLOW'
            }
        ]
    });

    dataSource.connector.connect(function (err, db) {
        db.collection('Dataset').createIndex({
            "$**": "text"
        }, function (err) {
            if (!err) {
                console.log("Text Index on dataset created succesfully")
            } else {
                console.log(err);
            }
        });
    });

    // add further information to options parameter
    // see https://loopback.io/doc/en/lb3/Using-current-context.html#use-a-custom-strong-remoting-phase

    app.remotes().phases
        .addBefore('invoke', 'options-from-request')
        .use(function (ctx, next) {
            //console.log("============ Phase: args,options",ctx.args,ctx.options)
            if (!ctx.args.options || !ctx.args.options.accessToken) return next();
            const User = app.models.User;
            const UserIdentity = app.models.UserIdentity
            // first check if email in User
            User.findById(ctx.args.options.accessToken.userId, function (err, user) {
                if (err) return next(err);
                // console.log("Found user:",user)
                ctx.args.options.currentUser = user.username;
                // TODO get email from UserIdentity and only this email for functional accounts
                ctx.args.options.currentUserEmail = user.email;
                // override email field for normal user accounts
                UserIdentity.findOne({
                    //json filter
                    where: {
                        userId: ctx.args.options.accessToken.userId
                    }
                }, function (err, u) {
                    // add user email and groups
                    if (!!u) {
                        var groups = []
                        if (u.profile) {
                            console.log("Profile:",u.profile)
                            // if user account update where query to append group groupCondition
                            ctx.args.options.currentUser = u.profile.username
                            ctx.args.options.currentUserEmail  = u.profile.email;
                            groups = u.profile.accessGroups
                            // check if a normal user or an internal ROLE
                            if (typeof groups === 'undefined') {
                                groups = []
                            }
                        }
                        ctx.args.options.currentGroups=groups
                    }
                    //console.log("Resulting options:",ctx.args.options)
                    return next()
                })
            });
        });
};
