# Scheduling Policy Simulation

To run the application smoothly, please follow the steps below. This will ensure that as a developer, you will have less to no errors encountered when running the app.

## Prerun Tasks
These are tasks needed to be done once after cloning the repository. If done already, you can proceed to the next part.

1. Install the dependencies.

        npm install
2. Create `.env` file in the directory.

    a. Right-click on the directory
    
    b. Select `new file`
    
    c. Name the file as `.env`
    
    d. Insert the environment variables. 
    
        Note: Please contact repository owner for the environment variables.
3. Create `data.json` in `src > components` folder.
    
    a. Create new file and name it as `data.json`.

    b. Paste this as the content of the file:

        {
          "pcb": [],
          "memory": [
            {
              "id": "a355",
              "location": 0,
              "block_size": 24,
              "row_id":"",
              "process_id": "",
              "job_size": "",
              "status": "Free",
              "fragmentation": "None",
              "splittable": true
            }
          ],
          "queue": []
        }

&nbsp;

## Run React APP
To start the app, open a new terminal and run:

    npm start

&nbsp;

## Run JSON Server
To be able to modify the json in app, install json-server globally:

    npm install -g json-server

Then, run:

    npm run server

&nbsp;

Note: The command above will run the json-server as follows:
    
    json-server src/components/data.json --port 3030

&nbsp;

# Guide for Optional Processes 

This section will encompass all processes that might be needed throughout the development plan. These processes are optional and is in as-needed basis.

## Add pushed file to `.gitignore`

1. modify `.gitignore`.

2. remove changed files

        git rm -r --cached .

3. add

        git add .

4. commit

        git commit -m ".gitignore is now working"