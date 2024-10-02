import jwt from 'jsonwebtoken';
import db from '../db/db.js'; // Import your database connection

// Authentication Middleware
// export const authMiddleware = (req, res, next) => {
//   const accessToken = req.cookies.accessToken; // Retrieve the access token from cookies

//   if (!accessToken) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }

//   try {
//     const user = jwt.verify(accessToken, process.env.JWT_SECRET); // Use the actual secret key
//     req.user = user; // Attach user info to the request object
//     next();
//   } catch (error) {
//     console.error('Token verification error:', error);
//     res.status(401).json({ message: 'Invalid Token' });
//   }
// };

// export const authMiddleware = (req, res, next) => {
//   console.log("Cookies:", req.cookies);
//   const accessToken = req.cookies.accessToken; // Retrieve the access token from cookies
//   console.log("Access Token:", accessToken); // Debug: Check if the token is retrieved

//   if (!accessToken) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }

//   try {
//     const user = jwt.verify(accessToken, 'accessSecret');
//     console.log("Decoded User:", user); // Debug: Log decoded user info
//     req.user = user; // Attach user info to the request object
//     next();
//   } catch (error) {
//     console.error('Token verification error:', error);
//     res.status(401).json({ message: 'Invalid Token' });
//   }
// };


// // Lock Middleware for Security
// export const lockMiddleware = async (req, res, next) => {
//   const accessToken = req.cookies.accessToken; // Retrieve the access token from cookies

//   if (accessToken) {
//     try {
//       const decodedToken = jwt.verify(accessToken, 'accessSecret'); // Verify and decode token
//       if (decodedToken.role !== 'admin') {
//         // Check lock status only if the user is not an admin
//         db.query("SELECT lock_status FROM system_lock WHERE id = 1", (err, results) => {
//           if (err) {
//             console.error(`Database error while fetching lock status: ${err.message}`);
//             return res.status(500).json({ message: "Internal server error.", error: err.message });
//           }

//           if (results.length === 0) {
//             console.error("No lock status found in the database.");
//             return res.status(500).json({ message: "Lock status not found in the system." });
//           }

//           if (results[0].lock_status) {
//             return res.status(403).json({ message: "System is locked. Please contact admin." });
//           }

//           next();
//         });
//       } else {
//         // Allow admins to bypass the lock status check
//         next();
//       }
//     } catch (error) {
//       console.error(`Error verifying token: ${error.message}`);
//       res.status(401).json({ message: "Invalid token." });
//     }
//   } else {
//     res.status(401).json({ message: "No token provided." });
//   }
// };


// Authentication Middleware
// export const authMiddleware = (req, res, next) => {
//   console.log("Cookies:", req.cookies);
//   const accessToken = req.cookies.accessToken; // Retrieve the access token from cookies
//   console.log("Access Token:", accessToken); // Debug: Check if the token is retrieved

//   if (!accessToken) {
//     return res.status(401).json({ message: 'Unauthorized: No token provided.' });
//   }

//   try {
//     const user = jwt.verify(accessToken, 'accessSecret'); // Replace 'accessSecret' with your actual JWT secret
//     console.log("Decoded User:", user); // Debug: Log decoded user info
//     req.user = user; // Attach user info to the request object
//     next();
//   } catch (error) {
//     console.error('Token verification error:', error);
//     return res.status(401).json({ message: 'Invalid Token' });
//   }
// };


export const authMiddleware = (req, res, next) => {
  console.log("Cookies:", req.cookies);
  const accessToken = req.cookies.accessToken; // Retrieve the access token from cookies
  console.log("Access Token:", accessToken); // Debug: Check if the token is retrieved

  if (!accessToken) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  try {
    const user = jwt.verify(accessToken, process.env.JWT_SECRET || 'accessSecret'); // Use your actual JWT secret
    console.log("Decoded User:", user); // Debug: Log decoded user info
    req.user = user; // Attach user info to the request object
    next();
  } catch (error) {
    console.error('Token verification error:', error);

    // Clear cookies if the token is invalid or expired
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    
    return res.status(401).json({ message: 'Invalid Token' });
  }
};


// Lock Middleware for Security

export const lockMiddleware = async (req, res, next) => {
  const accessToken = req.cookies.accessToken; // Retrieve the access token from cookies

  if (!accessToken) {
    return res.status(401).json({ message: "Unauthorized: No token provided." });
  }

  try {
    const decodedToken = jwt.verify(accessToken, 'accessSecret'); // Replace 'accessSecret' with your actual JWT secret
    console.log("Decoded Token:", decodedToken); // Debug: Log decoded token

    if (decodedToken.role !== 'admin') {
      // If the user is not an admin, check the lock status
      db.query("SELECT lock_status FROM system_lock WHERE id = 1", (err, results) => {
        if (err) {
          console.error(`Database error while fetching lock status: ${err.message}`);
          return res.status(500).json({ message: "Internal server error.", error: err.message });
        }

        if (results.length === 0) {
          console.error("No lock status found in the database.");
          return res.status(404).json({ message: "Lock status not found in the system." });
        }

        const lockStatus = results[0].lock_status;
        console.log(`Current Lock Status: ${lockStatus}`);

        if (lockStatus === "locked") {
          // Instead of 403, respond with 200 and lock status
          return res.status(200).json({ isLocked: true, message: "System is locked. Please contact the admin." });
        }

        next(); // Lock is not active, allow access
      });
    } else {
      // Admins bypass the lock check
      console.log("Admin access granted, bypassing lock check.");
      next();
    }
  } catch (error) {
    console.error(`Error verifying token: ${error.message}`);
    return res.status(401).json({ message: "Invalid token." });
  }
};




// Combined Middleware for Auth and Lock
export const authAndLockMiddleware = [authMiddleware, lockMiddleware];
