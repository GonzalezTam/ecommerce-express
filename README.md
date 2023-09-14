# ABOUT
Simple ecommerce backend. It uses express as a framework and mongodb as a database.
It contains a minimal frontend which is built with ejs and bootstrap, its purpose is to demonstrate the backend functionality.

# INSTALLATION
1. Clone the repository

2. Install dependencies
```
npm install
```
3. Create a .env file in the root directory and copy the structure from .env.example

4. Run the project
```
npm start
```
5. Visit http://localhost:3000

# FEATURES
- Login and register / Github login with passport
- Session management with express-session and connect-mongo
- Password reset with email verification
- Documents upload with multer
- User roles (admin, user, premium)
- Admin has access to users and products management
- Premium users have access to products management
- Users can add products to cart and checkout
- Mailing service with nodemailer
- Tests with mocha and chai
- Linting with eslint
- Logging with winston
- Chat with socket.io

# API DOCUMENTATION
Once the project is running, visit http://localhost:3000/docs to see the api documentation (swagger)
