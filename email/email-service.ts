import nodemailer from "nodemailer";
import { getResetPaswordEmailTemplate } from "./email-templates";


const hotmailTransporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: process.env.OUTLOOK_EMAIL,
      pass: process.env.OUTLOOK_PASSWORD,
    },
  });

export const sendResetPasswordEmail = (email: string, resetToken: string) => hotmailTransporter.sendMail({
    to: email,
    from: process.env.OUTLOOK_EMAIL,
    subject: "Password reset",
    html: getResetPaswordEmailTemplate(resetToken),
  });