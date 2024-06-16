import React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import HenryIcon from "../icons/HenryIcon";
import MobileDrawer from "./MobileDrawer";
import { useNavigate } from "react-router-dom";

interface MobileHeaderProps {
  handleDeleteAndReinitializeDB: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  handleDeleteAndReinitializeDB,
}) => {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const toggleDrawer = (newOpen: boolean) => {
    console.log("toggleDrawer", newOpen);
    setOpen(newOpen);
  };

  const handleSwitchUser = () => {
    navigate(`/`);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "center" }}>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
            toggleDrawer(true)
          }
        >
          <MenuIcon />
        </IconButton>
        <MobileDrawer open={open} toggleDrawer={toggleDrawer} />
        <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
          <HenryIcon style={{ fontSize: 54 }} />
        </Box>

        <div>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleSwitchUser}>Switch User</MenuItem>
            <MenuItem onClick={handleDeleteAndReinitializeDB}>
              Delete DB
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default MobileHeader;
