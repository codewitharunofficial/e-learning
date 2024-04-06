import { transporter } from "../MiddleWares/nodemailer.js";

export const messageForEmailUpdationReq = {
  subject: "Email Change Request",
  message: "Here is the OTP For Your Email Updation Request on Our E-Learning Platform, Please Verify the OTP to Complete you request. The Otp is valid for 5mins"
};

export const messageForAccountDeletionReq = {
  subject: "Account Deletion Request",
  message: "We've Got your request for deleting your account from our platform. We're sorry. Hope to see you back soon. Let us know How can we improve. Verify the OTP to complete your request. The Otp is valid for 5mins"
};
  

export const messageForEmailVerificationOnSignUp = {
  subject: "Email Verification",
  message: "Welcome To Our E-Learning Platform. /n Verify The OTP TO Finish Signing up. OTP is valid For 5mins."
};

export const newOTPForSignUp = {
  subject: "Account Verification",
  message: "Here's the new OTP. The OTP is valid for 5 mins."
};

export const emailUpdation = {
  subject: "Email Changed",
  message: "Your email has been updated. You'll be recieving future emails from us there. Enjoy! Keep Learning."
};

export const accountDeletion = {
  subject: "Account Deleted",
  message: "Your Account Has Been Permanently deleted."
};

export const finishedSignUp = {
  subject: "Welcome To E-Learning",
  message: "Congratulations! You've Finished Signing Up. ENjoy! Keep Learning."
};

export const forgotPasswordRequest = {
  subject: "Account Recovery",
  message: "Here's the otp for your Password change request. OTP is valid for 5 mins."
}

export const changedPassword = {
  subject: "Password Changed",
  message: "Password have been updated successfully."
}

export const sendEmailOTP = async (email, subject, firstName, lastName, OTP, message) => {
  try {
    const mailOptions = {
      from: "chatrrislive@gmail.com",
      to: email,
      subject: subject ? subject : "Account Verification",
      text: `
                Hi ${firstName + "" + lastName},
                ${message}.
                OTP is ${OTP}
                `,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        return console.error(error.message);
      }
      console.log("Email sent :", info.response);
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendEmail = async (email, subject, firstName, lastName, message) => {
  try {
    const mailOptions = {
      from: "chatrrislive@gmail.com",
      to: email,
      subject: subject ? subject : "Account Verification",
      text: `
                Hi ${firstName + "" + lastName},
                ${message}.
                
                `,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        return console.error(error.message);
      }
      console.log("Email sent :", info.response);
    });
  } catch (error) {
    console.log(error);
  }
};
