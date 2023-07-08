const mongoose = require('mongoose');

const connectDB = async () => {
  try{
		mongoose.set('strict', false);
    await mongoose.connect("mongodb+srv://coder:coder@backend39755.igyxgug.mongodb.net/ecommerce", {
      serverSelectionTimeoutMS: 5000
    })
    console.log("DB Connected")
  } catch (error) {
    console.log("DB Connection Error")
	}
}

module.exports = connectDB;
