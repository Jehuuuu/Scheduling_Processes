// Importing Modal component from react-bootstrap for creating modal dialogs
import { Modal } from "react-bootstrap";

// Importing MemoryHeader component for the memory table header
import MemoryHeader from "./MemoryHeader";

// Importing MemoryRows component for the memory table rows
import MemoryRows from "./MemoryRows";

// Importing JobQueueHeader component for the job queue table header
import JobQueueHeader from "./JobQueueHeader";

// Importing JobQueueRows component for the job queue table rows
import JobQueueRows from "./JobQueueRows";

// Importing data from a local JSON file
import jsonData from '../data.json';

// Importing functions for data manipulation
import { deleteRow, getRows } from '../data-funcs';

// Importing useEffect and useState hooks from React
import { useEffect, useState } from 'react';

// Defining a functional component named Memory
export default function Memory(props) {
    // Defining state variables using useState hook

    // State to hold memory data
    const [memory, setMemory] = useState([]);

    // State to hold the queue data
    const [queue, setQueue] = useState([]);

    // State to hold the amount of free memory, initialized to 24
    const [freeMem, setFreeMem] = useState(24);
    
    // Function to calculate the sum of block sizes in the memory
    function getSum(memory) {
      var sum = 0
      memory.forEach(item => sum += item.block_size)
      return sum
    }
  
    // Asynchronous function to fetch data for memory and job queue
    async function fetchData() {
        // Fetch memory data
        const memory = await getRows("memory");

        // Update free memory
        setFreeMem(24-getSum(memory))
        
        // If there is memory data, update the memory state
        if(memory.length > 0) {
            setMemory(memory);
        } else {
            setMemory([]);
        }
        
        // Fetch job queue data
        const queue = await getRows("queue");

        // Update queue state based on fetched data
        if(queue.length > 0) {
            setQueue(queue);
        } else {
            setQueue([]);
        }
    }
  
    // useEffect hook to fetch data when the component mounts or jsonData changes
    useEffect(() => {
        fetchData();
    }, [jsonData])

    return (
        // The component returns a Modal component containing memory and job queue data
        <Modal show={props.open} onHide={props.close} size="lg" className="policy-info centered-modal">
            {/* Memory section */}
            <h1>Memory</h1>

            {/* Rendering the memory table header */}
            <MemoryHeader />
                
            {/* Rendering the memory table rows */}
            <MemoryRows rows={memory} freeMem={freeMem} />

            {/* Job Queue section */}
            <h1 style={{"paddingTop": "50px"}}>Job Queue</h1>

            {/* Rendering the job queue table header */}
            <JobQueueHeader/>

            {/* Rendering the job queue table rows */}
            <JobQueueRows rows={queue} />
        </Modal>
    )
}