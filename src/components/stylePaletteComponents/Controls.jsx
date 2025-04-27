import { GrPowerReset } from "react-icons/gr";
import { RxZoomIn, RxZoomOut } from "react-icons/rx";

function Controls({panZoom}) {
  return (
    
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: 5,
        border: '2px solid white',
        position: 'absolute',
        top: '20px',
        right: '30px',
        padding: '3px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        gap: '10px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        



        
        <div style={{ cursor: 'pointer',
             padding: '5px',
              borderRadius: '5px',
               transition: 'background-color 0.3s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                 onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                 onClick={(ev) =>{
                    if(panZoom.current){
                        ev.preventDefault()
                        panZoom.current.zoomOut()
                    } 
                  }}>
          <RxZoomOut />
        </div>
        <div style={{ cursor: 'pointer',
                      padding: '5px',
                      borderRadius: '5px', 
                      transition: 'background-color 0.3s' }} 
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'} 
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      onClick={(ev) =>{

                        if(panZoom.current){
                            ev.preventDefault()
                            panZoom.current.resetZoom()
                        } 
                      }}>

          <GrPowerReset />
        </div>

        <div style={{ cursor: 'pointer',
                      padding: '5px',
                      borderRadius: '5px', 
                      transition: 'background-color 0.3s' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'} 
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      onClick={(ev) =>{

                        if(panZoom.current){
                            ev.preventDefault()
                            panZoom.current.zoomIn()
                        } 
                      }}
                      
                      >
          <RxZoomIn />
        </div>



      </div>
    </div>
  );
}

export default Controls;