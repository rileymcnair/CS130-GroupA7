Congure a CI pipeline for your repository that invokes your build script(s) on code commits to
your branches (at least the master branch).

You can use Travis CI, Circle CI, or other tools.

Include a pointer to your CI pipeline script, and describe how it is structured, and how the
process works (including triggers, actions, outputs, containers, etc.). You may choose to include a
diagram to help explain the process


Using Github Actions for both CI and CD

# Structure
1. unit tests run on push and PR to main, build is done here as well
2. integration tests run on push and PR to main.(project is small so it's not that bad to run all the tests)
3. deploy to Firebase Hosting and Firebase Functions is done upon push, since code has already been tested when pushing to main.

## unitTests
### triggers
- workflow triggered upon push to main
- workflow triggered on PR that targets main
### actions
- test both frontend and backend before building, to avoided wasted runtime failing after a build
### outputs
- test results
- build logs

## integrationTests
### triggers
- both unittests completed
### actions
- 
### outputs
- test results


## deployFirebaseFunctions.yml & deployFirebaseHosting.yml
### triggers
- workflow runs on push to the deployment branch. 
- devs should only merge to deployment branch from main only
    - since main is tested, the code that gets deployed should work.
### actions
- installing the respective required dependencies
- deploying frontend to Firebase Hosting
- deploying backend to Firebase Functions

## outputs
- build logs
- response logs?
