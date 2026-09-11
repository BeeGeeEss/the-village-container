# Explanation of Application Architecture

## Application Architecture

The following diagram represents the existing architecture of The Village Wellness App backend before containerisation.

```mermaid
flowchart LR

    %% CLIENTS

    F["React Frontend<br/>(Separate Project)"]

    I["Insomnia<br/>/ API Client"]


    %% EXPRESS API

    subgraph API["Express / Node.js REST API"]

        S["Security Middleware<br/><br/>
        • Helmet<br/>
        • CORS<br/>
        • JWT Authentication<br/>
        • Authorisation"]

        R["Routes & Controllers<br/><br/>
        • Users<br/>
        • Moods<br/>
        • Pains<br/>
        • Events"]

        V["Validation &<br/>Error Handling"]

        S --> R
        R --> V

    end


    %% MONGOOSE MODELS

    subgraph MODELS["Mongoose Models"]

        UM["User Model"]
        MM["Mood Model"]
        PM["Pain Model"]
        EM["Event Model"]

    end


    %% DATABASE

    subgraph DB["MongoDB Atlas"]

        D["Application Data<br/><br/>
        • Users<br/>
        • Moods<br/>
        • Pains<br/>
        • Events<br/>
        • Hashed Passwords"]

    end


    %% DEVELOPMENT & TESTING

    T["Development & Testing<br/><br/>
    Jest + Supertest"]


    %% ENVIRONMENT CONFIGURATION

    E["Environment Configuration<br/><br/>
    DATABASE_URL<br/>
    JWT_SECRET_KEY<br/>
    PORT<br/>
    NODE_ENV"]


    %% CONNECTIONS

    F -->|"HTTP / JSON"| S
    I -->|"HTTP / JSON"| S

    V -->|"Uses"| UM
    V -->|"Uses"| MM
    V -->|"Uses"| PM
    V -->|"Uses"| EM

    UM -->|"Mongoose"| D
    MM -->|"Mongoose"| D
    PM -->|"Mongoose"| D
    EM -->|"Mongoose"| D

    T -.->|"Automated Tests"| API
    E -.->|"Runtime Configuration"| API
```

The Village Wellness App uses client-server architecture, where a React front-end (seperate project) communicates with an Express.js/Node.js REST API. The backend processes HTTP requests, validates data, authenticates and authorises users, and connects to a MongoDB Atlas database, through Mongoose.

### React

The React frontend communicates with the backend via HTTP requests and JSON data. API clients such as Insomnia, can be used to communicate with data via the Express.js API, rather than the directly within the database. React is outside of the scope of the current project, but has been reflected in the architecture for context.

### Express.js & Node.js

The Express.js application takes a central role in processing - receiving requests from clients, validating data, applying authentication and security middleware, routing requests to controllers, and communicating with the database.

#### API

The backend is implemented using Node.js and Express.js.
Express provides the HTTP server and routing framework used to expose RESTful endpoints for the application’s resources, including:

• Users
• Moods
• Pains
• Users

The API follows a REST-style architecture where clients interact with resources through HTTP methods such as GET, POST, PUT and DELETE.

#### Security

The API has incorporated several middlware security components:

- Helmet: To apply security-related HTTP headers to responses - to protect against common web app vulnerabilities
- CORS: Provides browser-level cross-origin access controls
- JSON Web Tokens (JWTs): The API can issue JWTs to the client, the client can send the token (in the form of a bearer token) in the authorization header of a HTTP request to verify authentication. JWTs are stored as JWT_SECRET_KEY environment variables, so that secrets are not being committed to Git repositories
- Authorisation: Once the user is authenticated and can gain access to the application, authorisation is granted based on user roles i.e admin/basic user

#### Routes & Controllers

The application keeps each route seperate so that requests for moods are handled separately to requests related to pain.

The backend has the following routes:

- Users
- Pains
- Moods
- Events

The routing works alongside the authentication and authorisation middleware, ensuring that only registered users, with the appropriate role can access certain endpoints.

#### Error Handling

The API also provides consistent HTTP error responses:

