import React, { useState, useEffect } from "react";
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
  Checkbox, 
  FormControlLabel,
  Input,
  Link
} from "@mui/material";
import { useDispatch } from "react-redux";
import { Visibility, VisibilityOff, Google, Facebook } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import Logo from '../../../assets/neurolingvalogo.png' 
import { loginSuccess, logout  } from "../../../state/slices/authSlice.ts";
import { useVerifyTokenMutation } from "../../../state/api/auth.ts";

// Firebase authentication imports
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signOut,
  OAuthProvider,
  onAuthStateChanged,
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence
} from "firebase/auth";

/**
 * Login Component - Handles user authentication including:
 * - Google OAuth
 * - Token verification
 * - Navigation based on user role
 */
const Login = () => {
  // State management for form inputs and UI
  // Commented out email/password states since we're not using them
  // const [email, setEmail] = useState(""); // Stores email input
  // const [password, setPassword] = useState(""); // Stores password input
  // const [showPassword, setShowPassword] = useState(false); // Toggles password visibility
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Controls snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message content
  const [snackbarSeverity, setSnackbarSeverity] = useState("info"); // Snackbar severity level
  // Commented out unused loading states
  // const [isAuthLoading, setIsAuthLoading] = useState(false); // Loading state for email/password auth
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // Loading state for Google auth
  // const [isFacebookLoading, setIsFacebookLoading] = useState(false); // Loading state for Facebook auth
  const [rememberMe, setRememberMe] = useState(false);

  // Hooks for navigation, state management, and theming
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [verifyToken, { isLoading: isVerifyingToken }] = useVerifyTokenMutation();
  
  // Firebase authentication setup
  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider(); // Google auth provider
  // const facebookProvider = new FacebookAuthProvider(); // Facebook auth provider (commented out)

  /**
   * Effect hook to check if user is already authenticated
   * Runs on component mount and when auth object changes
   */
  useEffect(() => {
    console.log("Checking if user is already logged in...");
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User detected:", user);
        try {
          const idToken = await user.getIdToken();
          console.log("ID Token retrieved:", idToken);
          await handleTokenVerification(idToken, user);
        } catch (error) {
          console.error("Error verifying existing auth:", error);
        }
      } else {
        console.log("No user is currently logged in.");
      }
    });

    // Cleanup function to unsubscribe from auth state changes
    return () => unsubscribe();
  }, [auth]);

  /**
   * Handles token verification with backend API
   * @param {string} token - Firebase ID token
   * @param {object} firebaseUser - Firebase user object
   * @returns {boolean} - Returns true if verification succeeds
   */
  const handleTokenVerification = async (token, firebaseUser) => {
    console.log("Verifying token with backend...");
    try {
      // Call verifyToken mutation from Redux Toolkit Query
      const response = await verifyToken({ token }).unwrap();
      console.log("Token verification response:", response);
      const { user } = response.data;

      // Store token in localStorage for persistence
      localStorage.setItem("token", token);
      console.log("Token stored in localStorage.");

      // Dispatch login success action to Redux store
      dispatch(loginSuccess({ token, user: { ...user, email: firebaseUser.email } }));
      console.log("Login success dispatched with user:", user);

      // Navigate based on user role
      let rolePath = "/";
      switch (user.role) {
        case "Admin":
          rolePath = "/admin/dashboard";
          break;
        case "Subscriber":
          rolePath = "/subscriber/dashboard";
          break;
        case "Guest":
          rolePath = "/guest/dashboard/spaced";
          break;
      }

      console.log(`Navigating to ${rolePath}...`);
      navigate(rolePath);

      return true;
    } catch (error) {
      console.error("Token verification failed:", error);
      setSnackbarMessage("Authentication failed. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }
  };

  /*
   * Commented out email/password login handler since we're not using it
   * 
  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    console.log("Attempting email/password login...");
    setIsAuthLoading(true);

    try {
      // Firebase email/password authentication
         // Set persistence based on rememberMe selection
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      console.log("User credential:", user);


      if (!user.emailVerified) {
        console.log("User email not verified. Logging out...");

        // 1. Sign out from Firebase
        await signOut(auth);

        // 2. Clear Redux state
        dispatch(logout());

        // 3. Show message + redirect
        setSnackbarMessage("Please verify your email before logging in.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        navigate("/verifyemail");
        return;
      }


      console.log("Firebase login successful:", userCredential);
      const idToken = await userCredential.user.getIdToken();
      console.log("ID Token retrieved:", idToken);

      // Show verification in progress message
      setSnackbarMessage("Login successful! Verifying...");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Verify token with backend
      const success = await handleTokenVerification(idToken, userCredential.user);

      if (success) {
        console.log("Login verification successful.");
        setSnackbarMessage("Login successful! Redirecting...");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";

      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later.";
      }

      console.log("Error message:", errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      console.log("Email/password login process completed.");
      setIsAuthLoading(false);
    }
  };
  */

  /**
   * Handles Google OAuth sign-in
   */
  const handleGoogleSignIn = async () => {
    console.log("Attempting Google sign-in...");
    setIsGoogleLoading(true);
    try {
      // Firebase Google sign-in with popup
      // Set persistence based on rememberMe selection
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;

      console.log("User credential:", user);
      if (!user.emailVerified) {
        console.log("User email not verified. Logging out...");

        // 1. Sign out from Firebase
        await signOut(auth);

        // 2. Clear Redux state
        dispatch(logout());

        // 3. Show message + redirect
        setSnackbarMessage("Please verify your email before logging in.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        navigate("/verifyemail");
        return;
      }

      console.log("Google sign-in successful:", result);
      const idToken = await result.user.getIdToken();
      console.log("ID Token retrieved:", idToken);

      setSnackbarMessage("Google sign-in successful! Verifying...");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Verify token with backend
      await handleTokenVerification(idToken, result.user);
    } catch (error) {
      console.error("Google sign-in error:", error);
      console.log("Error message:", error.message);
      setSnackbarMessage("Google sign-in failed. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      console.log("Google sign-in process completed.");
      setIsGoogleLoading(false);
    }
  };

  /*
   * Commented out Facebook login handler since we're not using it
   * 
  const handleFacebookSignIn = async () => {
    console.log("Attempting Facebook sign-in...");
    setIsFacebookLoading(true);
    try {
      // Firebase Facebook sign-in with popup
       // Set persistence based on rememberMe selection
       await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const result = await signInWithPopup(auth, facebookProvider);

      const user = result.user;

    
      if (!user.emailVerified) {
        console.log("User email not verified. Logging out...");

        // 1. Sign out from Firebase
        await signOut(auth);

        // 2. Clear Redux state
        dispatch(logout());

        // 3. Show message + redirect
        setSnackbarMessage("Please verify your email before logging in.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        navigate("/verifyemail");
        return;
      }

      console.log("Facebook sign-in successful:", result);
      const idToken = await result.user.getIdToken();
      console.log("ID Token retrieved:", idToken);

      setSnackbarMessage("Facebook sign-in successful! Verifying...");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Verify token with backend
      await handleTokenVerification(idToken, result.user);
    } catch (error) {
      console.error("Facebook sign-in error:", error);
      setSnackbarMessage("Facebook sign-in failed. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      console.log("Facebook sign-in process completed.");
      setIsFacebookLoading(false);
    }
  };
  */

  /**
   * Navigates to sign-up page
   */
  const navigateToSignUp = () => {
    navigate("/signup");
  };

  /*
   * Commented out forgot password navigation since we're not using email/password login
   * 
  const navigateToForgotPassword = () => {
    navigate("/forgot-password");
  };
  */

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        minHeight: "100vh",
        width: "100%",
        padding: 2
      }}
      className="bg-gradient-to-br from-blue-50 to-blue-100"
    >
      {/* Main login card */}
      <Paper
        elevation={12}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          mt: 3,
          mb: 3,
          width: "100%",
          maxWidth: "450px",
          minHeight: "450px",
          height: "auto",
          borderRadius: 3,
          backdropFilter: "blur(16px)",
          backgroundColor: "#176DC2",
          border: "1px solid rgba(255, 255, 255, 0.125)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: "0 12px 40px 0 rgba(31, 38, 135, 0.47)",
          },
          position: "relative",
        }}
      >
        
        {/* Login form title */}

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
          LoopLearn
        </Typography>
  
        {/* Social login buttons */}
        <Box display="flex" justifyContent="space-around" mb="2rem" mt="4rem">
          {/* Google login button */}
          <Button
            variant="contained"
            startIcon={<Google />}
            disabled={isGoogleLoading}
            onClick={handleGoogleSignIn}
            sx={{
              py: 2,
              fontSize: '0.75rem',
              width: '70%',
              textWrap: 'nowrap',
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
              "Login with Google"
            )}
          </Button>
        </Box>
  
        {/* Divider for social login options 
        
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
  
        
        
        */}
        
        {/* 
         * Commented out the email/password form since we're not using it
         * 
        <Box
          component="form"
          onSubmit={handleEmailPasswordLogin}
          sx={{
            '& .MuiFormControl-root': { mb: 2 },
            '& .MuiButton-root': { mt: 2 },
          }}
        >
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
  
          <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1, mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: "rgba(255, 255, 255, 0.5)",
                    '&.Mui-checked': {
                      color: "#60efff",
                    },
                    "& .MuiSvgIcon-root": {
                      fontSize: 20,
                    },
                  }}
                />
              }
              label={<Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Remember Me</Typography>}
            />
  
            <Typography
              variant="body2"
              sx={{
                cursor: 'pointer',
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: '.8rem',
                letterSpacing: '0.5px',
                textAlign: 'right',
                transition: "color 0.2s ease",
                '&:hover': { 
                  color: "#60efff",
                  textDecoration: 'underline' 
                }
              }}
              onClick={navigateToForgotPassword}
            >
              Forgot Password?
            </Typography>
          </Box>
  
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isAuthLoading || isVerifyingToken}
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
            {isAuthLoading || isVerifyingToken ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Login"
            )}
          </Button>
  
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", letterSpacing: '0.5px' }}>
              Don't have an account?{' '}
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
                onClick={navigateToSignUp}
              >
                Sign up
              </Typography>
            </Typography>
          </Box>
        </Box>
        */}
      </Paper>
  
      {/* Snackbar for showing notifications/alerts */}
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

export default Login;