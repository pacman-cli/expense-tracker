# Deployment Instructions

This project includes a `deploy.sh` script to make updating the live server easier.

## Prerequisites

1.  **Git**: The project must be a git repository connected to your remote (GitHub).
2.  **Docker & Docker Compose**: Must be installed and running.
3.  **Environment Variables**: The `.env` file MUST be present in this directory with all production secrets.

## How to Deploy

1.  **SSH into your server**:
    ```bash
    ssh root@<your-droplet-ip>
    cd /path/to/my-fullstack-app
    ```

2.  **Run the deployment script**:
    ```bash
    # Make sure it's executable (only needed once)
    chmod +x deploy.sh
    
    # Run it
    ./deploy.sh
    ```

## What the script does

1.  **`git pull origin main`**: Fetches the latest code from GitHub.
2.  **`docker compose up -d --build`**: Rebuilds the Docker images and restarts the containers.
    -   `--build`: Forces a rebuild of images (important for code changes).
    -   `--remove-orphans`: Cleans up any containers not defined in the compose file.
3.  **`docker image prune -f`**: Removes dangling images to save disk space.

## Troubleshooting

-   **Permission Denied**: Run `chmod +x deploy.sh`.
-   **Env Vars Missing**: Check your `.env` file.
-   **Container Crash**: Run `docker compose logs --tail=100 <service_name>` (e.g., `backend` or `frontend`).
