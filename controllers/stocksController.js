import db from "../db/db.js";

// Utility function for logging
const log = (message) =>
  console.log(`[${new Date().toISOString()}] ${message}`);

// Get all stock items
export const getAllStocks = (req, res) => {
  const query = "SELECT * FROM stock";
  db.query(query, (err, results) => {
    if (err) {
      log(`Error fetching stocks: ${err.message}`);
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    log("Fetched all stock items");
    res.json(results);
  });
};

// Get stock items by description
export const getStockByDescription = (req, res) => {
  const { description } = req.query;

  if (!description) {
    log("Description parameter is missing");
    return res.status(400).json({ error: "Description parameter is required" });
  }

  // Query to get records of type 'day_to_day' and matching the description
  const query =
    "SELECT * FROM stock WHERE description LIKE ? AND record_type = 'day_to_day'";

  db.query(query, [`%${description}%`], (err, results) => {
    if (err) {
      log(`Error fetching stock by description: ${err.message}`);
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    if (results.length === 0) {
      log(`No stock found with description: ${description}`);
      return res.status(404).json({ message: "Stock not found" });
    }
    log(`Fetched stock by description: ${description}`);
    res.json(results); // Return all matching results
  });
};

// Save new stock record
// export const saveStock = (req, res) => {
//   const {
//     description,
//     purchase_qty,
//     standard_price,
//   } = req.body;

//   if (!description || purchase_qty === undefined || standard_price === undefined) {
//     log("Missing required fields in request");
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   log(`No existing stock record found. Creating a new record.`);

//   // Insert new stock record
//   const newRecord = {
//     description,
//     opening_qty: purchase_qty,
//     purchase_qty,
//     exchange_qty: 0,
//     return_qty: 0,
//     standard_price,
//     closing_stock: purchase_qty,
//     closing_value: purchase_qty * standard_price,
//     record_type: 'record_keeping',
//   };

//   insertStockRecord(newRecord, res);
// };

// // Insert new stock record
// const insertStockRecord = (record, res) => {
//   const queryInsert = `
//     INSERT INTO stock (description, opening_qty, purchase_qty, exchange_qty, return_qty, standard_price, closing_stock, closing_value, record_type)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//   log(`Inserting new stock record: ${JSON.stringify(record)}`);

//   db.query(queryInsert, [
//     record.description,
//     record.opening_qty,
//     record.purchase_qty,
//     record.exchange_qty,
//     record.return_qty,
//     record.standard_price,
//     record.closing_stock,
//     record.closing_value,
//     record.record_type,
//   ], (err) => {
//     if (err) {
//       log(`Error inserting stock record: ${err.message}`);
//       return res.status(500).json({ error: "Database error: " + err.message });
//     }
//     log(`Stock record inserted successfully for ${record.description}`);
//     res.json({ message: "Stock record added successfully" });
//   });
// };

// export const saveStock = (req, res) => {
//   const {
//     description,
//     purchase_qty,
//     standard_price,
//     category
//   } = req.body;

//   log(`Received request to save stock: ${JSON.stringify(req.body)}`);

//   if (!description || purchase_qty === undefined || standard_price === undefined) {
//     log("Missing required fields in request");
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   log(`Fetching existing stock record for description: ${description}`);
  
//   const query = "SELECT id, opening_qty, closing_stock, purchase_qty, record_type FROM stock WHERE description = ?";
//   db.query(query, [description], (error, results) => {
//     if (error) {
//       log(`Error fetching stock record: ${error.message}`);
//       return res.status(500).json({ error: "Database error: " + error.message });
//     }

//     log(`Results from stock query: ${JSON.stringify(results)}`);

//     if (results.length > 0) {
//       const existingRecord = results[0];
//       log(`Existing stock record found: ${JSON.stringify(existingRecord)}`);

//       if (existingRecord.record_type === 'record_keeping') {
//         log("Updating existing 'record_keeping' record with purchase information.");
//         const updatedPurchaseQty = existingRecord.purchase_qty + purchase_qty;

//         const queryUpdate = `
//           UPDATE stock
//           SET opening_qty = 0, closing_stock = 0, purchase_qty = ?, closing_value = 0
//           WHERE id = ?`;

//         log(`Updating stock record for description: ${description}, purchase_qty: ${updatedPurchaseQty}`);
        
//         db.query(queryUpdate, [
//           updatedPurchaseQty,
//           existingRecord.id
//         ], (err) => {
//           if (err) {
//             log(`Error updating stock record: ${err.message}`);
//             return res.status(500).json({ error: "Database error: " + err.message });
//           }
//           log(`Stock record updated successfully for description: ${description}`);
//           return res.json({ message: "Stock record updated successfully for 'record_keeping'" });
//         });
//       } else {
//         updateDayToDayStock(existingRecord, purchase_qty, standard_price, res);
//       }
//     } else {
//       // Insert a new stock record
//       log("No existing stock record found. Creating a new 'day_to_day' record.");

//       const newRecord = {
//         description,
//         opening_qty: purchase_qty,
//         purchase_qty,
//         exchange_qty: 0,
//         return_qty: 0,
//         standard_price,
//         closing_stock: purchase_qty,
//         closing_value: purchase_qty * standard_price,
//         record_type: 'day_to_day',
//       };

//       log(`Inserting new stock record: ${JSON.stringify(newRecord)}`);
//       insertStockRecord(newRecord, res);
//     }
//   });
// };


// const updateDayToDayStock = (existingRecord, purchase_qty, standard_price, res) => {
//   const updatedOpeningQty = existingRecord.opening_qty + purchase_qty;
//   const updatedClosingStock = existingRecord.closing_stock + purchase_qty;

//   const queryUpdate = `
//     UPDATE stock
//     SET opening_qty = ?, closing_stock = ?, closing_value = ?
//     WHERE id = ?`;

//   log(`Updating stock record for description: ${existingRecord.description}`);
//   log(`Updated Opening Quantity: ${updatedOpeningQty}`);
//   log(`Updated Closing Stock: ${updatedClosingStock}`);

//   db.query(queryUpdate, [
//     updatedOpeningQty,
//     updatedClosingStock,
//     updatedClosingStock * standard_price,
//     existingRecord.id
//   ], (err) => {
//     if (err) {
//       log(`Error updating stock record: ${err.message}`);
//       return res.status(500).json({ error: "Database error: " + err.message });
//     }
//     log(`Stock record updated successfully for description: ${existingRecord.description}`);
//     res.json({ message: "Stock record updated successfully" });
//   });
// };

// const insertStockRecord = (record, res) => {
//   const queryInsert = `
//     INSERT INTO stock (description, opening_qty, purchase_qty, exchange_qty, return_qty, standard_price, closing_stock, closing_value, record_type)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//   log(`Inserting new stock record: ${JSON.stringify(record)}`);

//   db.query(queryInsert, [
//     record.description,
//     record.opening_qty,
//     record.purchase_qty,
//     record.exchange_qty,
//     record.return_qty,
//     record.standard_price,
//     record.closing_stock,
//     record.closing_value,
//     record.record_type,
//   ], (err) => {
//     if (err) {
//       log(`Error inserting stock record: ${err.message}`);
//       return res.status(500).json({ error: "Database error: " + err.message });
//     }
//     log(`Stock record inserted successfully for ${record.description}`);
//     res.json({ message: "Stock record added successfully" });
//   });
// };




export const updateStockByDescription = (req, res) => {
  const { description } = req.params; // Extract description from URL parameters
  const { purchase_qty, standard_price, sale_status, sales_qty } = req.body;

  if (
    !description ||
    purchase_qty === undefined ||
    standard_price === undefined
  ) {
    console.error("Missing required fields in request");
    return res.status(400).json({ error: "Missing required fields" });
  }

  console.log(`Fetching existing stock record for description: ${description}`);

  // Fetch existing stock record
  const fetchQuery = "SELECT * FROM stock WHERE description = ?";
  db.query(fetchQuery, [description], (fetchErr, results) => {
    if (fetchErr) {
      console.error(`Error fetching stock record: ${fetchErr.message}`);
      return res
        .status(500)
        .json({ error: "Database error: " + fetchErr.message });
    }

    const existingRecord = results[0];

    if (existingRecord) {
      console.log(
        `Existing stock record found: ${JSON.stringify(existingRecord)}`
      );

      // Calculate updated quantities
      const updatedOpeningQty = existingRecord.opening_qty + purchase_qty;
      const updatedClosingStock = existingRecord.closing_stock + purchase_qty;

      console.log(`Updated opening quantity: ${updatedOpeningQty}`);
      console.log(`Updated closing stock: ${updatedClosingStock}`);

      // Adjust based on sales status
      let finalOpeningQty = updatedOpeningQty;
      let finalClosingStock = updatedClosingStock;

      if (sale_status === "supplied") {
        finalOpeningQty -= sales_qty;
        finalClosingStock -= sales_qty;
        console.log(`Sale status is "supplied". Adjusting quantities.`);
      } else if (sale_status === "pending") {
        console.log(
          `Sale status is "pending". No sales quantity will be subtracted.`
        );
      }

      console.log(`Final opening quantity: ${finalOpeningQty}`);
      console.log(`Final closing stock: ${finalClosingStock}`);

      // Update existing stock record with new values
      updateStockRecordByDescription(
        description,
        finalOpeningQty,
        finalClosingStock,
        standard_price,
        res
      );
    } else {
      console.error(
        `No existing stock record found for description: ${description}`
      );
      res.status(404).json({ message: "Stock record not found" });
    }
  });
};

// Separate function to update stock records by description
const updateStockRecordByDescription = (
  description,
  opening_qty,
  closing_stock,
  standard_price,
  res
) => {
  const queryUpdate = `
    UPDATE stock SET 
    opening_qty = ?,
    closing_stock = ?,
    closing_value = ? 
    WHERE description = ?
  `;

  // Detailed logging before updating
  console.log(
    `Preparing to update stock record for description: ${description}`
  );
  console.log(
    `New values - Opening Quantity: ${opening_qty}, Closing Stock: ${closing_stock}, Standard Price: ${standard_price}`
  );

  db.query(
    queryUpdate,
    [opening_qty, closing_stock, closing_stock * standard_price, description],
    (err) => {
      if (err) {
        // Error logging
        console.error(
          `Error updating stock record for description: ${description} - ${err.message}`
        );
        return res
          .status(500)
          .json({ error: "Database error: " + err.message });
      }
      // Success logging
      console.log(
        `Stock record updated successfully for description: ${description}`
      );
      console.log(
        `Updated values - Opening Quantity: ${opening_qty}, Closing Stock: ${closing_stock}, Closing Value: ${
          closing_stock * standard_price
        }`
      );
      res.json({ message: "Stock record updated successfully" });
    }
  );
};


// export const saveStock = (req, res) => {
//   const {
//     description,
//     purchase_qty,
//     standard_price,
//     record_type // Indicates whether it's 'record_keeping' or 'day_to_day'
//   } = req.body;

//   log(`Received request to save stock: ${JSON.stringify(req.body)}`);

//   if (!description || purchase_qty === undefined || standard_price === undefined) {
//     log("Missing required fields in request");
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   log(`Fetching existing stock record for description: ${description}`);
  
//   const query = "SELECT id, opening_qty, closing_stock, purchase_qty, record_type FROM stock WHERE description = ?";
//   db.query(query, [description], (error, results) => {
//     if (error) {
//       log(`Error fetching stock record: ${error.message}`);
//       return res.status(500).json({ error: "Database error: " + error.message });
//     }

//     log(`Results from stock query: ${JSON.stringify(results)}`);

//     if (results.length > 0) {
//       const existingRecord = results[0];
//       log(`Existing stock record found: ${JSON.stringify(existingRecord)}`);

//       if (existingRecord.record_type === 'record_keeping') {
//         log("Updating existing 'record_keeping' record with purchase information.");
//         const updatedPurchaseQty = existingRecord.purchase_qty + purchase_qty;

//         const queryUpdate = `
//           UPDATE stock
//           SET opening_qty = ?, purchase_qty = ?, closing_value = 0
//           WHERE id = ?`;

//         log(`Updating stock record for description: ${description}, purchase_qty: ${updatedPurchaseQty}`);
        
//         db.query(queryUpdate, [
//           existingRecord.opening_qty, // Retain previous opening_qty
//           updatedPurchaseQty,
//           existingRecord.id
//         ], (err) => {
//           if (err) {
//             log(`Error updating stock record: ${err.message}`);
//             return res.status(500).json({ error: "Database error: " + err.message });
//           }
//           log(`Stock record updated successfully for description: ${description}`);
//           return res.json({ message: "Stock record updated successfully for 'record_keeping'" });
//         });
//       } else if (existingRecord.record_type === 'day_to_day') {
//         // Ensure we don't end up with negative stock
//         const newClosingStock = existingRecord.closing_stock + purchase_qty;
//         if (newClosingStock < 0) {
//           return res.status(400).json({ error: "Cannot reduce stock below zero" });
//         }
//         updateDayToDayStock(existingRecord, purchase_qty, standard_price, res);
//       }
//     } else {
//       // Insert a new stock record based on the type
//       log("No existing stock record found. Creating a new record.");
//       let newRecord;

//       if (record_type === 'day_to_day') {
//         newRecord = {
//           description,
//           opening_qty: purchase_qty,
//           purchase_qty,
//           exchange_qty: 0,
//           return_qty: 0,
//           standard_price,
//           closing_stock: purchase_qty,
//           closing_value: purchase_qty * standard_price,
//           record_type: 'day_to_day',
//         };
//       } else if (record_type === 'record_keeping') {
//         newRecord = {
//           description,
//           opening_qty: existingRecord ? existingRecord.opening_qty : 0, // Maintain previous value or start at 0
//           purchase_qty, // Set to the quantity being purchased
//           exchange_qty: 0,
//           return_qty: 0,
//           standard_price,
//           closing_stock: 0, // Typically not needed for record keeping
//           closing_value: 0, // Typically not needed for record keeping
//           record_type: 'record_keeping',
//         };
//       }

//       log(`Inserting new stock record: ${JSON.stringify(newRecord)}`);
//       insertStockRecord(newRecord, res);
//     }
//   });
// };

// const updateDayToDayStock = (existingRecord, purchase_qty, standard_price, res) => {
//   const updatedOpeningQty = existingRecord.opening_qty + purchase_qty;
//   const updatedClosingStock = existingRecord.closing_stock + purchase_qty;

//   // Check if the updated closing stock is valid
//   if (updatedClosingStock < 0) {
//     return res.status(400).json({ error: "Cannot reduce stock below zero" });
//   }

//   const queryUpdate = `
//     UPDATE stock
//     SET opening_qty = ?, closing_stock = ?, closing_value = ?
//     WHERE id = ?`;

//   log(`Updating stock record for description: ${existingRecord.description}`);
//   log(`Updated Opening Quantity: ${updatedOpeningQty}`);
//   log(`Updated Closing Stock: ${updatedClosingStock}`);

//   db.query(queryUpdate, [
//     updatedOpeningQty,
//     updatedClosingStock,
//     updatedClosingStock * standard_price,
//     existingRecord.id
//   ], (err) => {
//     if (err) {
//       log(`Error updating stock record: ${err.message}`);
//       return res.status(500).json({ error: "Database error: " + err.message });
//     }
//     log(`Stock record updated successfully for description: ${existingRecord.description}`);
//     res.json({ message: "Stock record updated successfully" });
//   });
// };

// const insertStockRecord = (record, res) => {
//   const queryInsert = `
//     INSERT INTO stock (description, opening_qty, purchase_qty, exchange_qty, return_qty, standard_price, closing_stock, closing_value, record_type)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//   log(`Inserting new stock record: ${JSON.stringify(record)}`);

//   db.query(queryInsert, [
//     record.description,
//     record.opening_qty,
//     record.purchase_qty,
//     record.exchange_qty,
//     record.return_qty,
//     record.standard_price,
//     record.closing_stock,
//     record.closing_value,
//     record.record_type,
//   ], (err) => {
//     if (err) {
//       log(`Error inserting stock record: ${err.message}`);
//       return res.status(500).json({ error: "Database error: " + err.message });
//     }
//     log(`Stock record inserted successfully for ${record.description}`);
//     res.json({ message: "Stock record added successfully" });
//   });
// };



// export const saveStock = (req, res) => {
//   const {
//     description,
//     purchase_qty,
//     standard_price,
//     category, // Pass down category
//     record_type // Indicates whether it's 'record_keeping' or 'day_to_day'
//   } = req.body;

//   log(`Received request to save stock: ${JSON.stringify(req.body)}`);

//   if (!description || purchase_qty === undefined || standard_price === undefined || !category) {
//     log("Missing required fields in request");
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   log(`Fetching existing stock record for description: ${description}`);
  
//   const query = "SELECT id, opening_qty, closing_stock, purchase_qty, record_type, category FROM stock WHERE description = ? AND category = ?";
//   db.query(query, [description, category], (error, results) => {
//     if (error) {
//       log(`Error fetching stock record: ${error.message}`);
//       return res.status(500).json({ error: "Database error: " + error.message });
//     }

//     log(`Results from stock query: ${JSON.stringify(results)}`);

//     if (results.length > 0) {
//       const existingRecord = results[0];
//       log(`Existing stock record found: ${JSON.stringify(existingRecord)}`);

//       if (existingRecord.record_type === 'record_keeping') {
//         log("Updating existing 'record_keeping' record with purchase information.");
//         const updatedPurchaseQty = existingRecord.purchase_qty + purchase_qty;

//         const queryUpdate = `
//           UPDATE stock
//           SET opening_qty = ?, purchase_qty = ?, closing_value = 0
//           WHERE id = ? AND category = ?`;

//         log(`Updating stock record for description: ${description}, purchase_qty: ${updatedPurchaseQty}`);
        
//         db.query(queryUpdate, [
//           existingRecord.opening_qty, // Retain previous opening_qty
//           updatedPurchaseQty,
//           existingRecord.id,
//           category // Update based on category
//         ], (err) => {
//           if (err) {
//             log(`Error updating stock record: ${err.message}`);
//             return res.status(500).json({ error: "Database error: " + err.message });
//           }
//           log(`Stock record updated successfully for description: ${description}`);
//           return res.json({ message: "Stock record updated successfully for 'record_keeping'" });
//         });
//       } else if (existingRecord.record_type === 'day_to_day') {
//         // Ensure we don't end up with negative stock
//         const newClosingStock = existingRecord.closing_stock + purchase_qty;
//         if (newClosingStock < 0) {
//           return res.status(400).json({ error: "Cannot reduce stock below zero" });
//         }
//         updateDayToDayStock(existingRecord, purchase_qty, standard_price, category, res);
//       }
//     } else {
//       // Insert a new stock record based on the type
//       log("No existing stock record found. Creating a new record.");
//       let newRecord;

//       if (record_type === 'day_to_day') {
//         newRecord = {
//           description,
//           opening_qty: purchase_qty,
//           purchase_qty,
//           exchange_qty: 0,
//           return_qty: 0,
//           standard_price,
//           closing_stock: purchase_qty,
//           closing_value: purchase_qty * standard_price,
//           category, // Set category
//           record_type: 'day_to_day',
//         };
//       } else if (record_type === 'record_keeping') {
//         newRecord = {
//           description,
//           opening_qty: 0, // Start with zero for record-keeping
//           purchase_qty, // Set to the quantity being purchased
//           exchange_qty: 0,
//           return_qty: 0,
//           standard_price,
//           closing_stock: 0, // Typically not needed for record-keeping
//           closing_value: 0, // Typically not needed for record-keeping
//           category, // Set category
//           record_type: 'record_keeping',
//         };
//       }

//       log(`Inserting new stock record: ${JSON.stringify(newRecord)}`);
//       insertStockRecord(newRecord, res);
//     }
//   });
// };

// const updateDayToDayStock = (existingRecord, purchase_qty, standard_price, category, res) => {
//   const updatedOpeningQty = existingRecord.opening_qty + purchase_qty;
//   const updatedClosingStock = existingRecord.closing_stock + purchase_qty;

//   // Check if the updated closing stock is valid
//   if (updatedClosingStock < 0) {
//     return res.status(400).json({ error: "Cannot reduce stock below zero" });
//   }

//   const queryUpdate = `
//     UPDATE stock
//     SET opening_qty = ?, closing_stock = ?, closing_value = ?
//     WHERE id = ? AND category = ?`;

//   log(`Updating stock record for description: ${existingRecord.description}`);
//   log(`Updated Opening Quantity: ${updatedOpeningQty}`);
//   log(`Updated Closing Stock: ${updatedClosingStock}`);

//   db.query(queryUpdate, [
//     updatedOpeningQty,
//     updatedClosingStock,
//     updatedClosingStock * standard_price,
//     existingRecord.id,
//     category // Include category to ensure correct stock entry is updated
//   ], (err) => {
//     if (err) {
//       log(`Error updating stock record: ${err.message}`);
//       return res.status(500).json({ error: "Database error: " + err.message });
//     }
//     log(`Stock record updated successfully for description: ${existingRecord.description}`);
//     res.json({ message: "Stock record updated successfully" });
//   });
// };

// const insertStockRecord = (record, res) => {
//   const queryInsert = `
//     INSERT INTO stock (description, opening_qty, purchase_qty, exchange_qty, return_qty, standard_price, closing_stock, closing_value, category, record_type)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//   log(`Inserting new stock record: ${JSON.stringify(record)}`);

//   db.query(queryInsert, [
//     record.description,
//     record.opening_qty,
//     record.purchase_qty,
//     record.exchange_qty,
//     record.return_qty,
//     record.standard_price,
//     record.closing_stock,
//     record.closing_value,
//     record.category, // Include category in insertion
//     record.record_type,
//   ], (err) => {
//     if (err) {
//       log(`Error inserting stock record: ${err.message}`);
//       return res.status(500).json({ error: "Database error: " + err.message });
//     }
//     log(`Stock record inserted successfully for ${record.description}`);
//     res.json({ message: "Stock record added successfully" });
//   });
// };

// export const saveStock = (req, res) => {
//   const {
//     description,
//     purchase_qty,
//     standard_price,
//     category,
//     record_type
//   } = req.body;

//   log(`Received request to save stock: ${JSON.stringify(req.body)}`);

//   // Check for required fields
//   if (!description || purchase_qty === undefined || standard_price === undefined) {
//     log("Missing required fields in request");
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   log(`Fetching existing stock record for description: ${description}`);
  
//   const query = `
//     SELECT id, opening_qty, closing_stock, purchase_qty, record_type 
//     FROM stock 
//     WHERE description = ?
//   `;
  
//   db.query(query, [description], (error, results) => {
//     if (error) {
//       log(`Error fetching stock record: ${error.message}`);
//       return res.status(500).json({ error: "Database error: " + error.message });
//     }

//     log(`Results from stock query: ${JSON.stringify(results)}`);

//     if (results.length > 0) {
//       // Existing record found
//       const existingRecord = results[0];
//       log(`Existing stock record found: ${JSON.stringify(existingRecord)}`);

//       if (existingRecord.record_type === 'record_keeping') {
//         // Update existing 'record_keeping' record
//         log("Updating existing 'record_keeping' record with purchase information.");
//         const updatedPurchaseQty = existingRecord.purchase_qty + purchase_qty;

//         const queryUpdate = `
//           UPDATE stock
//           SET opening_qty = ?, purchase_qty = ?, closing_value = 0
//           WHERE id = ?
//         `;

//         log(`Updating stock record for description: ${description}, purchase_qty: ${updatedPurchaseQty}`);
        
//         db.query(queryUpdate, [
//           existingRecord.opening_qty, // Retain previous opening_qty
//           updatedPurchaseQty,
//           existingRecord.id
//         ], (err) => {
//           if (err) {
//             log(`Error updating stock record: ${err.message}`);
//             return res.status(500).json({ error: "Database error: " + err.message });
//           }
//           log(`Stock record updated successfully for description: ${description}`);
//           return res.json({ message: "Stock record updated successfully for 'record_keeping'" });
//         });
//       } else if (existingRecord.record_type === 'day_to_day') {
//         // Update existing 'day_to_day' record
//         const newClosingStock = existingRecord.closing_stock + purchase_qty;
//         if (newClosingStock < 0) {
//           log("Cannot reduce stock below zero for 'day_to_day'.");
//           return res.status(400).json({ error: "Cannot reduce stock below zero" });
//         }
//         updateDayToDayStock(existingRecord, purchase_qty, standard_price, res);
//       }
//     } else {
//       // No existing record found; insert a new one
//       log("No existing stock record found. Creating a new record.");
//       insertStockRecord(req.body, res);
//     }
//   });
// };





export const saveStock = (req, res) => {
  const {
    description,
    purchase_qty,
    standard_price,
    category,
    record_type
  } = req.body;

  log(`Received request to save stock: ${JSON.stringify(req.body)}`);

  // Check for required fields
  if (!description || purchase_qty === undefined || standard_price === undefined || !record_type) {
    log("Missing required fields in request");
    return res.status(400).json({ error: "Missing required fields" });
  }

  log(`Fetching existing stock record for description: ${description}`);
  
  const query = `
    SELECT id, opening_qty, closing_stock, purchase_qty, record_type 
    FROM stock 
    WHERE description = ?
  `;
  
  db.query(query, [description], (error, results) => {
    if (error) {
      log(`Error fetching stock record: ${error.message}`);
      return res.status(500).json({ error: "Database error: " + error.message });
    }

    log(`Results from stock query: ${JSON.stringify(results)}`);

    if (results.length > 0) {
      // Existing record found
      const existingRecord = results[0];
      log(`Existing stock record found: ${JSON.stringify(existingRecord)}`);

      if (existingRecord.record_type === 'record_keeping') {
        log("Updating existing 'record_keeping' record with purchase information.");
        const updatedPurchaseQty = existingRecord.purchase_qty + purchase_qty;

        const queryUpdate = `
          UPDATE stock
          SET opening_qty = ?, purchase_qty = ?, closing_value = 0
          WHERE id = ?
        `;

        log(`Updating stock record for description: ${description}, purchase_qty: ${updatedPurchaseQty}`);
        
        db.query(queryUpdate, [
          existingRecord.opening_qty,
          updatedPurchaseQty,
          existingRecord.id
        ], (err) => {
          if (err) {
            log(`Error updating stock record: ${err.message}`);
            return res.status(500).json({ error: "Database error: " + err.message });
          }
          log(`Stock record updated successfully for description: ${description}`);
          return res.json({ message: "Stock record updated successfully for 'record_keeping'" });
        });
      } else if (existingRecord.record_type === 'day_to_day') {
        const newClosingStock = existingRecord.closing_stock + purchase_qty;
        if (newClosingStock < 0) {
          log("Cannot reduce stock below zero for 'day_to_day'.");
          return res.status(400).json({ error: "Cannot reduce stock below zero" });
        }
        updateDayToDayStock(existingRecord, purchase_qty, standard_price, res);
      }
    } else {
      log("No existing stock record found. Creating a new record.");
      insertStockRecord(req.body, res);
    }
  });
};


const updateDayToDayStock = (existingRecord, purchase_qty, standard_price, res) => {
  const updatedOpeningQty = existingRecord.opening_qty + purchase_qty;
  const updatedClosingStock = existingRecord.closing_stock + purchase_qty;

  // Check if the updated closing stock is valid
  if (updatedClosingStock < 0) {
    log("Cannot reduce stock below zero after update for 'day_to_day'.");
    return res.status(400).json({ error: "Cannot reduce stock below zero" });
  }

  const queryUpdate = `
    UPDATE stock
    SET opening_qty = ?, closing_stock = ?, closing_value = ?
    WHERE id = ?
  `;

  log(`Updating stock record for description: ${existingRecord.description}`);
  log(`Updated Opening Quantity: ${updatedOpeningQty}`);
  log(`Updated Closing Stock: ${updatedClosingStock}`);

  db.query(queryUpdate, [
    updatedOpeningQty,
    updatedClosingStock,
    updatedClosingStock * standard_price,
    existingRecord.id
  ], (err) => {
    if (err) {
      log(`Error updating stock record: ${err.message}`);
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    log(`Stock record updated successfully for description: ${existingRecord.description}`);
    res.json({ message: "Stock record updated successfully" });
  });
};

const insertStockRecord = (body, res) => {
  const {
    description,
    purchase_qty,
    standard_price,
    category,
    record_type
  } = body;

  let newRecord;

  if (record_type === 'day_to_day') {
    newRecord = {
      description,
      opening_qty: purchase_qty,
      purchase_qty,
      exchange_qty: 0,
      return_qty: 0,
      standard_price,
      closing_stock: purchase_qty,
      closing_value: purchase_qty * standard_price,
      category,
      record_type,
    };
  } else if (record_type === 'record_keeping') {
    newRecord = {
      description,
      opening_qty: 0,
      purchase_qty,
      exchange_qty: 0,
      return_qty: 0,
      standard_price,
      closing_stock: 0,
      closing_value: 0,
      category,
      record_type,
    };
  }

  const queryInsert = `
    INSERT INTO stock (description, opening_qty, purchase_qty, exchange_qty, return_qty, standard_price, closing_stock, closing_value, category, record_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  log(`Inserting new stock record: ${JSON.stringify(newRecord)}`);

  db.query(queryInsert, [
    newRecord.description,
    newRecord.opening_qty,
    newRecord.purchase_qty,
    newRecord.exchange_qty,
    newRecord.return_qty,
    newRecord.standard_price,
    newRecord.closing_stock,
    newRecord.closing_value,
    newRecord.category,
    newRecord.record_type,
  ], (err) => {
    if (err) {
      log(`Error inserting stock record: ${err.message}`);
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    log(`Stock record inserted successfully for ${newRecord.description}`);
    res.json({ message: "Stock record added successfully" });
  });
};





// Function to add new stock
// export const addStock = (req, res) => {
//   const { description, purchase_qty, standard_price, category, record_type } = req.body;

//   log(`Received request to add stock: ${JSON.stringify(req.body)}`);

//   // Check for required fields
//   if (!description || purchase_qty === undefined || standard_price === undefined || !record_type) {
//     log("Missing required fields in request");
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   const newRecord = {
//     description,
//     opening_qty: record_type === 'day_to_day' ? purchase_qty : 0,
//     purchase_qty,
//     exchange_qty: 0,
//     return_qty: 0,
//     standard_price,
//     closing_stock: record_type === 'day_to_day' ? purchase_qty : 0,
//     closing_value: record_type === 'day_to_day' ? purchase_qty * standard_price : 0,
//     category,
//     record_type,
//   };

//   const queryInsert = `
//     INSERT INTO stock (description, opening_qty, purchase_qty, exchange_qty, return_qty, standard_price, closing_stock, closing_value, category, record_type)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(queryInsert, [
//     newRecord.description,
//     newRecord.opening_qty,
//     newRecord.purchase_qty,
//     newRecord.exchange_qty,
//     newRecord.return_qty,
//     newRecord.standard_price,
//     newRecord.closing_stock,
//     newRecord.closing_value,
//     newRecord.category,
//     newRecord.record_type,
//   ], (err) => {
//     if (err) {
//       log(`Error inserting stock record: ${err.message}`);
//       return res.status(500).json({ error: "Database error: " + err.message });
//     }
//     log(`Stock record added successfully for ${newRecord.description}`);
//     res.json({ message: "Stock record added successfully" });
//   });
// };

// // Function to update existing stock
// export const updateStock = (req, res) => {
//   const { description } = req.params;
//   const { purchase_qty, standard_price, category, record_type } = req.body;

//   log(`Received request to update stock: ${JSON.stringify(req.body)}`);

//   if (!description || purchase_qty === undefined || standard_price === undefined || !record_type) {
//     log("Missing required fields in request");
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   log(`Fetching existing stock record for description: ${description}`);
  
//   const query = `
//     SELECT id, opening_qty, closing_stock, purchase_qty, record_type 
//     FROM stock 
//     WHERE description = ?
//   `;

//   db.query(query, [description], (error, results) => {
//     if (error) {
//       log(`Error fetching stock record: ${error.message}`);
//       return res.status(500).json({ error: "Database error: " + error.message });
//     }

//     if (results.length === 0) {
//       log(`No stock record found for description: ${description}`);
//       return res.status(404).json({ error: "Stock record not found" });
//     }

//     const existingRecord = results[0];

//     // Update logic for 'record_keeping'
//     if (existingRecord.record_type === 'record_keeping') {
//       const updatedPurchaseQty = existingRecord.purchase_qty + purchase_qty;

//       const queryUpdate = `
//         UPDATE stock
//         SET purchase_qty = ?, closing_value = 0
//         WHERE id = ?
//       `;

//       db.query(queryUpdate, [updatedPurchaseQty, existingRecord.id], (err) => {
//         if (err) {
//           log(`Error updating stock record: ${err.message}`);
//           return res.status(500).json({ error: "Database error: " + err.message });
//         }
//         log(`Stock record updated successfully for 'record_keeping'`);
//         return res.json({ message: "Stock record updated successfully for 'record_keeping'" });
//       });
//     } 
//     // Update logic for 'day_to_day'
//     else if (existingRecord.record_type === 'day_to_day') {
//       const newClosingStock = existingRecord.closing_stock + purchase_qty;

//       if (newClosingStock < 0) {
//         log("Cannot reduce stock below zero for 'day_to_day'.");
//         return res.status(400).json({ error: "Cannot reduce stock below zero" });
//       }

//       const updatedOpeningQty = existingRecord.opening_qty + purchase_qty;

//       const queryUpdate = `
//         UPDATE stock
//         SET opening_qty = ?, closing_stock = ?, closing_value = ?
//         WHERE id = ?
//       `;

//       db.query(queryUpdate, [
//         updatedOpeningQty,
//         newClosingStock,
//         newClosingStock * standard_price,
//         existingRecord.id
//       ], (err) => {
//         if (err) {
//           log(`Error updating stock record: ${err.message}`);
//           return res.status(500).json({ error: "Database error: " + err.message });
//         }
//         log(`Stock record updated successfully for 'day_to_day'`);
//         return res.json({ message: "Stock record updated successfully for 'day_to_day'" });
//       });
//     }
//   });
// };




// Function to add new stock
// export const addStock = (req, res) => {
//   const { description, purchase_qty, standard_price, category } = req.body;

//   log(`Received request to add stock: ${JSON.stringify(req.body)}`);

//   // Check for required fields
//   if (!description || purchase_qty === undefined || standard_price === undefined) {
//     log("Missing required fields in request");
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   let newRecord;

//   // Distinguish logic between 'day_to_day' and 'record_keeping'
//   if (record_type === 'day_to_day') {
//     newRecord = {
//       description,
//       opening_qty: purchase_qty,
//       purchase_qty,
//       exchange_qty: 0,
//       return_qty: 0,
//       standard_price,
//       closing_stock: purchase_qty,
//       closing_value: purchase_qty * standard_price,
//       record_type: 'day_to_day',
//     };
//   } else if (record_type === 'record_keeping') {
//     newRecord = {
//       description,
//       opening_qty: 0, // Typically not needed for record keeping
//       purchase_qty, // Set to the quantity being purchased
//       exchange_qty: 0,
//       return_qty: 0,
//       standard_price,
//       closing_stock: 0, // Typically not needed for record keeping
//       closing_value: 0, // Typically not needed for record keeping
//       record_type: 'record_keeping',
//     };
//   }

//   const queryInsert = `
//     INSERT INTO stock (description, opening_qty, purchase_qty, exchange_qty, return_qty, standard_price, closing_stock, closing_value, category, record_type)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(queryInsert, [
//     newRecord.description,
//     newRecord.opening_qty,
//     newRecord.purchase_qty,
//     newRecord.exchange_qty,
//     newRecord.return_qty,
//     newRecord.standard_price,
//     newRecord.closing_stock,
//     newRecord.closing_value,
//     category, // Category field is passed but not used in any special logic
//     newRecord.record_type,
//   ], (err) => {
//     if (err) {
//       log(`Error inserting stock record: ${err.message}`);
//       return res.status(500).json({ error: "Database error: " + err.message });
//     }
//     log(`Stock record added successfully for ${newRecord.description}`);
//     res.json({ message: "Stock record added successfully" });
//   });
// };

// export const addStock = (req, res) => {
//   const { description, purchase_qty, standard_price, category } = req.body;

//   log(`Received request to add stock: ${JSON.stringify(req.body)}`);

//   // Check for required fields
//   if (!description || purchase_qty === undefined || standard_price === undefined || !category) {
//     log("Missing required fields in request");
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   // Day-to-Day Record
//   const dayToDayRecord = {
//     description,
//     opening_qty: purchase_qty, // Day-to-day opening and closing are based on the purchase quantity
//     purchase_qty: 0, // Day-to-day purchase_qty is set to 0
//     exchange_qty: 0,
//     return_qty: 0,
//     standard_price,
//     closing_stock: purchase_qty, // Closing stock equals purchase_qty for day-to-day
//     closing_value: purchase_qty * standard_price, // Closing value calculated
//     record_type: 'day_to_day',
//     category, // Category passed to the day-to-day record
//   };

//   // Record-Keeping Record
//   const recordKeeping = {
//     description,
//     opening_qty: 0, // Record-keeping doesn't track opening stock
//     purchase_qty, // Actual purchase quantity is recorded here
//     exchange_qty: 0,
//     return_qty: 0,
//     standard_price,
//     closing_stock: 0, // Record-keeping doesn't track closing stock
//     closing_value: 0, // Record-keeping doesn't track closing value
//     record_type: 'record_keeping',
//     category, // Category passed to the record-keeping record
//   };

//   // Insert both records into the database
//   const queryInsert = `
//     INSERT INTO stock (description, opening_qty, purchase_qty, exchange_qty, return_qty, standard_price, closing_stock, closing_value, category, record_type)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   // Insert Day-to-Day Record
//   db.query(queryInsert, [
//     dayToDayRecord.description,
//     dayToDayRecord.opening_qty,
//     dayToDayRecord.purchase_qty,
//     dayToDayRecord.exchange_qty,
//     dayToDayRecord.return_qty,
//     dayToDayRecord.standard_price,
//     dayToDayRecord.closing_stock,
//     dayToDayRecord.closing_value,
//     dayToDayRecord.category, // Pass category
//     dayToDayRecord.record_type,
//   ], (err) => {
//     if (err) {
//       log(`Error inserting day-to-day record: ${err.message}`);
//       return res.status(500).json({ error: "Database error: " + err.message });
//     }

//     log(`Day-to-day stock record added successfully for ${description}`);

//     // Insert Record-Keeping Record
//     db.query(queryInsert, [
//       recordKeeping.description,
//       recordKeeping.opening_qty,
//       recordKeeping.purchase_qty,
//       recordKeeping.exchange_qty,
//       recordKeeping.return_qty,
//       recordKeeping.standard_price,
//       recordKeeping.closing_stock,
//       recordKeeping.closing_value,
//       recordKeeping.category, // Pass category
//       recordKeeping.record_type,
//     ], (err) => {
//       if (err) {
//         log(`Error inserting record-keeping record: ${err.message}`);
//         return res.status(500).json({ error: "Database error: " + err.message });
//       }

//       log(`Record-keeping stock record added successfully for ${description}`);
//       res.json({ message: "Stock records (day-to-day and record-keeping) added successfully" });
//     });
//   });
// };

export const addStock = (req, res) => {
  const { description, purchase_qty, standard_price, category } = req.body;

  log(`Received request to add stock: ${JSON.stringify(req.body)}`);

  // Check for required fields
  if (!description || purchase_qty === undefined || standard_price === undefined || !category) {
    log("Missing required fields in request");
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Day-to-Day Record
  const dayToDayRecord = {
    description,
    opening_qty: purchase_qty, // Day-to-day opening based on the purchase quantity
    purchase_qty: 0, // Day-to-day purchase_qty is set to 0
    exchange_qty: 0,
    return_qty: 0,
    standard_price,
    // Remove closing_stock from this object
    closing_value: purchase_qty * standard_price, // Closing value calculated
    record_type: 'day_to_day',
    category, // Category passed to the day-to-day record
  };

  // Record-Keeping Record
  const recordKeeping = {
    description,
    opening_qty: 0, // Record-keeping doesn't track opening stock
    purchase_qty, // Actual purchase quantity is recorded here
    exchange_qty: 0,
    return_qty: 0,
    standard_price,
    // Remove closing_stock from this object
    closing_value: 0, // Record-keeping doesn't track closing value
    record_type: 'record_keeping',
    category, // Category passed to the record-keeping record
  };

  // Insert both records into the database
  const queryInsert = `
    INSERT INTO stock (description, opening_qty, purchase_qty, exchange_qty, return_qty, standard_price, closing_value, category, record_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Insert Day-to-Day Record
  db.query(queryInsert, [
    dayToDayRecord.description,
    dayToDayRecord.opening_qty,
    dayToDayRecord.purchase_qty,
    dayToDayRecord.exchange_qty,
    dayToDayRecord.return_qty,
    dayToDayRecord.standard_price,
    dayToDayRecord.closing_value, // Closing value calculated
    dayToDayRecord.category, // Pass category
    dayToDayRecord.record_type,
  ], (err) => {
    if (err) {
      log(`Error inserting day-to-day record: ${err.message}`);
      return res.status(500).json({ error: "Database error: " + err.message });
    }

    log(`Day-to-day stock record added successfully for ${description}`);

    // Insert Record-Keeping Record
    db.query(queryInsert, [
      recordKeeping.description,
      recordKeeping.opening_qty,
      recordKeeping.purchase_qty,
      recordKeeping.exchange_qty,
      recordKeeping.return_qty,
      recordKeeping.standard_price,
      recordKeeping.closing_value, // Closing value set to 0
      recordKeeping.category, // Pass category
      recordKeeping.record_type,
    ], (err) => {
      if (err) {
        log(`Error inserting record-keeping record: ${err.message}`);
        return res.status(500).json({ error: "Database error: " + err.message });
      }

      log(`Record-keeping stock record added successfully for ${description}`);
      res.json({ message: "Stock records (day-to-day and record-keeping) added successfully" });
    });
  });
};


// Function to update existing stock
// export const updateStock = (req, res) => {
//   const { description } = req.params;
//   const { purchase_qty, standard_price, category, record_type } = req.body;

//   log(`Received request to update stock: ${JSON.stringify(req.body)}`);

//   if (!description || purchase_qty === undefined || standard_price === undefined || !record_type) {
//     log("Missing required fields in request");
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   log(`Fetching existing stock record for description: ${description}`);
  
//   const query = `
//     SELECT id, opening_qty, closing_stock, purchase_qty, record_type 
//     FROM stock 
//     WHERE description = ?
//   `;

//   db.query(query, [description], (error, results) => {
//     if (error) {
//       log(`Error fetching stock record: ${error.message}`);
//       return res.status(500).json({ error: "Database error: " + error.message });
//     }

//     if (results.length === 0) {
//       log(`No stock record found for description: ${description}`);
//       return res.status(404).json({ error: "Stock record not found" });
//     }

//     const existingRecord = results[0];

//     if (existingRecord.record_type === 'record_keeping') {
//       // Update logic for 'record_keeping'
//       const updatedPurchaseQty = existingRecord.purchase_qty + purchase_qty;

//       const queryUpdate = `
//         UPDATE stock
//         SET purchase_qty = ?, closing_value = 0
//         WHERE id = ?
//       `;

//       db.query(queryUpdate, [updatedPurchaseQty, existingRecord.id], (err) => {
//         if (err) {
//           log(`Error updating stock record: ${err.message}`);
//           return res.status(500).json({ error: "Database error: " + err.message });
//         }
//         log(`Stock record updated successfully for 'record_keeping'`);
//         return res.json({ message: "Stock record updated successfully for 'record_keeping'" });
//       });
//     } else if (existingRecord.record_type === 'day_to_day') {
//       // Update logic for 'day_to_day'
//       const newClosingStock = existingRecord.closing_stock + purchase_qty;

//       if (newClosingStock < 0) {
//         log("Cannot reduce stock below zero for 'day_to_day'.");
//         return res.status(400).json({ error: "Cannot reduce stock below zero" });
//       }

//       const updatedOpeningQty = existingRecord.opening_qty + purchase_qty;

//       const queryUpdate = `
//         UPDATE stock
//         SET opening_qty = ?, closing_stock = ?, closing_value = ?
//         WHERE id = ?
//       `;

//       db.query(queryUpdate, [
//         updatedOpeningQty,
//         newClosingStock,
//         newClosingStock * standard_price,
//         existingRecord.id
//       ], (err) => {
//         if (err) {
//           log(`Error updating stock record: ${err.message}`);
//           return res.status(500).json({ error: "Database error: " + err.message });
//         }
//         log(`Stock record updated successfully for 'day_to_day'`);
//         return res.json({ message: "Stock record updated successfully for 'day_to_day'" });
//       });
//     }
//   });
// };



// export const updateStock = (req, res) => {
//   const { description } = req.params;
//   const { purchase_qty, standard_price, category } = req.body; // No need to pass record_type from body

//   log(`Received request to update stock: ${JSON.stringify(req.body)}`);

//   if (!description || purchase_qty === undefined || standard_price === undefined || !category) {
//     log("Missing required fields in request");
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   log(`Fetching existing stock record for description: ${description}`);
  
//   const query = `
//     SELECT id, opening_qty, closing_stock, purchase_qty, record_type 
//     FROM stock 
//     WHERE description = ? AND category = ?
//   `;

//   db.query(query, [description, category], (error, results) => {
//     if (error) {
//       log(`Error fetching stock record: ${error.message}`);
//       return res.status(500).json({ error: "Database error: " + error.message });
//     }

//     if (results.length === 0) {
//       log(`No stock record found for description: ${description}`);
//       return res.status(404).json({ error: "Stock record not found" });
//     }

//     const existingRecord = results[0];

//     if (existingRecord.record_type === 'record_keeping') {
//       // Update logic for 'record_keeping'
//       const updatedPurchaseQty = existingRecord.purchase_qty + purchase_qty;

//       const queryUpdate = `
//         UPDATE stock
//         SET purchase_qty = ?, closing_value = 0, category = ?
//         WHERE id = ?
//       `;

//       db.query(queryUpdate, [updatedPurchaseQty, category, existingRecord.id], (err) => {
//         if (err) {
//           log(`Error updating stock record: ${err.message}`);
//           return res.status(500).json({ error: "Database error: " + err.message });
//         }
//         log(`Stock record updated successfully for 'record_keeping'`);
//         return res.json({ message: "Stock record updated successfully for 'record_keeping'" });
//       });
//     } else if (existingRecord.record_type === 'day_to_day') {
//       // Update logic for 'day_to_day'
//       const newClosingStock = existingRecord.closing_stock + purchase_qty;

//       if (newClosingStock < 0) {
//         log("Cannot reduce stock below zero for 'day_to_day'.");
//         return res.status(400).json({ error: "Cannot reduce stock below zero" });
//       }

//       const updatedOpeningQty = existingRecord.opening_qty + purchase_qty;

//       const queryUpdate = `
//         UPDATE stock
//         SET opening_qty = ?, closing_stock = ?, closing_value = ?, category = ?
//         WHERE id = ?
//       `;

//       db.query(queryUpdate, [
//         updatedOpeningQty,
//         newClosingStock,
//         newClosingStock * standard_price, // Updated closing value based on price
//         category, // Pass the updated category
//         existingRecord.id
//       ], (err) => {
//         if (err) {
//           log(`Error updating stock record: ${err.message}`);
//           return res.status(500).json({ error: "Database error: " + err.message });
//         }
//         log(`Stock record updated successfully for 'day_to_day'`);
//         return res.json({ message: "Stock record updated successfully for 'day_to_day'" });
//       });
//     }
//   });
// };


// export const updateStock = (req, res) => {
//   const { description } = req.params;
//   const { purchase_qty, standard_price, category } = req.body; // No record_type passed in the body

//   log(`Received request to update stock: ${JSON.stringify(req.body)}`);

//   if (!description || purchase_qty === undefined || standard_price === undefined || !category) {
//     log("Missing required fields in request");
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   log(`Fetching existing day-to-day stock record for description: ${description} and category: ${category}`);
  
//   const queryDayToDay = `
//     SELECT id, opening_qty, closing_stock, record_type 
//     FROM stock 
//     WHERE description = ? AND category = ? AND record_type = 'day_to_day'
//   `;

//   // Update day-to-day record
//   db.query(queryDayToDay, [description, category], (error, results) => {
//     if (error) {
//       log(`Error fetching stock records: ${error.message}`);
//       return res.status(500).json({ error: "Database error: " + error.message });
//     }

//     if (results.length === 0) {
//       log(`No day-to-day stock record found for description: ${description} and category: ${category}`);
//       return res.status(404).json({ error: "Day-to-day stock record not found" });
//     }

//     const dayToDayRecord = results[0];
//     const newClosingStock = dayToDayRecord.closing_stock + purchase_qty;

//     if (newClosingStock < 0) {
//       log("Cannot reduce stock below zero for 'day_to_day'.");
//       return res.status(400).json({ error: "Cannot reduce stock below zero" });
//     }

//     const updatedOpeningQty = dayToDayRecord.opening_qty + purchase_qty;

//     const queryUpdateDayToDay = `
//       UPDATE stock
//       SET opening_qty = ?, closing_stock = ?, closing_value = ?, category = ?
//       WHERE id = ?
//     `;

//     db.query(queryUpdateDayToDay, [
//       updatedOpeningQty,
//       newClosingStock,
//       newClosingStock * standard_price, // Updated closing value based on price
//       category,
//       dayToDayRecord.id
//     ], (err) => {
//       if (err) {
//         log(`Error updating day-to-day stock record: ${err.message}`);
//         return res.status(500).json({ error: "Database error: " + err.message });
//       }
//       log(`Day-to-day stock record updated successfully for description: ${description}`);
//     });

//     // Insert new record for record-keeping
//     log(`Inserting new record-keeping stock record for description: ${description} and category: ${category}`);

//     const queryInsertRecordKeeping = `
//       INSERT INTO stock (description, opening_qty, purchase_qty, exchange_qty, return_qty, standard_price, closing_stock, closing_value, category, record_type)
//       VALUES (?, 0, ?, 0, 0, ?, 0, 0, ?, 'record_keeping')
//     `;

//     db.query(queryInsertRecordKeeping, [
//       description,
//       purchase_qty, // The new purchase quantity
//       standard_price,
//       category
//     ], (err) => {
//       if (err) {
//         log(`Error inserting new record-keeping stock record: ${err.message}`);
//         return res.status(500).json({ error: "Database error: " + err.message });
//       }

//       log(`New record-keeping stock record inserted successfully for description: ${description}`);
//       return res.json({ message: "Stock records updated successfully for both day-to-day and record-keeping" });
//     });
//   });
// };


export const updateStock = (req, res) => {
  const { description } = req.params;
  const { purchase_qty, standard_price, category } = req.body;

  log(`Received request to update stock: ${JSON.stringify(req.body)}`);

  if (!description || purchase_qty === undefined || standard_price === undefined || !category) {
    log("Missing required fields in request");
    return res.status(400).json({ error: "Missing required fields" });
  }

  log(`Fetching existing day-to-day stock record for description: ${description} and category: ${category}`);
  
  const queryDayToDay = `
    SELECT id, opening_qty, record_type 
    FROM stock 
    WHERE description = ? AND category = ? AND record_type = 'day_to_day'
  `;

  // Update day-to-day record
  db.query(queryDayToDay, [description, category], (error, results) => {
    if (error) {
      log(`Error fetching stock records: ${error.message}`);
      return res.status(500).json({ error: "Database error: " + error.message });
    }

    if (results.length === 0) {
      log(`No day-to-day stock record found for description: ${description} and category: ${category}`);
      return res.status(404).json({ error: "Day-to-day stock record not found" });
    }

    const dayToDayRecord = results[0];
    const updatedOpeningQty = dayToDayRecord.opening_qty + purchase_qty;

    const queryUpdateDayToDay = `
      UPDATE stock
      SET opening_qty = ?, category = ?
      WHERE id = ?
    `;

    db.query(queryUpdateDayToDay, [
      updatedOpeningQty,
      category,
      dayToDayRecord.id
    ], (err) => {
      if (err) {
        log(`Error updating day-to-day stock record: ${err.message}`);
        return res.status(500).json({ error: "Database error: " + err.message });
      }

      log(`Day-to-day stock record updated successfully for description: ${description}`);

      // Insert new record for record-keeping
      log(`Inserting new record-keeping stock record for description: ${description} and category: ${category}`);

      const queryInsertRecordKeeping = `
        INSERT INTO stock (description, opening_qty, purchase_qty, exchange_qty, return_qty, standard_price, category, record_type)
        VALUES (?, 0, ?, 0, 0, ?, ?, 'record_keeping')
      `;

      db.query(queryInsertRecordKeeping, [
        description,
        purchase_qty,
        standard_price,
        category
      ], (err) => {
        if (err) {
          log(`Error inserting new record-keeping stock record: ${err.message}`);
          return res.status(500).json({ error: "Database error: " + err.message });
        }

        log(`New record-keeping stock record inserted successfully for description: ${description}`);
        return res.json({ message: "Stock records updated successfully for both day-to-day and record-keeping" });
      });
    });
  });
};
