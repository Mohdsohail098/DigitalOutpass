import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button, Card, CardContent } from '@mui/material';
import { useUser } from '../usercontext';
import QRCode from 'react-qr-code';

const OutpassStatus = () => {
  const { user } = useUser();
  const [outpass, setOutpass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [approvedDate, setApprovedDate] = useState('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQrValue('');
    }, 60000); // Reset QR code after 1 minute

    return () => clearTimeout(timer);
  }, [qrValue]);

  const fetchOutpassStatusByRollNumber = async (roll_number) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/outpass/${roll_number}`);
      console.log(response.data);
      setOutpass(response.data);

      if (response.data.status === 'Approved') {
        const timestamp = Date.now();
        const formattedDate = new Date(timestamp).toLocaleString();
        const qrData = `Outpass for Roll Number: ${response.data.roll_number}, Key: ${response.data.key}`;
        
        setQrValue(qrData);
        setApprovedDate(formattedDate);
      } else {
        setQrValue('');
        setApprovedDate('');
      }

      setError('');
    } catch (error) {
      console.error("Error fetching outpass:", error);
      if (error.response && error.response.status === 404) {
        setError('Outpass not found for this roll number');
      } else {
        setError('Failed to fetch outpass status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (user) {
      fetchOutpassStatusByRollNumber(user.rollNumber);
    } else {
      setError('User not logged in.');
    }
  };

  const toggleQRCode = () => {
    setShowQR(!showQR);
  };

  return (
    <Container component="main" maxWidth="md">
      <div style={styles.paper}>
        <Typography component="h1" variant="h5" gutterBottom style={styles.text}>
          Check Outpass Status
        </Typography>
        <Button
          onClick={handleButtonClick}
          variant="contained"
          color="primary"
          fullWidth
          style={styles.submitButton}
          disabled={!user || loading}
        >
          {loading ? 'Loading...' : 'Check Status'}
        </Button>
        {error && <Typography color="error" variant="body1" style={styles.text}>{error}</Typography>}
        {outpass && (
          <div style={{ marginTop: '20px' }}>
            <Typography variant="subtitle1" gutterBottom style={styles.text}><strong>Roll Number:</strong> {outpass.roll_number}</Typography>
            <Typography variant="subtitle1" gutterBottom style={styles.text}><strong>Reason:</strong> {outpass.reason}</Typography>
            <Typography variant="subtitle1" gutterBottom style={styles.text}><strong>Status:</strong> {outpass.status}</Typography>
            {approvedDate && (
              <Typography variant="subtitle1" gutterBottom style={styles.text}><strong>Approved Date:</strong> {approvedDate}</Typography>
            )}

            {outpass.status === 'Approved' && qrValue && (
              <>
                <Button
                  onClick={toggleQRCode}
                  variant="contained"
                  color="secondary"
                  style={styles.qrButton}
                >
                  {showQR ? 'Hide QR Code' : 'Show QR Code'}
                </Button>

                {showQR && (
                  <Card style={styles.qrCard}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom style={styles.text}><strong>QR Code:</strong></Typography>
                      <QRCode value={qrValue} />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};

const styles = {
  paper: {
    marginTop: 32,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
  submitButton: {
    marginTop: 24,
  },
  qrButton: {
    marginTop: 16,
  },
  qrCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#333',
  },
};

export default OutpassStatus;
