// Importing Modal and Table components from react-bootstrap for creating the modal and table
import { Modal, Table } from "react-bootstrap";

// Importing functions for data manipulation
import { addRow, getLastRowID, getProcessID } from "../data-funcs";

// Importing useEffect and useState hooks from React
import { useEffect, useState } from "react";

// Defining a functional component named NewCustomRow
export default function NewCustomRow(props) {
    // Defining state variable using useState hook
    // State to hold the current row data
    const [row, setRow] = useState({});
    
    // Asynchronous function to initialize row data
    async function initialData() {
        // Get the next process ID
        const id = Number(await getProcessID()) + 1;
        // Set initial row data
        setRow({
            process_id: id.toString(),
            burst_time: 0,
            memory_size: 0,
            arrival_time: props.time,
            priority: 0,
            status: "Ready",
            waiting_time: '-',
            steps: 0
        })
    }

    // useEffect hook to initialize row data when the component is mounted or props.show change
    useEffect(() => {
        initialData();
    }, [props.show, true]);

    // Asynchronous function to add a new row to the PCB
    async function addNewRow() {
        row.waiting_time = 0;   // Set initial waiting time
        row.init_burst = row.burst_time;    // Set initial burst time
        row.io_when = Math.floor(Math.random() * (row.burst_time - 1)) + 1;  // Set random io event
        row.io_time = Math.floor(Math.random() * 10) + 1;   // Set random io time

        // Add the row to the "queue"
        await addRow(row, "queue");
        // Hide the modal
        props.hide();
    }

    // Function to handle input change
    function handleChange(e) {
        // Update the corresponding field in row state
        setRow({...row, [e.target.id]: e.target.value});
    }

    return (
        // The component returns a modal for adding a custom row
        <Modal dialogClassName="custom-row" show={props.show} onHide={props.hide} centered>
            <Modal.Header>Add Custom Row</Modal.Header>
            <Modal.Body>
                {/* Table for displaying row data */}
                <Table>
                    <thead>
                        <tr>
                            <th className="row-cell">Process ID</th>
                            <th className="row-cell">Burst Time</th>
                            <th className="row-cell">Memory Size</th>
                            <th className="row-cell">Arrival Time</th>
                            <th className={"row-cell " +
                                (props.policy !== "Priority" ? "color-gray" : "")}>
                                Priority
                            </th>
                            <th className="row-cell">Status</th>
                            <th className="row-cell">Waiting Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {/* Displaying Process ID */}
                                <div className="row-cell">{row.id}</div>
                            </td>
                            <td>
                                {/* Input for Burst Time */}
                                <input type="number" min="0" id="burst_time" className="row-cell" defaultValue={row.burst_time} onChange={(e) => handleChange(e)} />
                            </td>
                            <td>
                                {/* Input for Memory Size */}
                                <input type="number" min="0" id="memory_size" className="row-cell" defaultValue={row.memory_size} onChange={(e) => handleChange(e)} />
                            </td>
                            <td>
                                {/* Displaying Arrival Time */}
                                <div className="row-cell">{row.arrival_time}</div>    
                            </td>
                            <td>
                                {/* Input for Priority */}
                                <input 
                                    type="number" 
                                    min="0" 
                                    id="priority" 
                                    className="row-cell" 
                                    defaultValue={row.priority}
                                    disabled={props.policy !== "Priority" ? true : false} 
                                    onChange={(e) => handleChange(e)} 
                                />
                            </td>
                            <td>
                                {/* Displaying Status */}
                                <div className="row-cell">{row.status}</div>
                            </td>
                            <td>
                                {/* Displaying Waiting Time */}
                                <div className="row-cell">{row.waiting_time}</div>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                {/* Close button to hide the modal */}
                <button id='Close' className="btn-primary" onClick={props.hide}>Close</button>
                {/* Button to add a new row */}
                <button id='Add New Row' className="btn-primary btn-add" onClick={() => addNewRow()}>Add Row</button>
            </Modal.Footer>
        </Modal>
    )
}