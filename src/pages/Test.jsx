import React, { useState } from 'react';

const Test = () => {
    const [minAge, setMinAge] = useState(18);
    const [maxAge, setMaxAge] = useState(60);

    const handleChangeMin = (e) => {
        const value = Number(e.target.value); // Convert to number
        if (value < maxAge) {
            setMinAge(value);
        }
    };

    const handleChangeMax = (e) => {
        const value = Number(e.target.value); // Convert to number
        if (value > minAge) {
            setMaxAge(value);
        }
    };

    function test() {
        console.log(minAge, maxAge)
    }

    return (
        <div>
            <label>Age Range:</label><br />
            <input
                type="range"
                min="0"
                max="100"
                value={minAge}
                onChange={handleChangeMin}
            />
            <input
                type="range"
                min="0"
                max="100"
                value={maxAge}
                onChange={handleChangeMax}
            />
            <p id="rangeValue">Selected age range: {minAge} - {maxAge}</p>
            <button onClick={test}>Test</button>
        </div>
    );
};

export default Test;