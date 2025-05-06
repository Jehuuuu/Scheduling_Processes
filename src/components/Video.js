// Importing the Modal component from 'react-bootstrap' for displaying modals
import { Modal } from "react-bootstrap";

// Importing the video file
import video from "../images/honey-os.mp4";

/**
 * This is a functional component that displays a video in a modal.
 * The modal and video autoplay states are controlled by the 'open' prop.
 * The 'close' prop is a function that handles the closing of the modal.
 * @param {Object} props - The props object.
 * @param {boolean} props.open - The state of the modal and video autoplay.
 * @param {Function} props.close - The function to close the modal.
 * @return {JSX.Element} The Video component.
 */
export default function Video({open, close}) {
    return (
        // displays the modal
        <Modal className="confirm-switch" show={open} onHide={close} size="md" centered>
            <video autoPlay={open ? true : false}>
                <source src={video} type="video/mp4"/>
            </video>
        </Modal>
    )
}