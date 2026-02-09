# Basal Frontend

A Next.js frontend application for Basal, designed to help identify and mitigate bias in decision-making processes.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- running server at `http://localhost:8000` or provided BackendURL

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/drjayaswal/basal-frontend.git
cd basal-frontend
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Development Server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```


### Updating the Application Code

To stage all changes for a commit, use the following command:
```bash
git add .
```

To commit all changes with a message, use:
```bash
git commit -m "specify the changes made"
```

To commit all changes with a message, use:
```bash
git commit -m "specify the changes made"
```

To build and push the Docker image providing the Google Client ID, use:
## Platform Dependent MAC
```bash
docker build \
--build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=google-client-id \
-t dhruv2k3/basal-frontend:latest .
```
## Platform Independent MAC
```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-id \
  -t dhruv2k3/basal-frontend:latest \
  --push .
```

To test the image locally, use:
```bash
docker run -p 3000:3000 dhruv2k3/basal-frontend
```


To send new layers to docker hub, use:
```bash
docker push dhruv2k3/basal-frontend:latest
```

to run the docker container via docker-compose.yml, use:
```bash
docker compose pull
docker compose up -d

#or

docker compose up -d --build
```


Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The application auto-updates as you edit files in `app/` directory.

### Build for Production

```bash
npm run build
npm start
```


## Contributing

Contributions are welcome! Please feel free to submit a pull request.
