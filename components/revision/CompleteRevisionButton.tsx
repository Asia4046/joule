"use client";

import Button from "@mui/material/Button";
import DoneIcon from "@mui/icons-material/Done";
import { completeRevisionAction } from "@/app/actions/data";

export default function CompleteRevisionButton({ id }: { id: string }) {
  return (
    <form action={completeRevisionAction}>
      <input type="hidden" name="id" value={id} />
      <Button size="small" variant="contained" color="success" startIcon={<DoneIcon />} type="submit">
        Mark revised
      </Button>
    </form>
  );
}
