# HalloDoc Project

This project is an internship project developed in Node.js with MySQL as the database. It is designed for handling online appointments.

### Key Features

1. User registration and authentication
2. Appointment scheduling and management
3. Data persistence using MySQL
4. Secure communication with JWT-based authentication
5. User-friendly API with Swagger documentation

### Prerequisites

1. Node.js (version 14 or later)
2. pm or yarn
3. MySQL database (version 5.7 or later)

### Installation

1. *clone the repository*

    ```bash
    git clone https://github.com/deepakabari/HalloDoc-typescript.git
    ```

2. *Install dependencies:*

    ```bash
    npm install
    ```

3. *Create a `.env` file in the project root directory to store database credentials:*

    ```bash
    DATABASE_HOST=your_database_host
    DATABASE_PORT=your_database_port
    DATABASE_USERNAME=your_database_username
    DATABASE_PASSWORD=your_database_password
    DATABASE_NAME=your_database_name
    ```

### Database Setup

1. *Create a MySQL database with the name specified in your `.env` file.*

### Running the Application

1. *Start the development server:*

    ```bash
    npm start
    ```

    *This will run `nodemon app.ts` in development mode with hot reloading.*

2. *Access the API at `http://localhost:3000` in your browser.*

3. *Swagger documentation is available at `http://localhost:3000/docs` for exploring available API endpoints.*

### Development

1. *Use `ts-node` or your preferred TypeScript compiler for code development.*

2. *The `dev` script in `package.json` runs `ts-node-dev app.ts` for hot reloading during development.*

### Deployment

1. *Build the application for production using the `build` script in `package.json`:*

    ```bash
    npm run build
    ```

2. *Configure the deployment environment with the appropriate database credentials and environment variables.*


### License

*This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.*


### Contributions

*We welcome contributions from the community. Please submit pull requests following the project's guidelines.*