import React, { useRef, useState, useEffect } from 'react';
import { Container, Row, Col} from 'react-bootstrap';
import debounce from 'lodash.debounce';
import '../Header.css';

/**ICONS */
import { BsDashLg, BsFileFontFill } from "react-icons/bs";
import {
    FaCircle,
    FaLocationArrow, FaSquare, FaTrash
} from "react-icons/fa";
import { FaDiamond } from "react-icons/fa6";
import { ImFont } from "react-icons/im";

import { IoHandLeft, IoTriangle } from "react-icons/io5";
import { RxBorderDashed } from "react-icons/rx";
import { SlActionRedo, SlActionUndo } from "react-icons/sl";
import { IoGitNetworkSharp } from "react-icons/io5";

/**STYLE COMPONENTS */
import DesignPalette from './stylePaletteComponents/DesignPalette';
import Background from './stylePaletteComponents/Background';
import Menu from './stylePaletteComponents/Menu';
import Fonts from './stylePaletteComponents/Fonts';

function Header({
                elementRef,
                onSelect,
                fileSelectionEvent,
                onFont,
                onStroke,
                onRough,
                onStyle,
                onFill,
                onBackground,
                onBorder,
            }) {

    const fileInputRef = useRef(null);
    const [selectedOption, setSelectedOption] = useState('');
    const [prevFont, setPrevFont] = useState('Arial');  // Initialize with default font
    const [prevBG, setPrevBG] = useState('#FFFFFF');  // Initialize with default BGcolor

    const [toggleButtons, setToggleButtons] = useState({
        undo: false,
        redo: false,
        trash: false,
        dashedLink: false,
        solidLink: false,
        // layout: false,
    });

    const elements = [
        { icon: ImFont, label: 'Font', handler: 'font' },
        { icon: BsFileFontFill, label: 'Text', handler: 'text', size: 20 },
        // { icon: IoGitNetworkSharp, label: 'Format', handler: 'layout',size: 20 },
        { icon: FaSquare, label: 'MIE', handler: 'MIE', size: 19 },
        { icon: FaCircle, label: 'KE', handler: 'KE', size: 20 },
        { icon: IoTriangle, label: 'AOP', handler: 'AOP', size: 22 },
        { icon: FaDiamond, label: 'AO', handler: 'AO', size: 19 },
        { icon: BsDashLg, label: 'Adjacent', handler: 'solidLink', size: 23 },
        { icon: RxBorderDashed, label: 'Non-Adjacent', handler: 'dashedLink', size: 23 },
        { icon: IoHandLeft, label: 'Pan', handler: 'select', size: 20 },
        { icon: FaLocationArrow, label: 'Select', handler: '', size: 20 },
        { icon: SlActionUndo, label: 'Undo', handler: 'undo', size: 18 },
        { icon: SlActionRedo, label: 'Redo', handler: 'redo', size: 18 },
        { icon: FaTrash, label: 'Clear', handler: 'trash', size: 18 }
    ];

    const toggleHandlers = ['undo', 'redo', 'trash','dashedLink', 'solidLink', 'layout'];

    useEffect(() => {    
        toggleHandlers.forEach(handler => {
            if (toggleButtons[handler]) {
                const timer = setTimeout(() => {
                    setToggleButtons(prev => ({
                        ...prev,
                        [handler]: false
                    }));
                    setSelectedOption('');
                }, 300);
                
                return () => clearTimeout(timer);
            }
        });
    }, [toggleButtons]);

    const handleRoughDebounced = debounce((rough) => {
        if (elementRef.current) {
            elementRef.current.attr({
                roughRef: { 
                    current: [rough] 
                }
            });
        }
    }, 300);

    const handleBackground = (bg) => onBackground(bg);

    const handleStroke = (stroke) => {
        onStroke(stroke);
        if (elementRef.current) {
            elementRef.current.attr({
                border: {
                    stroke: stroke,
                },
                pointers: {
                    fill: '#FFF',
                },
            });
        }
    }

    const handleStyle = (style) => {
        onStyle(style);
        if (elementRef.current) {
            elementRef.current.attr({
                styleRef: { 
                    current: style
                }
            });
            // elementRef.current.set('attrs', {
            //     ...elementRef.current.attributes.attrs,
            //     styleRef: { 
            //         current: style
            //     },
            // });
        }
    }

    const handleBorder = (border) => {
        onBorder(border);
        if (elementRef.current) {
            elementRef.current.attr({
                body: {
                    stroke: border,
                },
            });
        }
    }

    const handleFill = (fill) => {
        onFill(fill);
        if (elementRef.current) {
            elementRef.current.attr({
                pointers: {
                    fill: fill,
                },
                border: {
                    stroke: '#FFF',
                },
            });
        }
    };

    const handleRough = (rough) => {
        onRough(rough);
        handleRoughDebounced(rough);
    };

    const handleFont = (font) => {
        onFont(font);
        if (elementRef.current){
        elementRef.current.attr({
            label: {
                fontFamily: font,
              },
            });
        }
    };

    const handleClick = (type) => {
        // Handle toggle buttons (undo, redo, trash)
        if (toggleHandlers.includes(type)) {
            // Clear any selected option when clicking action buttons
            // setSelectedOption('');
            
            // Set the toggle state for the clicked button
            setToggleButtons(prev => ({
                ...prev,
                [type]: true
            }));
            
            onSelect(type);
        }
        else if (type === 'open') {
            fileInputRef.current.click(); 
            onSelect(type);
            setSelectedOption(type);
        } else {
            onSelect(type);
            setSelectedOption(type);
        }
    };

    const getIconStyle = (type) => {
        // For toggle buttons
        if (toggleHandlers.includes(type)) {
            return toggleButtons[type] ? { color: 'gray', fontWeight: 'bold' } : {};
        }
        // For regular buttons
        return selectedOption === type ? { color: 'gray', fontWeight: 'bold' } : {};
    };

    const header = {
        position: 'fixed', 
        padding: '15px',
        display: 'flex',
        bottom: 0,
        alignItems: 'center',
        left: '50%',
        transform: 'translateX(-50%)', 
        width: '1000px',
        zIndex: 1000,
        flexDirection: 'row',
        justifyContent: 'space-between',
    };

    const header__icons = {
        cursor: 'pointer',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        padding: '10px',
        borderRadius: '10px',
        boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.2)',
        color: 'black',
    };

    return (
        <>
        <Container style={header} className='header__responsive'>
            
            <Row style={{ ...header__icons, position: 'relative' }} className='menu__craft'>

                <Col>
                    <Background
                        style={getIconStyle('paperpalette')}
                        onChange={handleBackground}
                        prevState={prevBG}
                        setPrevState={setPrevBG}
                    />
                </Col>

                <Col>
                    <DesignPalette 
                        onFillChange={handleFill}
                        onStyleChange={handleStyle} 
                        onStrokeChange={handleStroke} 
                        onBorderChange={handleBorder} 
                        onRoughChange={handleRough}
                        style={getIconStyle('elementpalette')}
                    />
                </Col>

                {elements.map((element, index) => (
                    <React.Fragment key={index}>

                        {(index === 2 || index === 8 || index === 10) && (
                            <Col>
                                <p style={{
                                    fontSize: '25px',
                                    color: 'lightgray',
                                    margin: '0px',
                                }}>|</p>
                            </Col>
                        )}
                        
                        <Col>
                            {/* Handle Font Component rendering instead of using icon */}
                            {element.handler === 'font' ? (
                                <Fonts 
                                onChange={handleFont}  // Pass the onFontChange handler
                                style={getIconStyle('font')}
                                prevState={prevFont}
                                setPrevState={setPrevFont}
                                />
                            ) : (
                                <element.icon onClick={() => handleClick(element.handler)}
                                 style={getIconStyle(element.handler)} size={element.size} />
                            )}
                        </Col>

                    </React.Fragment>
                ))}

                <Col>
                    <p style={{
                        fontSize: '25px',
                        color: 'lightgray',
                        margin: '0px',
                    }}>|</p>
                </Col>

                <Col>
                    <Menu 
                        onOptionClick={handleClick}
                        style={getIconStyle('menupalette')}
                    />
                </Col> 

            </Row>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                    fileSelectionEvent(e);
                    e.target.value = '';
                }}
            />

        </Container>
        </>
    );
}

export default Header;
