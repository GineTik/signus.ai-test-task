# ur.authentication

`ur.authentication` is a user authentication service that provides user registration, login, and social login functionalities.

## Project Setup

The project is fully containerized using Docker. To get started, you need to have Docker and Docker Compose installed on your machine.

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd ur.authentication
    ```

2.  **Create a `.env` file:**

    Based on the `.env.example` file or `docker-compose.yml`, create a `.env` file and set up your environment variables. The necessary variables are `DATABASE_URL` and `REDIS_URL`.

3.  **Build and run the application:**

    ```bash
    docker-compose up --build
    ```

    This command will build the Docker images for the application, a Postgres database, and a Redis instance, and then start the services. The application will be available at `http://localhost:3000`.

## What If

### Scaling the Authentication Service

To handle a massive increase in traffic, such as 1,000 user registration requests per second and 100,000 user login requests per second, we would need to re-architect our system. We'd move from a single-instance prototype to a distributed, highly available, and scalable architecture.

The core idea would be to introduce a load balancer to distribute incoming requests across multiple stateless instances of the authentication service. For data storage, a relational database like PostgreSQL is a good start, but for this scale, we would need to use a primary/secondary replication setup. The primary database would handle all write operations (like user registrations), while the replicas would handle read operations (like logins). This would significantly reduce the load on the primary database. To further improve read performance for logins, we could implement a caching layer using Redis to cache user sessions and frequently accessed data.

## Social Login

The implementation of social login in this service uses Passport.js with different strategies for each provider (e.g., `passport-google-oauth20`). The general flow is as follows:

1.  **Initiate Login**: The user clicks a "Login with Google" button on the client-side application.
2.  **Redirect to Provider**: The backend redirects the user to the social provider's authentication page.
3.  **User Consent**: The user grants permission for our application to access their basic profile information.
4.  **Callback**: The provider redirects the user back to a pre-configured callback URL on our service with an authorization code.
5.  **Token Exchange**: The backend exchanges the authorization code for an access token from the provider.
6.  **Fetch User Info**: The service uses the access token to fetch the user's profile information from the provider.
7.  **Authentication**: The service then either finds an existing user with the same email address or creates a new user in the database. Finally, it generates a JWT to send back to the client, completing the login process.
