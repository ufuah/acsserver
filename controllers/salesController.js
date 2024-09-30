import db from "../db/db.js";
import { v4 as uuidv4 } from "uuid";

// Get all sales associated with day-to-day stock
// export const getAllSales = (req, res) => {
//   const query = `
//     SELECT s.*, st.description AS item
//     FROM sales s
//     JOIN stock st ON s.item_id = st.id
//     WHERE st.record_type = 'day_to_day'
//   `;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("SQL Error:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     console.log("Sales Results:", results);
//     res.json(results);
//   });
// };

// export const getAllSales = (req, res) => {
//   const query = `
//   SELECT
//   s.sales_id AS sale_id,
//   s.date AS sale_date,
//   s.customer_id,
//   c.customer_name,
//   st.description AS item_name,
//   s.amount_per_item,
//   s.quantity_purchased,
//   s.amount_paid,
//   s.total_sale_value,
//   s.supplied_by,
//   s.status,
//   s.bank_or_pos
// FROM sales s
// JOIN stock st ON s.item_id = st.id
// JOIN customers c ON s.customer_id = c.customer_id  -- Adjust this based on the actual column name
// WHERE st.record_type = 'day_to_day'
// ORDER BY s.customer_id, s.date;

//   `;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("SQL Error:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     console.log("Sales Results:", results);
//     res.json(results);
//   });
// };

// export const addSale = (req, res) => {
//   const {
//     date,
//     customer_name,
//     number,
//     brand,
//     bank_or_pos,
//     supplied_by,
//     status,
//     items, // Corrected to use 'items'
//     total_sale_value,
//   } = req.body;

//   console.log(`Received request to add sale with status: ${status}`);
//   console.log("Items received in the request body:", items);

//   // Check if items is an array and has data
//   if (!Array.isArray(items) || items.length === 0) {
//     console.error("Items is not an array or is empty.");
//     return res.status(400).json({ error: "Invalid items data." });
//   }

//   // Start a transaction
//   db.beginTransaction((err) => {
//     if (err) {
//       console.error("Transaction start error:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     // Check if the customer already exists
//     const checkCustomerQuery =
//       "SELECT customer_id FROM customers WHERE customer_name = ?";
//     db.query(checkCustomerQuery, [customer_name], (err, customerResults) => {
//       if (err) {
//         console.error("Error executing checkCustomerQuery:", err);
//         return db.rollback(() => res.status(500).json({ error: err.message }));
//       }

//       let customerId = null;

//       const processCustomer = (callback) => {
//         if (customerResults.length > 0) {
//           customerId = customerResults[0].customer_id;
//           console.log(`Customer exists: ${customer_name} with ID ${customerId}`);
//           callback();
//         } else {
//           const insertCustomerQuery =
//             "INSERT INTO customers (customer_id, customer_name, number) VALUES (?, ?, ?)";
//           const newCustomerId = uuidv4();
//           db.query(
//             insertCustomerQuery,
//             [newCustomerId, customer_name, number],
//             (err) => {
//               if (err) {
//                 console.error("Error executing insertCustomerQuery:", err);
//                 return db.rollback(() => res.status(500).json({ error: err.message }));
//               }
//               customerId = newCustomerId;
//               console.log(`New customer added: ${customer_name} with ID ${customerId}`);
//               callback();
//             }
//           );
//         }
//       };

//       processCustomer(() => {
//         let itemProcessed = 0;

//         const processNextItem = () => {
//           if (itemProcessed >= items.length) {
//             db.commit((err) => {
//               if (err) {
//                 console.error("Transaction commit error:", err);
//                 return db.rollback(() => res.status(500).json({ error: "Error committing transaction." }));
//               }
//               res.send("Sale added successfully.");
//             });
//             return;
//           }

//           const item = items[itemProcessed];
//           const { item: itemName, amount_per_item, quantity_purchased } = item;

//           console.log(`Processing item: ${itemName}`);

//           const checkStockQuery = `
//             SELECT id, closing_stock, opening_qty
//             FROM stock
//             WHERE description = ?
//               AND record_type = 'day_to_day'
//           `;

//           db.query(checkStockQuery, [itemName], (err, stockResults) => {
//             if (err) {
//               console.error("Error executing checkStockQuery:", err);
//               return db.rollback(() => res.status(500).json({ error: err.message }));
//             }

//             if (stockResults.length === 0) {
//               console.error(`Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`);
//               return db.rollback(() => res.status(400).json({ error: `Item '${itemName}' not found in stock or does not match 'day_to_day' record type.` }));
//             }

//             const stockItem = stockResults[0];
//             const saleId = uuidv4();

//             console.log(`Inserting sale for item ID: ${stockItem.id}`);

//             const insertSaleQuery = `
//               INSERT INTO sales (
//                 sales_id, date, customer_id, item, item_id, amount_per_item, quantity_purchased,
//                 amount_paid, brand, bank_or_pos, number, supplied_by, status, total_sale_value, transaction_type
//               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//             `;

//             db.query(
//               insertSaleQuery,
//               [
//                 saleId,
//                 date,
//                 customerId,
//                 itemName,
//                 stockItem.id,
//                 amount_per_item,
//                 quantity_purchased,
//                 amount_per_item * quantity_purchased,
//                 brand,
//                 bank_or_pos,
//                 number,
//                 supplied_by,
//                 status,
//                 total_sale_value,
//                 "sales", // Transaction type is fixed to 'sales'
//               ],
//               (err) => {
//                 if (err) {
//                   console.error("Error executing insertSaleQuery:", err);
//                   return db.rollback(() => res.status(500).json({ error: err.message }));
//                 }

//                 console.log(`Sale inserted successfully for item ID: ${stockItem.id}`);

//                 let updateStockQuery = "";

//                 if (status.toLowerCase() === "supplied") {
//                   updateStockQuery = `
//                     UPDATE stock
//                     SET closing_stock = closing_stock - ?,
//                         opening_qty = opening_qty - ?
//                     WHERE id = ?
//                   `;
//                 }

//                 if (updateStockQuery) {
//                   db.query(
//                     updateStockQuery,
//                     [quantity_purchased, quantity_purchased, stockItem.id],
//                     (err) => {
//                       if (err) {
//                         console.error("Error executing updateStockQuery:", err);
//                         return db.rollback(() => res.status(500).json({ error: err.message }));
//                       }

//                       console.log(`Stock updated for item ID: ${stockItem.id}`);

//                       itemProcessed++;
//                       processNextItem();
//                     }
//                   );
//                 } else {
//                   itemProcessed++;
//                   processNextItem();
//                 }
//               }
//             );
//           });
//         };

//         processNextItem();
//       });
//     });
//   });
// };

// export const addSale = async (req, res) => {
//   const {
//     date,
//     customer_name,
//     number,
//     brand,
//     bank_or_pos,
//     supplied_by,
//     status,
//     items,
//     total_sale_value,
//   } = req.body;

//   console.log(`Received request to add sale with status: ${status}`);
//   console.log("Items received in the request body:", items);

//   // Validate items array
//   if (!Array.isArray(items) || items.length === 0) {
//     console.error("Items is not an array or is empty.");
//     return res.status(400).json({ error: "Invalid items data." });
//   }

//   // Start a transaction
//   db.beginTransaction(async (err) => {
//     if (err) {
//       console.error("Transaction start error:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     try {
//       // Customer processing logic
//       const checkCustomerQuery = "SELECT customer_id FROM customers WHERE customer_name = ?";
//       const [customerResults] = await db.query(checkCustomerQuery, [customer_name]);

//       let customerId = null;
//       if (customerResults.length > 0) {
//         customerId = customerResults[0].customer_id;
//         console.log(`Customer exists: ${customer_name} with ID ${customerId}`);
//       } else {
//         const insertCustomerQuery = "INSERT INTO customers (customer_id, customer_name, number) VALUES (?, ?, ?)";
//         customerId = uuidv4();
//         await db.query(insertCustomerQuery, [customerId, customer_name, number]);
//         console.log(`New customer added: ${customer_name} with ID ${customerId}`);
//       }

//       // Process each item
//       for (const item of items) {
//         const { item: itemName, amount_per_item, quantity_purchased } = item;
//         console.log(`Processing item: ${itemName}`);

//         const checkStockQuery = `
//           SELECT id, closing_stock, opening_qty
//           FROM stock
//           WHERE description = ?
//             AND record_type = 'day_to_day'
//         `;
//         const [stockResults] = await db.query(checkStockQuery, [itemName]);

//         if (stockResults.length === 0) {
//           throw new Error(`Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`);
//         }

//         const stockItem = stockResults[0];
//         const saleId = uuidv4();

//         console.log(`Inserting sale for item ID: ${stockItem.id}`);
//         const insertSaleQuery = `
//           INSERT INTO sales (
//             sales_id, date, customer_id, item, item_id, amount_per_item, quantity_purchased,
//             amount_paid, brand, bank_or_pos, number, supplied_by, status, total_sale_value, transaction_type
//           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;

//         await db.query(insertSaleQuery, [
//           saleId,
//           date,
//           customerId,
//           itemName,
//           stockItem.id,
//           amount_per_item,
//           quantity_purchased,
//           amount_per_item * quantity_purchased,
//           brand,
//           bank_or_pos,
//           number,
//           supplied_by,
//           status,
//           total_sale_value,
//           "sales",
//         ]);

//         console.log(`Sale inserted successfully for item ID: ${stockItem.id}`);

