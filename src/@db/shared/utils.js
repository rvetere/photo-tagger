import bcrypt from 'bcrypt'
import PasswordSalt from '../schema/passwordSalt';

export const SALT_ROUNDS = 10;

export const initSalt = () => {
  PasswordSalt.find({}, (err, entries) => {
    if (err) throw err

    if (entries.length === 0) {

      bcrypt.genSalt(SALT_ROUNDS, (saltErr, salt) => {
        if (saltErr) throw saltErr

        const newSalt = new PasswordSalt({
          salt
        })
        if (process.env.AUTH_DEV) console.info('Generate new salt for password generation on user collection!') // eslint-disable-line max-len

        global.PASSWORD_SALT = salt

        newSalt.save()
      })

      return
    }

    const passwordSaltEntry = entries.pop()
    global.PASSWORD_SALT = passwordSaltEntry.salt
  })
}
