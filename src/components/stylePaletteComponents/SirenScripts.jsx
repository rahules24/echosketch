import logo from '../../assets/img/favlogo.png';
import { Link } from 'react-router-dom';

function SirenScripts({ color }) {
  const handleClick = () => {
    window.open('https://rahules24.github.io/sirenscripts/', '_blank');
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <img
        style={{ 
          width: '3em', 
          height: '3em',
          cursor: 'pointer' 
        }}
        onClick={handleClick}
        onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')}
        onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        src={logo} 
        alt="SirenScripts"
      />

      <Link 
        to="/"
        style={{ 
          marginLeft: '25px',
          color: color,
          textDecoration: 'none',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = '0.5')}
        onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <p style={{fontFamily: 'Orbitron', fontSize: '1.4em'}}>echoSketch</p>
      </Link>

      <Link 
        to="/about"
        style={{ 
          marginLeft: '25px',
          color: color,
          textDecoration: 'none',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = '0.5')}
        onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <p style={{fontFamily: 'Orbitron', fontSize: '1.4em'}}>README.md</p>
      </Link>

    </div>
  );
}

export default SirenScripts;