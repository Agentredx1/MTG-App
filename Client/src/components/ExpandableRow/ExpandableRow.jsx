import React from 'react';
import './ExpandableRow.css';

function ExpandableRow({ 
  id,
  isExpanded, 
  onToggle, 
  children, 
  expandedContent, 
  colSpan = 1,
  className = ''
}) {
  const handleRowClick = () => {
    onToggle(id);
  };

  return (
    <React.Fragment>
      <tr 
        className={`expandable-row ${isExpanded ? 'expanded' : ''} ${className}`}
        onClick={handleRowClick}
      >
        {children}
      </tr>
      {isExpanded && (
        <tr className="expanded-content-row">
          <td colSpan={colSpan} className="expanded-content-cell">
            <div className="expanded-content-wrapper">
              {expandedContent}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

export default ExpandableRow;