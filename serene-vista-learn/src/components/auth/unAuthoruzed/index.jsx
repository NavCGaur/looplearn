import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const UnAuthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      textAlign="center"
      bgcolor="#1e293b" // Dark background
      color="white"
    >
      <LockOutlinedIcon sx={{ fontSize: 80, color: "#f44336", mb: 2 }} /> 
      <Typography variant="h3" fontWeight="bold">
        403 - Access Denied
      </Typography>
      <Typography variant="body1" mt={2} mb={4}>
        You do not have permission to view this page. If you believe this is an error, please contact support.
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

export default UnAuthorized;
