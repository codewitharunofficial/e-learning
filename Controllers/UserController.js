import { validationResult } from "express-validator";
import UserModel from "../Models/UserModel.js";
import { hashPassword, comparePassword } from "../Validators/UserValidator.js";
import {
  compareOTP,
  generateOtp,
  verifyOTPAndUpdateEmail,
} from "../Validators/OTPValidator.js";
import OTPModel from "../Models/OTPModel.js";
import JWT from "jsonwebtoken";
import cloudinary from "../Config/cloudinray.js";

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
      return res.status(401).send({
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
        generateOtp(email, firstName, lastName);

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
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Something went wrong",
      error,
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
      const OTP = await OTPModel.findOne({ email });
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
          await OTPModel.findOneAndDelete({ email });
          return res.status(201).send({
            success: false,
            message: "OTP Has Expired, Kindly Request New OTP",
          });
        } else {
          await OTPModel.findOneAndDelete({ email });
          const user = await UserModel.findOneAndUpdate(
            { email: email },
            { emailStatus: "Verified" },
            { new: true }
          );
        }
        res.status(200).send({
          success: true,
          message: "OTP Verification Successfull",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Something Went Wrong",
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
    res.status(400).send({
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
    res.status(400).send({
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
        await generateOtp(email, user?.firstName, user?.lastName);
        res.status(200).send({
          success: true,
          message: "An OTP Is Sent On The New Email Please Verify To Update",
        });
      }
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong",
      error,
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
    console.log(match);
    if (!match) {
      res.status(400).send({
        success: false,
        message: "OTP Expired",
      });
    } else {
      res.status(200).send({
        success: true,
        message: "OTP verify Successfully",
      });
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//uploading or updating user's profile photo


export const uploadProfiePic = async (req, res) => {
   try {
    const {id} = req.params;
    
       const results = await cloudinary.uploader.upload(req.files.photo.path, {
        public_id: `${id}_profile`,
        resource_type: "image"
       });
       switch (true) {
        case !results:
          throw new Error("Photo Is Required");
      }
       const user = await UserModel.findByIdAndUpdate({_id: id}, {profilePhoto: results}, {new: true});
       res.status(200).send({
        success: true,
        message: "Profile Picture Updated Successfully",
        user
       });
    
   } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong",
      error: error.message
    })
   }
}
