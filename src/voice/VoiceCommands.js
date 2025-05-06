//import used libraries and components
import React, {useState, useEffect} from 'react';
import SpeechRecognition, {useSpeechRecognition} from 'react-speech-recognition';
import MicOn from '@mui/icons-material/MicNoneOutlined';
import MicOff from '@mui/icons-material/MicOffOutlined';
import {commands} from './commands';

/**
 * 
 * @description VoiceCommands component that handles all voice commands and 
 * listens for the user's voice input
 */
const VoiceCommands = () => {

    const [isListening, setIsListening] = useState(false);
    const [willCall, setwillCall] = useState(false);
    const [script, setScript] = useState('');

    // use speech recognition hook
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // function to speak the text
    const speak = (text) => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        // Get an array of available voices
        const voices = synth.getVoices();
        
        // Find the voice by name (for example, 'Google UK English Female')
        const selectedVoice = voices.find(voice => voice.name === 'Microsoft Zira - English (United States)');
        
        // If the selected voice is found, set it
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        } else {
            console.error('Voice not found');
        }
        synth.speak(utterance);
    };

    /**
     * effect hook to handle transcript changes
     * only takes the transcript between 'honey' and 'please' 
     * and saves it as script for the toaster to display
     */
    useEffect(() => {

        if(transcript.includes('honey')) {
            setIsListening(true);
            setwillCall(true);
            console.log("willCall honey", willCall)
            resetTranscript();
            speak("Yes, my love?");
        }

        if (transcript.includes('please')) {
            setIsListening(false);
            console.log("isListening please", isListening)
            setScript(transcript.replace('please', '').toLowerCase());
            speak("Okay, my love.");
            resetTranscript();
        }
        
        console.log("transcript: " , transcript);

    }, [transcript, resetTranscript, isListening, willCall]);

    useEffect(() => {
        if (transcript.includes('hi')) {
            speak("hello, my love.");
            resetTranscript();
        }

        if (transcript.includes('simulate') && transcript.endsWith('please')){
            speak("Are you sure you want to switch the current scheduling policy, my love?");
        }

    }, [transcript])

    /**
     * takes the script in between 'honey' and 'please' 
     * and executes the command present in command.js.
     */
    useEffect(() => {
        commands.forEach(({ command, callback }) => {
          if (script.toLowerCase().includes(command)) {
            console.log("callback() ", willCall)
            if (willCall){       
                callback();
                setwillCall(false);
                console.log("false dapat() ", willCall)
            }
        }
        });
    }, [script]);

    /**
     * effect hook to start listening for the user's voice input (if not listening only)
     * autostart set to tru to start listening automatically on page load
     * continuous set to true to keep listening
     */
    useEffect(() => {
        if(!listening) 
          SpeechRecognition.startListening({ autoStart: true, continuous: true });
      }, [listening]);

    // if browser does not support speech recognition 
    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

    //render the voice commands component 
    return (
        <div>
            <button onClick={() => setIsListening(prevState => !prevState)} className='mic'>
                {isListening ?
                <MicOn  /> : 
                <MicOff  />}
            </button>
        </div>
    )
}

export default VoiceCommands;