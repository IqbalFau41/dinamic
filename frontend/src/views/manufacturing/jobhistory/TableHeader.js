import React from 'react'

export const TableHeader = ({ column, children, sortOrder, handleSort }) => (
  <div className="fixed-header-cell" onClick={() => handleSort(column)}>
    {children}
    {sortOrder.column === column && (
      <span className="ms-1">{sortOrder.direction === 'asc' ? '↑' : '↓'}</span>
    )}
  </div>
)
