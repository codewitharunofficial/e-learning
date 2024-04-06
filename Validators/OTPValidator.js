import bcrypt from "bcrypt";
import OTPModel from "../Models/OTPModel.js";
import UserModel from "../Models/UserModel.js";
import { sendEmail, sendEmailOTP } from "../helpers/Resend.js";
import {
  accountDeletion,
  changedPassword,
  emailUpdation,
  messageForEmailVerificationOnSignUp,
} from "../helpers/Email.js";
import { hashPassword } from "./UserValidator.js";
import { validationResult } from "express-validator";
// import { accountDeletion, emailUpdation, messageForEmailVerificationOnSignUp, sendEmail, sendEmailOTP } from "../helpers/Email.js";

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
};

export const generateOtp = async (
  email,
  firstName,
  lastName,
  message,
  subject
) => {
  try {
    const OTP = Math.floor(1000 + Math.random() * 9000).toString();

    const hashedOTP = await hashOTP(OTP);

    sendEmailOTP(email, subject, firstName, lastName, OTP, message);

    const otpInDb = new OTPModel({
      email: email,
      OTP: hashedOTP,
    }).save();
    return {
      success: true,
      message: "OTP Has Been Sent To Your Email Address.",
    };
  } catch (error) {
    console.log(error);
  }
};

//generate new otp for later verification

export const generateNewOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const OTP = Math.floor(1000 + Math.random() * 9000).toString();

    const hashedOTP = await hashOTP(OTP);

    const user = await UserModel.findById({ _id: id });
    const otp = await OTPModel.findOne({ email: user.email });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Invalid email provided or No user found",
      });
    } else if (user.emailStatus !== "Pending") {
      return res.status(201).send({
        success: true,
        message: "Your Email Is Already Verified",
      });
    } else {
      if (otp) {
        await otp.deleteOne();
        sendEmailOTP(
          user.email,
          messageForEmailVerificationOnSignUp.subject,
          user.firstName,
          user.lastName,
          OTP,
          messageForEmailVerificationOnSignUp.message
        );
        return res.status(200).send({
          success: true,
          message: "New OTP Sent Successfully To your Registered Email",
        });
      } else {
        sendEmailOTP(
          user.email,
          messageForEmailVerificationOnSignUp.subject,
          user.firstName,
          user.lastName,
          OTP,
          messageForEmailVerificationOnSignUp.message
        );
        const otpInDb = new OTPModel({
          email: user.email,
          OTP: hashedOTP,
        }).save();
        res.status(200).send({
          success: true,
          message: "New OTP Sent Successfully To your Registered Email",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

//verify otp to update email

export const verifyOTPAndUpdateEmail = async (newEmail, email, otp) => {
  try {
    if (!otp) {
      retrun({
        success: false,
        message: "Please Provide a valid OTP",
      });
    }
    if (!email) {
      return {
        success: false,
        message: "Please Provide a valid Email",
      };
    } else {
      const OTP = await OTPModel.findOne({ email });
      if (!OTP) {
        return {
          success: false,
          message: "Invalid Email",
        };
      }

      const verify = await compareOTP(otp, OTP.OTP);
      if (!verify) {
        return false;
      } else {
        const timeNow = Date.now();

        if (timeNow > OTP.expiresAt) {
          await OTPModel.findOneAndDelete({ email });
          return false;
        } else {
          await OTPModel.findOneAndDelete({ email });
          const user = await UserModel.findOneAndUpdate(
            { email: email },
            { emailStatus: "Verified", email: newEmail },
            { new: true }
          );

          sendEmail(
            email,
            emailUpdation.subject,
            user.firstName,
            user.lastName,
            emailUpdation.message
          );
          return {
            success: true,
            message: "OTP Verified & Email Updated Successfully",
          };
        }
      }
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

//for verify & deleting user account

export const verifyOTPAndDeleteAccount = async (email, otp, message) => {
  try {
    if (!otp) {
      return {
        success: false,
        message: "Please Provide a valid OTP",
      };
    }
    if (!email) {
      return {
        success: false,
        message: "Please Provide a valid Email",
      };
    } else {
      const OTP = await OTPModel.findOne({ email });
      if (!OTP) {
        return {
          success: false,
          message: "Invalid Email",
        };
      }

      const verify = await compareOTP(otp, OTP.OTP);
      if (!verify) {
        return false;
      } else {
        const timeNow = Date.now();

        if (timeNow > OTP.expiresAt) {
          await OTPModel.findOneAndDelete({ email });
          return false;
        } else {
          await OTPModel.findOneAndDelete({ email });
          const user = await UserModel.findOneAndDelete({ email: email });
          sendEmail(
            email,
            accountDeletion.subject,
            user.firstName,
            user.lastName,
            accountDeletion.message
          );
          return {
            success: true,
            message: "OTP Verified & Account has been deleted Successfully",
          };
        }
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

//verify & reset password

export const verifyOTPAndResetPassword = async (email, otp, newPassword, message) => {
  try {
    if (!otp) {
      return {
        success: false,
        message: "Please Provide a valid OTP",
      };
    }
    else if (!email) {
      return {
        success: false,
        message: "Please Provide a valid Email",
      };

    } else  if(!newPassword){
      return {
        success: false,
        message: "Please Provide your new Password Email",
      };
    } else {
      const OTP = await OTPModel.findOne({ email });
      if (!OTP) {
        return {
          success: false,
          message: "Invalid Email Or OTP Expired",
        };
      }


      const verify = await compareOTP(otp, OTP.OTP);
      if (!verify) {
        return false;
      } else {
        const timeNow = Date.now();

        if (timeNow > OTP.expiresAt) {
          await OTPModel.findOneAndDelete({ email });
          return false;
        } else {
          await OTPModel.findOneAndDelete({ email });
          const hashedPassword = await hashPassword(newPassword);
          const user = await UserModel.findOneAndUpdate({ email: email }, {password: hashedPassword}, {new: true});
          sendEmail(
            email,
            changedPassword.subject,
            user.firstName,
            user.lastName,
            changedPassword.message
          );
          return {
            success: true,
            message: "OTP Verified & Pasword has been Updated Successfully",
          };
        }
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
