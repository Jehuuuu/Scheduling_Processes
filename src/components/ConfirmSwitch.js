// Importing the Modal component from 'react-bootstrap' for displaying modals
import { Modal } from "react-bootstrap";
// Importing the deleteAllRows and resetTimeline functions from 'data-funcs'
import { deleteAllRows, resetTimeline } from "./data-funcs";
// Importing the useNavigate hook from 'react-router-dom' for navigation
import { useNavigate } from "react-router-dom";

/**
 * This is a functional component that displays a confirmation modal when switching policies.
 * The modal state is controlled by the 'open' prop.
 * The 'close' prop is a function that handles the closing of the modal.
 * The 'to_policy' prop determines the policy to switch to.
 * @param {Object} props - The props object.
 * @param {boolean} props.open - The state of the modal.
 * @param {Function} props.close - The function to close the modal.
 * @param {string} props.to_policy - The policy to switch to.
 * @return {JSX.Element} The ConfirmSwitch component.
 */
export default function ConfirmSwitch(props) {
    // hook used for navigation
    const navigate = useNavigate();

    /**
     * This function handles the policy change.
     * It deletes all rows in the 'pcb' table, navigates to the '/simulation' 
     * route with the new policy as state, and reloads the window.
     */
    async function changePolicy() {
        await deleteAllRows("pcb");
        navigate('/simulation', ({ state: { policy: props.to_policy }})) // change link state to the new policy
        window.location.reload();
    }

    return (
        // displays the modal for switching policy
        <Modal className="confirm-switch" show={props.open} onHide={props.close} size="md" centered>
            <h1>Confirm Policy Switch</h1>

            <p>Are you sure you want to switch the current scheduling policy to <strong>{props.to_policy}</strong>?</p>

            <div className="button-cont">
                <button id="Yes" onClick={() => changePolicy()}>Yes</button>
                <button id="No" onClick={props.close}>No</button>
            </div>
        </Modal>
    )
}