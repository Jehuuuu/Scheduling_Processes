// Defining a functional component named JobQueueHeader
export default function JobQueueHeader(props) {
    return(
        // The component returns a div containing the header for a job queue table
        <div>
            {/* This div contains the header row for the job queue table */}
            <div className="jobqueue-table-header">
                {/* Each cell in the header row represents a column title */}

                {/* Cell for the Process ID column */}
                <div className="pcb-cell">Process ID</div>

                {/* Cell for the Memory Size column */}
                <div className="pcb-cell">Memory Size</div>
            </div>  
        </div>
    )
}