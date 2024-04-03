import mongoose from "mongoose";
import OTPModel from "../Models/OTPModel.js";
import UserModel from "../Models/UserModel.js";

const conncetToDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_DB_URL);
    console.log(`Connected To Mongo ${connection.connection.host}`);
    const currentTime = Date.now();

    //deleting expired otps & not verified users from db after a certain time.
    await OTPModel.deleteMany({
      expiresAt: { $lte: currentTime },
    });
    await UserModel.deleteMany({
      emailStatus: "Pending",
      autoDeleteNotVerifiedIn: { $lte: currentTime },
    });
    
  } catch (error) {
    console.log(`Error while connecting to mongodb ${error}`);
  }
};

export default conncetToDB;
