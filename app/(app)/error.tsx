"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Box sx={{ py: 8, textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 420, mx: "auto" }}>
        The page failed to load. This is usually temporary — try again, or head back to the dashboard.
      </Typography>
      <Stack direction="row" spacing={1.5} justifyContent="center">
        <Button variant="contained" onClick={() => reset()}>
          Try again
        </Button>
        <Button variant="outlined" href="/dashboard">
          Dashboard
        </Button>
      </Stack>
    </Box>
  );
}
