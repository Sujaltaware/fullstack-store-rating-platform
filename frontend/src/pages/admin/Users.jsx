import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import FilterBar from '../../components/FilterBar';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = { ...filters, sortBy, sortOrder };
    api.get('/admin/users', { params })
      .then(({ data }) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => {
        const labels = { admin: 'Admin', user: 'User', store_owner: 'Store Owner' };
        return labels[row.role] || row.role;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => <Link to={`/admin/users/${row.id}`}>View Details</Link>,
    },
  ];

  const filterFields = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
        { value: 'store_owner', label: 'Store Owner' },
      ],
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <div className="actions">
          <Link to="/admin/users/add" className="btn btn-primary">+ Add User</Link>
        </div>
      </div>

      <FilterBar filters={filters} onFilterChange={(k, v) => setFilters({ ...filters, [k]: v })} fields={filterFields} />

      {loading ? (
        <div className="loading-screen"><div className="spinner"></div></div>
      ) : (
        <SortableTable
          columns={columns}
          data={users}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(key, order) => { setSortBy(key); setSortOrder(order); }}
        />
      )}
    </div>
  );
};

export default AdminUsers;
