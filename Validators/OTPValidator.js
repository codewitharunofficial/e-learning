import bcrypt from "bcrypt";
import OTPModel from "../Models/OTPModel.js";
import { transporter } from "../MiddleWares/nodemailer.js";
import UserModel from "../Models/UserModel.js";

export const hashOTP = async (OTP) => {
  try {
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(OTP, saltRounds);
    return hashedOTP;
  } catch (error) {
    console.log(error);
  }
};

export const compareOTP = async (OTP, hashedOTP) => {
    return bcrypt.compare(OTP, hashedOTP);
}

export const generateOtp = async (email, firstName, lastName) => {
  try {
    const OTP = Math.floor(1000 + Math.random() * 9000).toString();

        const hashedOTP = await hashOTP(OTP);

        const mailOptions = {
          from: "chatrrislive@gmail.com",
          to: email,
          subject: "Account Verification",
          text: `
          Welcome ${firstName + "" + lastName},
          The New World Of E-Learning \n
          OTP for your E-learning Account Verification is
           ${OTP}.
          The OTP Is Valid For 1 Minute.
          Please Verify OTP To Become Our To Enroll in courses on the go.
          `,
        };

        transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            return console.error(error.message);
          }
          console.log("Email sent :", info.response);
        });

        const otpInDb = new OTPModel({
          email: email,
          OTP: hashedOTP,
        }).save();
  } catch (error) {
    console.log(error);
  }
}


//verify otp to update email

export const verifyOTPAndUpdateEmail = async (newEmail, email, otp) => {
  try {
    if (!otp) {
      res.send({
        success: false,
        message: "Please Provide a valid OTP",
      });
      if (!email) {
        res.send({
          success: false,
          message: "Please Provide a valid Email",
        });
      }
    } else {
      const OTP = await OTPModel.findOne({ email });
      if (!OTP) {
        return res.status(201).send({
          success: false,
          message: "Invalid Email",
        });
      }

      const verify = await compareOTP(otp, OTP.OTP);
      if (!verify) {
        return false
      } else {
        const timeNow = Date.now();

        if (timeNow > OTP.expiresAt) {
          await OTPModel.findOneAndDelete({ email });
          return false
        } else {
          await OTPModel.findOneAndDelete({ email });
          const user = await UserModel.findOneAndUpdate(
            { email: email },
            { emailStatus: "Verified", email: newEmail },
            { new: true }
          );
          console.log("OTP Verified & User Updated Successfully");
          return true;
        }

      }
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};
