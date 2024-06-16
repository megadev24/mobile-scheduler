import { Box, Drawer } from "@mui/material";
import React, { FC } from "react";

interface MobileDrawerProps {
  open: boolean;
  toggleDrawer: (newOpen: boolean) => void;
}

const MobileDrawer: FC<MobileDrawerProps> = ({ open, toggleDrawer }) => {
  return (
    <Drawer anchor="left" open={open} onClose={() => toggleDrawer(false)}>
      <Box
        p={2}
        role="presentation"
        onClick={() => toggleDrawer(false)}
        onKeyDown={() => toggleDrawer(false)}
      >
        <p>Ha, there's nothing here</p>
      </Box>
    </Drawer>
  );
};

export default MobileDrawer;
