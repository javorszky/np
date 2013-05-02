module.exports = function(opts) {
  var options = {
    cookieName: opts && opts.cookieName || 'ndd-session',
    expiry: opts && opts.expiry || 604800
  },
  mongoose = require('mongoose'),
  ObjectId = mongoose.Schema.Types.ObjectId,
  sessionSchema = mongoose.Schema({
    cookiestring: String,
    user: ObjectId,
    valid: {
      type: Date,
      ldefault: Date.now,
      expires: (options.expiry / 1000)
    }
  });
  userSchema = mongoose.Schema({
    oauth_id: 'string',
    name: {
      first: 'string',
      last: 'string'
    },
    email: 'string',
    joined: {
      type: Date,
      ldefault: Date.now
    },
    picture: 'string',
    bd: 'string',
    gender: 'string',
    token: {
      access_token: {type: String, ldefault: ''},
      token_type: {type: String, ldefault: ''},
      expires_in: {type: Number, ldefault: 0},
      refresh_token: {type: String, ldefault: ''},
      id_token: {type: String, ldefault: ''}
    }
  }),
  uuid = require('node-uuid'),
  gapi = require('./gapi'),
  Session = mongoose.model('Session', sessionSchema),
  User = mongoose.model('User', userSchema),
  getUserInfo = function(res, done, next, req) {
    gapi.oauth
      .userinfo.get()
      .withAuthClient(gapi.client)
      .execute(function(err, results) {
        findOrCreateOne(results, gapi.client.credentials,
                        done, res, next, req);
    });
  },
  findOrCreateOne = function(profile, tokens, done, res, next, req) {
    User.findOne({
      'oauth_id': profile.id
    }, function(err, person) {
      if (err) {
        console.log('error ' + err);
      } else {
        if (person === null) {
          User.create({
            oauth_id: profile.id,
            name: {
              first: profile.given_name,
              last: profile.family_name
            },
            email: profile.email,
            bd: profile.birthday,
            picture: profile.picture,
            gender: profile.gender,
            token: tokens
          }, function(err, newuser) {
            if (err) {
              console.log('error', err);
            } else {
              done(err, newuser, res, next, req);
            }
          }); // end of User.create()
        } else {
          done(err, person, res, next, req);
        }
      }
    }); // end of User.findeOne();
  },
  checkCookie = function(req) {
    return !!req.cookies[options.cookieName];
  },
  setCookie = function(err, newuser, res, next, req) {
    var identifier = uuid.v4();
    res.cookie(options.cookieName, identifier, {
      expires: new Date(Date.now() + options.expiry)
    });
    req.user = newuser;
    Session.create({
      cookiestring: identifier,
      user: newuser._id
    }, function(err, newsession) {
    });
    next();
  };

  mongoose.connect('localhost', 'nodedate');

  return function(req, res, next) {
    if (req.url.indexOf('/javascript') != -1 || req.url.indexOf('/stylesheets') != -1) {
      // we're on a static content link, don't do stuff
      next();
    } else {
      if (checkCookie(req)) {
        /**
        * We found the cookie! Tasks then:
        *
        * - Populate the req.user
        * - Update the cookie on the client (setCookie)
        * - Update the date on the session thingy in the database
        */
        var query = {
              'cookiestring': req.cookies[options.cookieName]
            },
            update = {
              valid: new Date
            },
            opts = {
              upsert: true
            };

        Session.findOneAndUpdate(query, update, opts, function(err, session) {
          if (session !== null) {
            User.findOne({
              '_id': session.user
            }, function(err, user) {
              req.user = user;
              req.logout = function() {
                var cookie_value = req.cookies[options.cookieName];
                res.clearCookie(options.cookieName);
                Session.findOneAndRemove({
                  'cookiestring': cookie_value
                }, function(err, result) {

                });
              };
              var uid = req.cookies[options.cookieName];
              res.cookie(options.cookieName, uid, {
                expires: new Date(Date.now() + options.expiry)
              });
              next();
            });
          } else {
            next();
          }
        });
      } else {
        console.log('there be no cookie');
        code = req.query.code;
        if (code) {
          gapi.client.getToken(code, function(err, tokens) {
            gapi.client.credentials = tokens;
            getUserInfo(res, setCookie, next, req);
          });
        } else {
          next();
        }
      }
    }
  };
};