//         if (status.toLowerCase() === "supplied") {
//           const updateStockQuery = `
//             UPDATE stock
//             SET closing_stock = closing_stock - ?,
//                 opening_qty = opening_qty - ?
//             WHERE id = ?
//           `;
//           await db.query(updateStockQuery, [quantity_purchased, quantity_purchased, stockItem.id]);
//           console.log(`Stock updated for item ID: ${stockItem.id}`);
//         }
//       }

//       await db.commit();
//       res.send("Sale added successfully.");
//     } catch (err) {
//       console.error("Transaction error:", err);
//       await db.rollback();
//       res.status(500).json({ error: "Transaction failed. " + err.message });
//     }
//   });
// };

const updateStockAfterSale = async (item_id, quantity_purchased) => {
  const query = `
    UPDATE stocks
    SET purchase_qty = purchase_qty - ?
    WHERE id = ?
  `;

  await db.query(query, [quantity_purchased, item_id]);
};

// working well

// export const addSale = (req, res) => {
//   const {
//     date,
//     customer_name,
//     brand,
//     bank_or_pos,
//     supplied_by,
//     status,
//     number,
//     items,
//     total_sale_value,
//   } = req.body;

//   console.log("Request Body:", req.body);
//   const itemsDetails = items || [];
//   console.log("Items Details:", itemsDetails);

//   if (
//     !date ||
//     !customer_name ||
//     !number ||
//     !brand ||
//     !bank_or_pos ||
//     itemsDetails.length === 0
//   ) {
//     return res.status(400).json({
//       error: "Please fill out all required fields and add at least one item.",
//     });
//   }

//   const sales_id = uuidv4();
//   let processedItems = 0;
//   const totalItems = itemsDetails.length;

//   // Check if customer with the same number exists
//   const customerNumberQuery = `
//     SELECT customer_id, customer_name
//     FROM customers
//     WHERE number = ?
//   `;
//   db.query(customerNumberQuery, [number], function (error, numberResults) {
//     if (error) {
//       console.error("Error checking customer by number:", error);
//       return res.status(500).json({ error: "Error checking customer by number." });
//     }

//     // Check if customer with the same name exists
//     const customerNameQuery = `
//       SELECT customer_id, number
//       FROM customers
//       WHERE customer_name = ?
//     `;
//     db.query(customerNameQuery, [customer_name], function (error, nameResults) {
//       if (error) {
//         console.error("Error checking customer by name:", error);
//         return res.status(500).json({ error: "Error checking customer by name." });
//       }

//       if (nameResults.length > 0) {
//         // Customer name exists, but we need to check the number
//         const existingCustomer = nameResults[0];

//         if (existingCustomer.number !== number) {
//           // Name exists but number does not match
//           return res.status(400).json({
//             error: `The customer name "${customer_name}" exists but the phone number provided does not match the existing record. The associated number is "${existingCustomer.number}". Please provide the correct phone number.`,
//           });
//         } else {
//           // The name and number match the same customer, process the sale
//           processSale(customer_name, existingCustomer.customer_id);
//         }
//       } else if (numberResults.length > 0) {
//         // Number exists, but the name is different
//         const existingCustomerByNumber = numberResults[0];
//         return res.status(400).json({
//           error: `The phone number "${number}" is already associated with another customer: "${existingCustomerByNumber.customer_name}". Please use a different phone number.`,
//         });
//       } else {
//         // No match found, insert the new customer
//         const customer_id = uuidv4(); // Generate a new customer_id

//         const insertCustomerQuery = `
//           INSERT INTO customers (customer_id, customer_name, number, created_at)
//           VALUES (?, ?, ?, ?)
//         `;
//         const customerValues = [customer_id, customer_name, number, new Date()];

//         db.query(insertCustomerQuery, customerValues, (err, result) => {
//           if (err) {
//             console.error("Error inserting new customer:", err);
//             return res.status(500).json({ error: "Error adding new customer." });
//           }

//           console.log("New customer added successfully");
//           processSale(customer_name, customer_id);
//         });
//       }
//     });

//     // Function to process sale for each item
//     function processSale(customer_name, customer_id) {
//       itemsDetails.forEach((item) => {
//         const query = "SELECT id FROM stock WHERE description = ?";
//         db.query(query, [item.item], function (error, results) {
//           if (error) {
//             console.error("Error fetching item from stock:", error);
//             return res
//               .status(500)
//               .json({ error: "Error fetching item from stock." });
//           }

//           if (results.length > 0) {
//             const item_id = results[0].id;

//             const insertQuery = `
//               INSERT INTO sales (
//                 sales_id,
//                 date,
//                 customer_name,
//                 customer_id,
//                 item,
//                 item_id,
//                 amount_per_item,
//                 quantity_purchased,
//                 amount_paid,
//                 brand,
//                 bank_or_pos,
//                 bank_name,
//                 number,
//                 supplied_by,
//                 status,
//                 total_sale_value,
//                 created_at,
//                 transaction_type
//               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//             `;

//             const amount_paid = item.amount_per_item * item.quantity_purchased;
//             const values = [
//               sales_id,
//               date,
//               customer_name,
//               customer_id, // Use the existing or newly created customer_id
//               item.item,
//               item_id,
//               item.amount_per_item,
//               item.quantity_purchased,
//               amount_paid,
//               brand,
//               bank_or_pos,
//               null,
//               number,
//               supplied_by,
//               status,
//               total_sale_value,
//               new Date(),
//               "sales",
//             ];

//             db.query(insertQuery, values, (err, results) => {
//               if (err) {
//                 console.error("Error inserting sale data:", err);
//                 return res
//                   .status(500)
//                   .json({
//                     error: "An error occurred while submitting the sale.",
//                   });
//               }

//               console.log("Sale inserted successfully");
//               processedItems++;

//               // Check if all items have been processed successfully
//               if (processedItems === totalItems) {
//                 return res
//                   .status(201)
//                   .json({ message: "Sale added successfully!" });
//               }
//             });
//           } else {
//             console.error("Item not found in stock");
//             return res.status(400).json({ error: "Item not found in stock." });
//           }
//         });
//       });
//     }
//   });
// };

// export const addSale = (req, res) => {
//   const {
//     date,
//     customer_name,
//     brand,
//     bank_or_pos,
//     supplied_by,
//     status,
//     number,
//     items,
//     total_sale_value,
//   } = req.body;

//   const itemsDetails = items || [];

//   if (
//     !date ||
//     !customer_name ||
//     !number ||
//     !brand ||
//     !bank_or_pos ||
//     itemsDetails.length === 0
//   ) {
//     return res.status(400).json({
//       error: "Please fill out all required fields and add at least one item.",
//     });
//   }

//   const sales_id = uuidv4();
//   let processedItems = 0;
//   const totalItems = itemsDetails.length;

//   // Check if customer with the same number exists
//   const customerNumberQuery = `
//     SELECT customer_id, customer_name 
//     FROM customers 
//     WHERE number = ?
//   `;
//   db.query(customerNumberQuery, [number], function (error, numberResults) {
//     if (error) {
//       console.error("Error checking customer by number:", error);
//       return res
//         .status(500)
//         .json({ error: "Error checking customer by number." });
//     }

//     // Check if customer with the same name exists
//     const customerNameQuery = `
//       SELECT customer_id, number 
//       FROM customers 
//       WHERE customer_name = ?
//     `;
//     db.query(customerNameQuery, [customer_name], function (error, nameResults) {
//       if (error) {
//         console.error("Error checking customer by name:", error);
//         return res
//           .status(500)
//           .json({ error: "Error checking customer by name." });
//       }

//       if (nameResults.length > 0) {
//         // Customer name exists, but we need to check the number
//         const existingCustomer = nameResults[0];

//         if (existingCustomer.number !== number) {
//           // Name exists but number does not match
//           return res.status(400).json({
//             error: `The customer name "${customer_name}" exists but the phone number provided does not match the existing record. The associated number is "${existingCustomer.number}". Please provide the correct phone number.`,
//           });
//         } else {
//           // The name and number match the same customer, process the sale
//           processSale(existingCustomer.customer_id);
//         }
//       } else if (numberResults.length > 0) {
//         // Number exists, but the name is different
//         const existingCustomerByNumber = numberResults[0];
//         return res.status(400).json({
//           error: `The phone number "${number}" is already associated with another customer: "${existingCustomerByNumber.customer_name}". Please use a different phone number.`,
//         });
//       } else {
//         // No match found, insert the new customer
//         const customer_id = uuidv4(); // Generate a new customer_id

//         const insertCustomerQuery = `
//           INSERT INTO customers (customer_id, customer_name, number, created_at)
//           VALUES (?, ?, ?, ?)
//         `;
//         const customerValues = [customer_id, customer_name, number, new Date()];

//         db.query(insertCustomerQuery, customerValues, (err) => {
//           if (err) {
//             console.error("Error inserting new customer:", err);
//             return res
//               .status(500)
//               .json({ error: "Error adding new customer." });
//           }

//           processSale(customer_id);
//         });
//       }
//     });

//     // Function to process sale for each item
//     function processSale(customer_id) {
//       itemsDetails.forEach((item) => {
//         const query = `
//           SELECT id, closing_stock, opening_qty 
//           FROM stock 
//           WHERE description = ? AND record_type = 'day_to_day'
//         `;
//         db.query(query, [item.item], function (error, results) {
//           if (error) {
//             console.error("Error fetching item from stock:", error);
//             return res
//               .status(500)
//               .json({ error: "Error fetching item from stock." });
//           }

//           if (results.length > 0) {
//             const item_id = results[0].id;
//             const itemStock = results[0];

