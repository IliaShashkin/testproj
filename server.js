const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const REPORTS_FILE = path.join(__dirname, "reports.csv");

app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// Ensure the CSV file exists
if (!fs.existsSync(REPORTS_FILE)) {
    fs.writeFileSync(REPORTS_FILE, "Timestamp,Text,Status\n");
}

// Handle report submission
app.post("/submit-report", (req, res) => {
    const { timestamp, text, status } = req.body;
    const newEntry = `"${timestamp}","${text}","${status}"\n`;

    fs.appendFile(REPORTS_FILE, newEntry, (err) => {
        if (err) return res.status(500).send("Error saving report");
        res.send("Report saved");
    });
});

// Read reports
app.get("/get-reports", (req, res) => {
    fs.readFile(REPORTS_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading reports");
        res.send(data);
    });
});

// Close a report
app.post("/close-report", (req, res) => {
    const { timestamp } = req.body;
    fs.readFile(REPORTS_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading reports");

        let rows = data.split("\n");
        rows = rows.map(row => row.includes(timestamp) ? row.replace("Open", "Closed") : row);

        fs.writeFile(REPORTS_FILE, rows.join("\n"), (err) => {
            if (err) return res.status(500).send("Error updating report");
            res.send("Report closed");
        });
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));
