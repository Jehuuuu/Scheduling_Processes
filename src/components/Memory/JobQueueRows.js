// Importing useState hook from React for managing state
import { useState } from "react"

// Importing an image to be used indicating there are no job queue rows
import NoJobQueue from "../../images/no-job-queue.png"

// Importing NoData component, which displays a message & image when there is no data
import NoData from "../PCB/NoData"

// Defining a functional component named JobQueueRows
// This component accepts a prop named rows, which is an array of job queue data
export default function JobQueueRows({rows}){
    return(
        // The component returns a div containing the rows of the job queue table
      <div className="jobqueue-container"> 
            {/* If there are no rows, display the NoData component with an image */}
            {rows.length < 1 && 
              <NoData noDataImg={NoJobQueue} />
            }

            {/* Map over the rows array to create a div for each row */}
            {rows.map(row => {
                return (
                    // Each row div is given a unique key using the row's id for efficient rendering
                    <div className={"jobqueue-row"} key={row.id}>
                        {/* Cell for displaying the process ID */}
                        <div className="jobqueue-table-cell">{row.process_id}</div>

                        {/* Cell for displaying the memory size */}
                        <div className="jobqueue-table-cell">{row.memory_size}</div>
                    </div>
                )
            })}
        </div>
    )
}