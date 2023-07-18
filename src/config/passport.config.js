import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import local from 'passport-local';
import userModel from '../models/user.model.js';
import { createHash, isValidPassword } from '../utils.js';
import dotEnvConfig from './env.config.js';

const { GITHUB_CALLBACK_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = dotEnvConfig;
const LocalStrategy = local.Strategy;

const initializePassport = () => {
  passport.use('register', new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email'
  }, async (req, username, password, done) => {
    const { firstName, lastName, email, age } = req.body;

    // check if cart id will be generated automatically on register or should be generated later.
    try {
      const newUser = {
        firstName,
        lastName,
        email,
        age,
        cart: '',
        password: createHash(password)
      };
      const result = await userModel.create(newUser);
      return done(null, result);
    } catch (err) {
      return done('Error: ' + err);
    }
  }));

  passport.use('login', new LocalStrategy({
    usernameField: 'email'
  }, async (username, password, done) => {
    try {
      const user = await userModel.findOne({ email: username }).lean().exec();
      if (!user) return done(null, user); // user not found
      if (!isValidPassword(user, password)) return done(null, false); // invalid password
      return done(null, user); // success
    } catch (err) {
      return done('Error: ' + err); // server error
    }
  }));

  passport.use('github', new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALLBACK_URL,
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    // console.log(profile); // github profile data
    const name = profile._json.name;
    const email = profile._json.email || profile.emails[0].value;
    try {
      const user = await userModel.findOne({ email }).lean().exec();
      if (user) return done(null, user); // user found, return that user.
      if (!user || !email) return done(null, false); // user not found, return false.
      const newUser = {
        firstName: name,
        email
      };
      return done(null, newUser);
    } catch (err) {
      return done('Error: ' + err);
    }
  }
  ));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user);
  });
};

export default initializePassport;
