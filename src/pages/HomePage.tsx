import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box, useTheme } from "@mui/material";
import IndexedDB from "../indexedDB";
import { User } from "../types";

interface HomePageProps {
  db: IndexedDB | null;
}

const HomePage: React.FC<HomePageProps> = ({ db }) => {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const fetchUsers = async () => {
        // Grab all users from the database
        if (!db) return;
        const users = await db.getAllUsers();
        setUsers(users);
      };
      fetchUsers();
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [db]);

  const handleUserClick = (userId: number) => {
    navigate(`/user/${userId}`);
  };

  const backgroundColor = useTheme().palette.secondary.main;
  return (
    <Box alignContent="center" height={"100vh"} sx={{ backgroundColor: backgroundColor }}>
      <Typography variant="h2" align="center" sx={{ marginBottom: "8px" }}>
        Select User to Log In
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        {users.map((user) => (
          <Button
            key={user.id}
            variant="contained"
            onClick={() => handleUserClick(user.id!)}
            sx={{ marginBottom: "8px" }}
          >
            User {user.id} - {user.role}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default HomePage;
