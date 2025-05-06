import { deleteRow, editRow, filterRows } from "../components/data-funcs";
import { toast } from "react-hot-toast";

/**
 * Deletes a done process from the PCB (Process Control Block).
 *
 * @param {Object} data - The data object containing the process ID.
 * @returns {Promise<void>} - A promise that resolves when the process is successfully deleted.
 * @throws {Error} - If there is an error while deleting the process.
 */
const deleteDoneProcess = async (data) => {
    await deleteRow(data.id, "pcb")
}
/**
 * Updates a process row in the Process Control Block (PCB).
 * @param {Object} data - The process row data to be updated.
 */
// updating changes in the  Process Row
const pushChanges = async (data) => {
    await editRow(data, "pcb");
}

// changing Status of the process from Ready to Running
const changeStatus = async () => {
    // get all ready processes
    const rows = await filterRows("status", "Ready", "pcb");
    if(rows.length !== 0) {
        // sort by arrival time
        rows.sort((a, b) => a.arrival_time - b.arrival_time);
        
        // change first row to running
        rows[0].status = "Running";

        // start decrementing burst time
        rows[0].burst_time -= 1;
         
        // increase steps
        rows[0].steps += 1;
    
        // push edit
        pushChanges(rows[0]);
    }
}

// boolean to check if toast has been shown
let hasShownToast = false;

/**
 * Simulates the First Come, First Serve (FCFS) scheduling policy.
 * @param {boolean} roundRobin - Indicates whether the Round Robin algorithm is being used.
 * @returns {Promise<boolean>} - Returns a promise that resolves to a boolean indicating whether the cycle has ended.
 */
export const FCFS = async (roundRobin = false) => {

    // Check for reset flag
    if (window.resetPolicyToasts) {
        hasShownToast = false;
        window.resetPolicyToasts = false;
    }

    // show toast if not shown yet and roundRobin is false to ensure user it is already simulating
    if (!hasShownToast && roundRobin === false) {
        toast.success("Simulating First Come, First Serve...");
        hasShownToast = true;
    }

    // get the current running process
    const running = await filterRows("status", "Running", "pcb");

    // check if there is a running process
    if(running.length !== 0) {

        if (running[0].burst_time > 0) {
            
            // decrement burst_time
            running[0].burst_time -= 1;
            running[0].steps += 1;
            pushChanges(running[0])
            
        } else {

            // change current process
          deleteDoneProcess(running[0]);
          if(!roundRobin){
            changeStatus();
          } else return true
        }
        
        // end cycle
        return false;
    } 
    // get new running process if no current running process
    changeStatus();
    return false
}