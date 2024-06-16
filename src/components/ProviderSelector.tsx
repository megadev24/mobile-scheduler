import React, { useState, useEffect } from "react";
import IndexedDB from "../indexedDB";
import { Autocomplete, FormControl, TextField } from "@mui/material";
import { Box, Typography } from "@mui/material";
import { User } from "../types";

interface ProviderSelectorProps {
  db: IndexedDB;
  selectedProvider: User | null;
  setSelectedProvider: (provider: User | null) => void;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  db,
  selectedProvider,
  setSelectedProvider,
}) => {
  const [providers, setProviders] = useState<User[]>([]);

  // Grab all of the providers from the database
  useEffect(() => {
    const fetchProviders = async () => {
      if (!db) return;
      try {
        console.log("Fetching providers");
        const queriedProviders = await db.getUsersByRole("provider");
        console.log("Providers:", queriedProviders);
        setProviders(queriedProviders);
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    };
    fetchProviders();
  }, [db]);

  const handleChange = (_: any, value: User | null) => {
    setSelectedProvider(value);
  };

  return (
    <Box display="flex" flexDirection="column" mt={2}>
      <Typography variant="h2">Select a Provider</Typography>
      <FormControl fullWidth sx={{ marginTop: "8px" }}>
        <Autocomplete
          id="provider-autocomplete"
          options={providers}
          value={selectedProvider}
          getOptionLabel={(option) => String(option.name)}
          onChange={handleChange}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Provider"
              variant="outlined"
              fullWidth
            />
          )}
        />
      </FormControl>
    </Box>
  );
};

export default ProviderSelector;
