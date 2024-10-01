import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db/db.js"; // Adjust path as necessary

// Handle login

// export const login = (req, res) => {
//     const { username, password } = req.body;
//     console.log(`Login attempt:`, { username, password });

//     db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
//         if (err) {
//             console.error(`Database error: ${err.message}`);
//             return res.status(500).json({ message: 'Database error.', error: err.message });
//         }

//         if (results.length === 0) {
//             console.log(`User not found: ${username}`);
//             return res.status(401).json({ message: 'Invalid credentials.' });
//         }

//         const user = results[0];
//         console.log(`User found: ${JSON.stringify(user)}`);

//         // Ensure password is compared correctly
//         bcrypt.compare(password, user.password, (err, passwordMatch) => {
//             if (err) {
//                 console.error(`Error comparing passwords: ${err.message}`);
//                 return res.status(500).json({ message: 'Error during password comparison.', error: err.message });
//             }

//             if (!passwordMatch) {
//                 console.log(`Incorrect password for user: ${username}`);
//                 return res.status(401).json({ message: 'Invalid credentials.' });
//             }

//             // Create JWT token
//             const token = jwt.sign(
//                 { id: user.id, username: user.username, role: user.role, is_locked: user.is_locked },
//                 'yourSecretKey',
//                 { expiresIn: '1h' }
//             );

//             console.log(`Login successful for user: ${username}`);
//             res.json({ token });
//         });
//     });
// };

// export const login = async (req, res) => {
//     const { username, password } = req.body;
//     console.log(`Login attempt with username: ${username}`);

//     try {
//         const query = 'SELECT * FROM users WHERE username = ?';

//         db.query(query, [username], async (err, data) => {
//             if (err) {
//                 console.error(`Database error: ${err.message}`);
//                 return res.status(500).json({ error: 'Database error' });
//             }

//             if (data.length === 0) {
//                 console.log(`User not found: ${username}`);
//                 return res.status(404).json({ error: 'User not found' });
//             }

//             const user = data[0];
//             console.log(`User found: ${JSON.stringify(user)}`);

//             // Check password
//             const isPasswordCorrect = await bcrypt.compare(password, user.password);
//             console.log(`Password comparison result: ${isPasswordCorrect}`);

//             if (!isPasswordCorrect) {
//                 return res.status(400).json({ error: 'Wrong username or password' });
//             }

//             // Create JWT token
//             const token = jwt.sign({ id: user.id, username: user.username, role: user.role },
//                 process.env.ACCESS_TOKEN_SECRET,
//                 { expiresIn: '30m' }
//             );
//             console.log(`JWT token created: ${token}`);

//             const { password: userPassword, ...userData } = user;

//             // Set the JWT token as an HTTP-only cookie
//             res.cookie('authuser', token, {
//                 httpOnly: false,
//                 secure: process.env.NODE_ENV === 'production',
//                 sameSite: 'none',
//                 maxAge: 3600000, // 1 hour
//                 path: '/',
//             }).status(200).json(userData);
//         });
//     } catch (err) {
//         console.error(`Error during login process: ${err.message}`);
//         res.status(500).json({ error: 'Error logging in', details: err.message });
//     }
// };

// export const login = (req, res) => {
//     const { username, password } = req.body;
//     console.log(`Login attempt:`, { username, password });

//     db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
//         if (err) {
//             console.error(`Database error: ${err.message}`);
//             return res.status(500).json({ message: 'Database error.', error: err.message });
//         }

//         if (results.length === 0) {
//             console.log(`User not found: ${username}`);
//             return res.status(401).json({ message: 'Invalid credentials.' });
//         }

//         const user = results[0];
//         console.log(`User found: ${JSON.stringify(user)}`);

//         // Direct password comparison
//         if (password !== user.password) {
//             console.log(`Incorrect password for user: ${username}`);
//             return res.status(401).json({ message: 'Invalid credentials.' });
//         }

//         // Create JWT token
//         const token = jwt.sign(
//             { id: user.id, username: user.username, role: user.role, is_locked: user.is_locked },
//             'yourSecretKey',
//             { expiresIn: '1h' }
//         );

//         console.log(`Login successful for user: ${username}`);
//         res.json({ token });
//     });
// };

