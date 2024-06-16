import { Drawer } from "@mui/material";
import React, {FC} from "react";

interface MobileDrawerProps {
  open: boolean;
  toggleDrawer: (newOpen: boolean) => void;
}

const MobileDrawer: FC<MobileDrawerProps> = ({ open, toggleDrawer }) => {
  return (
    <Drawer anchor="left" open={open} onClose={() => toggleDrawer(false)}>
      <div
        role="presentation"
        onClick={() => toggleDrawer(false)}
        onKeyDown={() => toggleDrawer(false)}
      >
        <p>Ha, there's nothing here</p>
      </div>
    </Drawer>
  );
}

export default MobileDrawer;