• 400 — Bad Request
• 401 — Unauthorised
• 403 — Forbidden
• 404 — Not Found
• 500 — Internal Server Error

#### Testing

#### Environment Variables

### MongoDB Atlas

MongoDB Atlas persists data and communicates with Express.js via mongoose - an object data modelling layer.

There is a clear separation of concerns between Express.js/Node.js, React, and MongoDB Atlas, which ensures that each application has clear responsibilities and limited access.

## Containerised Architecture

The following diagram represents the architecture of The Village Wellness App backend after the Express.js application has been containerised using Docker for development. Docker Compose manages the development container, while MongoDB Atlas remains an external managed database.

```mermaid
flowchart TB

    DEV["Developer"]

    COMPOSE["Docker Compose<br/>compose.yaml"]

    subgraph CONT["Docker Container"]

        API["Express / Node.js API<br/><br/>
        Middleware<br/>
        Routes & Controllers<br/>
        Mongoose Models"]

    end

    ENV[".env<br/><br/>
    DATABASE_URL<br/>
    JWT_SECRET_KEY<br/>
    PORT<br/>
    NODE_ENV"]

    CLIENT["Insomnia / API Client"]

    DB["MongoDB Atlas<br/>External Database"]

    DEV -->|"docker compose up"| COMPOSE
    COMPOSE -->|"Build & run"| CONT
    ENV -.->|"Runtime configuration"| CONT
    CLIENT -->|"HTTP :3000"| API
    API -->|"Mongoose"| DB

```

## CI/CD Architecture

The following diagram represents the continuous integration and continuous delivery (CI/CD) architecture used to automatically validate, build, tag, and publish the containerised backend application to GitHub Container Registry.

GitHub Actions performs code-quality checks and automated testing before building the Docker image.

The resulting image is versioned using environment, application version, and Git commit information before being published to GitHub Container Registry.

Runtime environment variables and secrets are supplied separately and are not stored in the Docker image.

```mermaid
flowchart TB

    %% DEVELOPER

    DEV["Developer"]

    %% SOURCE CONTROL

    REPO["GitHub Repository<br/><br/>
    BeeGeeEss / the-village-container"]

    %% CI/CD PIPELINE

    subgraph ACTIONS["GitHub Actions CI/CD Pipeline"]

        CHECKOUT["Checkout Code"]

        INSTALL["Install Dependencies<br/><br/>
        npm ci"]

        LINT["Code Quality Check<br/><br/>
        npm run lint"]

        TEST["Automated Tests<br/><br/>
        npm test"]

        BUILD["Build Docker Image<br/><br/>
        Docker Buildx"]

        TAG["Tag Docker Image<br/><br/>
        latest<br/>
        development<br/>
        1.0.0<br/>
        development-1.0.0<br/>
        sha-xxxxxxx"]

        PUSH["Push Image"]

        CHECKOUT --> INSTALL
        INSTALL --> LINT
        LINT --> TEST
        TEST --> BUILD
        BUILD --> TAG
        TAG --> PUSH

    end

    %% CONTAINER REGISTRY

    GHCR["GitHub Container Registry<br/><br/>
    ghcr.io/beegeeess/<br/>
    the-village-container"]

    %% RUNTIME

    CONTAINER["Docker Container<br/><br/>
    Express / Node.js API"]

    %% RUNTIME CONFIGURATION

    SECRETS["Runtime Environment Variables<br/><br/>
    DATABASE_URL<br/>
    JWT_SECRET_KEY<br/>
    PORT<br/>
    NODE_ENV"]

    %% DATABASE

    DB["MongoDB Atlas<br/><br/>
    External Managed Database"]

    %% CONNECTIONS

    DEV -->|"git push to main"| REPO

    REPO -->|"Workflow trigger"| CHECKOUT

    PUSH -->|"Publish image"| GHCR

    GHCR -->|"Pull image"| CONTAINER

    SECRETS -.->|"Secure runtime configuration"| CONTAINER

    CONTAINER -->|"Mongoose"| DB
```
