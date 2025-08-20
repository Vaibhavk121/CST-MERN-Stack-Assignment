# MERN Stack Agent Management System

A full-stack web application built with MongoDB, Express.js, React.js, and Node.js for managing agents and distributing CSV lists among them.

## Features

- **Admin Authentication**: Secure login system with JWT tokens
- **Agent Management**: Create, view, and manage agents with their details
- **File Upload**: Upload CSV, XLSX, and XLS files with validation
- **Automatic Distribution**: Distribute list items equally among 5 agents
- **Dashboard**: Overview of system statistics and recent activities
- **Responsive Design**: Mobile-friendly user interface

## Tech Stack

- **Frontend**: React.js, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Processing**: Multer, CSV-Parser, XLSX
- **Styling**: Custom CSS

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd mern-agent-management
```

### 2. Install server dependencies
```bash
npm install
```

### 3. Install client dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration
The `.env` file is already configured with your MongoDB Atlas connection:

```env
MONGODB_URI=mongodb+srv://Vaibhav123:Vaibhav123@mycluster.z4vvm.mongodb.net/?retryWrites=true&w=majority&appName=MyCLuster
JWT_SECRET=shfH3984jsd@38hfH93bshkjdhf72!@3b$
PORT=5000
NODE_ENV=development
```

**Note**: The application uses MongoDB Atlas cloud database - no local MongoDB installation required.

### 5. Start the Application

#### Development Mode (Recommended)
Run both frontend and backend concurrently:
```bash
npm run dev
```

#### Production Mode
Build the React app and start the server:
```bash
npm run build
npm start
```

The application will be available at:
- Frontend: http://localhost:3000 (development) or http://localhost:5000 (production)
- Backend API: http://localhost:5000/api

## Usage

### 1. Create Account / Login
- Navigate to the application URL
- **First time users**: Click "Don't have an account? Sign up" to create a new admin account
- **Existing users**: Use your email and password to log in
- All accounts have admin privileges for managing agents and lists

### 2. Add Agents
- Go to the "Agents" section
- Click "Add New Agent"
- Fill in the required details:
  - Name
  - Email
  - Mobile number with country code
  - Password
- Submit the form to create the agent

### 3. Upload and Distribute Lists
- Go to the "Lists" section
- Click "Choose File" and select a CSV, XLSX, or XLS file
- The file should contain columns: `FirstName`, `Phone`, `Notes`
- Click "Upload & Distribute"
- The system will automatically distribute items equally among active agents

### 4. View Distributions
- In the "Lists" section, click "View Details" on any uploaded list
- See how items were distributed among agents
- View individual items assigned to each agent

## File Format Requirements

Your CSV/Excel files should have the following columns:

| Column Name | Type | Required | Description |
|-------------|------|----------|-------------|
| FirstName   | Text | Yes      | Contact's first name |
| Phone       | Text | Yes      | Contact's phone number |
| Notes       | Text | No       | Additional notes |

### Example CSV Format:
```csv
FirstName,Phone,Notes
John,+1234567890,Important client
Jane,+1987654321,Follow up needed
Bob,+1555123456,
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new admin account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Agents
- `GET /api/agents` - Get all agents
- `POST /api/agents` - Create new agent
- `GET /api/agents/:id` - Get agent by ID
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Lists
- `GET /api/lists` - Get all lists
- `POST /api/lists/upload` - Upload and distribute file
- `GET /api/lists/:id` - Get list details with distribution

## Distribution Logic

The system distributes items among agents using the following logic:

1. Get all active agents (maximum 5)
2. Calculate items per agent: `Math.floor(totalItems / agentCount)`
3. Calculate remaining items: `totalItems % agentCount`
4. Distribute remaining items sequentially to the first N agents

**Example**: 
- 23 items, 5 agents
- Each agent gets: 4 items (23 ÷ 5 = 4 remainder 3)
- First 3 agents get 1 extra item each
- Final distribution: 5, 5, 5, 4, 4

## Security Features

- Password hashing using bcryptjs
- JWT token authentication
- Input validation and sanitization
- File type validation
- Protected API routes
- CORS configuration

## Error Handling

The application includes comprehensive error handling:

- Client-side form validation
- Server-side input validation
- File upload validation
- Database error handling
- User-friendly error messages

## Folder Structure

```
mern-agent-management/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── App.js
│   └── package.json
├── models/                 # Mongoose models
├── routes/                 # Express routes
├── middleware/             # Custom middleware
├── scripts/                # Utility scripts
├── uploads/                # File upload directory
├── server.js               # Express server
├── package.json
└── README.md
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `.env`
   - Verify database permissions

2. **File Upload Issues**
   - Check file format (CSV, XLSX, XLS only)
   - Ensure file has required columns
   - Verify file size (5MB limit)

3. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in `.env`
   - Verify admin user exists

4. **Port Already in Use**
   - Change PORT in `.env`
   - Kill existing processes on port 5000/3000

### Development Tips

- Use MongoDB Compass to view database contents
- Check browser console for frontend errors
- Monitor server logs for backend issues
- Use Postman to test API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please create an issue in the repository or contact the development team.