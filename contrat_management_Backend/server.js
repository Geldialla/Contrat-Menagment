const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors'); // Import cors package

const server = express();
server.use(bodyParser.json());
server.use(cors()); // Add this line to enable CORS

// Create a database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'contrat_management'
});

// Connect to the database
db.connect(function (error) {
    if (error) {
        console.log('Error connecting to database');
    } else {
        console.log('Successfully connected to database');
    }
});

// Start the server
server.listen(8084, function check(error) {
    if (error) {
        console.log('Error starting server');
    } else {
        console.log('Server started on port 8084');
    }
});

// API endpoint to add a new employee record
server.post("/api/users_table/add", (req, res) => {
    console.log("Request Body:", req.body);
    const { employee, email, phone_number, personal_number, job_position, contract, start_date, end_date } = req.body;

    // Check if required fields are missing or empty
    if (!employee || !email || !phone_number || !personal_number || !job_position || !contract || !start_date || !end_date) {
        let missingFields = [];
        if (!employee) missingFields.push("employee");
        if (!email) missingFields.push("email");
        if (!phone_number) missingFields.push("phone_number");
        if (!personal_number) missingFields.push("personal_number");
        if (!job_position) missingFields.push("job_position");
        if (!contract) missingFields.push("contract");
        if (!start_date) missingFields.push("start_date");
        if (!end_date) missingFields.push("end_date");
        return res.status(400).json({ status: false, message: `Missing or empty required fields: ${missingFields.join(", ")}` });
    }

    const details = { employee, email, phone_number, personal_number, job_position, contract, start_date, end_date };

    const sql = "INSERT INTO users_table SET ?";

    db.query(sql, details, (error) => {
        if (error) {
            console.error("Error inserting users_table record:", error);
            return res.status(500).json({ status: false, message: "Employee creation failed" });
        }
        res.status(200).json({ status: true, message: "Employee created successfully" });
    });
});

// API endpoint to view all employee records
server.get("/api/users_table", (req, res) => {
    var sql = "SELECT * FROM users_table";
    db.query(sql, function (error, result) {
        if (error) {
            console.log("Error Connecting to DB");
            return res.status(500).json({ status: false, message: "Error connecting to database" });
        } else {
            res.status(200).json({ status: true, data: result });
        }
    });
});

// API endpoint to search for a specific employee record
server.get("/api/users_table/:id", (req, res) => {
    var employeeID = req.params.id;
    var sql = "SELECT * FROM users_table WHERE id=" + employeeID;
    db.query(sql, function (error, result) {
        if (error) {
            console.log("Error Connecting to DB");
            return res.status(500).json({ status: false, message: "Error connecting to database" });
        } else {
            res.status(200).json({ status: true, data: result });
        }
    });
});

// API endpoint to update an employee record
server.put("/api/users_table/update/:id", (req, res) => {
    const { employee, email, phone_number, personal_number, job_position, contract, start_date, end_date } = req.body;
    const id = req.params.id;

    console.log("Received data:", employee, email, phone_number, personal_number, job_position, contract, start_date, end_date, id); // Log received data

    // SQL query with parameters
    const sql = "UPDATE users_table SET employee = ?, email = ?, phone_number = ?, personal_number = ?, job_position = ?, contract = ?, start_date = ?, end_date = ? WHERE id = ?";
    console.log("SQL query:", sql); // Log SQL query

    // Execute the SQL query with parameters
    db.query(sql, [employee, email, phone_number, personal_number, job_position, contract, start_date, end_date, id], (error, result) => {
        if (error) {
            console.error("Error updating student:", error);
            return res.status(500).json({ status: false, message: "An error occurred while updating the employee" });
        }

        // Check if any rows were affected by the update
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: false, message: "employee not found" });
        }

        // Send a success response if the update was successful
        res.status(200).json({ status: true, message: "employee updated successfully" });
    });
});

// API endpoint to delete an employee record
server.delete("/api/users_table/delete/:id", (req, res) => {
    let sql = "DELETE FROM users_table WHERE id=" + req.params.id + "";
    let query = db.query(sql, (error) => {
        if (error) {
            console.error("Error deleting Employee:", error);
            return res.status(500).json({ status: false, message: "An error occurred while deleting the Employee" });
        } else {
            res.status(200).json({ status: true, message: "Employee deleted successfully" });
        }
    });
});
