// Importing the Modal component from 'react-bootstrap' for displaying modals
import { Modal } from "react-bootstrap";

/**
 * This is a functional component that displays a policy information in a modal.
 * The modal state is controlled by the 'open' prop.
 * The 'close' prop is a function that handles the closing of the modal.
 * The 'policy' prop determines the policy information to be displayed.
 * @param {Object} props - The props object.
 * @param {boolean} props.open - The state of the modal.
 * @param {Function} props.close - The function to close the modal.
 * @param {string} props.policy - The policy information to be displayed.
 * @return {JSX.Element} The Policy component.
 */
export default function Policy(props) {
    return (
        // displays the modal of the varying policies with its descriptions
        <Modal show={props.open} onHide={props.close} size="lg" className="policy-info">
            <h1>{props.policy}</h1>
            {
                props.policy === "First Come, First Serve" ?
                <p>It is the simplest scheduling algorithm. 
                    There is a single rule; schedule the first process to arrive, 
                    and let it run to completion. This is a non-preemptive scheduling 
                    algorithm, which means that only a single process can run at a time, 
                    regardless of whether it uses the resources of the system effectively, 
                    and also regardless of whether there is a queue of other processes 
                    waiting, and the relative importance of those processes. Due to these
                    limitations, the algorithm is not widely used
                </p> : null
            }

            {
                props.policy === "Shortest Job First" ?
                <p>
                    The shortest job first (SJF) or shortest job next, is a scheduling policy 
                    that selects the waiting process with the smallest execution time to 
                    execute next.
                </p> : null
            }

            {
                props.policy === "Priority" ?
                <p>
                    Priority scheduling is one of the most common scheduling algorithms in batch 
                    systems. Each process is assigned a priority. The process with the highest 
                    priority is to be executed first and so on. Processes with the same priority 
                    are executed on a first-come first served basis.
                </p> : null
            }

            {
                props.policy === "Round Robin" ?
                <p>
                    Round-robin is one of the algorithms employed by process and network schedulers 
                    in computing. As the term is generally used, time slices are assigned to each 
                    process in equal portions and in circular order, handling all processes without 
                    priority.
                </p> : null
            }
        </Modal>
    )
}