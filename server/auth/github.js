const passport = require('passport')
const router = require('express').Router()
const GithubStrategy = require('passport-github').Strategy
const {User} = require('../db/models')
module.exports = router

/**
 * For OAuth keys and other secrets, your Node process will search
 * process.env to find environment variables. On your production server,
 * you will be able to set these environment variables with the appropriate
 * values. In development, a good practice is to keep a separate file with
 * these secrets that you only share with your team - it should NOT be tracked
 * by git! In this case, you may use a file called `secrets.js`, which will
 * set these environment variables like so:
 *
 * process.env.GITHUB_CLIENT_ID = 'your google client id'
 * process.env.GITHUB_CLIENT_SECRET = 'your google client secret'
 * process.env.GITHUB_CALLBACK = '/your/google/callback'
 */

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  console.log('Github client ID / secret not found. Skipping GITHUB OAuth.')
} else {
  const githubconfig = {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK
  }

  const strategy = new GithubStrategy(
    githubconfig,
    (token, refreshToken, profile, done) => {
      const githubId = profile.id
      const name = profile.displayName
      const email = profile.username + '@email.com' //profile.emails[0].value

      User.findOrCreate({
        where: {githubId},
        defaults: {name, email}
      })
        .then(([user]) => done(null, user))
        .catch(done)
    }
  )

  passport.use(strategy)

  router.get('/', passport.authenticate('github', {scope: 'email'}))

  router.get(
    '/callback',
    passport.authenticate('github', {
      successRedirect: '/home',
      failureRedirect: '/login'
    })
  )
}
