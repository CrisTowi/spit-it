import React from 'react';
import SpitItem from './SpitItem';
import './SpitList.css';

const SpitList = ({ spits, onDeleteSpit, onEditSpit }) => {
  if (spits.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💭</div>
        <h3 className="empty-title">¡Aún no hay pensamientos!</h3>
        <p className="empty-message">
          Comienza a compartir tus pensamientos, ideas y experiencias arriba.
        </p>
      </div>
    );
  }

  return (
    <div className="spit-list">
      <h2 className="list-title">
        Tus Pensamientos ({spits.length})
      </h2>
      <div className="spits-container">
        {spits.map((spit) => (
          <SpitItem
            key={spit._id}
            spit={spit}
            onDelete={onDeleteSpit}
            onEdit={onEditSpit}
          />
        ))}
      </div>
    </div>
  );
};

export default SpitList;

