# X Clone

X Clone is a social media application built with modern web technologies, providing features such as user authentication, post creation, profile customization, and more. It uses React.js for the frontend, Node.js with Express for the backend, and MongoDB as the database. Tailwind CSS is employed for styling, while Cloudinary is integrated for image uploads.

---

## Features

- **Tech Stack:** React.js, MongoDB, Node.js, Express, Tailwind CSS
- **Authentication:** Secure user authentication using JSON Web Tokens (JWT)
- **Data Management:** Efficient data fetching and caching using React Query
- **Social Features:**
  - Suggested users to follow
  - Post creation, editing, and deletion (with owner validation)
  - Commenting and liking posts
- **Profile Management:**
  - Edit profile information
  - Update cover and profile images
- **Image Uploads:** Cloudinary integration for image hosting
- **Notifications:** Real-time notifications
- **Deployment Ready:** Optimized for production
- **More Features:** And much more coming soon!

---

## Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **Image Hosting:** Cloudinary
- **State Management:** React Query

---

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- MongoDB database (local or cloud-based)
- Cloudinary account for image uploads

---

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/x-clone.git
   cd x-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following keys:
   ```env
   MONGO_URI=your-mongodb-uri
   PORT=5000
   JWT_SECRET=your-jwt-secret
   NODE_ENV=development
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build the app for production:
   ```bash
   npm run build
   ```

6. Start the app:
   ```bash
   npm start
   ```

---


---

## Key Scripts

- **Start Development Server:**
  ```bash
  npm run dev
  ```
- **Build for Production:**
  ```bash
  npm run build
  ```
- **Start Production Server:**
  ```bash
  npm start
  ```

---

## Deployment

The app can be deployed using any hosting service such as [Vercel](https://vercel.com/). Ensure that all environment variables are properly configured in the hosting service.

---

## Contributing

1. Fork the repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).


