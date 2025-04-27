import User from '../../models/userSchema.js'; 
 
 /**
   * Create a new user in MongoDB
   * @param {Object} userData - User data
   * @returns {Object} - Created user data
   */
 export const createUser = async (userData) => {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ uid: userData.uid });
      if (existingUser) {
        return existingUser;
      }
      
      // Create new user in MongoDB with role
      const newUser = await User.create({
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: userData.role || 'user' // Default to 'user' if not specified
      });
      
      return newUser;
    } catch (error) {
      console.error('User creation error:', error);
      throw new Error('Error creating user');
    }
  }

  /**
   * Update user role
   * @param {string} uid - User ID
   * @param {string} role - New role
   * @returns {Object} - Updated user data
   */
  export const updateUserRole = async (uid, role) => {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { uid }, 
        { role }, 
        { new: true }
      );
      
      if (!updatedUser) {
        throw new Error('User not found');
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Role update error:', error);
      throw new Error('Error updating user role');
    }
  }
