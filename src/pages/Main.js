// Importing necessary hooks and modules from react, react-router-dom, and react-hot-toast
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from 'react-hot-toast';

// Importing necessary icons and styles
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import './Main.css';

// Importing necessary components
import Policy from "../components/policy";
import ConfirmSwitch from "../components/ConfirmSwitch";
import PCBRows from "../components/PCB/PCBRows";
import Header from "../components/PCB/header";
import TableHeader from "../components/PCB/tableHeader";
import Simulation from "../components/Simulation/Simulation";

// Importing necessary functions, scheduling policies, and data
import { addRow, deleteAllRows, deleteRow, editRow, filterRows, getRows, getSum } from "../components/data-funcs";
import { FCFS } from "../policies/FCFS";
import { Priority } from "../policies/Priority";
import { RoundRobin } from "../policies/RoundRobin";
import { SJF } from "../policies/SJF";
import jsonData from "../components/data.json";
import './Main.css';

// Main component
export default function Main() {
    // Using the useLocation hook to access the current location object
    const location = useLocation();

    /*<-------------- VARIABLES -------------->*/
    const [openInfo, setOpenInfo] = useState(false); // open info modal
    const [data, setData] = useState([]); // stores processes from json
    const [time, setTime] = useState(0); // tracks running time 
    const [currProcess, setCurrProcess] = useState({}); // stores current running process
    const [changePolicy, setChangePolicy] = useState(false); // for change policy modal
    const [toPolicy, setToPolicy] = useState("First Come, First Serve"); // for change policy modal
    const [selectedPolicy, setSelectedPolicy] = useState( // selected schedule policy
        location.state 
        ? location.state.policy 
        : 'First Come, First Serve');   

    const [avgTime, setAvgTime] = useState({ // stores calculated avg time
        total_time: 0,
        total_rows: 0,
        avg_time: 0
    });
    
    // State for job queue
    const [jobQueue, setJobQueue] = useState(0)

    const policies = [ // list of scheduling policies
        'First Come, First Serve',
        'Shortest Job First',
        'Priority',
        'Round Robin',
  ];


    /*<-------------- FUNCTIONS -------------->*/
    // fetch data to display
    useEffect(() => {
      async function fetchData() {
        setData(await getRows("pcb"));
      }
      fetchData()
    }, []);

    // processes to do when new policy is selected
    async function clickPolicy(e) {
        const policy = e.target.value;
        setToPolicy(policy);

        /* open modal to change policy here */
        setChangePolicy(true);
    }

    // calculate average waiting time
    useEffect(() => {
        var obj = avgTime; // holder for updated avg time
        const running = data.filter(item => item.status === "Running"); // get current running process

        if(running.length > 0) {
            // if not same with stored currProcess
            if(running[0].id !== currProcess.id) { 

                obj.total_time += running[0].waiting_time; // add waiting time to total time
                obj.total_rows += 1; // add new row to total rows
                obj.avg_time = parseFloat(obj.total_time / obj.total_rows).toFixed(2); // recalculate avg time

                setCurrProcess(running[0]); // set it as the new currProcess
            }
        }

        setAvgTime(obj); // set the updated avg time
    }, [data]);

    // increment waiting time
    async function changeWaitTime() {
        var allRows = await filterRows("status", "Ready", "pcb");

        allRows.forEach(async row => {
            row.waiting_time += 1;

            row.steps = 0;
            
            await editRow(row, "pcb");
        })
    }

    // decrement IO time
    async function changeIOTime() {
        const waiting = await filterRows("status", "Waiting", "pcb");

        waiting.forEach(async item => {
            if(item.io_time > 0) {
                item.io_time--;
            } else {
                item.status = "Ready";
            }
            
            item.steps = 0;

            await editRow(item, "pcb");
        })
    }

    // time interval component - only for time tracking, not for policy application
    useEffect(() => {
      const interval = setInterval(async () => {
          // Only increment the time counter for UI display purposes
          setTime(time => time + 1)
      }, 3000);
    
      return () => clearInterval(interval);
    }, []); 

    // io calculations - moved to the Simulation component
    // This useEffect is now only for display purposes and doesn't modify data
    useEffect(() => {
        async function updateDataDisplay() {
            const currentData = await getRows("pcb");
            setData(currentData);
        }
        
        updateDataDisplay();
    }, [jsonData]);

  function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
    // Job Queue - Memory Calculations
  async function checkJobQueue() {
    // get jobQueues
    var queue = await getRows("queue")
    // Set JobQueue to change badge status
    setJobQueue(queue.length)
    
    var i = 0;
    // for each queue, search memory space to
    while (i < queue.length) {
      const memory = await filterRows("status", "Free", "memory")
      var job = queue[i]
      var smallestFragmentation = {}
        for (var idx = 0; idx < memory.length; idx++){
          var currMemory = memory[idx]
          if (isEmptyObject(smallestFragmentation) && currMemory.splittable && currMemory.block_size >= job.memory_size) {
            // Split the segment
            if (parseInt(currMemory.block_size) - parseInt(job.memory_size) > 0) {
              var remainingSegment = {
                process_id: "",
                job_size: "",
                row_id: "",
                status: "Free",
                Fragmentation: "None",
                block_size: parseInt(currMemory.block_size) - parseInt(job.memory_size),
                splittable: true
              }
              // add to memory and pcb, delete it from queue
                await addRow(remainingSegment, "memory")
            }
            
            // Create another segment
            var segment = {
              id: currMemory.id,
              block_size: parseInt(job.memory_size),              
              process_id: job.process_id,
              row_id: job.id,
              job_size: parseInt(job.memory_size),
              status: "Busy",
              fragmentation: 0,
              splittable: false
            }
            await addRow(job, "pcb")
            await deleteRow(job.id, "queue")
            await editRow(segment, "memory")
            queue = await getRows("queue");
            i--

            break;
          } else if(currMemory.block_size >= job.memory_size) {
            var fragmentation = memory[idx].block_size - job.memory_size
            if(isEmptyObject(smallestFragmentation) || fragmentation < smallestFragmentation.fragmentation) {
              smallestFragmentation = memory[idx]
              smallestFragmentation.fragmentation = fragmentation
              smallestFragmentation.process_id = job.process_id
              smallestFragmentation.row_id = job.id
              smallestFragmentation.job_size = job.memory_size
              smallestFragmentation.status = "Busy"
            } else {
              continue
            }
          }
        }
        if (!isEmptyObject(smallestFragmentation)) {
          await editRow(smallestFragmentation, "memory")
          await addRow(job, "pcb")
          await deleteRow(job.id, "queue")
          queue = await getRows("queue");
          i--
        }


        i++
    }
    // Check if there is a need for compaction
    const remainingQueue = await getRows("queue")
    const currentMem = await filterRows("status", "Free", "memory")

    if (remainingQueue.length > 0 && currentMem.length > 1) {
      // perform compaction
      await startCompaction()
    }

  } 
  async function startCompaction() {
     // get all free
    const memory = await filterRows("status", "Free", "memory")
    // combine - add block size
    const combinedSum = getSum(memory)
    // create new segment with the sum of block size
    var combinedSegment = {
      process_id: "",
      job_size: "",
      row_id:"",
      status: "Free",
      Fragmentation: null,
      block_size: combinedSum,
      splittable: true
    }
    await addRow(combinedSegment, "memory")
    // delete all free
    for (var idx = 0; idx < memory.length; idx++){
      await deleteRow(memory[idx].id, "memory")
    }
  }
    useEffect(() => {
      (async () => await checkJobQueue())()
    },[jsonData])

    return (
        <div className="main">
            {/* scheduling policy */}
            <div className="policy-cont cont-template">
                <h1>Scheduling Policies</h1>
                <div className="policies">
                    {policies.map(policy => {
                        return (
                            <button 
                                id={policy}
                                className={"btn-primary " + (selectedPolicy === policy ? "selected-policy" : "")} 
                                value={policy} 
                                key={policy}
                                onClick={e => clickPolicy(e)}
                                disabled={selectedPolicy === policy ? true : false}>
                                {policy}
                            </button>
                        )
                    })}
                </div>

                {/* info */}
                <InfoOutlined className="info" onClick={() => setOpenInfo(true)} />
                <Policy policy={selectedPolicy} open={openInfo} close={() => setOpenInfo(false)} />
            </div>

            {/* simulation */}
            <div className="sim-cont mt-3">
                {/* <h6>Current Time: {time}</h6> */}
                <Simulation avgTime={avgTime.avg_time} policy={selectedPolicy} />
            </div>

            {/* PCB */}
            <div className="pcb-cont cont-template">
                {/* PCB header */}
                <Header time={time} policy={selectedPolicy} jobQueue={jobQueue} />

                {/* PCB table */}
                <TableHeader data={data} policy={selectedPolicy} />

                {/* PCB rows */}
                <PCBRows policy={selectedPolicy} />
            </div>

            {/* change Policy Modal */}
            <ConfirmSwitch open={changePolicy} close={() => setChangePolicy(false)} to_policy={toPolicy} />
        </div>
    );
}