const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value
                    ?.trim()
                    .toLowerCase();

                if (!email) {
                    return done(
                        new Error("Google account did not provide an email.")
                    );
                }

                let user = await User.findOne({ email });

                if (!user) {
                    const username =
                        profile.displayName?.replace(/\s+/g, "") ||
                        `google_${profile.id}`;

                    user = await User.create({
                        email,
                        googleId: profile.id,
                        username,
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);