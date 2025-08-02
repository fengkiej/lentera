# Database Scripts

This directory contains scripts for database operations and maintenance.

## Database Initialization

The database initialization scripts create the necessary tables and indexes for the application.

### Files

- `db-utils.ts` - Utility functions for database operations
- `init-db.ts` - Core database initialization logic
- `run-init-db.ts` - Entry point script for running the initialization
- `init-content-library.ts` - Content library table initialization logic
- `run-init-content-library.ts` - Entry point script for content library initialization
- `init-search-summaries.ts` - Search summaries table initialization logic
- `run-init-search-summaries.ts` - Entry point script for search summaries initialization
- `init-flashquiz.ts` - Flashquiz table initialization logic
- `run-init-flashquiz.ts` - Entry point script for flashquiz initialization
- `init-mindmap.ts` - Mindmap table initialization logic
- `run-init-mindmap.ts` - Entry point script for mindmap initialization

### Tables Created

1. **content_library_summary** - Stores summaries of content from various sources
   - Indexes:
     - `idx_content_url_hash` - For fast lookups by URL hash
     - `idx_content_created_at` - For time-based queries

2. **search_summaries** - Stores summaries of search results
   - Indexes:
     - `idx_content_created_at` - For time-based queries

3. **flashquiz** - Stores flashcard quizzes
   - Indexes:
     - `idx_content_created_at` - For time-based queries

4. **mindmap** - Stores mind maps
   - Indexes:
     - `idx_content_created_at` - For time-based queries

### How to Run

To initialize the complete database, run:

```bash
npm run init-db
# or
bun run init-db
```

To initialize only the content library table, run:

```bash
npm run init-content-library
# or
bun run init-content-library
```

To initialize only the search summaries table, run:

```bash
npm run init-search-summaries
# or
bun run init-search-summaries
```

To initialize only the flashquiz table, run:

```bash
npm run init-flashquiz
# or
bun run init-flashquiz
```

To initialize only the mindmap table, run:

```bash
npm run init-mindmap
# or
bun run init-mindmap
```

This will create all necessary tables and indexes if they don't already exist.

### Adding New Tables

To add new tables to the initialization process:

1. Edit `init-db.ts`
2. Add your table creation SQL to the `client.batch` array
3. Run the initialization script again