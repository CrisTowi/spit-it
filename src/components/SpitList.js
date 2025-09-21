import React from 'react';
import SpitItem from './SpitItem';
import './SpitList.css';

const SpitList = ({ spits, onDeleteSpit, onEditSpit }) => {
  if (spits.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💭</div>
        <h3 className="empty-title">No spits yet!</h3>
        <p className="empty-message">
          Start sharing your thoughts, ideas, and experiences above.
        </p>
      </div>
    );
  }

  return (
    <div className="spit-list">
      <h2 className="list-title">
        Your Spits ({spits.length})
      </h2>
      <div className="spits-container">
        {spits.map((spit) => (
          <SpitItem
            key={spit.id}
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

