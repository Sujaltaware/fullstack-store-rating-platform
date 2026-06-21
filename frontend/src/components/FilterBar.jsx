const FilterBar = ({ filters, onFilterChange, fields }) => {
  return (
    <div className="filter-bar">
      {fields.map((field) => (
        <div key={field.key} className="filter-item">
          <label htmlFor={field.key}>{field.label}</label>
          {field.type === 'select' ? (
            <select
              id={field.key}
              value={filters[field.key] || ''}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
            >
              <option value="">All</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.key}
              type="text"
              placeholder={`Filter by ${field.label.toLowerCase()}...`}
              value={filters[field.key] || ''}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
            />
          )}
        </div>
      ))}
      <button
        className="btn btn-outline btn-sm"
        onClick={() => fields.forEach((f) => onFilterChange(f.key, ''))}
      >
        Clear Filters
      </button>
    </div>
  );
};

export default FilterBar;