//             // Log stock details retrieved
//             console.log(
//               `Item: ${item.item}, Closing Stock: ${itemStock.closing_stock}, Opening Qty: ${itemStock.opening_qty}`
//             );

//             if (status === "supplied") {
//               // Update stock quantities
//               const updatedClosingStock =
//                 itemStock.closing_stock - item.quantity_purchased;
//               const updatedOpeningStock =
//                 itemStock.opening_qty - item.quantity_purchased;

//               // Log stock values before update
//               console.log(`Updating Stock for Item: ${item.item}`);
//               console.log(
//                 `Updated Closing Stock: ${updatedClosingStock}, Updated Opening Qty: ${updatedOpeningStock}`
//               );

//               const updateStockQuery = `
//                 UPDATE stock 
//                 SET closing_stock = ?, opening_qty = ? 
//                 WHERE id = ?
//               `;
//               db.query(
//                 updateStockQuery,
//                 [updatedClosingStock, updatedOpeningStock, item_id],
//                 (err) => {
//                   if (err) {
//                     console.error("Error updating stock:", err);
//                     return res
//                       .status(500)
//                       .json({ error: "Error updating stock." });
//                   }

//                   // Log successful update
//                   console.log(
//                     `Stock updated successfully for Item: ${item.item}`
//                   );
//                   insertSaleRecord(item_id, customer_id, item);
//                 }
//               );
//             } else {
//               // Process sale if status is not 'supplied'
//               insertSaleRecord(item_id, customer_id, item);
//             }
//           } else {
//             console.error(
//               "Item not found in stock with 'day_to_day' record_type"
//             );
//             return res
//               .status(400)
//               .json({
//                 error: "Item not found in stock with 'day_to_day' record_type.",
//               });
//           }
//         });
//       });
//     }

//     // Function to insert sale record
//     function insertSaleRecord(item_id, customer_id, item) {
//       const insertQuery = `
//         INSERT INTO sales (
//           sales_id,
//           date,
//           customer_name,
//           customer_id,
//           item,
//           item_id,
//           amount_per_item,
//           quantity_purchased,
//           amount_paid,
//           brand,
//           bank_or_pos,
//           bank_name,
//           number,
//           supplied_by,
//           status,
//           total_sale_value,
//           created_at,
//           transaction_type
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;

//       const amount_paid = item.amount_per_item * item.quantity_purchased;
//       const values = [
//         sales_id,
//         date,
//         customer_name,
//         customer_id,
//         item.item,
//         item_id,
//         item.amount_per_item,
//         item.quantity_purchased,
//         amount_paid,
//         brand,
//         bank_or_pos,
//         null,
//         number,
//         supplied_by,
//         status,
//         total_sale_value,
//         new Date(),
//         "sales",
//       ];

//       db.query(insertQuery, values, (err) => {
//         if (err) {
//           console.error("Error inserting sale data:", err);
//           return res
//             .status(500)
//             .json({ error: "An error occurred while submitting the sale." });
//         }
//         processedItems++;

//         // Check if all items have been processed
//         // if (processedItems === totalItems) {
//         //   return res.status(201).json({ message: "Sale added successfully!" });
//         // }

//         if (processedItems === totalItems) {
//           // Send the sales_id along with the success message
//           return res.status(201).json({
//             message: "Sale added successfully!",
//             sales_id: sales_id, // Send the sales_id to the frontend
//           });
//         }
//       });
//     }
//   });
// };

