import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import type { User } from '@shared/schema';

// Configure local strategy
passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const { firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return done(null, false, { message: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const newUser = await storage.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      authProvider: 'local',
      isEmailVerified: false
    });
    
    return done(null, newUser);
  } catch (error) {
    return done(error);
  }
}));

passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    if (user.authProvider !== 'local' || !user.password) {
      return done(null, false, { message: 'Please sign in with your social account' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Configure Google OAuth strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const domain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
  const protocol = domain.includes('localhost') ? 'http' : 'https';
  const callbackURL = `${protocol}://${domain}/api/auth/google/callback`;
  
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with this Google ID
      let user = await storage.getUserByProvider('google', profile.id);
      
      if (user) {
        return done(null, user);
      }
      
      // Check if user exists with same email
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await storage.getUserByEmail(email);
        if (user) {
          // Link Google account to existing user
          await storage.linkProvider(user.id, 'google', profile.id);
          return done(null, user);
        }
      }
      
      // Create new user
      const newUser = await storage.createUser({
        email: email || null,
        firstName: profile.name?.givenName || profile.displayName || 'User',
        lastName: profile.name?.familyName || '',
        profileImageUrl: profile.photos?.[0]?.value || null,
        authProvider: 'google',
        providerId: profile.id,
        isEmailVerified: true
      });
      
      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }));
}

// Configure Facebook OAuth strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  const domain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
  const protocol = domain.includes('localhost') ? 'http' : 'https';
  const facebookCallbackURL = `${protocol}://${domain}/api/auth/facebook/callback`;
  
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: facebookCallbackURL,
    profileFields: ['id', 'displayName', 'photos', 'email', 'name']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with this Facebook ID
      let user = await storage.getUserByProvider('facebook', profile.id);
      
      if (user) {
        return done(null, user);
      }
      
      // Check if user exists with same email
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await storage.getUserByEmail(email);
        if (user) {
          // Link Facebook account to existing user
          await storage.linkProvider(user.id, 'facebook', profile.id);
          return done(null, user);
        }
      }
      
      // Create new user
      const newUser = await storage.createUser({
        email: email || null,
        firstName: profile.name?.givenName || profile.displayName || 'User',
        lastName: profile.name?.familyName || '',
        profileImageUrl: profile.photos?.[0]?.value || null,
        authProvider: 'facebook',
        providerId: profile.id,
        isEmailVerified: true
      });
      
      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }));
}

// Serialize/deserialize user for sessions
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;