// export const signUp = (req, res) => {
//     const { username, password, role } = req.body;
//     try {
//         console.log(`Sign-up attempt for username: ${username}`);
//         db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
//             if (err) {
//                 console.error(`Database error during sign-up: ${err.message}`);
//                 return res.status(500).json({ message: 'Database error.', error: err.message });
//             }
//             if (results.length > 0) {
//                 console.log(`Sign-up failed for username: ${username} - User already exists`);
//                 return res.status(400).json({ message: 'User already exists.' });
//             }

//             // Insert new user into the database
//             db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role], (err, result) => {
//                 if (err) {
//                     console.error(`Database error during user registration: ${err.message}`);
//                     return res.status(500).json({ message: 'Database error.', error: err.message });
//                 }
//                 console.log(`User registered successfully for username: ${username}`);
//                 res.status(201).json({ message: 'User registered successfully.' });
//             });
//         });
//     } catch (err) {
//         console.error(`Error during sign-up process: ${err.message}`);
//         res.status(500).json({ message: 'Error signing up.', error: err.message });
//     }
// };

// Handle sign-up
// export const signUp = async (req, res) => {
//     const { username, password, role } = req.body;
//     console.log(`Sign-up attempt for username: ${username}`);

//     try {
//         const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
//         db.query(checkUserQuery, [username], async (err, results) => {
//             if (err) {
//                 console.error(`Database error during sign-up: ${err.message}`);
//                 return res.status(500).json({ message: 'Database error.', error: err.message });
//             }

//             if (results.length > 0) {
//                 console.log(`Sign-up failed for username: ${username} - User already exists`);
//                 return res.status(400).json({ message: 'User already exists.' });
//             }

//             // Hash the password
//             const hashedPassword = await bcrypt.hash(password, 10);
//             console.log(`Password hashed for username: ${username}`);

//             // Insert new user into the database
//             const insertUserQuery = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
//             db.query(insertUserQuery, [username, hashedPassword, role], (err, result) => {
//                 if (err) {
//                     console.error(`Database error during user registration: ${err.message}`);
//                     return res.status(500).json({ message: 'Database error.', error: err.message });
//                 }
//                 console.log(`User registered successfully for username: ${username}`);
//                 res.status(201).json({ message: 'User registered successfully.' });
//             });
//         });
//     } catch (err) {
//         console.error(`Error during sign-up process: ${err.message}`);
//         res.status(500).json({ message: 'Error signing up.', error: err.message });
//     }
// };

//main

// export const login = (req, res) => {
//   const { username, password } = req.body;

//   db.query(
//     "SELECT * FROM users WHERE username = ?",
//     [username],
//     (err, results) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ message: "Database error", error: err.message });
//       }

//       if (results.length === 0) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//       const user = results[0];

//       // Compare hashed password (replace this with actual password hash check)
//       if (password !== user.password) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//       // Generate JWT token
//       const token = jwt.sign(
//         {
//           id: user.id,
//           username: user.username,
//           role: user.role,
//           is_locked: user.is_locked,
//         },
//         "yourSecretKey", // Use environment variable for secret key
//         { expiresIn: "1h" }
//       );

//       // Set the token in a cookie
//       res.cookie("authToken", token, {
//         httpOnly: false,
//         secure: process.env.NODE_ENV === "production", // Set secure flag based on environment
//         sameSite: "none", // Ensure cookies are sent with same-site requests
//         maxAge: 3600000, // 1 hour
//       });

//       // Send user details and token in the response
//       res.json({
//         message: "Login successful",
//         user: {
//           username: user.username,
//           role: user.role,
//           is_locked: user.is_locked,
//         },
//         token,
//         // Include the token in the response body
//       });
//     }
//   );
// };

// export const login = (req, res) => {
//   const { username, password } = req.body;

//   // Check if username and password are provided
//   if (!username || !password) {
//     return res.status(400).json({ message: 'Username and password are required' });
//   }

//   db.query(
//     "SELECT * FROM users WHERE username = ?",
//     [username],
//     (err, results) => {
//       if (err) {
//         console.error('Database error:', err);
//         return res.status(500).json({ message: "Database error", error: err.message });
//       }

