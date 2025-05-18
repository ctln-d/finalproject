import React from 'react';

function Score({ score }) {
    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '10px',
            borderRadius: '5px',
            color: 'white',
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif'
        }}>
            Score: {score}
        </div>
    );
}

export default Score; 