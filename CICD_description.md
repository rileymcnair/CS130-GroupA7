# CI/CD Workflow Structure

## Unit Tests
Unit tests for both frontend and backend run on every push and pull request (PR) to the `main` branch.

### `frontendUnitTests.yml`
- **Triggers**: On push or PR to `main`.
- **Actions**: 
  - Install dependencies to run React.
  - Run unit tests.
- **Outputs**: Logs the names of failed test cases.

### `backendUnitTests.yml`
- **Triggers**: On push or PR to `main`.
- **Actions**: 
  - Install Python dependencies (`pip install requirements.txt`).
  - Run unit tests.
- **Outputs**: Logs failed test case responses.

---

## Integration/E2E Tests
Integration and end-to-end (E2E) tests run on every push and PR to the `main` branch but depend on the successful completion of both frontend and backend unit tests.

### `integrationTests.yml`
- **Triggers**: On push or PR to `main`.
- **Condition**: Waits for the completion of the following workflows:
  - Frontend Unit Tests.
  - Backend Unit Tests.
- **Actions**:
  1. Set up the project environment.
  2. Install dependencies for both React and Python.
  3. Build the project.
  4. Start local servers for the frontend and backend.
  5. Run Playwright tests.
- **Outputs**: Logs the names of failed test cases.

---

## Deployment Workflow
Deployment workflows are triggered by pushing to the `deploy` branch. This allows for manual control over when the latest version of the app is deployed, providing time for additional testing (e.g., manual testing).

### `deployFirebaseHosting.yml`
- **Triggers**: On push to the `deploy` branch.
- **Actions**:
  1. Install dependencies and build the app.
  2. Deploy the app to Firebase Hosting.

### `deployGoogleCloudRun.yml`
- **Status**: Not implemented due to issues with deploying the Docker container to Google Cloud Run.
- **Intended Structure**:
  - Similar to `deployFirebaseHosting.yml`, but adapted for deploying a Docker container to Google Cloud Run.
