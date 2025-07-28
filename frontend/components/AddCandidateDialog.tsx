import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormHelperText,
} from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  position: string;
}

export default function AddCandidateDialog({ open, onClose, onAdded, position }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('Male');
  const [resume, setResume] = useState<File | null>(null);
  const [mobileError, setMobileError] = useState('');

  const handleSubmit = async () => {
    if (!/^0\d{10}$/.test(mobile)) {
      setMobileError('Mobile must start with 0 and be 11 digits');
      return;
    }
    setMobileError('');
    const form = new FormData();
    form.append('name', name || '');
    form.append('mobile', mobile || '');
    form.append('gender', gender || '');
    form.append('position_type', position);
    if (resume) {
      form.append('resume', resume);
    }
    const res = await fetch('http://localhost:5000/api/candidates', {
      method: 'POST',
      body: form,
    });
    const data = await res.json();
    setName('');
    setMobile('');
    setGender('Male');
    setResume(null);
    onAdded();
    onClose();
    if (data?.id) {
      router.push(`/edit/${data.id}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Candidate</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          fullWidth
          error={!!mobileError}
          helperText={mobileError}
        />
        <TextField
          select
          label="Gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          fullWidth
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
        </TextField>
        <Button variant="outlined" component="label">
          Upload Resume
          <input
            type="file"
            hidden
            onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)}
          />
        </Button>
        {resume && <FormHelperText>{resume.name}</FormHelperText>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Add</Button>
      </DialogActions>
    </Dialog>
  );
}
