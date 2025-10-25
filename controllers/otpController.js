// import prisma from '../config/db.js';       
// import crypto from 'crypto';                 
// import { sendSms } from './smsController.js'; 
// export const sendOtp = async (req, res) => {
//   try {
//     const { phone } = req.body;
//     if (!phone) {
//       return res.status(400).json({ message: 'Phone number is required.' });
//     }
//     const otp = crypto.randomInt(100000, 999999).toString();
//     const expiryTime = new Date(Date.now() + 5 * 60 * 1000);
//     const user = await prisma.user.updateMany({
//       where: { phone },
//       data: { otpCode: otp, otpExpiry: expiryTime },
//     });
//     if (user.count === 0) {
//       return res.status(404).json({ message: 'User not found with this phone number.' });
//     }
//     await sendSms(phone, `Your FlightBridge verification code is ${otp}`);
//     res.json({ message: 'OTP sent successfully.' });

//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     res.status(500).json({ message: 'Something went wrong while sending OTP.' });
//   }
// };
// export const verifyOtp = async (req, res) => {
//   console.log('=== Verify OTP Called ===');
//   console.log('Request body:', req.body);
//   console.log('Timestamp:', new Date().toISOString());
  
//   try {
//     const { phone, otp } = req.body;
    
//     console.log('Extracted phone:', phone);
//     console.log('Extracted otp:', otp);
//     console.log('Phone type:', typeof phone);
//     console.log('OTP type:', typeof otp);
    
//     // Check for missing fields
//     if (!phone || !otp) {
//       console.log('❌ Missing required fields');
//       console.log('Phone present:', !!phone);
//       console.log('OTP present:', !!otp);
//       return res.status(400).json({ message: 'Phone and OTP are required.' });
//     }
    
//     console.log('✓ All required fields present');
//     console.log('Searching for user with phone:', phone);
    
//     const user = await prisma.user.findUnique({ where: { phone } });
    
//     if (!user) {
//       console.log('❌ User not found with phone:', phone);
//       return res.status(404).json({ message: 'User not found.' });
//     }
    
//     console.log('✓ User found:', user.id);
//     console.log('Stored OTP:', user.otpCode);
//     console.log('Provided OTP:', otp);
//     console.log('OTP Expiry:', user.otpExpiry);
//     console.log('Current time:', new Date());
    
//     if (user.otpCode !== otp) {
//       console.log('❌ Invalid OTP - Mismatch');
//       console.log('Expected:', user.otpCode);
//       console.log('Received:', otp);
//       return res.status(400).json({ message: 'Invalid OTP.' });
//     }
    
//     console.log('✓ OTP matches');
    
//     if (user.otpExpiry < new Date()) {
//       console.log('❌ OTP expired');
//       console.log('Expiry time:', user.otpExpiry);
//       console.log('Current time:', new Date());
//       return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
//     }
    
//     console.log('✓ OTP is still valid');
//     console.log('Updating user verification status...');
    
//     await prisma.user.update({
//       where: { phone },
//       data: {
//         phoneVerified: true,
//         otpCode: null,
//         otpExpiry: null,
//       },
//     });
    
//     console.log('✓ User verification updated successfully');
//     console.log('=== Verification Completed Successfully ===');
    
//     res.json({ message: 'Phone number verified successfully.' });

//   } catch (error) {
//     console.error('❌ Error verifying OTP:', error);
//     console.error('Error stack:', error.stack);
//     res.status(500).json({ message: 'Something went wrong during verification.' });
//   }
// };
