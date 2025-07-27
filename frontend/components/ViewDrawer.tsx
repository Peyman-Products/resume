import React from 'react';
import {
  Drawer,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { useRouter } from 'next/router';

interface Candidate {
  [key: string]: any;
}

interface Props {
  open: boolean;
  onClose: () => void;
  candidate: Candidate | null;
}

export default function ViewDrawer({ open, onClose, candidate }: Props) {
  const [tab, setTab] = React.useState(0);
  const router = useRouter();

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ width: 350 }}>
      <Box sx={{ width: 350, p: 2 }} role="presentation">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">{candidate?.name}</Typography>
          {candidate && (
            <Button size="small" onClick={() => router.push(`/edit/${candidate.id}`)}>
              Edit
            </Button>
          )}
        </Box>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="General" />
          <Tab label="Experience" />
          <Tab label="Design" />
          <Tab label="Meetings" />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {tab === 0 && (
            <Box>
              <Typography>Mobile: {candidate?.mobile}</Typography>
              <Typography>Gender: {candidate?.gender}</Typography>
              <Typography>Status: {candidate?.status}</Typography>
              {candidate?.resume_file && (
                <Typography>
                  <a
                    href={`http://localhost:5000/resumes/${candidate.resume_file}`}
                    target="_blank"
                  >
                    Resume
                  </a>
                </Typography>
              )}
            </Box>
          )}
          {tab === 1 && (
            <Box>
              <Typography>
                Technical Notes: {candidate?.technical_experience_notes || '-'}
              </Typography>
            </Box>
          )}
          {tab === 2 && (
            <Box>
              <Typography>Design Score: {candidate?.design_score || '-'}</Typography>
            </Box>
          )}
          {tab === 3 && (
            <Box>
              {candidate?.meetings_list?.length ? (
                candidate.meetings_list.map((m: any, idx: number) => (
                  <Typography key={idx}>{`${m.date} ${m.day} ${m.time} ${m.location} ${m.status}`}</Typography>
                ))
              ) : (
                <Typography>No meetings</Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
