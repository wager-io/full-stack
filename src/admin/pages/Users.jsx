import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import {
  Search,
  Visibility,
  NavigateBefore,
  NavigateNext,
  FirstPage,
  LastPage,
  FilterList,
  Person,
  PersonOff,
  Block
} from '@mui/icons-material';

// profiles.status is lowercase and its third value is 'suspended', not
// 'Disabled'. Mapped in one place so the filter, the badge and the icon cannot
// drift apart — and so a status nobody has seen before shows as itself rather
// than falling through to "Active".
const STATUS_LABEL = { active: 'Active', inactive: 'Inactive', suspended: 'Disabled' };
const toLabel = (s) => STATUS_LABEL[s] ?? (s ? s[0].toUpperCase() + s.slice(1) : 'Unknown');

export default function Users() {
  // This listed twelve invented players. Real rows come from `profiles`, which
  // an admin may read under RLS (`id = auth.uid() OR is_admin()`), so there is
  // no RPC in the way — a non-admin simply sees one row, their own.
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const usersPerPage = 10;

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, country, balance, clearing_balance, status, is_admin, current_level, created_at')
      .order('balance', { ascending: false })
      .limit(500);

    if (error) {
      toast.error(`Could not load users: ${error.message}`);
      setAllUsers([]);
    } else {
      setAllUsers((data ?? []).map((u) => ({
        userId: u.id,
        username: u.username || '—',
        email: u.email || '—',
        country: u.country || '—',
        balance: Number(u.balance ?? 0),
        // Held against an approved withdrawal. Shown apart from the spendable
        // balance: added together they would hide the only figure that says
        // what is already committed to leaving.
        held: Number(u.clearing_balance ?? 0),
        status: toLabel(u.status),
        isAdmin: u.is_admin,
        level: u.current_level ?? 0,
        joined: u.created_at,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter users based on search term and status
  const filteredUsers = allUsers.filter(user => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      user.userId.toLowerCase().includes(q) ||
      user.username.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <Person style={{ color: '#22c55e', fontSize: '18px' }} />;
      case 'Inactive':
        return <PersonOff style={{ color: '#f59e0b', fontSize: '18px' }} />;
      case 'Disabled':
        return <Block style={{ color: '#ef4444', fontSize: '18px' }} />;
      default:
        return <Person style={{ color: 'var(--text-dark)', fontSize: '18px' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return { color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e' };
      case 'Inactive':
        return { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b' };
      case 'Disabled':
        return { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' };
      default:
        return { color: 'var(--text-dark)', background: 'rgba(148, 163, 184, 0.1)', border: '1px solid var(--text-dark)' };
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--primary-bg)' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 
          className="text-4xl font-bold mb-2"
          style={{ 
            color: 'var(--text-light)',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)'
          }}
        >
          Users Management
        </h1>
        <p
          className="text-lg"
          style={{ color: 'var(--text-dark)' }}
        >
          {/* An empty list is ambiguous while the query is still running —
              "no users" and "not loaded yet" look identical otherwise. */}
          {loading
            ? 'Loading users…'
            : `${allUsers.length} registered user${allUsers.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* Search and Filter Section */}
      <div 
        className="rounded-xl p-6 mb-6"
        style={{
          background: 'linear-gradient(145deg, var(--secondary-bg), #1a1d3a)',
          border: '1px solid var(--border-color)',
          boxShadow: `
            0 15px 35px rgba(0, 0, 0, 0.3),
            0 5px 15px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08)
          `
        }}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search style={{ color: 'var(--text-dark)', fontSize: '20px' }} />
            </div>
            <input
              type="text"
              placeholder="Search by ID, username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{
                background: 'linear-gradient(145deg, #1a1d2e, #15182a)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-light)',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <FilterList style={{ color: 'var(--text-dark)', fontSize: '20px' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{
                background: 'linear-gradient(145deg, #1a1d2e, #15182a)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-light)',
                fontSize: '14px'
              }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>

          {/* Results Count */}
          <div 
            className="text-sm font-medium px-4 py-2 rounded-lg"
            style={{ 
              color: 'var(--text-light)',
              background: 'rgba(106, 13, 173, 0.1)',
              border: '1px solid var(--accent-purple)'
            }}
          >
            {/* {filteredUsers.length} Users Found */}
            12,847 Users 
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, var(--secondary-bg), #1a1d3a)',
          border: '1px solid var(--border-color)',
          boxShadow: `
            0 15px 35px rgba(0, 0, 0, 0.3),
            0 5px 15px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08)
          `
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 
            className="text-xl font-semibold"
            style={{ 
              color: 'var(--text-light)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
            }}
          >
            Users List
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr 
                className="border-b-2" 
                style={{ borderColor: 'var(--accent-purple)' }}
              >
                <th 
                  className="text-left py-4 px-6 text-sm font-semibold"
                  style={{ color: 'var(--text-light)' }}
                >
                  User ID
                </th>
                <th 
                  className="text-left py-4 px-6 text-sm font-semibold"
                  style={{ color: 'var(--text-light)' }}
                >
                  Username
                </th>
                <th 
                  className="text-left py-4 px-6 text-sm font-semibold"
                  style={{ color: 'var(--text-light)' }}
                >
                  Country
                </th>
                <th 
                  className="text-left py-4 px-6 text-sm font-semibold"
                  style={{ color: 'var(--text-light)' }}
                >
                  Balance
                </th>
                <th 
                  className="text-left py-4 px-6 text-sm font-semibold"
                  style={{ color: 'var(--text-light)' }}
                >
                  Email
                </th>
                <th 
                  className="text-left py-4 px-6 text-sm font-semibold"
                  style={{ color: 'var(--text-light)' }}
                >
                  Status
                </th>
                <th 
                  className="text-center py-4 px-6 text-sm font-semibold"
                  style={{ color: 'var(--text-light)' }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr 
                    key={user.userId} 
                    className="border-b transition-all duration-200 hover:bg-opacity-50"
                    style={{ 
                      borderColor: 'var(--border-color)',
                      backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                    }}
                  >
                    <td 
                      className="py-4 px-6 text-sm font-mono"
                      style={{ color: 'var(--accent-purple)' }}
                    >
                      {user.userId.slice(0, 8)}…
                    </td>
                    <td 
                      className="py-4 px-6 text-sm font-medium"
                      style={{ color: 'var(--text-light)' }}
                    >
                      {user.username}
                    </td>
                    <td 
                      className="py-4 px-6 text-sm"
                      style={{ color: 'var(--text-light)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{user.flag}</span>
                        <span>{user.country}</span>
                      </div>
                    </td>
                    <td 
                      className="py-4 px-6 text-sm font-bold"
                      style={{ color: 'var(--success-green)' }}
                    >
                      ${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      {user.held > 0 && (
                        <span className="block text-xs font-normal" style={{ color: '#3b82f6' }}>
                          ${user.held.toLocaleString(undefined, { minimumFractionDigits: 2 })} held
                        </span>
                      )}
                    </td>
                    <td 
                      className="py-4 px-6 text-sm"
                      style={{ color: 'var(--text-light)' }}
                    >
                      {user.email}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.status)}
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={getStatusColor(user.status)}
                        >
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                        style={{ 
                          color: 'var(--accent-purple)',
                          background: 'rgba(106, 13, 173, 0.1)',
                          border: '1px solid var(--accent-purple)'
                        }}
                        title="View User Details"
                      >
                        <Visibility fontSize="small" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan="7" 
                    className="py-12 text-center"
                    style={{ color: 'var(--text-dark)' }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Search style={{ fontSize: '48px', opacity: 0.5 }} />
                      <p className="text-lg">No users found matching your criteria</p>
                      <p className="text-sm">Try adjusting your search or filter settings</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div 
            className="flex items-center justify-between p-6 border-t"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div 
              className="text-sm"
              style={{ color: 'var(--text-dark)' }}
            >
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  color: 'var(--text-light)',
                  background: currentPage === 1 ? 'rgba(148, 163, 184, 0.1)' : 'rgba(106, 13, 173, 0.1)',
                  border: '1px solid var(--border-color)'
                }}
                title="First Page"
              >
                <FirstPage fontSize="small" />
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  color: 'var(--text-light)',
                  background: currentPage === 1 ? 'rgba(148, 163, 184, 0.1)' : 'rgba(106, 13, 173, 0.1)',
                  border: '1px solid var(--border-color)'
                }}
                title="Previous Page"
              >
                <NavigateBefore fontSize="small" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium"
                    style={{ 
                      color: page === currentPage ? 'white' : 'var(--text-light)',
                      background: page === currentPage 
                        ? 'var(--accent-purple)' 
                        : 'rgba(106, 13, 173, 0.1)',
                      border: `1px solid ${page === currentPage ? 'var(--accent-purple)' : 'var(--border-color)'}`
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  color: 'var(--text-light)',
                  background: currentPage === totalPages ? 'rgba(148, 163, 184, 0.1)' : 'rgba(106, 13, 173, 0.1)',
                  border: '1px solid var(--border-color)'
                }}
                title="Next Page"
              >
                <NavigateNext fontSize="small" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  color: 'var(--text-light)',
                  background: currentPage === totalPages ? 'rgba(148, 163, 184, 0.1)' : 'rgba(106, 13, 173, 0.1)',
                  border: '1px solid var(--border-color)'
                }}
                title="Last Page"
              >
                <LastPage fontSize="small" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
