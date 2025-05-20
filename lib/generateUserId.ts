import User from "@/models/user";
import Employee from "@/models/Employee";

// Generate a random string of specified length from given characters
const generateRandomString = (length: number, characters: string): string => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Generate a unique user_id in the format ****-**** (e.g., ABCD-1234)
export const generateUniqueUserId = async (): Promise<string> => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  let userId: string;
  let isUnique = false;

  do {
    const letterPart = generateRandomString(4, letters);
    const digitPart = generateRandomString(4, digits);
    userId = `${letterPart}-${digitPart}`;

    // Check uniqueness in both User and Employee collections
    const userExists = await User.findOne({ user_id: userId });
    const employeeExists = await Employee.findOne({ user_id: userId });
    isUnique = !userExists && !employeeExists;
  } while (!isUnique);

  return userId;
};
