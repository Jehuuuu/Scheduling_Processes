// Importing necessary dependencies
import {useEffect, useState} from "react"

// MemoryRows component takes rows and freeMem as props
export default function MemoryRows({ rows, freeMem }) {
  // Initialize state variables for sum and elementRows
  const [sum, setSum] = useState(0)
  const [elementRows, setElementRows] = useState([])
  
  // useEffect hook to update elementRows whenever rows prop changes
  useEffect(() => {
    // Array to hold new rows with location data
    var newRows = []

    // Variable to keep track of cumulative sum of block sizes
    var cumulativeSum = 0;

    // Loop through each row to calculate its location and update cumulative sum
    for (var idx = 0; idx < rows.length; idx++){
      var row = rows[idx]

      // Set location to current cumulative sum
      row.location = cumulativeSum

      // Add updated row to newRows array
      newRows.push(row)

      // Update cumulative sum with current row's block size
      cumulativeSum+=row.block_size
    }

    // Update elementRows state with new rows
    setElementRows(newRows)
  }, [rows]) // The effect runs whenever the rows array changes
    
  return(
    // The component returns a div containing the rows of the memory table
    <div>
      {
        // Map over elementRows array to create a div for each row
        elementRows.map(row => {
          return (
            // Each row div is given a class based on its status (busy or free) and a unique key using the row's id
            <div className={"memory-row " + (row.status.toLowerCase() === "busy" ? "memory-busy" : "")} key={row.id}>
                  {/* Cell for displaying the location in hexadecimal format */}
                  <div className="memory-table-cell">{"0xFF"+(row.location).toString(16).toUpperCase().padStart(6, '0')}</div>

                  {/* Cell for displaying the block size */}
                  <div className="memory-table-cell">{row.block_size}</div>

                  {/* Cell for displaying the process ID */}
                  <div className="memory-table-cell">{row.process_id}</div>

                  {/* Cell for displaying the job size */}
                  <div className="memory-table-cell">{row.job_size}</div>

                  {/* Cell for displaying the status */}
                  <div className={"memory-table-cell "+(row.status.toLowerCase() === "busy" ? "status-busy" : "status-free")}>{row.status}</div>

                  {/* Cell for displaying the fragmentation */}
                  <div className="memory-table-cell">{row.fragmentation}</div>
            </div>
          )
        })
      }
    </div>
  )
}