//       // If no user is found with the provided username
//       if (results.length === 0) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//       const user = results[0];

//       // Compare the provided password with the stored password
//       if (password !== user.password) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//       // Generate JWT token
//       const token = jwt.sign(
//         {
//           id: user.id,
//           username: user.username,
//           role: user.role,
//         },
//         process.env.JWT_SECRET || "yourSecretKey", // Use environment variable for secret
//         { expiresIn: "1h" }
//       );

//       // Set the JWT token in a secure cookie
//       res.cookie('token', token, {
//         httpOnly: false, // Prevent access by JavaScript (for security)
//         secure: process.env.NODE_ENV === 'production', // Send cookie over HTTPS in production
//         sameSite: 'None', // Allow cross-site cookie (use 'none' if frontend and backend are on the same domain)
//       });

//       // Send response with user details
//       res.json({
//         message: "Login successful",
//         user: {
//           id: user.id,
//           username: user.username,
//           role: user.role,
//         },
//         token, // Optionally return the token in the body (if needed by frontend)
//       });
//     }
//   );
// };

// export const login = (req, res) => {
//   const { username, password } = req.body;

//   // Log incoming request
//   console.log(`Login attempt for user: ${username}`);

//   // Validate input
//   if (!username || !password) {
//     console.warn("Login failed: Username and password are required");
//     return res
//       .status(400)
//       .json({ message: "Username and password are required" });
//   }

//   // Query the database for the user
//   db.query(
//     "SELECT * FROM users WHERE username = ?",
//     [username],
//     (err, results) => {
//       if (err) {
//         console.error("Database error:", err.message);
//         return res
//           .status(500)
//           .json({ message: "Database error", error: err.message });
//       }

//       // Check if user exists
//       if (results.length === 0) {
//         console.warn(`Login failed: Invalid credentials for user: ${username}`);
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//       const user = results[0];

//       // Check if password matches
//       if (password !== user.password) {
//         console.warn(`Login failed: Invalid password for user: ${username}`);
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//       // Generate short-lived access token
//       const accessToken = jwt.sign(
//         { id: user.id, username: user.username, role: user.role },
//         process.env.JWT_SECRET || "accessSecret",
//         { expiresIn: "15m" }
//       );

//       // Generate long-lived refresh token
//       const refreshToken = jwt.sign(
//         { id: user.id },
//         process.env.JWT_REFRESH_SECRET || "refreshSecret",
//         { expiresIn: "7d" }
//       );

//       // Set access token in httpOnly cookie
//       res.cookie("accessToken", accessToken, {
//         httpOnly: false, // Set to true for production
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "None", // Adjust based on your needs
//         path: "/",
//         maxAge: 15 * 60 * 1000,
//       });

//       // Set refresh token in httpOnly cookie
//       res.cookie("refreshToken", refreshToken, {
//         httpOnly: false, // Set to true for production
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "None", // Adjust based on your needs
//         path: "/",
//         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//       });

//       console.log(`Login successful for user: ${username}`);

//       res.json({
//         message: "Login successful",
//         user: { id: user.id, username: user.username, role: user.role },
//         // Do not return the token in the response for security reasons
//         // accessToken, // Optionally return the token in the body (if needed by frontend)
//       });
//     }
//   );
// };

// export const login = (req, res) => {
//   const { username, password } = req.body;

//   // Log incoming request
//   console.log(`Login attempt for user: ${username}`);

//   // Validate input
//   if (!username || !password) {
//     console.warn("Login failed: Username and password are required");
//     return res
//       .status(400)
//       .json({ message: "Username and password are required" });
//   }

//   // Query the database for the user
//   db.query(
//     "SELECT * FROM users WHERE username = ?",
//     [username],
//     (err, results) => {
//       if (err) {
//         console.error("Database error:", err.message);
//         return res
//           .status(500)
//           .json({ message: "Database error", error: err.message });
//       }

//       // Check if user exists
//       if (results.length === 0) {
//         console.warn(`Login failed: Invalid credentials for user: ${username}`);
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//       const user = results[0];

