// Importing necessary functions from data-funcs.js
import { deleteRow, editRow, filterRows, getRows } from "../components/data-funcs";
// Importing FCFS function from FCFS.js
import { FCFS } from "./FCFS";
// Importing toast function from react-hot-toast for notifications
import { toast } from "react-hot-toast";

// Defining the time quantum for the Round Robin scheduling
let quantum = 3;

// Defining an async function to get the current running process
const getCurrent = async () => {
  // Fetching all processes from the "pcb" table
  const processes = await getRows("pcb");
  // Returning the process that is currently running
  return processes.find(row => row.status === "Running")
}

// Defining an async function to push changes to a row
const pushChanges = async (data) => {
    // Editing the row with the given data in the "pcb" table
    await editRow(data, "pcb");
}

// Defining an async function to mark a process as completed instead of deleting it
// This ensures better tracking for the simulation visualization
const markProcessComplete = async (data) => {
  // Update the process status to "Completed" instead of deleting
  data.status = "Completed";
  // Store the final steps value to ensure progress tracking is accurate
  data.final_steps = data.steps;
  // Update the PCB table
  await editRow(data, "pcb");
  
  // After ensuring visualization has time to track completion, then remove
  setTimeout(async () => {
    // Now remove the completed process from PCB
    await deleteRow(data.id, "pcb");
  }, 500); // Small delay to ensure visualization updates
}

// Defining an async function to change the current process
const changeProcess = async (current) => {
  // Fetching all ready processes
  const rows = await filterRows("status", "Ready", "pcb");

  // Checking if there are any ready processes
  if(rows.length > 0) {
    // Changing the status of the first ready process to running
    rows[0].status = "Running";
    // Decrementing the burst time of the process
    rows[0].burst_time -= 1;
    // Incrementing the steps of the process
    rows[0].steps += 1;

    // Pushing the changes to the process
    pushChanges(rows[0]);
  }

  // Checking if there is a current process
  if(current) {
    // Checking if the burst time of the process is 0
    if(current.burst_time === 0) {
      // Mark the process as completed instead of deleting immediately
      await markProcessComplete(current);
      return;
    }

    // Changing the status of the process to ready
    current.status = "Ready";
    
    // Don't reset steps on context switch to ensure proper progress tracking
    // This ensures the progress bar accounts for all work done
    
    // Pushing the changes to the process
    pushChanges(current);
  }
}

// Defining a variable to check if a toast has been shown
let hasShownToast = false;

// Exporting an async function named RoundRobin
export const RoundRobin = async () => {
  
  // Check for reset flag
  if (window.resetPolicyToasts) {
    hasShownToast = false;
    window.resetPolicyToasts = false;
  }
  
  // Checking if a toast has not been shown
  if (!hasShownToast) {
    // Showing a success toast with the message "Simulating Round Robin..."
    toast.success("Simulating Round Robin...");
    // Setting the variable to true to indicate that a toast has been shown
    hasShownToast = true;
  }
  
  // Fetching the current running process
  var current = await getCurrent()

  // Checking if there is a current process
  if(current) {
    // Checking if the steps of the process is less than the quantum and the burst time is greater than 0
    if(current.steps < quantum && current.burst_time > 0) {
      // Decrementing the burst time of the process
      current.burst_time -= 1;
      // Incrementing the steps of the process
      current.steps += 1;
      // Pushing the changes to the process
      pushChanges(current);
    
    // Changing the process if the steps of the process is equal to the quantum or the burst time is 0
    } else {
      await changeProcess(current);
    }
  } else {
    // Get completed processes to check if simulation is done
    const completedProcesses = await filterRows("status", "Completed", "pcb");
    const readyProcesses = await filterRows("status", "Ready", "pcb");
    const waitingProcesses = await filterRows("status", "Waiting", "pcb");
    
    // If there are no ready or waiting processes but we have completed ones,
    // move them to a final state by removing them
    if (readyProcesses.length === 0 && waitingProcesses.length === 0 && completedProcesses.length > 0) {
      // Remove all completed processes to signal simulation end
      for (const process of completedProcesses) {
        await deleteRow(process.id, "pcb");
      }
    } else {
      // Changing the process if there is no current process
      await changeProcess(null);
    }
  }
}