/**
 * Utility functions for generating credentials (usernames and passwords)
 */

/**
 * Generates a username based on the user's name
 * Format: first letter of first name + last name + random 3-digit number
 * Example: John Doe -> jdoe123
 * 
 * @param {string} fullName - The full name of the user
 * @returns {string} - The generated username
 */
export const generateUsername = (fullName) => {
  const nameParts = fullName.toLowerCase().split(' ');
  
  let username = '';
  if (nameParts.length > 1) {
    // First letter of first name + full last name
    username = nameParts[0][0] + nameParts[nameParts.length - 1];
  } else {
    // Just use the single name
    username = nameParts[0];
  }
  
  // Add 3 random digits
  const randomDigits = Math.floor(Math.random() * 900 + 100);
  username += randomDigits;
  
  return username;
};

/**
 * Generates a random password with specified complexity
 * Password includes: lowercase letters, uppercase letters, numbers, and special characters
 * 
 * @returns {string} - A random password of specified length
 */
export const generateRandomPassword = () => {
  const length = 10;
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '@#$%^&*!';
  
  const allChars = lowercase + uppercase + numbers + special;
  
  // Ensure at least one character from each category
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex];
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}; 