const { Router } = require('express');
const { registerValidations, loginValidations } = require('../utils.js');
const passport = require('passport');

const router = Router();

router.post('/register', registerValidations, passport.authenticate('register', {
	failureRedirect: '/register?failed=true',
}), async (req, res) => {
	res.redirect('/login')
})

router.post('/login', loginValidations, passport.authenticate('login', {
	failureRedirect: '/login?failed=true',
}), async (req, res) => {
	if (!req.user) {
		return res.status(400).send({ status: 'error', message: 'Email or password incorrect' })
	}
	req.session.user = {
		firstName: req.user.firstName,
		lastName: req.user.lastName,
		email: req.user.email,
		age: req.user.age,
		cart: req.user.cart,
		role: 'user'
	}
	res.redirect('/products')
})

router.get('/current', (req, res) => {
	if (!req.session.user) return res.send({ message: 'No active session' })
	res.send(req.session.user)
})

router.get('/github', passport.authenticate('github', { scope: ["user:email"] }), (req, res) => { })

router.get('/githubcallback',
	passport.authenticate('github', { failureRedirect: '/login?failed=github' }),
	async (req, res) => {
		req.session.user = req.user
		res.redirect('/products')
	})

router.get('/logout', function (req, res) {
	req.session.destroy(err => {
		if (err) return res.send({ message: 'Logout failed' })
	})
	res.send({ message: 'Logout success!' })
});

module.exports = router;
