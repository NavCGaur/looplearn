import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Button, 
  Snackbar, 
  Alert, 
  Box, 
  Typography, 
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Input,
  MenuItem,
  Select,
  Link
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import HomeIcon from '@mui/icons-material/Home';
import Logo from '../../../assets/neurolingvalogo.png';
import { loginSuccess } from "../../../state/slices/authSlice.ts";

/**
 * Onboarding Component - Collects user's name and class information
 */
const Onboarding = () => {
  const [displayName, setDisplayName] = useState("");
  const [classStandard, setClassStandard] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const user = auth?.user;
  const tokenFromRedux = auth?.token;

  // Class options from 1-12
  const classOptions = Array.from({ length: 12 }, (_, i) => ({
    value: `class-${i + 1}`,
    label: `Class ${i + 1}`
  }));

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem("token") || tokenFromRedux;
    if (!token || !user) {
      setSnackbarMessage("Please log in to access this page.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }
  }, [tokenFromRedux, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setSnackbarMessage("Please enter your name");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (!classStandard) {
      setSnackbarMessage("Please select your class");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the token from localStorage or Redux state
      const token = localStorage.getItem("token") || tokenFromRedux;
      
      if (!token) {
        setSnackbarMessage("Authentication token not found. Please log in again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        
        // Redirect to login after showing error
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      // Update user profile with onboarding data
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/users/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName: displayName.trim(),
          classStandard
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();

      // Update Redux store with new user data
      const updatedUser = {
        ...user,
        displayName: displayName.trim(),
        classStandard
      };

      dispatch(loginSuccess({ 
        token,
        user: updatedUser
      }));

      setSnackbarMessage("Profile updated successfully! Redirecting...");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        switch (user.role) {
          case "Admin":
            navigate("/admin/dashboard");
            break;
          case "Subscriber":
            navigate("/subscriber/dashboard");
            break;
          case "Guest":
          default:
            navigate("/guest/dashboard/spaced");
            break;
        }
      }, 1500);

    } catch (error) {
      console.error("Onboarding error:", error);
      setSnackbarMessage(error.message || "Failed to update profile. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
        padding: { xs: 2, sm: 4 },
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative accent */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: { xs: 220, sm: 360 },
          height: { xs: 220, sm: 360 },
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.12), transparent 30%), radial-gradient(circle at 70% 70%, rgba(99,102,241,0.08), transparent 40%)',
          filter: 'blur(24px)',
          top: -60,
          right: -80,
          transform: 'rotate(10deg)',
          pointerEvents: 'none'
        }}
      />

      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          mx: 'auto',
          width: '100%',
          maxWidth: '520px',
          minHeight: { xs: '420px', sm: '480px' },
          borderRadius: 4,
          backgroundColor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(226,232,240,0.6)',
          boxShadow: '0 12px 40px rgba(16,24,40,0.08)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'stretch'
        }}
      >
        {/* Logo */}
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}> 
          <img src={Logo} alt="logo" style={{ width: 56, height: 56, borderRadius: 8, boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }} /> 
        </Box>

        {/* Home Icon */}
        <Box>
          <Link href="/" style={{ textDecoration: "none" }}>
            <HomeIcon
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                width: "30px",
                height: "30px",
                color: "#64748B",
                cursor: "pointer"
              }}
            />
          </Link>
        </Box>

        {/* Title */}
        <Typography 
          variant="h4" 
          component="h1"
          textAlign="center"
          fontWeight="700"
          mb={1}
          sx={{
            background: "linear-gradient(90deg, #3B82F6, #1E40AF)",
            backgroundClip: "text",
            textFillColor: "transparent",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: '-0.02em'
          }}
        >
          Welcome to LoopLearn
        </Typography>

        <Typography 
          variant="subtitle1"  
          component="h2"
          textAlign="center"
          mb={3}
          sx={{ color: "#64748B" }}
        >
          Let's set up your profile
        </Typography>

        {/* Onboarding Form */}
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{
            '& .MuiFormControl-root': { mb: 3 },
            '& .MuiButton-root': { mt: 2 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch'
          }}
        >
          {/* Name Field */}
          <FormControl fullWidth required>
            <InputLabel htmlFor="displayName" sx={{
              fontSize: '0.9rem',
              color: "#64748B",
            }}>
              Your Name
            </InputLabel>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your full name"
              disableUnderline
              sx={{
                backgroundColor: "#F8FAFC",
                color: "#1E293B",
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: '0.95rem',
                border: "2px solid #E2E8F0",
                transition: "all 0.3s ease",
                '&:hover': {
                  backgroundColor: "#F1F5F9",
                  border: "2px solid #CBD5E1",
                },
                '&:focus': {
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #3B82F6",
                  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
                }
              }}
            />
          </FormControl>

          {/* Class Selection */}
          <FormControl fullWidth required>
            <InputLabel 
              htmlFor="classStandard" 
              sx={{
                fontSize: '0.9rem',
                color: "#64748B",
                top: '-6px', // Adjust label position for Select
                '&.Mui-focused': {
                  color: "#3B82F6",
                }
              }}
            >
            </InputLabel>
            <Select
              id="classStandard"
              value={classStandard}
              onChange={(e) => setClassStandard(e.target.value)}
              displayEmpty
              sx={{
                backgroundColor: "#F8FAFC",
                color: "#1E293B",
                borderRadius: "10px",
                fontSize: '0.95rem',
                minHeight: '48px', // Ensure consistent height
                '& .MuiOutlinedInput-notchedOutline': {
                  border: '2px solid #E2E8F0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: '2px solid #CBD5E1',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: '2px solid #3B82F6',
                },
                '& .MuiSelect-select': {
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                }
              }}
            >
              <MenuItem value="" disabled sx={{ color: "#64748B" }}>
                <em>Select Your Class</em>
              </MenuItem>
              {classOptions.map((option) => (
                <MenuItem 
                  key={option.value} 
                  value={option.value}
                  sx={{
                    fontSize: '0.95rem',
                    color: "#1E293B",
                    '&:hover': {
                      backgroundColor: "#F1F5F9"
                    },
                    '&.Mui-selected': {
                      backgroundColor: "#EBF4FF",
                      color: "#3B82F6",
                      '&:hover': {
                        backgroundColor: "#DBEAFE"
                      }
                    }
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: "600",
              borderRadius: "10px",
              background: "linear-gradient(90deg, #3B82F6, #1E40AF)",
              color: "#FFFFFF",
              textTransform: 'none',
              '&:hover': {
                background: "linear-gradient(90deg, #2563EB, #1D4ED8)",
                transform: 'translateY(-2px)',
                boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)",
              },
              '&:disabled': {
                background: "#CBD5E1",
                color: "#64748B",
                transform: 'none',
                boxShadow: 'none'
              },
              transition: 'all 0.3s ease',
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Complete Setup"
            )}
          </Button>

          {/* Info Text */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "#64748B", 
                fontSize: '0.85rem',
                lineHeight: 1.5
              }}
            >
              This information helps us personalize your learning experience and provide content appropriate for your level.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
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
              ? "rgba(34, 197, 94, 0.9)"
              : "rgba(239, 68, 68, 0.9)",
            borderRadius: "10px"
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Onboarding;
