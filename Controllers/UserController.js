import { validationResult } from "express-validator";
import UserModel from "../Models/UserModel.js";
import { hashPassword, comparePassword } from "../Validators/UserValidator.js";
import {
  compareOTP,
  generateOtp,
  verifyOTPAndDeleteAccount,
  verifyOTPAndResetPassword,
  verifyOTPAndUpdateEmail,
} from "../Validators/OTPValidator.js";
import OTPModel from "../Models/OTPModel.js";
import JWT from "jsonwebtoken";
import cloudinary from "../Config/cloudinray.js";
import {
  finishedSignUp,
  forgotPasswordRequest,
  messageForAccountDeletionReq,
  messageForEmailUpdationReq,
  messageForEmailVerificationOnSignUp,
} from "../helpers/Email.js";
import { sendEmail } from "../helpers/Resend.js";

export const signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    switch (true) {
      case !firstName:
        throw new Error("First Name Is Required");
      case !lastName:
        throw new Error("Last Name Is Required");
      case !email:
        throw new Error("Email Is Required");
      case !password:
        throw new Error(
          "Password is Required & Should be of atleast 6 characters and Should contain atleast 1 Uppercase, 1 lowercase, 1 special character & 1 number"
        );
      case !phone:
        throw new Error("Phone Number Is Required");
    }

    //validating user, checking if provided email or phone is already registered or not

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send({
        success: false,
        error: errors.array(),
      });
    } else {
      const existingUser = await UserModel.findOne({
        $or: [{ email: email }, { phone: phone }],
      });

      if (existingUser) {
        return res.status(201).send({
          success: false,
          message: "Email Or Phone Is Already Registered",
        });
      } else {
        const hashedPassword = await hashPassword(password);
        generateOtp(
          email,
          firstName,
          lastName,
          messageForEmailVerificationOnSignUp.message,
          messageForEmailVerificationOnSignUp.subject
        );

        const user = new UserModel({
          ...req.body,
          password: hashedPassword,
          name: firstName + " " + lastName,
        });
        const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        await user.save();
        res.status(200).send({
          success: true,
          message: `An OTP Has Been Sent To ${email}, Enter The OTP To Verify & Finish Signing Up`,
          user,
          token,
        });
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//verify Email Through otp

export const verifyOTP = async (req, res) => {
  try {
    const { otp, email } = req.body;
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
      const OTP = await OTPModel.findOne({ email: email });
      if (!OTP) {
        return res.status(201).send({
          success: false,
          message: "Invalid Email",
        });
      }

      const verify = await compareOTP(otp, OTP.OTP);
      if (!verify) {
        return res.status(201).send({
          success: false,
          message: "Incorrect OTP",
        });
      } else {
        const timeNow = Date.now();

        if (timeNow > OTP.expiresAt) {
          await OTPModel.findOneAndDelete({ email: email });
          return res.status(201).send({
            success: false,
            message: "OTP Has Expired, Kindly Request New OTP",
          });
        } else {
          await OTPModel.findOneAndDelete({ email: email });
          const user = await UserModel.findOneAndUpdate(
            { email: email },
            { emailStatus: "Verified" },
            { new: true }
          );
        }

        const user = await UserModel.findOne({ email: email });
        sendEmail(
          email,
          finishedSignUp.subject,
          user.firstName,
          user.lastName,
          finishedSignUp.message
        );
        res.status(200).send({
          success: true,
          message: "OTP Verification Successfull",
        });
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};

//User Login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    switch (true) {
      case !email:
        throw new Error("Email is Required");
      case !password:
        throw new Error("Password is Required");
    }

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Email Not Registered",
      });
    } else {
      const match = await comparePassword(password, user?.password);
      if (!match) {
        return res.status(400).send({
          success: false,
          message: "Invalid Password",
        });
      } else {
        const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });
        res.status(200).send({
          success: true,
          message: `Welcome ${user?.name}`,
          user,
          token,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//for updating user profile

export const updateProfile = async (req, res) => {
  try {
    const { phone, firstName, lastName } = req.body;
    const { id } = req.params;
    switch (true) {
      case !email:
        throw new Error("Email Is Required");
      case !phone:
        throw new Error("Phone Is Required");
      case !lastName:
        throw new Error("Last Name Is Required");
      case !firstName:
        throw new Error("First Name Is Required");
    }
    const user = await UserModel.findById({ _id: id });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "No such user found",
      });
    } else {
      const updatedUser = await UserModel.findByIdAndUpdate(
        { _id: user?._id },
        {
          phone: phone,
          firstName: firstName,
          lastName: lastName,
          name: firstName + " " + lastName,
        },
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "Profile Updated Successfully",
        updatedUser,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
    console.log(error);
  }
};

//for verifying & updating new email

export const otpForNewEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    if (!id) {
      throw new Error("User ID is Required");
    } else {
      const user = await UserModel.findById({ _id: id });

      if (!user) {
        return res.status(400).send({
          success: false,
          message: "No Account found with provided email",
        });
      } else {
        const otp = await OTPModel.findOne({ email: email });
        if (otp) {
          return res.status(201).send({
            success: false,
            message: "An OTP Has Already been Generated and sent to your email",
          });
        } else {
          await generateOtp(
            email,
            user?.firstName,
            user?.lastName,
            messageForEmailUpdationReq.message,
            messageForEmailUpdationReq.subject
          );
          res.status(200).send({
            success: true,
            message: "An OTP Is Sent On The New Email Please Verify To Update",
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//verifying & updating new email

export const updateNewEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const { id } = req.params;
    switch (true) {
      case !email:
        throw new Error("Email is required to update");
      case !otp:
        throw new Error("Please provide the OTP");
    }
    const user = await UserModel.findById({ _id: id });
    const match = await verifyOTPAndUpdateEmail(email, user?.email, otp);

    if (!match) {
      res.status(400).send({
        success: false,
        message: match.message,
      });
    } else {
      res.status(200).send({
        success: true,
        message: match?.message,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//uploading or updating user's profile photo

export const uploadProfiePic = async (req, res) => {
  try {
    const { id } = req.params;

    const results = await cloudinary.uploader.upload(req.files.photo.path, {
      public_id: `${id}_profile`,
      resource_type: "image",
      folder: "User's Profile Photos",
    });
    switch (true) {
      case !results:
        throw new Error("Photo Is Required");
    }
    const user = await UserModel.findByIdAndUpdate(
      { _id: id },
      { profilePhoto: results },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Picture Updated Successfully",
      user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//req for deleting a user account

export const deleteAccountReq = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error("User ID is Required");
    } else {
      const user = await UserModel.findById({ _id: id });
      if (!user) {
        return res.status(400).send({
          success: false,
          message: "No User Found Or Invalid User Id",
        });
      } else {
        const subject = "Account Deletion Request";
        const otp = await OTPModel.findOne({ email: user.email });
        if (otp) {
          return res.status(201).send({
            success: false,
            message: "An OTP Has Already Been Generated and Sent to you Email",
          });
        } else {
          await generateOtp(
            user.email,
            user.firstName,
            user.lastName,
            messageForAccountDeletionReq.message,
            messageForAccountDeletionReq.subject
          );
          res.status(200).send({
            success: true,
            message:
              "An OTP Has Been Sent To the registered email, please verify to delete account",
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//verifying and deleting account
//here I'm not removing user from courses and enrollments because these infos can be important

export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp, email } = req.body;
    if (!id) {
      throw new Error("User ID is required");
    } else {
      const user = await UserModel.findById({ _id: id });
      if (!user) {
        return res.status(400).send({
          success: false,
          message: "No User Found or Invalid User ID",
        });
      } else {
        const match = await verifyOTPAndDeleteAccount(email, otp);
        if (match.success !== true) {
          return res.status(400).send({
            success: match.success,
            message: match.message,
          });
        } else {
          res.status(200).send({
            success: match.success,
            message: match.message,
            user,
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const resetPasswordReq = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error("No User id Provided");
    } else {
      const user = await UserModel.findById({ _id: id });
      if (!user) {
        return res.status(400).send({
          success: false,
          message: "Invalid User id",
        });
      } else {
        const otpRequest = await generateOtp(
          user.email,
          user.firstName,
          user.lastName,
          forgotPasswordRequest.message,
          forgotPasswordRequest.subject
        );
        if (!otpRequest) {
          return res.status(400).send({
            success: false,
            message: "Something went wrong while generating otp",
          });
        } else {
          return res.status(200).send({
            success: true,
            message: "An OTP has been send to your registered email",
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//verify otp and reset password

export const verifyAndReset = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp, password } = req.body;
    switch (true) {
      case !id:
        throw new Error("User ID IS Required");
      case !otp:
        throw new Error("No OTP Provided");
      case !password:
        throw new Error("No New Password Provided");
    }
    const user = await UserModel.findById({ _id: id });
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(401).send({
        success: false,
        error: errors.array(),
      });
    }
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "invalid user id",
      });
    } else {
      const match = await verifyOTPAndResetPassword(user.email, otp, password);
      if (match.success !== true) {
        res.status(500).send({
          success: false,
          message: match.message,
        });
      } else {
        res.status(500).send({
          success: true,
          message: match.message,
        });
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
