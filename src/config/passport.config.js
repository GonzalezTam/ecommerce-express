import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import local from 'passport-local';
import userModel from '../dao/models/user.model.js';
import cartModel from '../dao/models/cart.model.js';
import { createHash, isValidPassword } from '../middlewares/auth.js';
import dotEnvConfig from './env.config.js';

const { GITHUB_CALLBACK_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = dotEnvConfig;
const LocalStrategy = local.Strategy;

const initializePassport = () => {
  passport.use('register', new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email'
  }, async (req, username, password, done) => {
    const { firstName, lastName, email, age } = req.body;
    const cart = await cartModel.create({});

    try {
      const newUser = {
        firstName,
        lastName,
        email,
        age,
        cart: cart._id,
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
      await userModel.findOneAndUpdate({ email: username }, { last_connection: new Date() });
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
      if (user) {
        await userModel.findOneAndUpdate({ email }, { last_connection: new Date() });
        return done(null, user); // user found, return that user.
      }
      const cart = await cartModel.create({}); // create empty cart for new user
      const newUser = await userModel.create({
        firstName: name,
        lastName: name,
        email,
        age: 0,
        cart: cart._id,
        password: createHash(email), // use email as password
        role: 'user',
        last_connection: new Date()
      });
      return done(null, newUser); // create new user with github account
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
