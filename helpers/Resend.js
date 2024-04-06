import { Resend } from "resend";
import dotenv from 'dotenv';


dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailOTP = async (email, subject, firstName, lastName, OTP, message) => {
    try {
        const {data, error} = await resend.emails.send({
            from: "e-learning@resend.dev",
            to: email,
            subject: subject ? subject : "Account Verification",
            html: `<strong> Hi ${firstName + " "+ lastName},</strong>
            <p>${message}</p>
            <strong>OTP is: ${OTP}</strong>
            `
        });
        if(error){
            console.log({error});
            return false
        }
        console.log(data);
        return true
    } catch (error) {
        console.log(error);
    }
}

export const sendEmail = async (email, subject, firstName, lastName, message) => {
    try {
        const {data, error} = await resend.emails.send({
            from: "e-learning@resend.dev",
            to: [email],
            subject: subject ? subject : 'Account Verification',
            html: `<strong> Hi ${firstName + " "+ lastName},</strong>
            <p>${message}</p>
            `
        });
        if(error){
            console.log({error});
            return false
        }
        console.log(data);
        return true
    } catch (error) {
        console.log(error);
    }
}