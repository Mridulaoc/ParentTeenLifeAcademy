import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { UserRepository } from "../domain/repositories/userRepository";
import { GoogleAuthUseCase } from "../domain/usecases/googleAuthUseCase";

const userRepository: UserRepository = new UserRepository();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL:
        "https://www.parentteenlifeacademy.site/auth/google/callback",
      passReqToCallback: true,
    },
    async (
      request: any,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: Function
    ) => {
      const googleAuthUseCase = new GoogleAuthUseCase(userRepository);

      try {
        const user = await googleAuthUseCase.findOrCreateGoogleUser(profile);
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user: any, done: Function) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: Function) => {
  try {
    const user = await userRepository.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
