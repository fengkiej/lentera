# Fasaha AI Backend

Backend API service for Fasaha AI - Arabic Root Words Learning Application.

## Features

- **Authentication & Authorization**: JWT-based user authentication
- **Learning Management**: Lessons, progress tracking, and user statistics
- **Root Words Dictionary**: Comprehensive Arabic root words database
- **Practice System**: Interactive quizzes and exercises
- **AI Voice Teacher**: Audio upload and pronunciation analysis
- **Progress Tracking**: Detailed learning analytics and achievements

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite with Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Zod
- **Security**: Helmet, CORS, bcrypt

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── schema.ts          # Database schema definitions
│   │   ├── connection.ts      # Database connection setup
│   │   ├── migrate.ts         # Migration runner
│   │   └── seed.ts           # Database seeding
│   ├── middleware/
│   │   ├── auth.ts           # Authentication middleware
│   │   ├── errorHandler.ts   # Error handling middleware
│   │   └── notFound.ts       # 404 handler
│   ├── routes/
│   │   ├── auth.ts           # Authentication routes
│   │   ├── user.ts           # User management routes
│   │   ├── lessons.ts        # Lessons management routes
│   │   ├── rootWords.ts      # Root words dictionary routes
│   │   ├── progress.ts       # Progress tracking routes
│   │   ├── practice.ts       # Practice/quiz routes
│   │   └── voice.ts          # Voice/audio routes
│   └── index.ts              # Main application entry point
├── database/                 # SQLite database files
├── uploads/                  # Uploaded files storage
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── .env
```

## Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run database migrations**:

   ```bash
   npm run db:migrate
   ```

4. **Seed the database**:
   ```bash
   npm run db:seed
   ```

## Development

1. **Start development server**:

   ```bash
   npm run dev
   ```

2. **Build for production**:

   ```bash
   npm run build
   ```

3. **Start production server**:
   ```bash
   npm start
   ```

## API Documentation

### Base URL

```
http://localhost:3001/api/v1
```

### Authentication

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Lessons

#### Get All Lessons

```http
GET /lessons?page=1&limit=10&difficulty=Mudah&sortBy=order&sortOrder=asc
```

#### Get Lesson by ID

```http
GET /lessons/:id
```

### Root Words

#### Get All Root Words

```http
GET /root-words?page=1&limit=20&search=كتب&sortBy=root_letters&sortOrder=asc
```

#### Search Root Words

```http
GET /root-words/search?q=كتب&limit=10
```

### Progress

#### Get User Progress

```http
GET /progress
Authorization: Bearer <token>
```

#### Update Progress

```http
POST /progress/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "lessonId": 1,
  "progressPercentage": 75,
  "timeSpent": 300,
  "completed": false
}
```

### Practice

#### Get Practice Questions

```http
GET /practice/questions?lessonId=1&questionType=guess-meaning&limit=10
Authorization: Bearer <token>
```

#### Submit Answer

```http
POST /practice/submit-answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "questionId": 1,
  "selectedOptionId": 2,
  "isCorrect": true,
  "timeSpent": 30
}
```

### Voice/Audio

#### Upload Audio for Analysis

```http
POST /voice/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

audio: <audio-file>
targetWord: "كتاب"
targetTransliteration: "kitab"
lessonId: 1
```

#### Get Audio File

```http
GET /voice/audio/:id/stream
```

## Database Schema

### Core Tables

- **users**: User accounts and profiles
- **root_words**: Arabic root words dictionary
- **lessons**: Learning lessons and content
- **lesson_examples**: Quran examples for lessons
- **derivatives**: Word derivatives from root words
- **user_progress**: User learning progress tracking
- **practice_questions**: Quiz and practice questions
- **question_options**: Multiple choice options
- **user_practice_results**: User quiz results
- **user_stats**: User statistics and achievements
- **achievements**: Available achievements
- **user_achievements**: User earned achievements
- **audio_files**: Audio files for pronunciation

## Environment Variables

| Variable                 | Description              | Default                 |
| ------------------------ | ------------------------ | ----------------------- |
| `PORT`                   | Server port              | `3001`                  |
| `NODE_ENV`               | Environment              | `development`           |
| `DATABASE_URL`           | SQLite database path     | `./database/fasaha.db`  |
| `JWT_SECRET`             | JWT signing secret       | Required                |
| `JWT_REFRESH_SECRET`     | JWT refresh secret       | Required                |
| `JWT_EXPIRES_IN`         | JWT expiration time      | `24h`                   |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d`                    |
| `CORS_ORIGIN`            | Allowed CORS origin      | `http://localhost:8080` |
| `UPLOAD_DIR`             | File upload directory    | `./uploads`             |
| `MAX_FILE_SIZE`          | Max upload file size     | `10485760` (10MB)       |
| `API_PREFIX`             | API route prefix         | `/api/v1`               |

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **CORS Protection**: Configurable origin restrictions
- **Helmet**: Security headers middleware
- **Input Validation**: Zod schema validation
- **File Upload Security**: MIME type validation
- **Rate Limiting**: (Recommended for production)

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

## Success Response Format

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

## Development Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm run db:migrate`: Run database migrations
- `npm run db:seed`: Seed database with initial data
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking

## Production Deployment

1. **Build the application**:

   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Run migrations**:

   ```bash
   npm run db:migrate
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
