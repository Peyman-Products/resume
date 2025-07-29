import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  Container,
  Typography,
  CircularProgress,
  Button,
  TextField,
  IconButton,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AddCandidateDialog from "../../components/AddCandidateDialog";
import ViewDrawer from "../../components/ViewDrawer";

interface Candidate {
  id: number;
  name: string;
  mobile: string;
  gender: string;
  total_score: number | null;
  resume_file: string | null;
  status: string;
}

export default function CandidateList() {
  const router = useRouter();
  const { position } = router.query;
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Candidate | null>(null);

  const deleteCandidate = async (id: number) => {
    if (!confirm("Delete this candidate?")) return;
    await fetch(`http://localhost:5000/delete/${id}`, { method: "POST" });
    fetchData();
  };

  const fetchData = () => {
    if (!position) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/candidates?position=${position}`)
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data);
        setLoading(false);
      });
  };

  const openDrawer = async (id: number) => {
    const res = await fetch(`http://localhost:5000/get/${id}`);
    const data = await res.json();
    if (data.meetings) {
      try {
        data.meetings_list = JSON.parse(data.meetings);
      } catch {
        data.meetings_list = [];
      }
    }
    setSelected(data);
    setDrawerOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, [position]);

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "mobile", headerName: "Mobile", flex: 1 },
    { field: "gender", headerName: "Gender", flex: 1 },
    { field: "total_score", headerName: "Total", type: "number", flex: 1 },
    {
      field: "resume_file",
      headerName: "Resume",
      flex: 1,
      renderCell: (params) =>
        params.value ? (
          <a href={`http://localhost:5000/resumes/${params.value}`}>Resume</a>
        ) : (
          "-"
        ),
    },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <>
          <IconButton
            size="small"
            onClick={() => openDrawer(params.row.id)}
            aria-label="view"
          >
            <VisibilityIcon fontSize="inherit" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => router.push(`/edit/${params.row.id}`)}
            aria-label="edit"
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => deleteCandidate(params.row.id)}
            aria-label="delete"
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </>
      ),
    },
  ];

  const filtered = candidates.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Container sx={{ mt: 4 }} maxWidth="xl" disableGutters>
      <Head>
        <title>{position} Candidates</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4">{position} Candidates</Typography>
        <Button variant="outlined" onClick={() => router.push("/")}>
          Back
        </Button>
      </Box>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
        <Button variant="contained" onClick={() => setOpen(true)}>
          New Candidate
        </Button>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={filtered.map((c) => ({
              id: c.id,
              name: c.name || "-",
              mobile: c.mobile || "-",
              gender: c.gender || "-",
              total_score: c.total_score ?? 0,
              resume_file: c.resume_file || "",
              status: c.status || "-",
            }))}
            columns={columns}
            pageSizeOptions={[5, 10]}
            initialState={{
              pagination: { paginationModel: { pageSize: 5, page: 0 } },
            }}
            disableRowSelectionOnClick
            autoHeight
          />
        </div>
      )}
      <AddCandidateDialog
        open={open}
        onClose={() => setOpen(false)}
        onAdded={fetchData}
        position={typeof position === "string" ? position : ""}
      />
      <ViewDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelected(null);
        }}
        candidate={selected}
      />
    </Container>
  );
}
