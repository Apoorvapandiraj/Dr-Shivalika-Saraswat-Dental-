const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');
const { AppError } = require('./error');

// ================================================
// OTP MANAGEMENT & NOTIFICATION
// ================================================

class OTPManager {
  static generateOTP() {
    // Cryptographically secure 6-digit OTP
    return String(crypto.randomInt(100000, 1000000));
  }

  static hashOTP(otp) {
    return crypto.createHash('sha256').update(String(otp)).digest('hex');
  }

  static async storeOTP(identifier, purpose) {
    const otp = this.generateOTP();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '15', 10);
    await Otp.findOneAndUpdate(
      { identifier, purpose },
      {
        identifier,
        purpose,
        hashedOtp: this.hashOTP(otp),
        attempts: 0,
        verified: false,
        expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
      },
      { upsert: true, new: true }
    );
    return otp;
  }

  static async verifyOTP(identifier, purpose, enteredOTP) {
    const record = await Otp.findOne({ identifier, purpose });
    if (!record) throw new AppError('OTP not found or expired. Please request a new one.', 400);
    if (record.verified) throw new AppError('OTP already used. Please request a new one.', 400);
    if (record.expiresAt < new Date()) throw new AppError('OTP has expired', 400);
    if (record.attempts >= 5) throw new AppError('Too many attempts. Please request a new OTP.', 429);

    record.attempts += 1;
    if (record.hashedOtp !== this.hashOTP(enteredOTP)) {
      await record.save();
      throw new AppError('Incorrect OTP', 400);
    }

    record.verified = true;
    await record.save();
    return true;
  }

  static async sendOTPEmail(email, otp, purpose = 'verification') {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      const message = `Email delivery is not configured: set GMAIL_USER and GMAIL_APP_PASSWORD in server/.env. OTP for ${email} (${purpose}) was logged to console only.`;
      console.warn(`📧 [DEV] ${message}`);
      console.log(`📧 [DEV] OTP for ${email} (${purpose}): ${otp}`);
      return { configured: false, otp, message };
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      to: email,
      subject: `Your OTP for ${purpose}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verification Code</h2>
          <p>Your OTP for ${purpose} is:</p>
          <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
          <p>This code expires in ${process.env.OTP_EXPIRY_MINUTES || 15} minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return { configured: true, otp };
  }

  static async sendOTPSMS(phone, otp) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log(`📱 [DEV] OTP for +91${phone}: ${otp}`);
      return;
    }
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const message = await client.messages.create({
      body: `Your verification OTP is ${otp}. Valid for ${process.env.OTP_EXPIRY_MINUTES || 15} minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`,
    });
    return message.sid;
  }
}

module.exports = { OTPManager };
