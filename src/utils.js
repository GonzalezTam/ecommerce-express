const bcrypt = require('bcrypt');
const userModel = require('./dao/models/user.model.js');

const registerValidations = async (req, res, next) => {
	const emailRegex = /\S+@\S+\.\S+/;
	const { email, password, password2, firstName, lastName, age } = req.body

	if (!firstName) return res.status(400).send({ message: 'First name is required.' })
	if (!lastName) return res.status(400).send({ message: 'Last name is required.' })
	if (!age || age > 100 || age < 18) return res.status(400).send({ message: 'Specify a valid age between 18 and 100.' })
	if (!email || !emailRegex.test(email)) return res.status(400).send({ message: 'Provide a valid email.' })
	if (email === 'adminCoder@coder.com') return res.status(400).send({ message: 'Email not available.' })
	if (!password) return res.status(400).send({ message: 'Password is required.' })
	if (!password2) return res.status(400).send({ message: 'Password confirmation is required.' })
	if (password !== password2) return res.status(400).send({ message: 'Passwords do not match.' })

  try {
    const user = await userModel.findOne({ email });
    if (user) return res.status(400).send({ message: 'Email already registered.' });
  } catch (error) {
    return res.status(400).send({ message: `Error: ${error}` });
  }
  next();
}

const loginValidations = (req, res, next) => {
	const emailRegex = /\S+@\S+\.\S+/;
	const { email, password } = req.body
	if (!email && !password) return res.status(400).send({ message: 'Email and password are required.' });
	if (!email || !emailRegex.test(email)) return res.status(400).send({ message: 'A valid email is required.' })
	if (!password) return res.status(400).send({ message: 'Password is required.' })

	// Hardcoded admin user
	if (email === 'adminCoder@coder.com'){
		if (password !== 'adminCod3r123') return res.status(401).send({ message: 'Login failed. Wrong password.' })
		const reqSessionUser = {
			_id: undefined,
			email: email,
			firstName: 'Coder',
			lastName: 'House',
			age: 100,
			role: 'admin'
		}
		req.session.user = reqSessionUser;
		return res.send({ message: 'Login success!', user: reqSessionUser })
	}
	next();
}

const createHash = password => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

const isValidPassword = (user, password) => {
    return bcrypt.compareSync(password, user.password)
}

module.exports = { loginValidations, registerValidations, createHash, isValidPassword };
