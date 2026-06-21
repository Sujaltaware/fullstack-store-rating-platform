import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import FilterBar from '../../components/FilterBar';

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  const fetchStores = useCallback(() => {
    setLoading(true);
    const params = { ...filters, sortBy, sortOrder };
    api.get('/admin/stores', { params })
      .then(({ data }) => setStores(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(fetchStores, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true, render: (row) => `⭐ ${row.rating}` },
    { key: 'owner_name', label: 'Owner' },
  ];

  const filterFields = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Stores</h1>
        <div className="actions">
          <Link to="/admin/stores/add" className="btn btn-primary">+ Add Store</Link>
        </div>
      </div>

      <FilterBar filters={filters} onFilterChange={(k, v) => setFilters({ ...filters, [k]: v })} fields={filterFields} />

      {loading ? (
        <div className="loading-screen"><div className="spinner"></div></div>
      ) : (
        <SortableTable
          columns={columns}
          data={stores}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(key, order) => { setSortBy(key); setSortOrder(order); }}
        />
      )}
    </div>
  );
};

export default AdminStores;
