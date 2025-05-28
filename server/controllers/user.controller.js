import sendEmail from '../config/sendEmail.js';
import User from '../models/mysql/user.model.js';
 // Assure-toi que User est bien exporté depuis ce fichier
import bcryptjs from 'bcryptjs';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import generatedRefreshToken from '../utils/generatedRefreshToken.js';
import uploadImageClodinary from '../utils/uploadImageClodinary.js';
import generatedOtp from '../utils/generatedOtp.js';
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js';
import jwt from 'jsonwebtoken';

// Register user
export async function registerUserController(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email and password.",
        error: true,
        success: false
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered.",
        error: true,
        success: false
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      verify_email: false,
      status: "Active"
    });

    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${newUser.id}`;

    await sendEmail({
      sendTo: email,
      subject: "Verify your email - AJI TCHRI",
      html: verifyEmailTemplate({ name, url: verifyEmailUrl })
    });

    return res.json({
      message: "User registered successfully. Please verify your email.",
      error: false,
      success: true,
      data: newUser
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

// Verify email
export async function verifyEmailController(req, res) {
  try {
    const { code } = req.body;
    const user = await User.findByPk(code);

    if (!user) {
      return res.status(400).json({
        message: "Invalid verification code.",
        error: true,
        success: false
      });
    }

    user.verify_email = true;
    await user.save();

    return res.json({
      message: "Email verified successfully.",
      error: false,
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

// Login
export async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password.",
        error: true,
        success: false
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({
        message: "User not registered.",
        error: true,
        success: false
      });
    }

    if (user.status !== "Active") {
      return res.status(400).json({
        message: "Account not active. Please contact admin.",
        error: true,
        success: false
      });
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({
        message: "Incorrect password.",
        error: true,
        success: false
      });
    }

    const accessToken = await generatedAccessToken(user.id);
    const refreshToken = await generatedRefreshToken(user.id);

    user.last_login_date = new Date();
    user.refresh_token = refreshToken;
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    };

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.json({
      message: "Login successful.",
      error: false,
      success: true,
      data: { accessToken, refreshToken }
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

// Logout
export async function logoutController(req, res) {
  try {
    const userId = req.userId; // Doit venir du middleware d'authentification

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    const user = await User.findByPk(userId);
    if (user) {
      user.refresh_token = null;
      await user.save();
    }

    return res.json({
      message: "Logout successful.",
      error: false,
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

// Upload avatar
export async function uploadAvatar(req, res) {
  try {
    const userId = req.userId;
    const image = req.file;

    if (!image) {
      return res.status(400).json({
        message: "No image provided.",
        error: true,
        success: false
      });
    }

    const upload = await uploadImageClodinary(image);

    const user = await User.findByPk(userId);
    user.avatar = upload.url;
    await user.save();

    return res.json({
      message: "Profile image uploaded.",
      error: false,
      success: true,
      data: {
        id: userId,
        avatar: upload.url
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

// Update user details
export async function updateUserDetails(req, res) {
  try {
    const userId = req.userId;
    const { name, email, mobile, password } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        error: true,
        success: false
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;

    if (password) {
      const salt = await bcryptjs.genSalt(10);
      user.password = await bcryptjs.hash(password, salt);
    }

    await user.save();

    return res.json({
      message: "User updated successfully.",
      error: false,
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

// Forgot password
export async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        message: "Email not registered.",
        error: true,
        success: false
      });
    }

    const otp = generatedOtp();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.forgot_password_otp = otp;
    user.forgot_password_expiry = expiry;
    await user.save();

    await sendEmail({
      sendTo: email,
      subject: "Forgot Password - AJI TCHRI",
      html: forgotPasswordTemplate({ name: user.name, otp })
    });

    return res.json({
      message: "OTP sent to your email.",
      error: false,
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

// Verify OTP
export async function verifyForgotPasswordOtp(req, res) {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        message: "Email not found.",
        error: true,
        success: false
      });
    }

    if (user.forgot_password_expiry < new Date()) {
      return res.status(400).json({
        message: "OTP has expired.",
        error: true,
        success: false
      });
    }

    if (otp !== user.forgot_password_otp) {
      return res.status(400).json({
        message: "Invalid OTP.",
        error: true,
        success: false
      });
    }

    user.forgot_password_otp = null;
    user.forgot_password_expiry = null;
    await user.save();

    return res.json({
      message: "OTP verified successfully.",
      error: false,
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

// Reset password
export async function resetPassword(req, res) {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required.",
        error: true,
        success: false
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
        error: true,
        success: false
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        message: "User not found.",
        error: true,
        success: false
      });
    }

    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(newPassword, salt);

    await user.save();

    return res.json({
      message: "Password reset successful.",
      error: false,
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

// Refresh token
export async function refreshToken(req, res) {
  try {
    const token = req.cookies.refreshToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No refresh token provided.",
        error: true,
        success: false
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY_REFRESH_TOKEN);
    const userId = decoded?.id;

    const newAccessToken = await generatedAccessToken(userId);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    };

    res.cookie("accessToken", newAccessToken, cookieOptions);

    return res.json({
      message: "New access token generated.",
      error: false,
      success: true,
      data: { accessToken: newAccessToken }
    });

  } catch (error) {
    return res.status(401).json({
      message: error.message || "Invalid refresh token.",
      error: true,
      success: false
    });
  }
}

// Get current user details
export async function userDetails(req, res) {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'refresh_token'] }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        error: true,
        success: false
      });
    }

    return res.json({
      message: "User data fetched successfully.",
      error: false,
      success: true,
      data: user
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}
