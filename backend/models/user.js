//backend/models/user.js
const jwt = require("jsonwebtoken");
const Joi = require("joi");

// Fungsi untuk menghasilkan token JWT
const generateAuthToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_KEY, { expiresIn: "7d" });
};

// Fungsi untuk memvalidasi data login
const validateLogin = (data) => {
  const schema = Joi.object({
    nrp: Joi.string().required().label("NRP"),
    email: Joi.string().required().email().label("Email"),
  });
  return schema.validate(data);
};

// Fungsi login - Using the connection pool from database object
const login = async (data, deptMfgPool) => {
  const { error } = validateLogin(data);
  if (error) throw new Error(error.details[0].message);

  // Normalize the input to uppercase
  const NRP = data.nrp.toUpperCase();
  const EMAIL = data.email.toLowerCase();

  try {
    // Create a new request using the provided connection pool
    const request = deptMfgPool.request();

    // Add parameters - safer than string interpolation
    request.input("nrp", NRP);
    request.input("email", EMAIL);

    // Execute query with parameters
    const result = await request.query(`
      SELECT * FROM [DEPT_MANUFACTURING].[dbo].[USER_NAME] 
      WHERE NRP = @nrp AND EMAIL = @email
    `);

    const user = result.recordset[0];
    if (!user) throw new Error("User not found");

    // Update LastLogin timestamp
    const updateRequest = deptMfgPool.request();
    updateRequest.input("nrp", NRP);

    await updateRequest.query(`
      UPDATE [DEPT_MANUFACTURING].[dbo].[USER_NAME] 
      SET LastLogin = GETDATE() 
      WHERE NRP = @nrp
    `);

    const token = generateAuthToken(user.NRP);
    return { token, user };
  } catch (error) {
    console.error("Error during login:", error.message);
    throw error;
  }
};

// Ekspor fungsi
module.exports = {
  login,
  validateLogin,
  generateAuthToken,
};
