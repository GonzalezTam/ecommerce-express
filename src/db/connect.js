const mongoose = require('mongoose');

const connectDB = async (MONGO_URI) => {
  try{
		mongoose.set('strict', false);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    })
    console.log("DB Connected")
  } catch (error) {
    //console.log(error)
    console.log("DB Connection Error")
	}
}

module.exports = connectDB;
