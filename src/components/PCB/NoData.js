// Importing the default no-data image
import NoDataIMG from '../../images/no-data.png';

// Defining a functional component named NoData
export default function NoData({noDataImg}) {
    return (
        <div className="no-data">
            {/* Displaying the no-data image, using a provided image or the default if none is provided */}
            <img src={noDataImg||NoDataIMG} alt="No Data" />

            {/* Displaying a message indicating no processes were found */}
            <p>No Processes Found!</p>

            {/* Prompt to add a new process */}
            <p>Add a new process to begin simulation.</p>
        </div>
    )
}