export const addSale = (req, res) => {
  const {
    date,
    customer_name,
    brand,
    bank_or_pos,
    supplied_by,
    status,
    number,
    items,
    total_sale_value,
  } = req.body;

  const itemsDetails = items || [];

  if (
    !date ||
    !customer_name ||
    !number ||
    !brand ||
    !bank_or_pos ||
    itemsDetails.length === 0
  ) {
    return res.status(400).json({
      error: "Please fill out all required fields and add at least one item.",
    });
  }

  const sales_id = uuidv4();
  let processedItems = 0;
  const totalItems = itemsDetails.length;

  // Check if customer with the same number exists
  const customerNumberQuery = `
    SELECT customer_id, customer_name 
    FROM customers 
    WHERE number = ?
  `;
  db.query(customerNumberQuery, [number], function (error, numberResults) {
    if (error) {
      console.error("Error checking customer by number:", error);
      return res
        .status(500)
        .json({ error: "Error checking customer by number." });
    }

    // Check if customer with the same name exists
    const customerNameQuery = `
      SELECT customer_id, number 
      FROM customers 
      WHERE customer_name = ?
    `;
    db.query(customerNameQuery, [customer_name], function (error, nameResults) {
      if (error) {
        console.error("Error checking customer by name:", error);
        return res
          .status(500)
          .json({ error: "Error checking customer by name." });
      }

      if (nameResults.length > 0) {
        // Customer name exists, but we need to check the number
        const existingCustomer = nameResults[0];

        if (existingCustomer.number !== number) {
          // Name exists but number does not match
          return res.status(400).json({
            error: `The customer name "${customer_name}" exists but the phone number provided does not match the existing record. The associated number is "${existingCustomer.number}". Please provide the correct phone number.`,
          });
        } else {
          // The name and number match the same customer, process the sale
          processSale(existingCustomer.customer_id);
        }
      } else if (numberResults.length > 0) {
        // Number exists, but the name is different
        const existingCustomerByNumber = numberResults[0];
        return res.status(400).json({
          error: `The phone number "${number}" is already associated with another customer: "${existingCustomerByNumber.customer_name}". Please use a different phone number.`,
        });
      } else {
        // No match found, insert the new customer
        const customer_id = uuidv4(); // Generate a new customer_id

        const insertCustomerQuery = `
          INSERT INTO customers (customer_id, customer_name, number, created_at)
          VALUES (?, ?, ?, ?)
        `;
        const customerValues = [customer_id, customer_name, number, new Date()];

        db.query(insertCustomerQuery, customerValues, (err) => {
          if (err) {
            console.error("Error inserting new customer:", err);
            return res
              .status(500)
              .json({ error: "Error adding new customer." });
          }

          processSale(customer_id);
        });
      }
    });

    // Function to process sale for each item
    function processSale(customer_id) {
      itemsDetails.forEach((item) => {
        const query = `
          SELECT id, closing_stock, opening_qty 
          FROM stock 
          WHERE description = ? AND record_type = 'day_to_day'
        `;
        db.query(query, [item.item], function (error, results) {
          if (error) {
            console.error("Error fetching item from stock:", error);
            return res
              .status(500)
              .json({ error: "Error fetching item from stock." });
          }

          if (results.length > 0) {
            const item_id = results[0].id;
            const itemStock = results[0];

            // Log stock details retrieved
            console.log(
              `Item: ${item.item}, Closing Stock: ${itemStock.closing_stock}, Opening Qty: ${itemStock.opening_qty}`
            );

            // Check if the quantity requested exceeds available stock
            if (item.quantity_purchased > itemStock.closing_stock) {
              return res.status(400).json({
                error: `Insufficient stock for item "${item.item}". Available stock is ${itemStock.closing_stock}, but the requested quantity is ${item.quantity_purchased}.`,
              });
            }

             // Check if the quantity requested exceeds available stock
            // if (item.quantity_purchased > itemStock.closing_stock) {
            //   return res.status(400).json({
            //     error: `Insufficient stock for item "${item.item}". Available stock is ${itemStock.closing_stock}, but the requested quantity is ${item.quantity_purchased}.`,
            //   });
            // } else if (item.quantity_purchased === itemStock.closing_stock) {
            //   return res.status(200).json({
            //     warning: `Warning: The requested quantity for item "${item.item}" is equal to the available stock. Proceed with caution.`,
            //   });
            // }
            

            if (status === "supplied") {
              // Update stock quantities
              const updatedClosingStock =
                itemStock.closing_stock - item.quantity_purchased;
              const updatedOpeningStock =
                itemStock.opening_qty - item.quantity_purchased;

              // Log stock values before update
              console.log(`Updating Stock for Item: ${item.item}`);
              console.log(
                `Updated Closing Stock: ${updatedClosingStock}, Updated Opening Qty: ${updatedOpeningStock}`
              );

              const updateStockQuery = `
                UPDATE stock 
                SET closing_stock = ?, opening_qty = ? 
                WHERE id = ?
              `;
              db.query(
                updateStockQuery,
                [updatedClosingStock, updatedOpeningStock, item_id],
                (err) => {
                  if (err) {
                    console.error("Error updating stock:", err);
                    return res
                      .status(500)
                      .json({ error: "Error updating stock." });
                  }

                  // Log successful update
                  console.log(
                    `Stock updated successfully for Item: ${item.item}`
                  );
                  insertSaleRecord(item_id, customer_id, item);
                }
              );
            } else {
              // Process sale if status is not 'supplied'
              insertSaleRecord(item_id, customer_id, item);
            }
          } else {
            console.error(
              "Item not found in stock with 'day_to_day' record_type"
            );
            return res
              .status(400)
              .json({
                error: "Item not found in stock with 'day_to_day' record_type.",
              });
          }
        });
      });
    }

    // Function to insert sale record
    function insertSaleRecord(item_id, customer_id, item) {
      const insertQuery = `
        INSERT INTO sales (
          sales_id,
          date,
          customer_name,
          customer_id,
          item,
          item_id,
          amount_per_item,
          quantity_purchased,
          amount_paid,
          brand,
          bank_or_pos,
          bank_name,
          number,
          supplied_by,
          status,
          total_sale_value,
          created_at,
          transaction_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const amount_paid = item.amount_per_item * item.quantity_purchased;
      const values = [
        sales_id,
        date,
        customer_name,
        customer_id,
        item.item,
        item_id,
        item.amount_per_item,
        item.quantity_purchased,
        amount_paid,
        brand,
        bank_or_pos,
        null,
        number,
        supplied_by,
        status,
        total_sale_value,
        new Date(),
        "sales",
      ];

      db.query(insertQuery, values, (err) => {
        if (err) {
          console.error("Error inserting sale data:", err);
          return res
            .status(500)
            .json({ error: "An error occurred while submitting the sale." });
        }
        processedItems++;

        // Check if all items have been processed
        if (processedItems === totalItems) {
          // Send the sales_id along with the success message
          return res.status(201).json({
            message: "Sale added successfully!",
            sales_id: sales_id, // Send the sales_id to the frontend
          });
        }
      });
    }
  });
};


export const getSales = (req, res) => {
  const query = "SELECT * FROM sales ORDER BY created_at DESC";

  pool.query(query, (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to retrieve sales" });
    }

    res.status(200).json(results);
  });
};

// Get all sales associated with day-to-day stock

// export const getAllSales = (req, res) => {
//   const query = `
//     SELECT 
//       s.sales_id AS sale_id,
//       s.date AS sale_date,
//       s.customer_id,
//       c.customer_name,
//       st.description AS item_name,
//       s.amount_per_item,
//       s.quantity_purchased,
//       s.amount_paid,
//       s.total_sale_value,
//       s.supplied_by,
//       s.status,
//       s.bank_or_pos
//     FROM sales s
//     JOIN stock st ON s.item_id = st.id
//     JOIN customers c ON s.customer_id = c.customer_id  -- Adjust this based on the actual column name
//     WHERE st.record_type = 'day_to_day'
//     ORDER BY s.customer_id, s.date;
//   `;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("SQL Error:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     console.log("Sales Results:", results);
//     res.json(results);
//   });
// };

// export const getAllSales = (req, res) => {
//   const query = `
//     SELECT 
//       s.sales_id, 
//       s.date, 
//       s.customer_name, 
//       s.customer_id, 
//       s.item, 
//       s.quantity_purchased, 
//       s.amount_per_item, 
//       s.amount_paid, 
//       s.total_sale_value,
//       c.number AS customer_number
//     FROM sales s
//     JOIN customers c ON s.customer_id = c.customer_id
//   `;

//   db.query(query, (error, results) => {
//     if (error) {
//       console.error("Error fetching all sales:", error);
//       return res.status(500).json({ error: "Error fetching all sales." });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ message: "No sales found." });
//     }

//     // Organize the log output
//     console.log("Fetched Sales Data:");
//     results.forEach((sale, index) => {
//       console.log(`Sale ${index + 1}:`);
//       console.log(`  Sales ID: ${sale.sales_id}`);
//       console.log(`  Date: ${sale.date}`);
//       console.log(`  Customer Name: ${sale.customer_name}`);
//       console.log(`  Customer ID: ${sale.customer_id}`);
//       console.log(`  Item: ${sale.item}`);
//       console.log(`  Quantity Purchased: ${sale.quantity_purchased}`);
//       console.log(`  Amount per Item: ${sale.amount_per_item}`);
//       console.log(`  Amount Paid: ${sale.amount_paid}`);
//       console.log(`  Total Sale Value: ${sale.total_sale_value}`);
//       console.log(`  Customer Number: ${sale.customer_number}`);
//       console.log('----------------------------------------');
//     });

//     res.status(200).json({
//       message: "All sales fetched successfully!",
//       sales: results
//     });
//   });
// };

export const getAllSales = (req, res) => {
  const query = `
    SELECT 
      s.sales_id, 
      s.date, 
      s.customer_name, 
      s.customer_id, 
      s.item, 
      s.amount_per_item, 
      s.quantity_purchased, 
      s.amount_paid, 
      s.total_sale_value,
      s.brand,
      s.bank_or_pos,
      s.bank_name,
      s.number,
      s.supplied_by,
      s.status,
      s.created_at,
      s.transaction_type,
      c.number AS customer_number
    FROM sales s
    JOIN customers c ON s.customer_id = c.customer_id
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching all sales:", error);
      return res.status(500).json({ error: "Error fetching all sales." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No sales found." });
    }

    // Log the fetched sales data for debugging
    console.log("Fetched Sales Data:");
    results.forEach((sale, index) => {
      console.log(`Sale ${index + 1}:`, sale);
    });

    res.status(200).json({
      message: "All sales fetched successfully!",
      sales: results
    });
  });
};

// export const getAllSales = (req, res) => {
//   const query = `
//     SELECT 
//       'sale' AS record_type, 
//       s.sales_id AS id, 
//       s.date, 
//       s.customer_name, 
//       s.customer_id, 
//       s.item, 
//       s.amount_per_item, 
//       s.quantity_purchased AS quantity, 
//       s.amount_paid, 
//       s.total_sale_value,
//       s.brand,
//       s.bank_or_pos,
//       s.bank_name,
//       s.number,
//       s.supplied_by,
//       s.status,
//       s.created_at,
//       s.transaction_type,
//       c.number AS customer_number
//     FROM sales s
//     JOIN customers c ON s.customer_id = c.customer_id

//     UNION ALL

//     SELECT 
//       'exchange' AS record_type, 
//       e.exchange_id AS id, 
//       e.date, 
//       e.customer_name, 
//       e.customer_id, 
//       e.item, 
//       NULL AS amount_per_item, 
//       e.quantity, 
//       NULL AS amount_paid, 
//       NULL AS total_sale_value,
//       NULL AS brand,
//       NULL AS bank_or_pos,
//       NULL AS bank_name,
//       NULL AS number,
//       NULL AS supplied_by,
//       NULL AS status,
//       e.created_at,
//       NULL AS transaction_type,
//       c.number AS customer_number
//     FROM exchanges e
//     JOIN customers c ON e.customer_id = c.customer_id

//     UNION ALL

//     SELECT 
//       'return' AS record_type, 
//       r.return_id AS id, 
//       r.date, 
//       r.customer_name, 
//       r.customer_id, 
//       r.item, 
//       NULL AS amount_per_item, 
//       r.quantity, 
//       NULL AS amount_paid, 
//       NULL AS total_sale_value,
//       NULL AS brand,
//       NULL AS bank_or_pos,
//       NULL AS bank_name,
//       NULL AS number,
//       NULL AS supplied_by,
//       NULL AS status,
//       r.created_at,
//       NULL AS transaction_type,
//       c.number AS customer_number
//     FROM returns r
//     JOIN customers c ON r.customer_id = c.customer_id
//   `;

//   db.query(query, (error, results) => {
//     if (error) {
//       console.error("Error fetching all sales, exchanges, and returns:", error);
//       return res.status(500).json({ error: "Error fetching all sales." });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ message: "No sales found." });
//     }

//     // Log the fetched sales data for debugging
//     console.log("Fetched Sales Data:");
//     results.forEach((sale, index) => {
//       console.log(`Sale ${index + 1}:`, sale);
//     });

//     res.status(200).json({
//       message: "All sales fetched successfully!",
//       sales: results
//     });
//   });
// };



// export const addSale = async (req, res) => {
//   const {
//     date,
//     customer_name,
//     number,
//     brand,
//     bank_or_pos,
//     supplied_by,
//     status,
//     items,
//     total_sale_value,
//   } = req.body;

//   console.log(`Received request to add sale with status: ${status}`);
//   console.log("Items received in the request body:", items);

//   // Validate items array
//   if (!Array.isArray(items) || items.length === 0) {
//     console.error("Items is not an array or is empty.");
//     return res.status(400).json({ error: "Invalid items data." });
//   }

//   // Start a transaction
//   db.beginTransaction(async (err) => {
//     if (err) {
//       console.error("Transaction start error:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     try {
//       // Customer processing logic
//       const checkCustomerQuery = "SELECT customer_id FROM customers WHERE customer_name = ?";
//       const customerResults = await db.query(checkCustomerQuery, [customer_name]);

//       let customerId;
//       if (customerResults && customerResults.length > 0) {
//         customerId = customerResults[0].customer_id;
//         console.log(`Customer exists: ${customer_name} with ID ${customerId}`);
//       } else {
//         const insertCustomerQuery = "INSERT INTO customers (customer_id, customer_name, number) VALUES (?, ?, ?)";
//         customerId = uuidv4();
//         await db.query(insertCustomerQuery, [customerId, customer_name, number]);
//         console.log(`New customer added: ${customer_name} with ID ${customerId}`);
//       }

//       // Process each item
//       for (const item of items) {
//         const { item: itemName, amount_per_item, quantity_purchased } = item;
//         console.log(`Processing item: ${itemName}`);

//         const checkStockQuery = `
//           SELECT id, closing_stock, opening_qty
//           FROM stock
//           WHERE description = ?
//             AND record_type = 'day_to_day'
//         `;
//         const stockResults = await db.query(checkStockQuery, [itemName]);

//         if (!stockResults || stockResults.length === 0) {
//           throw new Error(`Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`);
//         }

//         const stockItem = stockResults[0];
//         if (!stockItem || !stockItem.id) {
//           throw new Error(`Stock item for '${itemName}' is undefined or missing an ID.`);
//         }

//         const saleId = uuidv4();

//         console.log(`Inserting sale for item ID: ${stockItem.id}`);
//         const insertSaleQuery = `
//           INSERT INTO sales (
//             sales_id, date, customer_id, item, item_id, amount_per_item, quantity_purchased,
//             amount_paid, brand, bank_or_pos, number, supplied_by, status, total_sale_value, transaction_type
//           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;

//         await db.query(insertSaleQuery, [
//           saleId,
//           date,
//           customerId,
//           itemName,
//           stockItem.id,
//           amount_per_item,
//           quantity_purchased,
//           amount_per_item * quantity_purchased,
//           brand,
//           bank_or_pos,
//           number,
//           supplied_by,
//           status,
//           total_sale_value,
//           "sales",
//         ]);

//         console.log(`Sale inserted successfully for item ID: ${stockItem.id}`);

//         if (status.toLowerCase() === "supplied") {
//           const updateStockQuery = `
//             UPDATE stock
//             SET closing_stock = closing_stock - ?,
//                 opening_qty = opening_qty - ?
//             WHERE id = ?
//           `;
//           await db.query(updateStockQuery, [quantity_purchased, quantity_purchased, stockItem.id]);
//           console.log(`Stock updated for item ID: ${stockItem.id}`);
//         }
//       }

//       await db.commit();
//       res.send("Sale added successfully.");
//     } catch (err) {
//       console.error("Transaction error:", err);
//       await db.rollback();
//       res.status(500).json({ error: "Transaction failed. " + err.message });
//     }
//   });
// };

// Update sale status from "pending" to "supplied"


export const updateSaleStatus = (req, res) => {
  const { saleId } = req.params;

  console.log(`Received request to update sale status for Sale ID: ${saleId}`);

  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction start error:", err);
      return res.status(500).json({ error: "Error starting transaction." });
    }

    const checkSaleQuery = `
      SELECT s.sales_id, s.item_id, s.quantity_purchased, s.status, s.number, st.closing_stock, st.opening_qty
      FROM sales s
      JOIN stock st ON s.item_id = st.id
      WHERE s.sales_id = ? AND s.status = 'pending'
    `;

    db.query(checkSaleQuery, [saleId], (err, saleResults) => {
      if (err) {
        console.error("Error executing checkSaleQuery:", err);
        return db.rollback(() =>
          res.status(500).json({ error: "Error checking sale." })
        );
      }

      if (saleResults.length === 0) {
        console.error("Sale not found or already supplied.");
        return db.rollback(() =>
          res.status(400).json({ error: "Sale not found or already supplied." })
        );
      }

      const sale = saleResults[0];
      console.log(`Sale found: ${JSON.stringify(sale)}`);

      const updateSaleQuery =
        "UPDATE sales SET status = 'supplied' WHERE sales_id = ?";
      db.query(updateSaleQuery, [saleId], (err) => {
        if (err) {
          console.error("Error executing updateSaleQuery:", err);
          return db.rollback(() =>
            res.status(500).json({ error: "Error updating sale status." })
          );
        }

        const updateStockQuery = `
          UPDATE stock
          SET opening_qty = opening_qty - ?,
              closing_stock = closing_stock - ?
          WHERE id = ?
        `;
        db.query(
          updateStockQuery,
          [sale.quantity_purchased, sale.quantity_purchased, sale.item_id],
          (err) => {
            if (err) {
              console.error("Error executing updateStockQuery:", err);
              return db.rollback(() =>
                res.status(500).json({ error: "Error updating stock." })
              );
            }

            console.log(
              `Stock updated. ${sale.quantity_purchased} units subtracted from item ID ${sale.item_id}.`
            );

            db.commit((err) => {
              if (err) {
                console.error("Transaction commit error:", err);
                return db.rollback(() =>
                  res
                    .status(500)
                    .json({ error: "Error committing transaction." })
                );
              }
              res.send("Sale status updated to supplied and stock adjusted.");
            });
          }
        );
      });
    });
  });
};

// export const Return = (req, res) => {
//   const { customer, items } = req.body;  // Destructure 'customer' and 'items' from req.body
//   const { customer_name, number, date } = customer;  // Destructure customer fields

//   // Log the request body to check the incoming data
//   console.log("Request Body:", req.body);

//   // Validate the presence of required fields
//   if (!customer_name || !number || !date || !items || items.length === 0) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   db.beginTransaction((err) => {
//     if (err) {
//       console.error("Transaction start error:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     const checkCustomerQuery = `
//       SELECT customer_id FROM customers WHERE customer_name = ? AND number = ?
//     `;
//     db.query(checkCustomerQuery, [customer_name, number], (err, customerResults) => {
//       if (err) {
//         console.error("Error executing checkCustomerQuery:", err);
//         return db.rollback(() =>
//           res.status(500).json({ error: err.message })
//         );
//       }

//       let customerId;
//       if (customerResults.length === 0) {
//         // Customer does not exist, insert them
//         const insertCustomerQuery = `
//           INSERT INTO customers (customer_id, customer_name, number, created_at)
//           VALUES (UUID(), ?, ?, NOW()
//         `;
//         db.query(insertCustomerQuery, [customer_name, number], (err, result) => {
//           if (err) {
//             console.error("Error inserting customer:", err);
//             return db.rollback(() =>
//               res.status(500).json({ error: err.message })
//             );
//           }

//           // Fetch the newly inserted customer's ID
//           const fetchCustomerIdQuery = `SELECT customer_id FROM customers WHERE number = ?`;
//           db.query(fetchCustomerIdQuery, [number], (err, newCustomerResult) => {
//             if (err) {
//               console.error("Error fetching customer ID:", err);
//               return db.rollback(() => res.status(500).json({ error: err.message }));
//             }

//             customerId = newCustomerResult[0].customer_id;
//             processItems(customerId);
//           });
//         });
//       } else {
//         // Customer exists, use their ID
//         customerId = customerResults[0].customer_id;
//         processItems(customerId);
//       }
//     });

//     const processItems = (customerId) => {
//       let itemProcessed = 0;

//       const processNextItem = () => {
//         if (itemProcessed >= items.length) {
//           db.commit((err) => {
//             if (err) {
//               console.error("Transaction commit error:", err);
//               return db.rollback(() =>
//                 res.status(500).json({ error: "Error committing transaction." })
//               );
//             }
//             res.send("Return added successfully.");
//           });
//           return;
//         }

//         const item = items[itemProcessed];
//         const { item: itemName, qty } = item;

//         const checkStockQuery = `
//           SELECT id, closing_stock, opening_qty
//           FROM stock
//           WHERE description = ?
//             AND record_type = 'day_to_day'
//         `;
//         db.query(checkStockQuery, [itemName], (err, stockResults) => {
//           if (err) {
//             console.error("Error executing checkStockQuery:", err);
//             return db.rollback(() =>
//               res.status(500).json({ error: err.message })
//             );
//           }

//           if (stockResults.length === 0) {
//             console.error(
//               `Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`
//             );
//             return db.rollback(() =>
//               res.status(400).json({
//                 error: `Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`,
//               })
//             );
//           }

//           const stockItem = stockResults[0];
//           const { id } = stockItem;

//           const returnId = uuidv4();

//           const insertReturnQuery = `
//             INSERT INTO returns (
//               return_id, date, customer_id, customer_name, item_id, item, quantity
//             ) VALUES (?, ?, ?, ?, ?, ?, ?)
//           `;
//           db.query(
//             insertReturnQuery,
//             [returnId, date, customerId, customer_name, id, itemName, qty],
//             (err) => {
//               if (err) {
//                 console.error("Error executing insertReturnQuery:", err);
//                 return db.rollback(() =>
//                   res.status(500).json({ error: err.message })
//                 );
//               }

//               const updateStockQuery = `
//               UPDATE stock
//               SET closing_stock = closing_stock + ?,
//                   opening_qty = opening_qty + ?
//               WHERE id = ?
//             `;
//               db.query(updateStockQuery, [qty, qty, id], (err) => {
//                 if (err) {
//                   console.error("Error executing updateStockQuery:", err);
//                   return db.rollback(() =>
//                     res.status(500).json({ error: err.message })
//                   );
//                 }

//                 itemProcessed++;
//                 processNextItem();
//               });
//             }
//           );
//         });
//       };

//       processNextItem();
//     };
//   });
// };

// export const Exchange = (req, res) => {
//   const { customer, items, total } = req.body;
//   const { customer_name, number, date } = customer;

//   if (!customer_name || !number || !date || !items || items.length === 0) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   db.beginTransaction((err) => {
//     if (err) {
//       console.error("Transaction start error:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     const checkCustomerQuery = `
//       SELECT customer_id FROM customers WHERE number = ?
//     `;
//     db.query(checkCustomerQuery, [number], (err, customerResults) => {
//       if (err) {
//         console.error("Error executing checkCustomerQuery:", err);
//         return db.rollback(() => res.status(500).json({ error: err.message }));
//       }

//       let customerId;
//       if (customerResults.length === 0) {
//         // Customer does not exist, insert them
//         const insertCustomerQuery = `
//           INSERT INTO customers (customer_id, customer_name, number, created_at)
//           VALUES (UUID(), ?, ?, NOW())
//         `;
//         db.query(insertCustomerQuery, [customer_name, number], (err, result) => {
//           if (err) {
//             console.error("Error inserting customer:", err);
//             return db.rollback(() => res.status(500).json({ error: err.message }));
//           }

//           // Fetch the newly inserted customer's ID
//           const fetchCustomerIdQuery = `SELECT customer_id FROM customers WHERE number = ?`;
//           db.query(fetchCustomerIdQuery, [number], (err, newCustomerResult) => {
//             if (err) {
//               console.error("Error fetching customer ID:", err);
//               return db.rollback(() => res.status(500).json({ error: err.message }));
//             }

//             customerId = newCustomerResult[0].customer_id;
//             processItems(customerId);
//           });
//         });
//       } else {
//         // Customer exists, use their ID
//         customerId = customerResults[0].customer_id;
//         processItems(customerId);
//       }
//     });

//     const processItems = (customerId) => {
//       let itemProcessed = 0;

//       const processNextItem = () => {
//         if (itemProcessed >= items.length) {
//           db.commit((err) => {
//             if (err) {
//               console.error("Transaction commit error:", err);
//               return db.rollback(() =>
//                 res.status(500).json({ error: "Error committing transaction." })
//               );
//             }
//             res.send("Exchange added successfully.");
//           });
//           return;
//         }

//         const item = items[itemProcessed];
//         const { item: itemName, qty } = item;

//         const checkStockQuery = `
//           SELECT id, closing_stock, opening_qty
//           FROM stock
//           WHERE description = ? AND record_type = 'day_to_day'
//         `;
//         db.query(checkStockQuery, [itemName], (err, stockResults) => {
//           if (err) {
//             console.error("Error executing checkStockQuery:", err);
//             return db.rollback(() => res.status(500).json({ error: err.message }));
//           }

//           if (stockResults.length === 0) {
//             console.error(`Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`);
//             return db.rollback(() =>
//               res.status(400).json({
//                 error: `Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`,
//               })
//             );
//           }

//           const stockItem = stockResults[0];
//           const { id } = stockItem;

//           const exchangeId = uuidv4();

//           const insertExchangeQuery = `
//             INSERT INTO exchanges (exchange_id, date, customer_id, customer_name, item_id, item, quantity)
//             VALUES (?, ?, ?, ?, ?, ?, ?)
//           `;
//           db.query(insertExchangeQuery, [exchangeId, date, customerId, customer_name, id, itemName, qty], (err) => {
//             if (err) {
//               console.error("Error executing insertExchangeQuery:", err);
//               return db.rollback(() => res.status(500).json({ error: err.message }));
//             }

//             const updateStockQuery = `
//               UPDATE stock
//               SET closing_stock = closing_stock - ?, opening_qty = opening_qty - ?
//               WHERE id = ?
//             `;
//             db.query(updateStockQuery, [qty, qty, id], (err) => {
//               if (err) {
//                 console.error("Error executing updateStockQuery:", err);
//                 return db.rollback(() => res.status(500).json({ error: err.message }));
//               }

//               itemProcessed++;
//               processNextItem();
//             });
//           });
//         });
//       };

//       processNextItem();
//     };
//   });
// };

// Get all customers

// export const Exchange = (req, res) => {
//   // Log the body to see what data is being received
//   console.log("Received request body:", req.body);

//   const { customer, items, total } = req.body;
//   const { customer_name, number, date } = customer;

//   // Log the customer and items for more detailed inspection
//   console.log("Customer Info:", customer);
//   console.log("Items:", items);

//   if (!customer_name || !number || !date || !items || items.length === 0) {
//     console.error("Missing required fields:", { customer_name, number, date, items });
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   db.beginTransaction((err) => {
//     if (err) {
//       console.error("Transaction start error:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     const checkCustomerQuery = `SELECT customer_id FROM customers WHERE number = ?`;
//     db.query(checkCustomerQuery, [number], (err, customerResults) => {
//       if (err) {
//         console.error("Error executing checkCustomerQuery:", err);
//         return db.rollback(() => res.status(500).json({ error: err.message }));
//       }

//       let customerId;
//       if (customerResults.length === 0) {
//         console.log("Customer not found, inserting new customer:", customer_name);

//         const insertCustomerQuery = `
//           INSERT INTO customers (customer_id, customer_name, number, created_at)
//           VALUES (UUID(), ?, ?, NOW())
//         `;
//         db.query(insertCustomerQuery, [customer_name, number], (err, result) => {
//           if (err) {
//             console.error("Error inserting customer:", err);
//             return db.rollback(() => res.status(500).json({ error: err.message }));
//           }

//           console.log("New customer inserted:", result);
//           const fetchCustomerIdQuery = `SELECT customer_id FROM customers WHERE number = ?`;
//           db.query(fetchCustomerIdQuery, [number], (err, newCustomerResult) => {
//             if (err) {
//               console.error("Error fetching customer ID:", err);
//               return db.rollback(() => res.status(500).json({ error: err.message }));
//             }

//             customerId = newCustomerResult[0].customer_id;
//             console.log("Fetched new customer ID:", customerId);
//             processItems(customerId);
//           });
//         });
//       } else {
//         customerId = customerResults[0].customer_id;
//         console.log("Existing customer ID:", customerId);
//         processItems(customerId);
//       }
//     });

//     const processItems = (customerId) => {
//       let itemProcessed = 0;

//       const processNextItem = () => {
//         if (itemProcessed >= items.length) {
//           db.commit((err) => {
//             if (err) {
//               console.error("Transaction commit error:", err);
//               return db.rollback(() =>
//                 res.status(500).json({ error: "Error committing transaction." })
//               );
//             }
//             console.log("Exchange added successfully");
//             res.send("Exchange added successfully.");
//           });
//           return;
//         }

//         const item = items[itemProcessed];
//         const { item: itemName, qty } = item;

//         console.log("Processing item:", itemName, "with quantity:", qty);

//         const checkStockQuery = `
//           SELECT id, closing_stock, opening_qty
//           FROM stock
//           WHERE description = ? AND record_type = 'day_to_day'
//         `;
//         db.query(checkStockQuery, [itemName], (err, stockResults) => {
//           if (err) {
//             console.error("Error executing checkStockQuery:", err);
//             return db.rollback(() => res.status(500).json({ error: err.message }));
//           }

//           if (stockResults.length === 0) {
//             console.error(`Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`);
//             return db.rollback(() =>
//               res.status(400).json({
//                 error: `Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`,
//               })
//             );
//           }

//           const stockItem = stockResults[0];
//           const { id } = stockItem;

//           console.log("Stock item found with ID:", id);

//           const exchangeId = uuidv4();

//           const insertExchangeQuery = `
//             INSERT INTO exchanges (exchange_id, date, customer_id, customer_name, item_id, item, quantity)
//             VALUES (?, ?, ?, ?, ?, ?, ?)
//           `;
//           db.query(insertExchangeQuery, [exchangeId, date, customerId, customer_name, id, itemName, qty], (err) => {
//             if (err) {
//               console.error("Error executing insertExchangeQuery:", err);
//               return db.rollback(() => res.status(500).json({ error: err.message }));
//             }

//             console.log("Exchange inserted for item:", itemName);

//             const updateStockQuery = `
//               UPDATE stock
//               SET closing_stock = closing_stock - ?, opening_qty = opening_qty - ?
//               WHERE id = ?
//             `;
//             db.query(updateStockQuery, [qty, qty, id], (err) => {
//               if (err) {
//                 console.error("Error executing updateStockQuery:", err);
//                 return db.rollback(() => res.status(500).json({ error: err.message }));
//               }

//               console.log("Stock updated for item:", itemName);
//               itemProcessed++;
//               processNextItem();
//             });
//           });
//         });
//       };

//       processNextItem();
//     };
//   });
// };

// export const Return = (req, res) => {
//   const { customer, items } = req.body; // Destructure 'customer' and 'items' from req.body
//   const { customer_name, number, date } = customer; // Destructure customer fields

//   // Log the request body to check the incoming data
//   console.log("Request Body:", req.body);

//   // Validate the presence of required fields
//   if (!customer_name || !number || !date || !items || items.length === 0) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   db.beginTransaction((err) => {
//     if (err) {
//       console.error("Transaction start error:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     const checkCustomerQuery = `
//       SELECT customer_id FROM customers WHERE customer_name = ? AND number = ?
//     `;
//     db.query(checkCustomerQuery, [customer_name, number], (err, customerResults) => {
//       if (err) {
//         console.error("Error executing checkCustomerQuery:", err);
//         return db.rollback(() =>
//           res.status(500).json({ error: err.message })
//         );
//       }

//       let customerId;
//       if (customerResults.length === 0) {
//         // Customer does not exist, insert them
//         const insertCustomerQuery = `
//           INSERT INTO customers (customer_id, customer_name, number, created_at)
//           VALUES (UUID(), ?, ?, NOW())
//         `;
//         db.query(insertCustomerQuery, [customer_name, number], (err, result) => {
//           if (err) {
//             console.error("Error inserting customer:", err);
//             return db.rollback(() =>
//               res.status(500).json({ error: err.message })
//             );
//           }

//           // Fetch the newly inserted customer's ID
//           const fetchCustomerIdQuery = `SELECT customer_id FROM customers WHERE number = ?`;
//           db.query(fetchCustomerIdQuery, [number], (err, newCustomerResult) => {
//             if (err) {
//               console.error("Error fetching customer ID:", err);
//               return db.rollback(() => res.status(500).json({ error: err.message }));
//             }

//             customerId = newCustomerResult[0].customer_id;
//             processItems(customerId);
//           });
//         });
//       } else {
//         // Customer exists, use their ID
//         customerId = customerResults[0].customer_id;
//         processItems(customerId);
//       }
//     });

//     const processItems = (customerId) => {
//       const returnId = uuidv4(); // Generate returnId once for all items

//       let itemProcessed = 0;

//       const processNextItem = () => {
//         if (itemProcessed >= items.length) {
//           db.commit((err) => {
//             if (err) {
//               console.error("Transaction commit error:", err);
//               return db.rollback(() =>
//                 res.status(500).json({ error: "Error committing transaction." })
//               );
//             }
//             res.send("Return added successfully.");
//           });
//           return;
//         }

//         const item = items[itemProcessed];
//         const { item: itemName, qty } = item;

//         const checkStockQuery = `
//           SELECT id, closing_stock, opening_qty
//           FROM stock
//           WHERE description = ? AND record_type = 'day_to_day'
//         `;
//         db.query(checkStockQuery, [itemName], (err, stockResults) => {
//           if (err) {
//             console.error("Error executing checkStockQuery:", err);
//             return db.rollback(() =>
//               res.status(500).json({ error: err.message })
//             );
//           }

//           if (stockResults.length === 0) {
//             console.error(
//               `Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`
//             );
//             return db.rollback(() =>
//               res.status(400).json({
//                 error: `Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`,
//               })
//             );
//           }

//           const stockItem = stockResults[0];
//           const { id } = stockItem;

//           const insertReturnQuery = `
//             INSERT INTO returns (
//               return_id, date, customer_id, customer_name, item_id, item, quantity
//             ) VALUES (?, ?, ?, ?, ?, ?, ?)
//           `;
//           db.query(
//             insertReturnQuery,
//             [returnId, date, customerId, customer_name, id, itemName, qty],
//             (err) => {
//               if (err) {
//                 console.error("Error executing insertReturnQuery:", err);
//                 return db.rollback(() =>
//                   res.status(500).json({ error: err.message })
//                 );
//               }

//               const updateStockQuery = `
//               UPDATE stock
//               SET closing_stock = closing_stock + ?,
//                   opening_qty = opening_qty + ?
//               WHERE id = ?
//             `;
//               db.query(updateStockQuery, [qty, qty, id], (err) => {
//                 if (err) {
//                   console.error("Error executing updateStockQuery:", err);
//                   return db.rollback(() =>
//                     res.status(500).json({ error: err.message })
//                   );
//                 }

//                 itemProcessed++;
//                 processNextItem();
//               });
//             }
//           );
//         });
//       };

//       processNextItem();
//     };
//   });
// };

// export const Exchange = (req, res) => {
//   console.log("Received request body:", req.body);

//   const { customer, items, total } = req.body;
//   const { customer_name, number, date } = customer;

//   if (!customer_name || !number || !date || !items || items.length === 0) {
//     console.error("Missing required fields:", { customer_name, number, date, items });
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   db.beginTransaction((err) => {
//     if (err) {
//       console.error("Transaction start error:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     const checkCustomerQuery = `SELECT customer_id FROM customers WHERE number = ?`;
//     db.query(checkCustomerQuery, [number], (err, customerResults) => {
//       if (err) {
//         console.error("Error executing checkCustomerQuery:", err);
//         return db.rollback(() => res.status(500).json({ error: err.message }));
//       }

//       let customerId;
//       if (customerResults.length === 0) {
//         console.log("Customer not found, inserting new customer:", customer_name);

//         const insertCustomerQuery = `
//           INSERT INTO customers (customer_id, customer_name, number, created_at)
//           VALUES (UUID(), ?, ?, NOW())
//         `;
//         db.query(insertCustomerQuery, [customer_name, number], (err, result) => {
//           if (err) {
//             console.error("Error inserting customer:", err);
//             return db.rollback(() => res.status(500).json({ error: err.message }));
//           }

//           const fetchCustomerIdQuery = `SELECT customer_id FROM customers WHERE number = ?`;
//           db.query(fetchCustomerIdQuery, [number], (err, newCustomerResult) => {
//             if (err) {
//               console.error("Error fetching customer ID:", err);
//               return db.rollback(() => res.status(500).json({ error: err.message }));
//             }

//             customerId = newCustomerResult[0].customer_id;
//             processItems(customerId);
//           });
//         });
//       } else {
//         customerId = customerResults[0].customer_id;
//         processItems(customerId);
//       }
//     });

//     const processItems = (customerId) => {
//       const exchangeId = uuidv4(); // Generate exchangeId once for all items

//       let itemProcessed = 0;

//       const processNextItem = () => {
//         if (itemProcessed >= items.length) {
//           db.commit((err) => {
//             if (err) {
//               console.error("Transaction commit error:", err);
//               return db.rollback(() => res.status(500).json({ error: "Error committing transaction." }));
//             }
//             res.send("Exchange added successfully.");
//           });
//           return;
//         }

//         const item = items[itemProcessed];
//         const { item: itemName, qty } = item;

//         const checkStockQuery = `
//           SELECT id, closing_stock, opening_qty
//           FROM stock
//           WHERE description = ? AND record_type = 'day_to_day'
//         `;
//         db.query(checkStockQuery, [itemName], (err, stockResults) => {
//           if (err) {
//             return db.rollback(() => res.status(500).json({ error: err.message }));
//           }

//           if (stockResults.length === 0) {
//             return db.rollback(() => res.status(400).json({ error: `Item '${itemName}' not found.` }));
//           }

//           const stockItem = stockResults[0];
//           const { id } = stockItem;

//           const insertExchangeQuery = `
//             INSERT INTO exchanges (exchange_id, date, customer_id, customer_name, item_id, item, quantity)
//             VALUES (?, ?, ?, ?, ?, ?, ?)
//           `;
//           db.query(insertExchangeQuery, [exchangeId, date, customerId, customer_name, id, itemName, qty], (err) => {
//             if (err) {
//               return db.rollback(() => res.status(500).json({ error: err.message }));
//             }

//             const updateStockQuery = `
//               UPDATE stock
//               SET closing_stock = closing_stock - ?, opening_qty = opening_qty - ?
//               WHERE id = ?
//             `;
//             db.query(updateStockQuery, [qty, qty, id], (err) => {
//               if (err) {
//                 return db.rollback(() => res.status(500).json({ error: err.message }));
//               }

//               itemProcessed++;
//               processNextItem();
//             });
//           });
//         });
//       };

//       processNextItem();
//     };
//   });
// };

// export const Return = (req, res) => {
//   const { customer, items } = req.body; // Destructure 'customer' and 'items' from req.body
//   const { customer_name, number, date } = customer; // Destructure customer fields

//   // Log the request body to check the incoming data
//   console.log("Request Body:", req.body);

//   // Validate the presence of required fields
//   if (!customer_name || !number || !date || !items || items.length === 0) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   db.beginTransaction((err) => {
//     if (err) {
//       console.error("Transaction start error:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     const checkCustomerQuery = `
//       SELECT customer_id FROM customers WHERE customer_name = ? AND number = ?
//     `;
//     db.query(
//       checkCustomerQuery,
//       [customer_name, number],
//       (err, customerResults) => {
//         if (err) {
//           console.error("Error executing checkCustomerQuery:", err);
//           return db.rollback(() =>
//             res.status(500).json({ error: err.message })
//           );
//         }

//         let customerId;
//         if (customerResults.length === 0) {
//           // Customer does not exist, insert them
//           const insertCustomerQuery = `
//           INSERT INTO customers (customer_id, customer_name, number, created_at) 
//           VALUES (UUID(), ?, ?, NOW())
//         `;
//           db.query(
//             insertCustomerQuery,
//             [customer_name, number],
//             (err, result) => {
//               if (err) {
//                 console.error("Error inserting customer:", err);
//                 return db.rollback(() =>
//                   res.status(500).json({ error: err.message })
//                 );
//               }

//               // Fetch the newly inserted customer's ID
//               const fetchCustomerIdQuery = `SELECT customer_id FROM customers WHERE number = ?`;
//               db.query(
//                 fetchCustomerIdQuery,
//                 [number],
//                 (err, newCustomerResult) => {
//                   if (err) {
//                     console.error("Error fetching customer ID:", err);
//                     return db.rollback(() =>
//                       res.status(500).json({ error: err.message })
//                     );
//                   }

//                   customerId = newCustomerResult[0].customer_id;
//                   processItems(customerId);
//                 }
//               );
//             }
//           );
//         } else {
//           // Customer exists, use their ID
//           customerId = customerResults[0].customer_id;
//           processItems(customerId);
//         }
//       }
//     );

//     const processItems = (customerId) => {
//       const returnId = uuidv4(); // Generate returnId once for all items

//       let itemProcessed = 0;

//       const processNextItem = () => {
//         if (itemProcessed >= items.length) {
//           db.commit((err) => {
//             if (err) {
//               console.error("Transaction commit error:", err);
//               return db.rollback(() =>
//                 res.status(500).json({ error: "Error committing transaction." })
//               );
//             }
//              // Return success message along with returnId
//             return res.status(201).json({
//               message: "Return added successfully.",
//               returnId: returnId, // Send the sales_id to the frontend
//             });
//             // Return success message along with returnId
//             res.json({ message: "Return added successfully.", returnId });
//           });
//           return;
//         }

//         const item = items[itemProcessed];
//         const { item: itemName, qty } = item;

//         const checkStockQuery = `
//           SELECT id, closing_stock, opening_qty
//           FROM stock
//           WHERE description = ? AND record_type = 'day_to_day'
//         `;
//         db.query(checkStockQuery, [itemName], (err, stockResults) => {
//           if (err) {
//             console.error("Error executing checkStockQuery:", err);
//             return db.rollback(() =>
//               res.status(500).json({ error: err.message })
//             );
//           }

//           if (stockResults.length === 0) {
//             console.error(
//               `Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`
//             );
//             return db.rollback(() =>
//               res.status(400).json({
//                 error: `Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`,
//               })
//             );
//           }

//           const stockItem = stockResults[0];
//           const { id } = stockItem;

//           const insertReturnQuery = `
//             INSERT INTO returns (
//               return_id, date, customer_id, customer_name, item_id, item, quantity
//             ) VALUES (?, ?, ?, ?, ?, ?, ?)
//           `;
//           db.query(
//             insertReturnQuery,
//             [returnId, date, customerId, customer_name, id, itemName, qty],
//             (err) => {
//               if (err) {
//                 console.error("Error executing insertReturnQuery:", err);
//                 return db.rollback(() =>
//                   res.status(500).json({ error: err.message })
//                 );
//               }

//               const updateStockQuery = `
//               UPDATE stock
//               SET closing_stock = closing_stock + ?,
//                   opening_qty = opening_qty + ?
//               WHERE id = ?
//             `;
//               db.query(updateStockQuery, [qty, qty, id], (err) => {
//                 if (err) {
//                   console.error("Error executing updateStockQuery:", err);
//                   return db.rollback(() =>
//                     res.status(500).json({ error: err.message })
//                   );
//                 }

//                 itemProcessed++;
//                 processNextItem();
//               });
//             }
//           );
//         });
//       };

//       processNextItem();
//     };
//   });
// };


export const Return = (req, res) => {
  const { customer, items } = req.body;
  const { customer_name, number, date } = customer;

  // Log the request body to check the incoming data
  console.log("Request Body:", req.body);

  if (!customer_name || !number || !date || !items || items.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction start error:", err);
      return res.status(500).json({ error: err.message });
    }

    const checkCustomerQuery = `
      SELECT customer_id FROM customers WHERE customer_name = ? AND number = ?
    `;
    db.query(checkCustomerQuery, [customer_name, number], (err, customerResults) => {
      if (err) {
        console.error("Error executing checkCustomerQuery:", err);
        return db.rollback(() => res.status(500).json({ error: err.message }));
      }

      let customerId;
      if (customerResults.length === 0) {
        // Customer does not exist, insert them
        const insertCustomerQuery = `
          INSERT INTO customers (customer_id, customer_name, number, created_at) 
          VALUES (UUID(), ?, ?, NOW())
        `;
        db.query(insertCustomerQuery, [customer_name, number], (err) => {
          if (err) {
            console.error("Error inserting customer:", err);
            return db.rollback(() => res.status(500).json({ error: err.message }));
          }

          const fetchCustomerIdQuery = `SELECT customer_id FROM customers WHERE number = ?`;
          db.query(fetchCustomerIdQuery, [number], (err, newCustomerResult) => {
            if (err) {
              console.error("Error fetching customer ID:", err);
              return db.rollback(() => res.status(500).json({ error: err.message }));
            }

            customerId = newCustomerResult[0].customer_id;
            processItems(customerId);
          });
        });
      } else {
        // Customer exists, use their ID
        customerId = customerResults[0].customer_id;
        processItems(customerId);
      }
    });

    const processItems = (customerId) => {
      const returnId = uuidv4(); // Generate returnId once for all items

      let itemProcessed = 0;

      const processNextItem = () => {
        if (itemProcessed >= items.length) {
          db.commit((err) => {
            if (err) {
              console.error("Transaction commit error:", err);
              return db.rollback(() =>
                res.status(500).json({ error: "Error committing transaction." })
              );
            }

            // Return success message along with returnId
            return res.status(201).json({
              message: "Return added successfully.",
              return_Id: returnId,
            });
          });
          return;
        }

        const item = items[itemProcessed];
        const { item: itemName, qty } = item;

        const checkStockQuery = `
          SELECT id, closing_stock, opening_qty
          FROM stock
          WHERE description = ? AND record_type = 'day_to_day'
        `;
        db.query(checkStockQuery, [itemName], (err, stockResults) => {
          if (err) {
            console.error("Error executing checkStockQuery:", err);
            return db.rollback(() => res.status(500).json({ error: err.message }));
          }

          if (stockResults.length === 0) {
            console.error(`Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`);
            return db.rollback(() =>
              res.status(400).json({
                error: `Item '${itemName}' not found in stock or does not match 'day_to_day' record type.`,
              })
            );
          }

          const stockItem = stockResults[0];
          const { id } = stockItem;

          const insertReturnQuery = `
            INSERT INTO returns (return_id, date, customer_id, customer_name, item_id, item, quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          db.query(insertReturnQuery, [returnId, date, customerId, customer_name, id, itemName, qty], (err) => {
            if (err) {
              console.error("Error executing insertReturnQuery:", err);
              return db.rollback(() => res.status(500).json({ error: err.message }));
            }

            const updateStockQuery = `
              UPDATE stock
              SET closing_stock = closing_stock + ?, opening_qty = opening_qty + ?
              WHERE id = ?
            `;
            db.query(updateStockQuery, [qty, qty, id], (err) => {
              if (err) {
                console.error("Error executing updateStockQuery:", err);
                return db.rollback(() => res.status(500).json({ error: err.message }));
              }

              itemProcessed++;
              processNextItem();
            });
          });
        });
      };

      processNextItem();
    };
  });
};


export const Exchange = (req, res) => {
  const { customer, items } = req.body; // Destructure 'customer' and 'items' from req.body
  const { customer_name, number, date } = customer; // Destructure customer fields

  // Validate the presence of required fields
  if (!customer_name || !number || !date || !items || items.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction start error:", err);
      return res.status(500).json({ error: err.message });
    }

    const checkCustomerQuery = `
      SELECT customer_id FROM customers WHERE customer_name = ? AND number = ?
    `;
    db.query(
      checkCustomerQuery,
      [customer_name, number],
      (err, customerResults) => {
        if (err) {
          console.error("Error executing checkCustomerQuery:", err);
          return db.rollback(() =>
            res.status(500).json({ error: err.message })
          );
        }

        let customerId;
        if (customerResults.length === 0) {
          // Customer does not exist, insert them
          const insertCustomerQuery = `
          INSERT INTO customers (customer_id, customer_name, number, created_at) 
          VALUES (UUID(), ?, ?, NOW())
        `;
          db.query(
            insertCustomerQuery,
            [customer_name, number],
            (err, result) => {
              if (err) {
                console.error("Error inserting customer:", err);
                return db.rollback(() =>
                  res.status(500).json({ error: err.message })
                );
              }

              // Fetch the newly inserted customer's ID
              const fetchCustomerIdQuery = `SELECT customer_id FROM customers WHERE number = ?`;
              db.query(
                fetchCustomerIdQuery,
                [number],
                (err, newCustomerResult) => {
                  if (err) {
                    console.error("Error fetching customer ID:", err);
                    return db.rollback(() =>
                      res.status(500).json({ error: err.message })
                    );
                  }

                  customerId = newCustomerResult[0].customer_id;
                  processItems(customerId);
                }
              );
            }
          );
        } else {
          // Customer exists, use their ID
          customerId = customerResults[0].customer_id;
          processItems(customerId);
        }
      }
    );

    const processItems = (customerId) => {
      const exchangeId = uuidv4(); // Generate exchangeId once for all items

      let itemProcessed = 0;

      const processNextItem = () => {
        if (itemProcessed >= items.length) {
          db.commit((err) => {
            if (err) {
              console.error("Transaction commit error:", err);
              return db.rollback(() =>
                res.status(500).json({ error: "Error committing transaction." })
              );
            }
            // Return success message along with exchangeId
            res.json({ message: "Exchange added successfully.", exchangeId });
          });
          return;
        }

        const item = items[itemProcessed];
        const { item: itemName, qty } = item;

        // Rest of the exchange logic here...

        itemProcessed++;
        processNextItem();
      };

      processNextItem();
    };
  });
};

export const getAllCustomers = (req, res) => {
  const query = "SELECT * FROM customers";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching customers:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get customer by name
// export const getCustomerByName = (req, res) => {

//   const { customer_name } = req.params;
//   console.log('Request params:', req.params);

//   if (!customer_name) {
//     return res.status(400).json({ error: 'Customer name is required' });
//   }

//   const query = 'SELECT * FROM customers WHERE customer_name = ?';

//   db.query(query, [customer_name], (err, results) => {
//     if (err) {
//       console.error('Error fetching customer by name:', err);
//       return res.status(500).json({ error: err.message });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     res.json(results[0]);
//   });
// };

export const getCustomerByName = (req, res) => {
  console.log("Request received at /api/customers/:customer_name");
  console.log("Request params:", req.params);

  const { customer_name } = req.params;

  if (!customer_name) {
    console.log("Customer name is missing");
    return res.status(400).json({ error: "Customer name is required" });
  }

  const query = "SELECT * FROM customers WHERE customer_name = ?";

  db.query(query, [customer_name], (err, results) => {
    if (err) {
      console.error("Error fetching customer by name:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      console.log("Customer not found:", customer_name);
      return res.status(404).json({ error: "Customer not found" });
    }

    console.log("Customer found:", results[0]);
    res.json(results[0]);
  });
};


export const getSaleById = (req, res) => {
  const { saleId } = req.params; // Get the saleId from request parameters

  // Validate the saleId
  if (!saleId) {
    return res.status(400).json({ error: "Sale ID is required." });
  }

  const query = `
    SELECT * FROM sales WHERE sales_id = ?
  `;

  db.query(query, [saleId], (err, results) => {
    if (err) {
      console.error("Error fetching sale by ID:", err);
      return res.status(500).json({ error: "Failed to retrieve sale." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Sale not found." });
    }

    // Return the sale details
    res.status(200).json(results[0]);
  });
};
