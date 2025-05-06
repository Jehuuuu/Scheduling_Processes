// This is a functional component that renders the table header for a process control block (PCB)
export default function TableHeader(props) {
    // The component returns a div with a dynamic class name based on the length of the data prop
    return (
        <div className={"pcb-table-header " + (props.data.length > 2 ? "table-scroll" : "table-no-scroll")}>
            {/* Empty div for CPU Scheduler */}
            <div className="pcb-table-cell"></div>

            {/* Divs for PCB headers */}
            <div className="pcb-table-cell">Process ID</div> {/* Header for Process ID */}
            <div className="pcb-table-cell">Burst Time</div> {/* Header for Burst Time */}
            <div className="pcb-table-cell">Memory Size</div> {/* Header for Memory Size */}
            <div className="pcb-table-cell">Arrival Time</div> {/* Header for Arrival Time */}
            <div className={"pcb-table-cell " + 
                (props.policy !== "Priority" ? "color-gray" : "")}>
                Priority {/* Header for Priority, with conditional styling based on the policy prop */}
            </div>
            <div className="pcb-table-cell">Status</div> {/* Header for Status */}
            <div className="pcb-table-cell">Waiting Time</div> {/* Header for Waiting Time */}
            <div className="pcb-table-cell">IO Event</div> {/* Header for IO Event */}
            <div className="pcb-table-cell">IO Time</div> {/* Header for IO Time */}

            {/* Empty div for delete button */}
            <div className="pcb-table-cell"></div>
        </div>     
    )
}