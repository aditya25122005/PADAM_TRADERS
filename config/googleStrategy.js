const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      callbackURL: "http://localhost:8085/auth/google/callback"
    },

    async (accessToken, refreshToken, profile, done) => {

      try {
        const email = profile.emails[0].value;

        //  Check if user already exists
        let user = await User.findOne({ email });

        //  If not, create new user
        if (!user) {
          user = await User.create({
            email: email,
            googleId: profile.id,
            username: profile.displayName.replace(/\s+/g, "") // remove spaces
          });
        }

        return done(null, user);

      } catch (err) {
        return done(err, null);
      }
    }
  )
);
