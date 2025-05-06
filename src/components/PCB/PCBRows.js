// Delete icon from Material-UI
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';

// Arrow icon from Material-UI
import ArrowIcon from '@mui/icons-material/ArrowRightOutlined';

// useEffect and useState hooks from React
import { useEffect, useState } from 'react';

// Data manipulation functions
import { deleteRow, getRows } from '../data-funcs';

// NoData component
import NoData from './NoData';

// Importing data from JSON file
import jsonData from '../data.json';

// Defining a functional component named PCBRows
export default function PCBRows(props){
    // State variable to hold data
    const [data, setData] = useState([]);

    // useEffect hook to fetch data on component mount or when jsonData changes
    useEffect(() => {
        async function fetchData() {
            // Fetching rows from "pcb"
            const rows = await getRows("pcb");

            if(rows.length > 0) {
                // If rows are found, set data
                setData(rows);
            } else {
                // If no rows are found, set data to empty array
                setData([]);
            }
        }
        // Calling fetchData function
        fetchData();
    }, [jsonData]) // Dependency array to re-run effect when jsonData changes

    // Function to delete a row by ID
    async function deleteRowID(id) {
        // Deleting row from "pcb"
        await deleteRow(id, "pcb");
    }

    return (
        <div className="pcb-table">
            {/* Displaying NoData component if no data is available */}
            {data.length === 0 ?
            <NoData />
            : data.map(row => {
                return (
                    // Displaying each row in the PCB
                    <div className={"pcb-row " + (row.status.toLowerCase() === "running" ? "pcb-row-active" : "")} key={row.id}>
                        {/* Arrow icon, active if row status is running */}
                        <div className={"pcb-cell " + (row.status.toLowerCase() === "running" ? "" : "pcb-cell-inactive")}>
                            <ArrowIcon className='ms-1' />
                        </div>

                        {/* Displaying row data */}

                        {/* Displaying process id cell */}
                        <div className="pcb-cell">{row.process_id}</div>

                        {/* Displaying burst time cell */}
                        <div className="pcb-cell">{row.burst_time}</div>

                        {/* Displaying memory size cell */}
                        <div className="pcb-cell">{row.memory_size}</div>

                        {/* Displaying arrival time cell */}
                        <div className="pcb-cell">{row.arrival_time}</div>

                        {/* Displaying priority cell. Only enabled during Priority Scheduling */}
                        <div className={"pcb-cell " +
                            (props.policy !== "Priority" ? "color-gray" : "")}>
                            {row.priority}
                        </div>

                        {/* Displaying status cell */}
                        <div className={"pcb-cell " + (
                            row.status.toLowerCase() === "running" ? "pcb-cell-green" :
                            row.status.toLowerCase() === "waiting" ? "pcb-cell-red" : 
                            row.status.toLowerCase() === "ready" ? "pcb-cell-yellow" : "")}>
                            {row.status}
                        </div>

                        {/* Displaying waiting time cell */}
                        <div className="pcb-cell">{row.waiting_time}</div>

                        {/* Displaying I/O event and I/O time cells */}
                        <div className="pcb-cell">{row.io_when}</div>
                        <div className="pcb-cell">{row.io_time}</div>

                        {/* Delete icon to delete the row */}
                        <DeleteIcon id='Delete' className="delete-icon" onClick={() => deleteRowID(row.id)} />
                    </div>
                )
            })}
        </div>
    )
}