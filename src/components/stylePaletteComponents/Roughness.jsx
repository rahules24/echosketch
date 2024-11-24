import { useEffect, useRef, useState } from 'react';
import { GiLightningFrequency } from "react-icons/gi";
import tippy from 'tippy.js';

function Roughness({ onChange, prevState, setPrevState }) {
    const [selectedRough, setSelectedRough] = useState(prevState || 0.5); // Initialize with prevState
    const roughRef = useRef(null);
    const tippyInstanceRef = useRef(null);
    const tippyContentDiv = useRef(null);

    const handleRoughSelect = (event) => {
        const roughValue = parseFloat(event.target.value);
        setSelectedRough(roughValue);
        setPrevState(roughValue); // Update prevState with the new value
        onChange(roughValue);
    };

    useEffect(() => {
        if (roughRef.current) {
            // Create a div to hold the slider
            tippyContentDiv.current = document.createElement('div');
            tippyContentDiv.current.classList.add('element-pallete');
            document.body.appendChild(tippyContentDiv.current);

            // Initialize tippy once
            tippyInstanceRef.current = tippy(roughRef.current, {
                content: tippyContentDiv.current,
                allowHTML: true,
                interactive: true,
                arrow: false,
                trigger: 'click',
                placement: 'right',
                theme: 'elpalette'
            });

            // Render the range input inside the tooltip content
            const rangeInput = document.createElement('input');
            rangeInput.type = 'range';
            rangeInput.min = 0;
            rangeInput.max = 3;
            rangeInput.step = 0.1;
            rangeInput.value = selectedRough; // Set initial value from selectedRough
            rangeInput.addEventListener('input', handleRoughSelect);
            tippyContentDiv.current.appendChild(rangeInput);
        }

        return () => {
            if (tippyInstanceRef.current) {
                tippyInstanceRef.current.destroy();
            }
            if (tippyContentDiv.current) {
                tippyContentDiv.current.remove();
            }
        };
    }, [roughRef]); // Add roughRef to dependencies

    useEffect(() => {
        // Update the slider value when `selectedRough` changes
        if (tippyContentDiv.current) {
            const rangeInput = tippyContentDiv.current.querySelector('input[type="range"]');
            if (rangeInput) {
                rangeInput.value = selectedRough; // Keep it in sync with selectedRough
            }
        }
    }, [selectedRough]);

    useEffect(() => {
        // Update selectedRough when prevState changes
        if (prevState !== undefined) {
            setSelectedRough(prevState);
        }
    }, [prevState]);

    return (
        <div ref={roughRef}
            style={{
                margin: '3px',
            }}>
            <GiLightningFrequency />
            <span style={{ marginLeft: '5px' }}>Roughness</span>
        </div>
    );
}

export default Roughness;
