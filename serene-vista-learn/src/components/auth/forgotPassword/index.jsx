import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Button, 
  Snackbar, 
  Alert, 
  Box, 
  Typography, 
  useTheme,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  OutlinedInput
} from "@mui/material";
import ServiceNavbar from "../../serviceForms/ServiceNavbar";

// Firebase imports
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const auth = getAuth();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setSnackbarMessage("Please enter your email address");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      
      setSnackbarMessage("Password reset email sent! Check your inbox.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      
      // After successful reset email, wait a bit then redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error) {
      console.error("Reset password error:", error);
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many requests. Please try again later.";
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigate("/login");
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.primary.main,
        padding: { xs: 2, sm: 4 },
        height: "100%",
      }}
    >
      <ServiceNavbar />

      <Paper
        elevation={12}
        sx={{
          p: { xs: 3, sm: 6 },
          width: "100%",
          maxWidth: "450px",
          minHeight: "400px",
          borderRadius: 2,
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.primary.dark
            : '#ffffff',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.01)'
          }
        }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          textAlign="center"
          fontWeight="bold"
          mb={4}
          color={theme.palette.primary.alt}
        >
          MD ASSOCIATES
        </Typography>

        <Typography 
          variant="h6" 
          component="h2"
          textAlign="center"
          mb={4}
          color={theme.palette.text.secondary}
        >
          Reset Your Password
        </Typography>

        <Typography 
          variant="body2" 
          textAlign="center"
          mb={4}
          color={theme.palette.text.secondary}
        >
          Enter your email address and we'll send you a link to reset your password.
        </Typography>

        <Box 
          component="form" 
          onSubmit={handleResetPassword}
          sx={{
            '& .MuiFormControl-root': { mb: 3 },
            '& .MuiButton-root': { mt: 2 },
          }}
        >
          <FormControl variant="outlined" fullWidth required>
            <InputLabel htmlFor="email" shrink>Email</InputLabel>
            <OutlinedInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              sx={{
                backgroundColor: theme.palette.background.paper,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              py: 1.5,
              position: 'relative',
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'translateY(-1px)',
              },
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Send Reset Link"
            )}
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              <Typography
                component="span"
                variant="body2"
                sx={{ 
                  cursor: 'pointer', 
                  color: theme.palette.primary.main,
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={navigateToLogin}
              >
                Back to Login
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ForgotPassword;