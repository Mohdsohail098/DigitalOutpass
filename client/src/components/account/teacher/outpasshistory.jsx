import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const OutpassHistoryPage = () => {
  const [outpasses, setOutpasses] = useState([]);
  const [students, setStudents] = useState({});
  const navigate = useNavigate();
  const location = useLocation(); // To check the current path

  useEffect(() => {
    fetchOutpasses();
  }, []);
  const fetchOutpasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/outpasshist', { 
        params: { status: ["Approved", "Rejected"] }, // ✅ Send as an array
        paramsSerializer: params => {
          return Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${params[key].map(encodeURIComponent).join("&" + key + "=")}`)
            .join("&");
        }
      });
  
      console.log("📜 Fetched Outpasses:", response.data);
      setOutpasses(response.data);
    } catch (error) {
      console.error('❌ Error fetching outpasses:', error);
    }
  };
  
  
  

  const fetchStudentDetails = async (roll_number) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/Student`, { params: { roll_number } });
      const studentDetails = response.data;
      setStudents(prevStudents => ({
        ...prevStudents,
        [roll_number]: studentDetails
      }));
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  return (
    <div style={styles.pageContainer}>
       <AppBar position="fixed" sx={{ backgroundColor: '#3f51b5' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">Teacher Dashboard</Typography>
          <div>
            <Button color="inherit" onClick={() => navigate('/teacherhome')} sx={{ marginLeft: 2 }}>Home</Button>
            <Button color="inherit" onClick={() => navigate('/outpass-requests')} sx={{ marginLeft: 2 }}>Outpass Requests</Button>
            <Button color="inherit" onClick={() => navigate('/outpass-history')} sx={{ marginLeft: 2 }}>Outpass History</Button>
          </div>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container style={{ paddingTop: '80px' }}>
      <Box mt={4} sx={{ 
  color: '#000', // Darker text for visibility
  textAlign: 'center', 
  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
  padding: '20px', 
  borderRadius: '8px' 
}}>
  <h2>Outpass History - Approved/Rejected Applications</h2>
  {outpasses.length === 0 ? (
    <p>No approved or rejected outpass applications.</p>
  ) : (
    outpasses.map(outpass => (
      <div key={outpass._id} style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        border: '1px solid #aaa', 
        backgroundColor: 'rgba(255, 255, 255, 1)', 
        color: '#222' // Darker text for better visibility
      }}>
        <p><strong>Roll Number:</strong> {outpass.roll_number}</p>
        <p><strong>Reason:</strong> {outpass.reason}</p>
        <p><strong>Status:</strong> {outpass.status}</p>

        {students[outpass.roll_number] ? (
          <div>
            <p><strong>Student Name:</strong> {students[outpass.roll_number].name}</p>
            <p><strong>Student Roll Number:</strong> {students[outpass.roll_number].roll_number}</p>
            <p><strong>Student Email:</strong> {students[outpass.roll_number].email}</p>
            <p><strong>Student Phone Number:</strong> {students[outpass.roll_number].phone_number}</p>
          </div>
        ) : (
          <Button onClick={() => fetchStudentDetails(outpass.roll_number)} sx={{ color: '#3f51b5' }}>
            Fetch Student Details
          </Button>
        )}
      </div>
    ))
  )}
</Box>

      </Container>
    </div>
  );
};

const styles = {
  pageContainer: {
    backgroundImage: 'url("https://cdn.wallpapersafari.com/42/59/MV7c4e.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
  },
  text: {
    color: '#333', // Ensures the text is visible
  },
};

export default OutpassHistoryPage;
