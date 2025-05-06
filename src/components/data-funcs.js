// Importing axios for making HTTP requests
import axios from 'axios';

// Setting the base URL for the API
const baseURL = process.env.REACT_APP_JSON_SERVER;

// Function to get all rows from a specific table
export const getRows = async (table) => {
    // Making a GET request to the API
    const response = await axios.get(baseURL + table);
    // Returning the data from the response
    return response.data;
}

// Function to get a specific row from a table
export const getRow = async (id, table) => {
    // Making a GET request to the API
    const response = await axios.get(baseURL + table+ '/' + id);
    // Returning the data from the response
    return response.data;
}

// Function to filter rows based on a specific condition
export const filterRows = async (type, state, table) => {
    // Getting all rows from the table
    const rows = await getRows(table);
    // Filtering the rows based on the condition and returning the result
    return rows.filter(row => row[type] === state);
}

// Function to get the ID of the last row in a table
export const getLastRowID = async (table) => {
    // Getting all rows from the table
    const response = await getRows(table);

    // If there are no rows, return null
    if(response.length === 0) return null;
    // Otherwise, return the ID of the last row
    else return response[response.length - 1].process_id;
}

// Function to get the process ID
export const getProcessID = async () => {
  // Getting the last row ID from the queue table
  const response = await getLastRowID("queue")
  // If there is no response, get the last row ID from the pcb table
  if (response === null) {
    const pcb = await getLastRowID("pcb")
    return pcb
  } 
  // Otherwise, return the response
  return response
}

// Function to add a new row to a table
export const addRow = async (data, table) => {
    try {
        // Making a POST request to the API
        const response = await axios.post(baseURL + table, data);
        // Returning the status of the response
        return response.status;
    } catch (error) {
        // Logging any errors
        console.error(error);
    }
}

// Function to edit a row in a table
export const editRow = async (data, table) => {
    try {
        // Making a PUT request to the API
        const response = await axios.put(baseURL + table + '/' + data.id, data);

        // Returning the data from the response
        return response.data;
    } catch (error) {
        // Logging any errors
        console.error(error);
    }
}

// Function to delete a row from a table
export const deleteRow = async (process_id, table) => {
    try {
      // Making a DELETE request to the API
      const response = await axios.delete(baseURL + table + "/" + process_id);
      // If the table is pcb, update the memory status
      if (table === "pcb") {
        const memory = await filterRows("row_id", process_id, "memory")
        if(memory.length>0){
          const updated_memory = { ...memory[0], status: "Free", process_id: "", job_size: "", row_id:"", fragmentation: "None" }
          const memory_res = await editRow(updated_memory, "memory")
        }
      }
        // Returning the status of the response
        return response.status;
    } catch (error) {
        // Logging any errors
        console.error(error);
    }
}

// Function to delete all rows from a table
export const deleteAllRows = async (table) => {
    try {
        // Getting all rows from the table
        const rows = await getRows(table);

        // Deleting each row from the table
        rows.forEach(async row => {
            await deleteRow(row.id, table);
        });

    } catch (error) {
        // Logging any errors
        console.error(error);
    }
}

// Function to get the sum of the block sizes in memory
export function getSum(memory) {
      var sum = 0
      // Adding up the block sizes
      memory.forEach(item => sum += item.block_size)
      // Returning the sum
      return sum
}