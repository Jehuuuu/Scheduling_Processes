import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import man from '../../images/man.gif';
import woman from '../../images/woman.gif';
import Video from '../Video.js';
import { addRow, deleteAllRows, getRows, editRow, filterRows, deleteRow } from '../data-funcs.js';
import jsonData from '../data.json';
import './Simulation.css';

// Import scheduling policies
import { FCFS } from '../../policies/FCFS';
import { SJF } from '../../policies/SJF';
import { Priority } from '../../policies/Priority';
import { RoundRobin } from '../../policies/RoundRobin';

/**
 * This function is the simulation component designed to cater simulation for various scheduling policies.
 */

export default function Simulation(props) {
    /** state variables **/
    const location = useLocation();
    const [rows, setRows] = useState([]); //rows of data
    const [running, setRunning] = useState([]); //running processes
    const [valuemax, setValueMax] = useState(0); //maximum value
    const [totalSteps, setTotalSteps] = useState(0); //total steps
    const [doneProcess, setDoneProcess] = useState([]); //all entering processes
    const [timeline, setTimeline] = useState([0, 0]); //timeline
    const [onLoad, setOnLoad] = useState(true); //flag for page load
    const [showVideo, setShowVideo] = useState(false); //flag to show video
    const [videoFlag, setVideoFlag] = useState(false); //flag for video
    const [showResetModal, setShowResetModal] = useState(false); //flag for reset modal
    const [simulationPaused, setSimulationPaused] = useState(true); //flag to control simulation start/pause

    // fetch all current processes
    useEffect(() => {
        async function fetchData() {
            const rows = await getRows("pcb");
            setRows(rows);
        }

        fetchData();
    }, [jsonData]);

    // process the running processes
    useEffect(() => {
        async function getRunningProcess() {
            // Only process running processes if simulation is not paused
            if (simulationPaused) return;
            
            // Check for both running and completed processes
            const current_running = rows.filter(row => row.status === 'Running');
            const completed_processes = rows.filter(row => row.status === 'Completed');

            // Process completed processes to ensure they're included in the visualization
            for (const completedProcess of completed_processes) {
                // Make sure completed processes are in the running array for visualization
                if (!running.find(r => r.id === completedProcess.id)) {
                    var newArr = [...running];  // Create a proper copy to avoid mutation issues
                    newArr.push(completedProcess);
                    setRunning(newArr);
                }
            }
            
            if(current_running.length > 0) {
                const curr = current_running[0]; // current running process
                var newArr = [...running]; // holder for updated running processes (proper copy)
                var time = [...timeline]; // proper copy
                time.pop();
                
                if(running.length > 0) {
                    const lastIndex = running.length - 1; // last index of processes ran
                    
                    // check if last process is the same with current running
                    const sameID = running[lastIndex].id === curr.id;
                    const sameBurst = running[lastIndex].init_burst === curr.init_burst;
                    const sameIO = running[lastIndex].io_time === curr.io_time;

                    if(sameID && sameBurst && sameIO) {
                        // update last index details
                        newArr[lastIndex] = curr;
                        time[time.length - 1] = time[time.length - 2] + curr.steps;
                    } else {
                        // update last index steps
                        // if policy is preemptive
                        if (location.state && location.state.policy !== "First Come, First Serve"
                            && location.state.policy !== "Round Robin") {
                            const lastOne = rows.find(item => item.id === newArr[lastIndex].id);
    
                            if(lastOne?.status === "Ready") {
                                newArr[lastIndex].steps += 1;
                                time[time.length - 1] += 1;
                            }
                        }
                         
                        // add curr
                        newArr.push(curr)
                        time.push(time[time.length - 1] + curr.steps)
                    }
                } else {
                    // add new element to array if array is empty
                    newArr.push(curr)
                    time.push(time[time.length - 1] + curr.steps)
                }

                // push changes to variable
                time.push(valuemax);
                setTimeline(time);
                setRunning(newArr);
            }
        }
        
        getRunningProcess();
    }, [jsonData, simulationPaused])

    // count the maximum value
    useEffect(() => {
        if (simulationPaused) return;
        
        var max = valuemax;

        if(doneProcess.length < 1) {
            setDoneProcess(rows);
            max += rows.reduce((sum, item) => sum += Number(item.init_burst), 0);
        } else {
            rows.forEach(item => {
                if(!doneProcess.find(x => (x.id === item.id) && (x.init_burst === item.init_burst))) {
                    max += Number(item.init_burst);
                    setDoneProcess(prev => [...prev, item]);
                } 
            })
        }

        // push value calculated to variable
        setValueMax(max);
    }, [jsonData, simulationPaused])

    // count the running total steps
    useEffect(() => {
        if (simulationPaused) return;
        
        // Check if the current policy is Round Robin
        const isRoundRobin = props.policy === "Round Robin";
        
        if (running.length > 0) {
            // Calculate steps from both running and completed processes
            let currentSteps = 0;
            
            // For each process in running, account for normal steps and final_steps for completed processes
            running.forEach(row => {
                if (row.status === 'Completed' && row.final_steps) {
                    // Use final_steps for completed processes
                    currentSteps += row.final_steps;
                } else {
                    // Use regular steps for in-progress processes
                    currentSteps += row.steps;
                }
            });
            
            // Set the total steps
            setTotalSteps(currentSteps);
            
            // For Round Robin, also check if all processes are gone but we haven't reached completion
            if (isRoundRobin) {
                const checkFinalSteps = async () => {
                    const pcbProcesses = await getRows("pcb");
                    const queueProcesses = await getRows("queue");
                    
                    // If PCB and queue are empty, we're done, even if totalSteps < valuemax
                    if (pcbProcesses.length === 0 && queueProcesses.length === 0 && 
                        valuemax > 0 && currentSteps < valuemax) {
                        // Force the simulation to completion
                        setTotalSteps(valuemax);
                    }
                };
                
                checkFinalSteps();
            }
        }
    }, [running, simulationPaused, props.policy, valuemax])

    // reset timeline every reload
    useEffect(() => {
        (async () => {
            if(onLoad) {
                await deleteAllRows("pcb");
                await deleteAllRows("queue");
                await deleteAllRows("memory");
                var segment = {
                    block_size: 24,
                    row_id:"",
                    location: 0,
                    process_id: "",
                    job_size: "",
                    status: "Free",
                    fragmentation: "None",
                    splittable: true
                }

                await addRow(segment, "memory")
                setOnLoad(false);
              }
        })()
    }, []);

    // show animations and reset modal
    useEffect(() => {
        if (simulationPaused) return;
        
        // Check if all processes are complete
        const checkAllProcessesComplete = async () => {
            const pcbProcesses = await getRows("pcb");
            const queueProcesses = await getRows("queue");
            
            // Check if any running processes exist
            const runningProcesses = pcbProcesses.filter(p => p.status === 'Running');
            const readyProcesses = pcbProcesses.filter(p => p.status === 'Ready');
            const waitingProcesses = pcbProcesses.filter(p => p.status === 'Waiting');
            const completedProcesses = pcbProcesses.filter(p => p.status === 'Completed');
            
            // No active processes and we have either completed ones or empty tables
            const isCompleted = (runningProcesses.length === 0 && 
                                readyProcesses.length === 0 && 
                                waitingProcesses.length === 0 &&
                                queueProcesses.length === 0 &&
                                (completedProcesses.length > 0 || pcbProcesses.length === 0) &&
                                valuemax !== 0 && !videoFlag);
            
            if (isCompleted) {
                // If we have processes in Completed status, make sure we've accounted for their steps
                if (completedProcesses.length > 0) {
                    let completedSteps = completedProcesses.reduce((sum, p) => 
                        sum + (p.final_steps || p.steps), 0);
                    
                    // If completed steps are close to valuemax but not equal, force completion
                    if (Math.abs(completedSteps - valuemax) <= 5) {
                        setTotalSteps(valuemax);
                    }
                }
                
                setShowVideo(true);
                setTimeout(() => {
                    setShowVideo(false);
                    setVideoFlag(true);
                    setShowResetModal(true); // Show reset modal after video
                    setSimulationPaused(true); // Pause simulation when all processes are done
                }, 7000);
            }
        };
        
        // Original completion check (based on totalSteps)
        if(totalSteps === valuemax && valuemax !== 0 && !videoFlag) {
            setShowVideo(true);
            setTimeout(() => {
                setShowVideo(false);
                setVideoFlag(true);
                setShowResetModal(true); // Show reset modal after video
                setSimulationPaused(true); // Pause simulation when all processes are done
            }, 7000)
        } 

        if (totalSteps !== valuemax){
            setVideoFlag(false);
            // Check if all processes are complete even if totalSteps doesn't match valuemax
            // This handles the Round Robin case where processes might be removed but steps not fully counted
            checkAllProcessesComplete();
        } else {
            // Even if totalSteps equals valuemax, make sure to clean up any remaining completed processes
            const removeCompletedProcesses = async () => {
                const completedProcesses = await filterRows("status", "Completed", "pcb");
                for (const process of completedProcesses) {
                    await deleteRow(process.id, "pcb");
                }
            };
            removeCompletedProcesses();
        }
    }, [totalSteps, valuemax, simulationPaused, jsonData])
    
    // Function to start the simulation - triggered by the Start Simulation button
    const startSimulation = async () => {
        // Check if there are processes in PCB
        const pcbProcesses = await getRows("pcb");
        if (pcbProcesses.length === 0) {
            // Check if there are processes in the queue and move one to PCB
            const queueProcesses = await getRows("queue");
            if (queueProcesses.length > 0) {
                // Move first process from queue to PCB
                await addRow(queueProcesses[0], "pcb");
                await editRow({...queueProcesses[0], status: "Ready"}, "pcb");
                
                // Find the first ready process and mark it as running
                const readyProcesses = await filterRows("status", "Ready", "pcb");
                if (readyProcesses.length > 0) {
                    await editRow({...readyProcesses[0], status: "Running"}, "pcb");
                }
            }
        } else {
            // Check if there's a running process, if not set the first ready process to running
            const runningProcesses = await filterRows("status", "Running", "pcb");
            if (runningProcesses.length === 0) {
                const readyProcesses = await filterRows("status", "Ready", "pcb");
                if (readyProcesses.length > 0) {
                    await editRow({...readyProcesses[0], status: "Running"}, "pcb");
                }
            }
        }
        
        // Start the simulation only when the button is clicked
        setSimulationPaused(false);
    };
    
    // Function to reset the simulation
    const handleReset = async () => {
        setShowResetModal(false);
        // Reset state variables
        setRunning([]);
        setValueMax(0);
        setTotalSteps(0);
        setDoneProcess([]);
        setTimeline([0, 0]);
        setVideoFlag(false);
        setSimulationPaused(true); // Make sure simulation is paused after reset
        
        // Reset hasShownToast variables in scheduling policies
        window.resetPolicyToasts = true;
        
        // Reset the man icon position by forcing a re-render
        const manIcon = document.querySelector('.man-gif');
        if (manIcon) {
            manIcon.style.left = '0%';
        }
        
        // Reset data in json server - ensure all tables are completely cleared
        await deleteAllRows("pcb");
        await deleteAllRows("queue");
        await deleteAllRows("memory");
        
        // Add initial memory segment
        var segment = {
            block_size: 24,
            row_id:"",
            location: 0,
            process_id: "",
            job_size: "",
            status: "Free",
            fragmentation: "None",
            splittable: true
        }
        await addRow(segment, "memory");
        
        // Force a refresh of data to ensure clean state
        const rows = await getRows("pcb");
        setRows(rows);
    };
    
    // time interval component - controlling when policies are applied
    // This should only run when simulation is not paused
    useEffect(() => {
        // Skip policy application if simulation is paused
        if (simulationPaused) return;
        
        // Functions to handle process waiting time and IO time
        const changeWaitTime = async () => {
            const allRows = await filterRows("status", "Ready", "pcb");
            allRows.forEach(async row => {
                row.waiting_time += 1;
                row.steps = 0;
                await editRow(row, "pcb");
            });
        };
        
        const changeIOTime = async () => {
            const waiting = await filterRows("status", "Waiting", "pcb");
            waiting.forEach(async item => {
                if(item.io_time > 0) {
                    item.io_time--;
                } else {
                    item.status = "Ready";
                }
                item.steps = 0;
                await editRow(item, "pcb");
            });
        };
        
        const interval = setInterval(async () => {
            // Get the current policy from props
            const policy = props.policy || 'First Come, First Serve';
            
            // Apply appropriate scheduling policy
            if(policy === "First Come, First Serve") {
                FCFS();
            } else if(policy === "Shortest Job First") {
                SJF();
            } else if(policy === "Priority") {
                Priority();
            } else if(policy === "Round Robin") { 
                RoundRobin();
            }
            
            // Handle IO events for running processes
            const handleIOEvents = async () => {
                const running = await filterRows("status", "Running", "pcb");
                const row = running[0] ? running[0] : "";
                
                if(row !== "") {
                    if(row.burst_time === row.io_when) {
                        row.status = "Waiting";
                        row.steps = row.init_burst - row.io_when;
                        await editRow(row, "pcb");
                    }
                }
            };
            
            // Update IO events
            await handleIOEvents();
            
            // Update waiting time and IO time for processes
            await changeWaitTime();
            await changeIOTime();
            
        }, 1000); // Use a shorter interval for smoother animation
        
        return () => clearInterval(interval);
    }, [simulationPaused, props.policy]); 

    return (
        <div className="progress-container">
            {/** use to display the moving people for interactive simulation */}
            <div className='gif-container'> 
                <img 
                    key="man" 
                    src={man} 
                    alt="man-gif" 
                    className="man-gif gif" 
                    style={{left: `${valuemax === 0 ? 0 : (totalSteps / valuemax) * 93}%`}}
                />
                <img src={woman} alt="woman-gif" className="woman-gif gif" />
            </div>
            
            {/** Start Simulation Button */}
            {simulationPaused && rows.length > 0 && (
                <div className="d-flex justify-content-center my-3">
                    <Button 
                        variant="success" 
                        onClick={startSimulation}
                        className="start-simulation-btn"
                        style={{ width: '200px' }}
                    >
                        Start Simulation
                    </Button>
                </div>
            )}
            
            {/** displays progress of the status timeline */}
            <div className='progress-timeline'>
                <div className="progress" style={{height: '8vh'}}>
                    {running.map((item, index) => {
                        const percentage = item.steps / valuemax * 100;
                        return (
                            <div className={`progress-bar ${item.steps !== 0 ? 'process-outline' : ''}`} 
                                key={index}
                                role="progressbar" 
                                style={{width: `${percentage}%`, backgroundColor: 'var(--color-blue)'}} 
                                aria-valuenow={item.steps} 
                                aria-valuemin="0" 
                                aria-valuemax={valuemax}
                            >
                                <span className="label">P{item.process_id}</span>
                            </div>
                        )
                    })}
                </div>
                {/** displays and keep track of the timeline */}
                
                <div className="timeline"> 
                    {timeline.map((item, index) => {
                        const percentage = (item - timeline[index !== 0 ? index-1 : 0]) / valuemax   * 100;
                        return (
                            <div className="timeline-item" key={index} style={{width: `${percentage}%`}}> 
                                {index === timeline.length - 1 && item === timeline[index - 1] ? "" : item} 
                            </div> 
                        )
                    })} 
                </div>
            </div>
            
            {/* Reset Modal */}
            <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Process Completed</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    All processes have completed execution. Would you like to reset the simulation?
                </Modal.Body>
                <Modal.Footer className="p-2">
                    <div className="d-flex justify-content-between w-100">
                        <Button variant="primary" onClick={handleReset} style={{ width: '48%' }}>
                            Reset Simulation
                        </Button>
                        <Button variant="secondary" onClick={() => setShowResetModal(false)} style={{ width: '48%' }}>
                            Cancel
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
            
            <Video open={showVideo} close={() => setShowVideo(false)} />
        </div>
    )
}