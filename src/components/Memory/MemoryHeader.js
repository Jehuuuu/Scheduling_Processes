// Defining a functional component named MemoryHeader
// This component does not use props but accepts them as an argument
export default function MemoryHeader(props) {
    // The component returns a div containing the header for a memory table
    return(
        <div>
            {/* This div contains the header row for the memory table */}
            <div className="memory-table-header ">
                {/* Each cell in the header row represents a column title */}

                {/* Cell for the Location column */}
                <div className="pcb-cell">Location</div>

                {/* Cell for the Block Size column */}
                <div className="pcb-cell">Block Size</div>

                {/* Cell for the Process ID column */}
                <div className="pcb-cell">Process ID</div>

                {/* Cell for the Job Size column */}
                <div className="pcb-cell">Job Size</div>

                {/* Cell for the Status column */}
                <div className="pcb-cell">Status</div>

                {/* Cell for the Fragmentation column */}
                <div className="pcb-cell">Fragmentation</div>
            </div>  
        </div>
    )
}