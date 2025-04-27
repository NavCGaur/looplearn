import authService from '../services/auth/authService.js';

const authController = {
  /**
   * Verify Firebase authentication token
   */
  verifyToken: async (req, res) => {

    console.log("verifying token in authcontroller", req.body);

    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required'
        });
      }

      const userData = await authService.verifyFirebaseToken(token);

      return res.status(200).json({
        success: true,
        data: {
          user: userData
        },
        message: 'Token verified successfully'
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid token'
      });
    }
  },

  /**
   * Register a new user
   */
  registerUser: async (req, res) => {
    try {
      const userData = req.body;

      if (!userData.email || !userData.uid) {
        return res.status(400).json({
          success: false,
          message: 'Email and UID are required'
        });
      }

      const newUser = await authService.createUser(userData);

      return res.status(201).json({
        success: true,
        data: {
          user: newUser
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('User registration error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error registering user'
      });
    }
  }
};

export default authController;
