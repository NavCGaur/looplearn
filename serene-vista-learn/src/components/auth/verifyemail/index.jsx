import React from "react";
import { Box, Typography, Button } from "@mui/material";
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      textAlign="center"
      bgcolor="#1e293b"
      color="white"
      px={2}
    >
      <MarkEmailUnreadOutlinedIcon sx={{ fontSize: 80, color: "#fbc02d", mb: 2 }} />
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Please Verify Your Email
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        We've sent a verification link to your registered email address.
        <br />
        Please check your inbox and click the link to activate your account.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/login")}
        sx={{ padding: "10px 20px", fontSize: "1rem" }}
      >
        Back to Login
      </Button>
    </Box>
  );
};

export default VerifyEmail;
