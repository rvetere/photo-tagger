import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const Schema = mongoose.Schema

// create a schema
const userSchema = new Schema({
  name                  : { type: String, required: true, unique: true },
  email                 : { type: String, required: true, unique: true },
  password              : { type: String, required: true },
  domain                : { type: String, required: true, unique: true },
  modules               : { type: Array, default: [] },
  roles                 : { type: Array, default: ['user'] },
  provider              : { type: Object, default: {} },
  owncloudMeta          : { type: Object, default: {} },
  createdAt             : { type: Date, default: Date.now },
  updatedAt             : { type: Date, default: Date.now },
  rememberPwCode        : { type: String, default: null },
  rememberPwCodeAt      : { type: Number, default: null }
})

userSchema.methods.authenticate = function authenticate(passwordClearText, callback) {
  bcrypt.compare(passwordClearText, this.password, function(err, res) { // eslint-disable-line
    if (err) throw err
    if (process.env.AUTH_DEV) console.log(`bcrypt compare result "${res}"`) // eslint-disable-line max-len
    callback(res)
  })
}


// the schema is useless so far
// we need to create a model using it
let User
try {
  User = mongoose.model('User')
} catch (e) {
  // ignore
}
if (!User) {
  User = mongoose.model('User', userSchema)
}

// make this available to our users in our Node applications
export default User
