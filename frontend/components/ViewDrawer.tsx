import React from 'react';
import {
  Drawer,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  Divider,
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
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 500 } }}
    >
      <Box sx={{ width: 500, p: 2 }} role="presentation">
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
            <Box sx={{ '& > *': { mb: 1 } }}>
              <Typography fontWeight="bold">Mobile: <span style={{ fontWeight: 400 }}>{candidate?.mobile}</span></Typography>
              <Typography fontWeight="bold">Gender: <span style={{ fontWeight: 400 }}>{candidate?.gender}</span></Typography>
              <Typography fontWeight="bold">Status: <span style={{ fontWeight: 400 }}>{candidate?.status}</span></Typography>
              <Typography fontWeight="bold">Marital Status: <span style={{ fontWeight: 400 }}>{candidate?.marital_status || '-'}</span></Typography>
              <Typography fontWeight="bold">Education: <span style={{ fontWeight: 400 }}>{candidate?.education || '-'}</span></Typography>
              <Typography fontWeight="bold">Major: <span style={{ fontWeight: 400 }}>{candidate?.major || '-'}</span></Typography>
              <Typography fontWeight="bold">Year of Birth: <span style={{ fontWeight: 400 }}>{candidate?.year_of_birth || '-'}</span></Typography>
              <Typography fontWeight="bold">Source of News: <span style={{ fontWeight: 400 }}>{candidate?.source_of_news || '-'}</span></Typography>
              <Typography fontWeight="bold">Military Status: <span style={{ fontWeight: 400 }}>{candidate?.military_status || '-'}</span></Typography>
              <Typography fontWeight="bold">Job Status: <span style={{ fontWeight: 400 }}>{candidate?.job_status || '-'}</span></Typography>
              <Typography fontWeight="bold">Years of Experience: <span style={{ fontWeight: 400 }}>{candidate?.years_of_experience || '-'}</span></Typography>
              <Typography fontWeight="bold">Start From: <span style={{ fontWeight: 400 }}>{candidate?.can_start_from || '-'}</span></Typography>
              <Typography fontWeight="bold">9-6 Available: <span style={{ fontWeight: 400 }}>{candidate?.available_9_to_6 || '-'}</span></Typography>
              <Typography fontWeight="bold">Telegram ID: <span style={{ fontWeight: 400 }}>{candidate?.telegram_id || '-'}</span></Typography>
              <Typography fontWeight="bold">Location: <span style={{ fontWeight: 400 }}>{candidate?.location || '-'}</span></Typography>
              <Typography fontWeight="bold">Interviewer Score: <span style={{ fontWeight: 400 }}>{candidate?.interviewer_score || '-'}</span></Typography>
              <Typography fontWeight="bold">Look Score: <span style={{ fontWeight: 400 }}>{candidate?.look_score || '-'}</span></Typography>
              <Typography fontWeight="bold">Portfolio Score: <span style={{ fontWeight: 400 }}>{candidate?.portfolio_score || '-'}</span></Typography>
              <Typography fontWeight="bold">Previous Work Score: <span style={{ fontWeight: 400 }}>{candidate?.previous_work_score || '-'}</span></Typography>
              <Typography fontWeight="bold">Total Score: <span style={{ fontWeight: 400 }}>{candidate?.total_score || '-'}</span></Typography>
              {candidate?.resume_file && (
                <Typography fontWeight="bold">
                  Resume:{' '}
                  <a href={`http://localhost:5000/resumes/${candidate.resume_file}`} target="_blank" rel="noreferrer">
                    Download
                  </a>
                </Typography>
              )}
            </Box>
          )}
          {tab === 1 && (
            <Box sx={{ '& > *': { mb: 1 } }}>
              <Typography fontWeight="bold">B2B Dashboard Exp: <span style={{ fontWeight: 400 }}>{candidate?.exp_dashboard_b2b || '-'}</span></Typography>
              <Typography fontWeight="bold">Dynamic Reports: <span style={{ fontWeight: 400 }}>{candidate?.exp_dynamic_reports || '-'}</span></Typography>
              <Typography fontWeight="bold">Role-Based UI: <span style={{ fontWeight: 400 }}>{candidate?.exp_role_based_access || '-'}</span></Typography>
              <Typography fontWeight="bold">POS/Mobile Exp: <span style={{ fontWeight: 400 }}>{candidate?.exp_pos_mobile || '-'}</span></Typography>
              <Typography fontWeight="bold">Data Sync: <span style={{ fontWeight: 400 }}>{candidate?.exp_data_sync || '-'}</span></Typography>
              <Typography fontWeight="bold">Multi-step Forms: <span style={{ fontWeight: 400 }}>{candidate?.exp_multistep_forms || '-'}</span></Typography>
              <Typography fontWeight="bold">Low-Literate Users: <span style={{ fontWeight: 400 }}>{candidate?.exp_low_digital_users || '-'}</span></Typography>
              <Typography fontWeight="bold">Multilingual: <span style={{ fontWeight: 400 }}>{candidate?.exp_multilingual || '-'}</span></Typography>
              <Typography fontWeight="bold">Portfolio Relevant: <span style={{ fontWeight: 400 }}>{candidate?.exp_portfolio_relevant || '-'}</span></Typography>
              <Divider sx={{ my: 1 }} />
              <Typography fontWeight="bold">Technical Notes:</Typography>
              <Typography sx={{ ml: 1 }}>{candidate?.technical_experience_notes || '-'}</Typography>
            </Box>
          )}
          {tab === 2 && (
            <Box>
              <Typography fontWeight="bold">Design Score: <span style={{ fontWeight: 400 }}>{candidate?.design_score || '-'}</span></Typography>
            </Box>
          )}
          {tab === 3 && (
            <Box sx={{ '& > *': { mb: 1 } }}>
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
