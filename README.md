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

## Usage

- Access `http://localhost:3000` to view the candidate list rendered using Material UI components.
- Use the backend endpoints defined in `app.py` to add, edit or delete candidates.

