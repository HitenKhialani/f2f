import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search,
  Filter,
  UserCheck,
  UserX,
  Edit,
  Shield,
  Wheat,
  Truck,
  Package,
  ShoppingBag,
  User
} from 'lucide-react';
import { adminAPI } from '../../services/adminApi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers(roleFilter);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await adminAPI.updateUser(userId, updates);
      setSelectedUser(null);
      setEditMode(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      farmer: Wheat,
      transporter: Truck,
      distributor: Package,
      retailer: ShoppingBag,
      consumer: User,
      admin: Shield,
    };
    const Icon = icons[role?.toLowerCase()] || User;
    return <Icon className="w-4 h-4" />;
  };

  const getRoleColor = (role) => {
    const colors = {
      farmer: 'bg-emerald-100 text-emerald-700',
      transporter: 'bg-blue-100 text-blue-700',
      distributor: 'bg-purple-100 text-purple-700',
      retailer: 'bg-orange-100 text-orange-700',
      consumer: 'bg-pink-100 text-pink-700',
      admin: 'bg-red-100 text-red-700',
    };
    return colors[role?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.stakeholderprofile?.role?.toLowerCase().includes(searchLower)
    );
  });

  const roleStats = {
    farmer: users.filter(u => u.stakeholderprofile?.role === 'farmer').length,
    transporter: users.filter(u => u.stakeholderprofile?.role === 'transporter').length,
    distributor: users.filter(u => u.stakeholderprofile?.role === 'distributor').length,
    retailer: users.filter(u => u.stakeholderprofile?.role === 'retailer').length,
    consumer: users.filter(u => u.stakeholderprofile?.role === 'consumer').length,
    admin: users.filter(u => u.stakeholderprofile?.role === 'admin').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(roleStats).map(([role, count]) => (
          <div key={role} className={`rounded-lg p-4 border ${getRoleColor(role)}`}>
            <div className="flex items-center gap-2 mb-1">
              {getRoleIcon(role)}
              <span className="text-xs font-medium capitalize">{role}s</span>
            </div>
            <p className="text-2xl font-bold">{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Roles</option>
              <option value="farmer">Farmer</option>
              <option value="transporter">Transporter</option>
              <option value="distributor">Distributor</option>
              <option value="retailer">Retailer</option>
              <option value="consumer">Consumer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">KYC Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor(user.stakeholderprofile?.role)}`}>
                          {getRoleIcon(user.stakeholderprofile?.role)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.stakeholderprofile?.organization && (
                            <p className="text-xs text-gray-400">{user.stakeholderprofile.organization}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(user.stakeholderprofile?.role)}`}>
                        {user.stakeholderprofile?.role || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.stakeholderprofile?.kyc_status === 'approved' 
                          ? 'bg-green-100 text-green-700'
                          : user.stakeholderprofile?.kyc_status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {user.stakeholderprofile?.kyc_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.date_joined ? new Date(user.date_joined).toLocaleDateString('hi-IN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setEditMode(true);
                          }}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateUser(user.id, { is_active: !user.is_active })}
                          className={`p-2 rounded-lg ${
                            user.is_active 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedUser && editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit User: {selectedUser.username}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={selectedUser.email}
                  onChange={(e) => selectedUser.email = e.target.value}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization
                </label>
                <input
                  type="text"
                  defaultValue={selectedUser.stakeholderprofile?.organization || ''}
                  onChange={(e) => selectedUser.stakeholderprofile.organization = e.target.value}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  defaultValue={selectedUser.stakeholderprofile?.phone || ''}
                  onChange={(e) => selectedUser.stakeholderprofile.phone = e.target.value}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setEditMode(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateUser(selectedUser.id, {
                  email: selectedUser.email,
                  profile: {
                    organization: selectedUser.stakeholderprofile?.organization,
                    phone: selectedUser.stakeholderprofile?.phone,
                  }
                })}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
