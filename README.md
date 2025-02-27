# My Fullstack App

This is a fullstack application built with a Node.js backend and a Vue.js frontend. The project is structured to separate the backend and frontend code, allowing for easier development and deployment.

## Project Structure

```
my-fullstack-app
├── backend
│   ├── src
│   │   ├── app.ts
│   │   ├── controllers
│   │   │   └── index.ts
│   │   ├── routes
│   │   │   └── index.ts
│   │   └── types
│   │       └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend
│   ├── src
│   │   ├── main.js
│   │   ├── App.vue
│   │   └── components
│   │       └── HelloWorld.vue
│   ├── public
│   │   └── index.html
│   ├── package.json
│   ├── vue.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- Docker
- Docker Compose

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd my-fullstack-app
   ```

2. Navigate to the backend directory and install dependencies:
   ```
   cd backend
   npm install
   ```

3. Navigate to the frontend directory and install dependencies:
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

You can run the application using Docker Compose. From the root of the project, execute:

```
docker-compose up --build
```

This command will build the Docker images for both the frontend and backend and start the services.

### Accessing the Application

- The backend API will be available at `http://localhost:3000`
- The frontend application will be available at `http://localhost:8080`

### Contributing

Feel free to submit issues or pull requests for any improvements or bug fixes.

### License

This project is licensed under the MIT License. See the LICENSE file for details.