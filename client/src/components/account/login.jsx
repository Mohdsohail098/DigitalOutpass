import React, { useState } from 'react';
import { Container, CssBaseline, Typography, TextField, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from './usercontext';

function LoginPage() {
  const [username, setUsername] = useState(''); // User's ID (roll number/employee ID)
  const [password, setPassword] = useState(''); // Password
  const { setUser } = useUser(); // Set user in context
  const navigate = useNavigate(); // Navigation after successful login

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!username || !password) {
      alert('Username and password are required');
      return;
    }

    try {
      let response;

      // Determine if the user is a student, teacher, or security officer based on ID pattern
      const isStudent = username.startsWith('2'); // Assuming student roll numbers start with '2'
      const isSecurityOfficer = username.startsWith('S'); // Assuming security officer IDs start with 'S'

      // Send login request based on user type
      if (isStudent) {
        response = await axios.post('http://localhost:5000/api/Student', {
          roll_number: username,
          password,
        });
      } else if (isSecurityOfficer) {
        response = await axios.post('http://localhost:5000/api/Security', {
          roll_number: username,
          password,
        });
      }
      else {
        response = await axios.post('http://localhost:5000/api/Teacher', {
          roll_number: username,
          password,
        });
      }

      console.log('Login response:', response.data);
      const { token, role, roll_number } = response.data; // ✅ Extract roll_number

      localStorage.setItem('token', token); 
      localStorage.setItem('role', role);
      localStorage.setItem('roll_number', roll_number); // ✅ Store roll_number
      
      setUser({ rollNumber: roll_number, role }); // ✅ Use roll_number instead of username
       // Set user role in context

      // Redirect based on the role
      if (role === 'student') {
        navigate('/student'); // Redirect to student page
      } else if (role === 'teacher') {
        navigate('/teacherhome'); // Redirect to teacher page
      } else if (role === 'security') {
        navigate('/securitydashboard'); // Redirect to security officer dashboard
      } else {
        alert('Invalid role');
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response) {
        alert(error.response.data.message); // Show backend error message
      } else {
        alert('Error: ' + error.message);
      }
    }
  };

  return (
    <div style={styles.background}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div style={styles.paper}>
          <Typography component="h1" variant="h5" style={styles.welcomeText}>
            WELCOME - VNRVJIET
          </Typography>
          <form style={styles.form} noValidate onSubmit={handleLogin}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="User Name (Roll Number or Employee ID)"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              style={styles.submit}
            >
              Log In
            </Button>
          </form>
        </div>
        <Box mt={8}>
          <Typography variant="body2" color="textSecondary" align="center">
            {'© '}
            <Link color="inherit" href="https://material-ui.com/">
              Your Website
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Box>
      </Container>
    </div>
  );
}

const styles = {
  background: {
    backgroundImage: 'url(https://media.istockphoto.com/id/1501103626/photo/defocused-background-image-of-a-spacious-hallway-in-a-modern-office.webp?b=1&s=170667a&w=0&k=20&c=3HUg5TdHHWq4rmYJ7lA0Jn9koAesfCrO4lFiEaUFKuI=)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
  welcomeText: {
    marginBottom: 16,
  },
  form: {
    width: '100%',
    marginTop: 8,
  },
  submit: {
    marginTop: 24,
    marginBottom: 16,
  },
};

export default LoginPage;
