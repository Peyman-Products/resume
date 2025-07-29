# Resume Service

This repository contains a Flask backend for managing candidate resumes and a Next.js frontend (using TypeScript and Material UI) for interacting with the data.

## Prerequisites

- Python 3.8+
- Node.js 16+

## Backend Setup

1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Run the Flask server:
   ```bash
   python app.py
   ```
   The server listens on `http://localhost:5000`.

## Frontend Setup

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
npm run dev
```
   This will start the app on `http://localhost:3000`.

If you encounter an error about global CSS when using MUI's `DataGrid` with the
latest Next.js versions, ensure the package is transpiled. The included
`next.config.js` sets:

```javascript
  transpilePackages: ['@mui/x-data-grid']
```

This allows the DataGrid styles to be processed correctly.

The frontend fetches candidate data from the Flask backend using the `/api/candidates` endpoint.

## Production Build

To build the frontend for production, run:
```bash
npm run build
npm start
```

### Checking TypeScript

The frontend codebase is written in TypeScript. You can verify that all files
compile correctly by running the TypeScript compiler in the `frontend` folder:

```bash
npx tsc --noEmit
```

This command performs a type check without generating any output files.

## Usage

- Access `http://localhost:3000` to view the candidate list rendered using Material UI components.
- Use the backend endpoints defined in `app.py` to add, edit or delete candidates.
- The list of available positions can be retrieved via `GET /api/positions` which
  returns an array of objects containing `id` and `name`.

## Candidate Types and Admin Area

The application distinguishes between multiple candidate positions. Two example
roles are provided out of the box:

- **Go Developer**
- **Product Designer**

When a candidate is created you choose which position they are applying for. All
positions share the same general information fields as well as the "test task"
score and meeting history.

### Technical Experience by Position

Each position has its own set of technical experience questions which are stored
in `scoring_config.json`. The admin interface allows these questions and their
score values to be modified per position as well as the global scoring rules
(education, availability, reviewer weights, etc.).

### Typical User Flow

1. Visit the home page.
2. Choose the position (Go Developer or Product Designer).
3. The candidate list for that position is displayed.
4. For each row you can **view**, **edit** or **delete** the candidate. The
   delete action appears as a trash bin icon.
5. Use the **Add** button to register a new candidate in the selected list.

### Scoring Weights API

Use `/api/weights/<position>` to retrieve the total weight defined for a role in
`scoring_config.json`.


