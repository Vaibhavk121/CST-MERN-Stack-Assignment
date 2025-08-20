# Testing the MERN Agent Management System

## Quick Test Setup

The application is configured to use MongoDB Atlas cloud database - no local setup required!

### 1. Start the Application
```bash
npm run dev
```

### 2. Test the Features

1. **Create Account/Login**: 
   - Go to http://localhost:3000
   - **First time**: Click "Don't have an account? Sign up" and create your admin account
   - **Returning**: Use your email and password to log in

2. **Add Agents**:
   - Navigate to Agents section
   - Add at least 5 agents for proper distribution testing

3. **Upload CSV**:
   - Use the provided `sample-data.csv` file
   - Go to Lists section
   - Upload the file and see the distribution

## Sample Test Data

The `sample-data.csv` file contains 25 sample contacts that will be distributed as:
- Agent 1: 5 items
- Agent 2: 5 items  
- Agent 3: 5 items
- Agent 4: 5 items
- Agent 5: 5 items

## API Testing with Postman

You can also test the API endpoints directly:

### 1. Signup
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "yourpassword123"
}
```

### 2. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "yourpassword123"
}
```

### 3. Create Agent
```
POST http://localhost:5000/api/agents
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": {
    "countryCode": "+1",
    "number": "1234567890"
  },
  "password": "password123"
}
```

### 4. Get All Agents
```
GET http://localhost:5000/api/agents
Authorization: Bearer YOUR_JWT_TOKEN
```

### 5. Upload File
```
POST http://localhost:5000/api/lists/upload
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

file: [select sample-data.csv]
```

## Troubleshooting

1. **Port 3000 already in use**: Kill the process or change the port
2. **MongoDB connection issues**: Use MongoDB Atlas or install MongoDB locally
3. **CORS errors**: Make sure both frontend and backend are running
4. **File upload issues**: Check file format and size limits