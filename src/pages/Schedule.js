// Importing necessary hooks from React
import { useEffect, useState } from "react";
// Importing useNavigate hook from react-router-dom for navigation
import { useNavigate } from "react-router-dom";
// Importing an image
import BG from '../images/schedule.png';
// Importing a component named Welcome
import Welcome from "./Welcome";

// Importing a CSS file
import './Schedule.css';
// Importing a component named VoiceCommands
import VoiceCommands from "../voice/VoiceCommands";

// Exporting a functional component named Schedule
export default function Schedule() {
    // Using the useNavigate hook for navigation
    const navigate = useNavigate();
    // Using the useState hook to manage the state of the welcome message
    const [welcome, setWelcome] = useState(localStorage.getItem('welcome')  ? true : false);
    // Defining an array of policies
    const policies = [
        'First Come, First Serve',
        'Shortest Job First',
        'Priority',
        'Round Robin',
    ];

    // Using the useEffect hook to perform side effects
    useEffect(() => {
        // Checking if the welcome message is not displayed
        if(!welcome) {
            // Setting a timeout to display the welcome message after 10 seconds
            setTimeout(() => {
                // Updating the state of the welcome message to true
                setWelcome(true);
                // Storing the state of the welcome message in the local storage
                localStorage.setItem('welcome', true);
            }, 10000);
        }
    }, [welcome]) // Adding welcome as a dependency to the useEffect hook

    // Checking if the welcome message is not displayed
    if(!welcome) return <Welcome />

    // Defining a function to handle click events
    function handleClick(e) {
        // Getting the value of the clicked element
        const policy = e.target.value;

        // Navigating to the "/simulation" route with the policy as a state
        navigate("/simulation", ({ state: { policy: policy } }))
    }
    
    return (
        <div className="schedule">
            <div className="form">
                <h1>Scheduling Policies</h1>
                <div className="policies">
                    {/* Mapping over the policies array to render a button for each policy */}
                    {policies.map(policy => {
                        return (
                            // Rendering a button with the policy as the value and id, and handleClick as the onClick handler
                            <button id={policy} className="btn-primary" value={policy} onClick={e => handleClick(e)}>
                                {policy}
                            </button>
                        ) 
                    })}
                </div>
                {/* Rendering the VoiceCommands component */}
                <VoiceCommands/>
            </div>

            {/* Rendering an image with the BG as the source and "Schedule" as the alt text */}
            <img src={BG} alt="Schedule" className="bg-sched" />
        </div>
    );
}