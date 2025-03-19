import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import { Button, TextField, Typography, Box, Paper } from "@mui/material";

const SecurityPage = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [enteredKey, setEnteredKey] = useState("");
  const [message, setMessage] = useState("");
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    const scannerInstance = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scannerInstance.render(
      (decodedText) => handleScannedData(decodedText),
      (error) => console.warn("QR Scan Error:", error)
    );

    setScanner(scannerInstance);

    return () => {
      scannerInstance.clear().catch((error) => console.warn("Scanner cleanup error:", error));
    };
  }, []);

  const handleScannedData = (decodedText) => {
    console.log("Scanned Data:", decodedText);

    // Updated regex to match Roll Number and Key
    const match = decodedText.match(/Roll\s*Number:\s*(\w+),?\s*Key:\s*([\w\d]+)/i);

    if (match) {
      setRollNumber(match[1].trim()); // Extract and trim Roll Number
      setEnteredKey(match[2].trim()); // Extract and trim Key
      setMessage("✅ QR Code Scanned Successfully!");
    } else {
      console.error("⚠ Regex failed to match the scanned text.");
      setMessage("⚠ Invalid QR Code Format! Please scan a valid Outpass QR.");
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();

    if (!rollNumber || !enteredKey) {
      setMessage('⚠ Please provide both roll number and key.');
      return;
    }

    const payload = {
      roll_number: rollNumber.trim(), // ✅ Matches backend DB field name
      random_key: enteredKey.trim(),  // ✅ Matches backend DB field name
    };

    console.log("🔍 Sending Data to API:", payload); // ✅ Debugging

    try {
      const response = await axios.post("http://localhost:5000/api/verifyKey", payload);
      setMessage(response.data.message);
    } catch (error) {
      console.error("⚠ API Error:", error.response?.data || error.message);
      setMessage(error.response?.data.message || '❌ Server error. Try again.');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode("qr-reader-file");
    try {
      const decodedText = await html5QrCode.scanFile(file, false);
      handleScannedData(decodedText);
    } catch (error) {
      console.error("File Upload Error:", error);
      setMessage("❌ Unable to read QR Code from file!");
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #ff6b6b, #ff8e53, #ffa726, #ffcc33)",
        backgroundSize: "cover",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: "90%",
          maxWidth: "400px",
          padding: "20px",
          borderRadius: "20px",
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.2)",
          boxShadow: "0px 4px 30px rgba(0, 0, 0, 0.2)",
          color: "#fff",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          🔒 Outpass Verification
        </Typography>

        {/* QR Scanner (Live Camera) */}
        <Box id="qr-reader" sx={{ marginTop: "10px", borderRadius: "10px", overflow: "hidden" }} />

        {/* QR Code Upload Option */}
        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} id="upload-qr" />
        <label htmlFor="upload-qr">
          <Button
            component="span"
            variant="contained"
            sx={{
              marginTop: "15px",
              backgroundColor: "#28a745",
              "&:hover": { backgroundColor: "#218838" },
            }}
          >
            📤 Upload QR Code
          </Button>
        </label>

        {/* Hidden div to fix file upload scanning */}
        <div id="qr-reader-file" style={{ display: "none" }}></div>

        <form onSubmit={handleVerification}>
          <TextField
            fullWidth
            label="Roll Number"
            variant="outlined"
            margin="normal"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
            sx={{ background: "#fff", borderRadius: "10px" }}
          />
          <TextField
            fullWidth
            label="Enter Key"
            variant="outlined"
            margin="normal"
            value={enteredKey}
            onChange={(e) => setEnteredKey(e.target.value)}
            required
            sx={{ background: "#fff", borderRadius: "10px" }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              marginTop: "20px",
              backgroundColor: "#007BFF",
              padding: "12px",
              fontSize: "16px",
              borderRadius: "10px",
              "&:hover": { backgroundColor: "#0056b3" },
            }}
          >
            ✅ Verify
          </Button>
        </form>

        {message && (
          <Typography sx={{ marginTop: "20px", fontWeight: "bold", color: message.includes("❌") ? "red" : "black" }}>
            {message}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default SecurityPage;
