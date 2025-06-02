# Parent Teen Life Academy (Learning Management System)

Welcome to **Parent Teen Life Academy**, a full-stack Learning Management System designed to offer a seamless experience for instructor and learners. This application provides robust course management, secure user authentication, real-time communication, and a fully integrated payment system.

---

## Features

### User Features
- **User Authentication**:
  - Secure login and registration using Google OAuth2.
  - JWT-based session management for secure and seamless access.
- **Course Management**:
  - Browse, view, and enroll in available courses and course modules.  
- **Cart & Payment**:
  - Add courses to the cart and securely check out using Razorpay integration.
- **Real-Time Chat**:
  - Interactive discussion with instructor and learners powered by Socket.io.
  - Live class feature implementation with webRTC.
- **Progress Tracking**:
  - View enrolled courses and track learning progress.
- **Review System**
  - Feature to write,edit,and delete the review by enrolled users


### Admin Features
- **Dashboard**:
  - Manage users, courses, course modules, orders and notifications efficiently.
- **Course Management**:
  - Add, edit, or delete courses.
- **Course Module Management**:
  - Add, edit, or delete course modules.
- **User Management**:
  - Monitor and manage user activity.

---

## Technologies Used

### Frontend
- **Core Frameworks**: React.js
- **Styling**: Tailwind CSS, Material UI
- **Validation**: React Hook Form, Zod
- **Media & Charts**: Chart.js, Vimeo player
- **State Management**: Redux Toolkit
- **Real-Time Communication**: Socket.io-client, webRTC
- **Payment Integration**: Razorpay SDK

### Backend
- **Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Google OAuth2, JWT, Passport
- **File Storage**: Cloudinary
- **Scheduling**: Node-cron
- **Security**: Bcrypt for password hashing
- **Email Services**: Nodemailer

### Development Tools
- **Languages**: TypeScript
- **Linters & Formatters**: ESLint, Prettier
- **Runtime Tools**: Nodemon, ts-node-dev


---

## Setup & Installation

1. **Clone the repository:**
   
   ```bash
   git clone https://github.com/Mridulaoc/ParentTeenLifeAcademy.git
   cd ParentTeenLifeAcademy

2. **Install Dependencies:**
   - **For the backend**

     ```bash
     cd Server
     npm install
     
   - **For the frontend**

     ```bash
     cd Client
     npm install

3. **Set up Environment Variables:**
  - Create a .env file in the server directory with the following variables:
    
    ```bash
      MONGO_URI=<MONGO_URI>
      PORT=<PORT>
      JWT_SECRET_KEY=<>
      EMAIL_USER=<>
      EMAIL_PASSWORD=<>
      GOOGLE_CLIENT_ID=<>
      GOOGLE_CLIENT_SECRET=<>
      CLOUDINARY_CLOUD_NAME=<>
      CLOUDINARY_API_KEY=<>
      CLOUDINARY_API_SECRET=<>
      RAZORPAY_API_KEY=<>
      RAZORPAY_API_SECRET =<>
      VIMEO_CLIENT_ID=<>
      VIMEO_CLIENT_SECRET=<>
      VIMEO_ACCESS_TOKEN=<>
      CLIENT_URL=<>

4. **Run the application:**
   - **Start the backend server**

     ```bash
     cd Server
     npm start
     
   - **Start the frontend development server**

     ```bash
     cd Client
     npm run dev

5. **Access the Application**

   - Open your browser and visit: http://localhost:<frontend_port>

## Contact

For any queries or suggestions, feel free to reach out:
- Author: Mridula O C
- Email: mridulaOC@gmail.com
