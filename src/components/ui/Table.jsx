import React from 'react';

export default function Table({ columns, data, onRowClick }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1C1C22' }}>
            {columns.map((col, i) => (
              <th key={i} style={{
                padding: '10px 14px',
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: 600,
                color: '#55556A',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderBottom: '1px solid #1F1F28',
                whiteSpace: 'nowrap',
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr
              key={ri}
              onClick={() => onRowClick && onRowClick(row)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                borderBottom: '1px solid #1F1F28',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#23232B'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map((col, ci) => (
                <td key={ci} style={{
                  padding: '12px 14px',
                  fontSize: '13px',
                  color: '#F0EFF6',
                  verticalAlign: 'middle',
                }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