//       // Check if password matches (consider using bcrypt for password hashing)
//       if (password !== user.password) {
//         console.warn(`Login failed: Invalid password for user: ${username}`);
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//       // Generate short-lived access token
//       const accessToken = jwt.sign(
//         { id: user.id, username: user.username, role: user.role },
//         process.env.JWT_SECRET || "accessSecret",
//         { expiresIn: "15m" }
//       );

//       // Generate long-lived refresh token
//       const refreshToken = jwt.sign(
//         { id: user.id },
//         process.env.JWT_REFRESH_SECRET || "refreshSecret",
//         { expiresIn: "7d" }
//       );

//       // Set access token in httpOnly cookie
//       // res.cookie('accessToken', accessToken, {
//       //   httpOnly: false,
//       //   secure: process.env.NODE_ENV === 'production', // Use secure in production
//       //   maxAge: 3600000 // 1 hour
//       // });

//       res.cookie("accessToken", accessToken, {
//         httpOnly: false, // Access via JavaScript (set to true for more security, but green color means false)
//         secure: process.env.NODE_ENV === "production", // Send over HTTPS in production
//         sameSite: "Strict", // Limits CSRF attacks
//         path: "/", // Available across the entire app
//         maxAge: 15 * 60 * 1000, // 15 minutes lifetime
//       });

//       // Set refresh token in httpOnly cookie
//       res.cookie("refreshToken", refreshToken, {
//         httpOnly: false, // Set to true for production
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "Strict", // Adjust based on your needs
//         path: "/",
//         maxAge: 7 * 24 *  60 * 60 * 1000, // 7 days
//       });

//       console.log(`Login successful for user: ${username}`);
//       console.log("Set-Cookie Header:", res.getHeaders()["set-cookie"]); // Log the cookie headers

//       res.json({
//         message: "Login successful",
//         user: { id: user.id, username: user.username, role: user.role },
//         accessToken,
//       });
//     }
//   );
// };

// export const refreshToken = (req, res) => {
//   const refreshToken = req.cookies.refreshToken;

//   if (!refreshToken) {
//     return res.status(401).json({ message: "Refresh token not found" });
//   }

//   jwt.verify(refreshToken, 'refreshToken', (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ message: "Invalid refresh token" });
//     }

//     // Generate new access token
//     const newAccessToken = jwt.sign(
//       { id: decoded.id, username: decoded.username, role: decoded.role },
//       process.env.JWT_SECRET || "accessSecret",
//       { expiresIn: "15m" }
//     );

//     res.cookie("accessToken", newAccessToken, {
//       httpOnly: false,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "none",
//       path: "/",
//       maxAge: 15 * 60 * 1000, // 15 minutes
//     });

//     res.json({ message: "Access token refreshed" });
//   });
// };

export const login = (req, res) => {
  const { username, password } = req.body;

  console.log(`Login attempt for user: ${username}`);

  if (!username || !password) {
    console.warn("Login failed: Username and password are required");
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Query the database for the user
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("Database error:", err.message);
        return res
          .status(500)
          .json({ message: "Database error", error: err.message });
      }

      if (results.length === 0) {
        console.warn(`Login failed: Invalid credentials for user: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = results[0];

      // Check if password matches
      if (password !== user.password) {
        console.warn(`Login failed: Invalid password for user: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate short-lived access token
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || "accessSecret",
        { expiresIn: "15m" }
      );

      // Generate long-lived refresh token
      const refreshToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_REFRESH_SECRET || "refreshSecret",
        { expiresIn: "7d" }
      );

      // Set access token in httpOnly cookie
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true, // Only set to true if using HTTPS
        sameSite: "Lax", // Required for cross-origin cookies
        path: "/",
        maxAge: 15 * 60 * 1000,
      });

      // Set refresh token in httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // Only set to true if using HTTPS
        sameSite: "Lax", // Required for cross-origin cookies
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      console.log(`Login successful for user: ${username}`);

      res.json({
        message: "Login successful",
        user: { id: user.id, username: user.username, role: user.role },
      });
    }
  );
};

export const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token not found" });
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET || "refreshSecret",
    (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { id: decoded.id, username: decoded.username, role: decoded.role },
        process.env.JWT_SECRET || "accessSecret",
        { expiresIn: "15m" }
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        path: "/",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.json({ message: "Access token refreshed" });
    }
  );
};

