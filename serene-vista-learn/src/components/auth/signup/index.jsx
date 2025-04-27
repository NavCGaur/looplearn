import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Button, 
  Snackbar, 
  Alert, 
  Box, 
  Typography, 
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Divider,
  Stack,
  Link,
  Input
} from "@mui/material";
import { useDispatch } from "react-redux";
import { Visibility, VisibilityOff, Google, Facebook } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import Logo from '../../../assets/neurolingvalogo.png' 
import { loginSuccess } from "../../../state/slices/authSlice";
import { useRegisterUserMutation } from "../../../state/slices/authSlice.js";

// Firebase imports
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  updateProfile
} from "firebase/auth";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerUser] = useRegisterUserMutation();
  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();

  const validateForm = () => {
    if (!fullName.trim()) {
      setSnackbarMessage("Please enter your full name");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }
    
    if (!email.trim()) {
      setSnackbarMessage("Please enter your email");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }
    
    if (password.length < 8) {
      setSnackbarMessage("Password must be at least 8 characters long");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }
    
    if (password !== confirmPassword) {
      setSnackbarMessage("Passwords do not match");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }
    
    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsRegistering(true);
    
    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with full name
      await updateProfile(user, {
        displayName: fullName
      });
      
      // Send verification email
      await sendEmailVerification(user);
      
      // Get ID token
      const idToken = await user.getIdToken();
      
      // Register user in backend
      await registerUser({
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        token: idToken
      }).unwrap();
      
      // Save token and dispatch login
      localStorage.setItem("token", idToken);
      dispatch(loginSuccess({ 
        token: idToken, 
        user: { 
          email: user.email, 
          displayName: fullName,
          role: "User" // Default role - backend will verify
        } 
      }));
      
      setSnackbarMessage("Account created successfully! Verification email sent.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      
      // Navigate to appropriate page (user dashboard)
      setTimeout(() => {
        navigate("/service/users");
      }, 1500);
      
    } catch (error) {
      console.error("Sign up error:", error);
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email already in use. Please use a different email or sign in.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please use a stronger password.";
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      // Register user in backend
      await registerUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        token: idToken
      }).unwrap();
      
      // Save token and dispatch login
      localStorage.setItem("token", idToken);
      dispatch(loginSuccess({ 
        token: idToken, 
        user: { 
          email: user.email, 
          displayName: user.displayName,
          role: "User" // Default role - backend will verify
        } 
      }));
      
      setSnackbarMessage("Account created successfully with Google!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      
      setTimeout(() => {
        navigate("/service/users");
      }, 1000);
    } catch (error) {
      console.error("Google sign up error:", error);
      setSnackbarMessage("Google sign up failed. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    setIsFacebookLoading(true);
    try {
      // Sign in with Facebook
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      // Register user in backend
      await registerUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        token: idToken
      }).unwrap();
      
      // Save token and dispatch login
      localStorage.setItem("token", idToken);
      dispatch(loginSuccess({ 
        token: idToken, 
        user: { 
          email: user.email, 
          displayName: user.displayName,
          role: "User" // Default role - backend will verify
        } 
      }));
      
      setSnackbarMessage("Account created successfully with Facebook!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      
      setTimeout(() => {
        navigate("/service/users");
      }, 1000);
    } catch (error) {
      console.error("Facebook sign up error:", error);
      setSnackbarMessage("Facebook sign up failed. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsFacebookLoading(false);
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
        background: "linear-gradient(135deg,#1E91FF, #EDF9FF)",       
        padding: 2
      }}
    >
      <Paper
        elevation={12}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          mt: 3,
          mb: 3,
          width: "100%",
          maxWidth: "450px",
          minHeight: "650px",
          borderRadius: 3,
          backdropFilter: "blur(16px)",
          backgroundColor: "#176DC2",
          border: "1px solid rgba(255, 255, 255, 0.125)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: "0 12px 40px 0 rgba(31, 38, 135, 0.47)",
          }
        }}
      >

         <Box display="flex" alignItems="center" justifyContent="center" mb={3}> 
                   <img src={Logo} alt="logo" style={{ width: "50px", height: "50px" }} /> 
                </Box>
        
                <Box>
                  <Link href="/" style={{ textDecoration: "none" }}>
                    <HomeIcon
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        width: "30px",
                        height: "30px",
                        color: "white",
                        cursor: "pointer"
                      }}
                    />
                  </Link>
                </Box>
        
        <Typography 
          variant="h4" 
          component="h1"
          textAlign="center"
          fontWeight="bold"
          mb={3}
          sx={{
            background: "linear-gradient(90deg, #60efff, #00ff87)",
            backgroundClip: "text",
            textFillColor: "transparent",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          LinguaLearn
        </Typography>
  
        <Typography 
          variant="h6"  
          component="h2"
          textAlign="center"
          mb={4}
          sx={{ color: "rgba(255, 255, 255, 0.7)" }}
        >
          Create a new account
        </Typography>
  
        <Box 
          component="form" 
          onSubmit={handleSignUp}
          sx={{
            '& .MuiFormControl-root': { mb: 2 },
            '& .MuiButton-root': { mt: 2 },
          }}
        >
          <FormControl fullWidth required>
            <InputLabel htmlFor="fullName" sx={{
              fontSize: '0.85rem',
              color: "rgba(255, 255, 255, 0.7)",
            }}>
              Full Name
            </InputLabel>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              disableUnderline
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.07)",
                color: "#ffffff !important",
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: '0.95rem',
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
                '&:hover': {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                },
                '&:focus': {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 0 0 2px rgba(96, 239, 255, 0.2)"
                }
              }}
            />
          </FormControl>
  
          <FormControl fullWidth required>
            <InputLabel htmlFor="email" sx={{
              fontSize: '0.85rem',
              color: "rgba(255, 255, 255, 0.7)",
            }}>
              Email
            </InputLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disableUnderline
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.07)",
                color: "#ffffff !important",
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: '0.95rem',
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
                '&:hover': {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                },
                '&:focus': {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 0 0 2px rgba(96, 239, 255, 0.2)"
                }
              }}
            />
          </FormControl>
  
          <FormControl fullWidth required>
            <InputLabel htmlFor="password" sx={{
              fontSize: '0.85rem',
              color: "rgba(255, 255, 255, 0.7)",
            }}>
              Password
            </InputLabel>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disableUnderline
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.07)",
                color: "#ffffff",
                padding: "12px 16px",
                fontSize: '0.95rem',
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
                '&:hover': {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                },
                '&:focus': {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 0 0 2px rgba(96, 239, 255, 0.2)"
                }
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
  
          <FormControl fullWidth required>
            <InputLabel htmlFor="confirmPassword" sx={{
              fontSize: '0.85rem',
              color: "rgba(255, 255, 255, 0.7)",
            }}>
              Confirm Password
            </InputLabel>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disableUnderline
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.07)",
                color: "#ffffff",
                padding: "12px 16px",
                fontSize: '0.95rem',
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
                '&:hover': {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                },
                '&:focus': {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 0 0 2px rgba(96, 239, 255, 0.2)"
                }
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
  
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isRegistering}
            sx={{
              py: 1.5,
              position: 'relative',
              background: "linear-gradient(90deg, #60efff, #00ff87)",
              color: "#111827",
              fontWeight: "bold",
              borderRadius: "10px",
              '&:hover': {
                background: "linear-gradient(90deg, #60efff, #00ff87)",
                boxShadow: "0 10px 20px rgba(0, 255, 135, 0.3)",
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: "rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.4)"
              },
              transition: 'all 0.3s ease',
            }}
          >
            {isRegistering ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign Up"
            )}
          </Button>
  
          <Box sx={{ my: 2 }}>
            <Divider sx={{ 
              "&::before, &::after": {
                borderColor: "rgba(255, 255, 255, 0.2)",
              }
            }}>
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                OR
              </Typography>
            </Divider>
          </Box>
  
          <Stack spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Google />}
              disabled={isGoogleLoading}
              onClick={handleGoogleSignUp}
              sx={{
                py: 1.5,
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#fff",
                boxShadow: "none",
                '&:hover': {
                  background: "rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease"
              }}
            >
              {isGoogleLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign up with Google"
              )}
            </Button>
  
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Facebook />}
              disabled={isFacebookLoading}
              onClick={handleFacebookSignUp}
              sx={{
                py: 1.5,
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#fff",
                boxShadow: "none",
                '&:hover': {
                  background: "rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease"
              }}
            >
              {isFacebookLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign up with Facebook"
              )}
            </Button>
          </Stack>
  
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", letterSpacing: '0.5px' }}>
              Already have an account?{' '}
              <Typography
                component="span"
                variant="body2"
                sx={{ 
                  cursor: 'pointer', 
                  fontSize: '0.95rem',
                  fontWeight: "medium",
                  color: "#60efff",
                  transition: "color 0.2s ease",
                  '&:hover': { 
                    textDecoration: 'underline',
                    color: "#00ff87"
                  }
                }}
                onClick={navigateToLogin}
              >
                Login
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Paper>
  
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ 
            width: "100%",
            backdropFilter: "blur(10px)",
            backgroundColor: snackbarSeverity === "success" 
              ? "rgba(46, 125, 50, 0.9)"
              : "rgba(211, 47, 47, 0.9)",
            borderRadius: "10px"
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SignUp;