import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Button, 
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from "@mui/material";
import { 
  AccountCircle, 
  ExitToApp, 
  Settings, 
  KeyboardArrowDown 
} from '@mui/icons-material';
import { useDispatch } from "react-redux";
import { logout } from "../../../state/slices/authSlice.js";

// Firebase imports
import { getAuth, signOut } from "firebase/auth";

const LogoutComponent = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = getAuth();

  const handleMenuOpen = (event) => {
    // Stop propagation to prevent event bubbling
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate("/profile");
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate("/settings");
  };

  const handleLogout = async () => {
    handleMenuClose();
    
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear local storage and Redux state
      localStorage.removeItem("token");
      dispatch(logout());
      
      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still try to clear local state even if Firebase logout fails
      localStorage.removeItem("token");
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <>
      <Button
        color="inherit"
        onClick={handleMenuOpen}
        endIcon={
          <KeyboardArrowDown 
            onClick={(e) => {
              // Prevent any interference from icon click
              e.stopPropagation();
              handleMenuOpen(e);
            }} 
          />
        }
        startIcon={<AccountCircle />}
        sx={{ 
          textTransform: 'none',
          fontWeight: 'medium' 
        }}
      >
        Account
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        // Close menu only when clicking outside
        disableRestoreFocus
        keepMounted
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
        </MenuItem>
      </Menu>
    </>
  );
};

export default LogoutComponent;