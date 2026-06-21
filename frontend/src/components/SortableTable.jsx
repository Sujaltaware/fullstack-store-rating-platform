const SortableTable = ({ columns, data, sortBy, sortOrder, onSort }) => {
  const handleSort = (key) => {
    if (!key) return;
    const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(key, newOrder);
  };

  const getSortIcon = (key) => {
    if (sortBy !== key) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={col.sortable ? 'sortable' : ''}
              >
                {col.label}
                {col.sortable && <span className="sort-icon">{getSortIcon(col.key)}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-row">
                No records found
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={row.id || index}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;
