// Importing necessary dependencies
import { useState, useEffect } from "react";

// Importing Dropdown component from react-bootstrap for creating dropdown menus
import { Dropdown } from "react-bootstrap";

// Importing functions for data manipulation
import { addRow, getLastRowID, getProcessID } from "../data-funcs";

// Importing NewCustomRow component for adding a custom row
import NewCustomRow from "./NewCustomRow";

// Importing Memory component to show the memory modal
import Memory from '../Memory/MemoryModal';

// Importing VoiceCommands component for voice command functionality
import VoiceCommands from "../../voice/VoiceCommands";

// Defining a functional component named Header
export default function Header(props) {
    // Defining state variables using useState hook

    // State to manage the visibility of NewCustomRow modal
    const [open, setOpen] = useState(false); 

    // State to manage the visibility of Memory modal
    const [openMemory, setOpenMemory] = useState(false);

    // Asynchronous function to add a new row to the PCB
    async function addNewRow(type) {
        // Get the last row ID and increment by 1 to get the new row ID
        const id = Number(await getLastRowID("pcb")) + 1;

        if(type === "random")  {
            // Create a new row with random values
            const finalRow = {
                process_id: id.toString(),
                burst_time:Math.floor(Math.random() * 8) + 3,
                memory_size: Math.floor(Math.random() * 10) + 1,
                arrival_time: props.time,
                priority: Math.floor(Math.random() * 10) + 1,
                status: "Ready",
                waiting_time: 0,
                steps: 0
            }

            // Initialize io event and io time properties for the new row
            finalRow.init_burst = finalRow.burst_time;
            finalRow.io_when = Math.floor(Math.random() * (finalRow.burst_time - 2)) + 2;
            finalRow.io_time = Math.floor(Math.random() * 10) + 1;

            // Add the new row to the "queue"
            await addRow(finalRow, "queue");
        } else {
            // Open the NewCustomRow modal for custom process
            setOpen(true);
        }
    }

    return (
        // The component returns a div containing the header for the PCB
        <div className="pcb-header">
        
        <div className="title-contain">
          <h1>Process Control Block</h1>
            <div className="btn-badge-wrapper">
                {/* Button to open the Memory modal */}
                <button className="btn-primary" onClick={()=>setOpenMemory(true)}>
                  Job Queue
                </button>
                
                {/* Display a badge with the number of jobs in the job queue */}
                {props.jobQueue > 0 && (
                  <span className="btn-badge">{props.jobQueue}</span>
                )}
            </div>
        </div>
            <div className="btn-cont">
                {/* VoiceCommands component for voice command functionality */}
                <VoiceCommands/>

                {/* Dropdown menu to add a new process */}
                <Dropdown className="dropdown">
                    <Dropdown.Toggle className="new-process" id="New">
                        Add New Process
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        {/* Dropdown item to generate a random process */}
                        <Dropdown.Item id='Random' onClick={() => addNewRow("random")}>Generate Random Process</Dropdown.Item>

                        {/* Dropdown item to add a custom process */}
                        <Dropdown.Item id='Custom' onClick={() => addNewRow("custom")}>Add Custom Process</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>

            {/* Modal for adding a custom process */}
            <NewCustomRow show={open} hide={() => setOpen(false)} time={props.time} policy={props.policy} />

            {/* Modal for displaying memory */}
            <Memory open={openMemory} close={() => setOpenMemory(false)}/>
        </div>
    )
}