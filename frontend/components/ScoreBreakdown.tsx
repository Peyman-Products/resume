import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";

interface Candidate {
  [key: string]: any;
}

interface ScoreItem {
  label: string;
  value: any;
  points: number;
}

interface Props {
  candidate: Candidate | null;
}

export default function ScoreBreakdown({ candidate }: Props) {
  const [items, setItems] = useState<ScoreItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!candidate) return;
    async function calc() {
      const role = String(candidate.position_type || "").toLowerCase();
      const [posRes, globalRes] = await Promise.all([
        fetch(`http://localhost:5000/api/scoring/${role}`).then((r) =>
          r.json(),
        ),
        fetch("http://localhost:5000/api/scoring/global").then((r) => r.json()),
      ]);
      const list: ScoreItem[] = [];
      let score = 0;
      const add = (label: string, value: any, pts: number) => {
        list.push({ label, value, points: pts });
        score += pts;
      };
      const mapScore = (field: string, value: any) => {
        const map = (globalRes as any)[field] || {};
        const key = String(value).toLowerCase().replace(/\s+/g, "_");
        const pts = Number(map[key] || 0);
        add(field.replace(/_/g, " "), value || "-", pts);
      };

      mapScore("gender", candidate.gender);
      mapScore("education", candidate.education);
      mapScore("military_status", candidate.military_status);
      mapScore("job_status", candidate.job_status);
      mapScore("availability", candidate.can_start_from);

      if (String(candidate.available_9_to_6).toLowerCase() === "yes") {
        add("Available 9-6", "Yes", 5);
      }
      if (String(candidate.has_portfolio).toLowerCase() === "yes") {
        add("Has portfolio", "Yes", 5);
      }
      if (String(candidate.ok_with_task).toLowerCase() === "yes") {
        add("Ok with task", "Yes", 2);
      }

      const weights = (globalRes as any).reviewer_weights || {};
      [
        "interviewer_score",
        "design_score",
        "look_score",
        "portfolio_score",
        "previous_work_score",
      ].forEach((f) => {
        const val = parseFloat(candidate[f] ?? 0);
        const w = parseFloat(weights[f] ?? 1);
        const pts = val * w;
        add(f.replace(/_/g, " "), val, pts);
      });

      const years = parseFloat(candidate.years_of_experience ?? 0);
      const perYear = parseFloat((globalRes as any).exp_per_year ?? 0);
      if (!isNaN(years) && !isNaN(perYear)) {
        add("Experience years", years, years * perYear);
      }

      const exp = (posRes as any).experience || {};
      Object.entries(exp).forEach(([field, info]) => {
        const val = String(candidate[field] || "");
        const pts = val === "Yes" ? Number((info as any).points || 0) : 0;
        add((info as any).label || field, val || "-", pts);
      });

      setItems(list);
      setTotal(score);
    }
    calc();
  }, [candidate]);

  if (!candidate) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Score Breakdown
      </Typography>
      <Table size="small">
        <TableBody>
          {items.map((it, idx) => (
            <TableRow key={idx}>
              <TableCell>{it.label}</TableCell>
              <TableCell>{String(it.value)}</TableCell>
              <TableCell align="right">{it.points}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>
              Total
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              {total}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
}