// export const refreshToken = (req, res) => {
//   const refreshToken = req.cookies.refreshToken;

//   if (!refreshToken) {
//     return res.status(401).json({ message: "Refresh token not provided" });
//   }

//   // Verify refresh token
//   jwt.verify(
//     refreshToken,
//     process.env.JWT_REFRESH_SECRET || "refreshSecret",
//     (err, decoded) => {
//       if (err) {
//         return res.status(403).json({ message: "Invalid refresh token" });
//       }

//       // Generate new access token
//       const accessToken = jwt.sign(
//         { id: decoded.id, username: decoded.username, role: decoded.role },
//         process.env.JWT_SECRET || "accessSecret",
//         { expiresIn: "15m" }
//       );

//       // Set new access token in cookie
//       res.cookie("accessToken", accessToken, {
//         httpOnly: false,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: 'none',
//         path: "/",
//         maxAge: 15 * 60 * 1000, // 15 minutes
//       });

//       res.json({ message: "Access token refreshed" });
//     }
//   );
// };

// export const login = (req, res) => {
//   const { username, password } = req.body;

//   db.query(
//     "SELECT * FROM users WHERE username = ?",
//     [username],
//     (err, results) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ message: "Database error", error: err.message });
//       }

//       if (results.length === 0) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//       const user = results[0];

//       // Compare hashed password (replace this with actual password hash check)
//       if (password !== user.password) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//       // Generate JWT token
//       const token = jwt.sign(
//         {
//           id: user.id,
//           username: user.username,
//           role: user.role,
//         },
//         "yourSecretKey", // Use environment variable for the secret key
//         { expiresIn: "1h" }
//       );

//       // Send user details, including user ID, and token in the response
//       res.json({
//         message: "Login successful",
//         user: {
//           id: user.id,
//           username: user.username,
//           role: user.role,
//         },
//         token,
//       });
//     }
//   );
// };

export const signUp = (req, res) => {
  const { username, password, role } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Database error", error: err.message });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Add new user
      db.query(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        [username, password, role],
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Database error", error: err.message });
          }

          res.status(201).json({ message: "User registered successfully" });
        }
      );
    }
  );
};

export const logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
};

export const toggleLock = (req, res) => {
  if (req.user.role !== "admin") {
    console.warn(
      `Unauthorized access attempt by user with role: ${req.user.role}`
    );
    return res.status(403).json({ message: "Unauthorized: Admins only." });
  }

  // Fetch current lock status
  db.query(
    "SELECT lock_status FROM system_lock WHERE id = ?",
    [1],
    (err, results) => {
      if (err) {
        console.error(
          `Database error while fetching lock status: ${err.message}`
        );
        return res
          .status(500)
          .json({ message: "Database error", error: err.message });
      }

      if (results.length === 0) {
        console.error("No lock status found in the database.");
        return res.status(404).json({ message: "No lock status found." });
      }

      // Determine new lock status
      const currentStatus = results[0].lock_status;
      const newLockStatus = currentStatus === "locked" ? "unlocked" : "locked";

      // Update lock status in the database
      db.query(
        "UPDATE system_lock SET lock_status = ? WHERE id = ?",
        [newLockStatus, 1],
        (err) => {
          if (err) {
            console.error(`Failed to update lock status: ${err.message}`);
            return res.status(500).json({
              message: "Failed to update lock status.",
              error: err.message,
            });
          }

          console.log(`Lock status updated to: ${newLockStatus}`);
          res.json({
            message: "Lock status updated.",
            lock_status: newLockStatus,
          });
        }
      );
    }
  );
};

// Example of your checkLockStatus function in the backend
export const checkLockStatus = (req, res) => {
  db.query(
    "SELECT lock_status FROM system_lock WHERE id = 1",
    (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Internal server error.", error: err.message });
      }

      if (results.length === 0) {
        return res
          .status(500)
          .json({ message: "Lock status not found in the system." });
      }

      // Assuming lock_status can be either 'locked' or 'unlocked'
      const isLocked = results[0].lock_status === "locked";
      console.log(`Lock status fetched: ${isLocked}`);
      res.json({ isLocked }); // Return as a Boolean
    }
  );
};
