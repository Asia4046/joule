import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

export default function AppLoading() {
  return (
    <Box role="status" aria-label="Loading page content">
      <Skeleton variant="text" width={280} height={44} />
      <Skeleton variant="text" width={200} height={24} sx={{ mb: 3 }} />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={88} />
        ))}
      </Box>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ flex: 1.2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ flex: 1 }} />
      </Stack>
      <Skeleton variant="rectangular" height={260} sx={{ mb: 3 }} />
      <Skeleton variant="rectangular" height={160} />
    </Box>
  );
}
