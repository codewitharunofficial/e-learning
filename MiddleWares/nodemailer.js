import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
      user: "chatrrislive@gmail.com",
      pass: "cobojbqyrlloofec",
    },
  });