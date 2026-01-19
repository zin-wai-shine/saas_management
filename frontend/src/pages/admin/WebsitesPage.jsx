import { useState, useEffect, useMemo } from 'react';
import { websiteAPI } from '../../api/api';
import { Modal } from '../../components/Modal';
import { Dropdown } from '../../components/Dropdown';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  X,
  Globe,
  Eye,
  Save,
  ExternalLink,
} from 'lucide-react';

const columnHelper = createColumnHelper();

export const WebsitesPage = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [demoFilter, setDemoFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    theme_name: 'professional',
    status: 'pending',
    is_demo: false,
    is_claimed: false,
  });

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const response = await websiteAPI.list();
      setWebsites(response.data || []);
    } catch (error) {
      console.error('Failed to fetch websites:', error);
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:text-teal-glass"
          >
            ID
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('title', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:text-teal-glass"
          >
            Title
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-teal-500/10 backdrop-blur-md border border-teal-500/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-teal-300" />
            </div>
            <span className="font-medium">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('url', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:text-teal-glass"
          >
            URL
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => {
          const rowData = info.row.original;
          const url = rowData.url || info.getValue() || rowData.website_url || rowData.domain || '';
          
          if (!url || url.trim() === '' || url === 'null') {
            return <span className="text-gray-500">N/A</span>;
          }
          
          const cleanUrl = url.trim();
          const displayUrl = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') 
            ? cleanUrl 
            : `https://${cleanUrl}`;
          
          return (
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.open(displayUrl, '_blank', 'noopener,noreferrer');
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-teal-glass/10 backdrop-blur-sm border border-teal-glass/30 text-teal-glass hover:bg-teal-glass/20 hover:border-teal-glass/50 transition-all text-sm font-medium cursor-pointer group"
              title={`Visit ${displayUrl}`}
            >
              <Globe className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate max-w-[200px]">{cleanUrl}</span>
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          );
        },
      }),
      columnHelper.accessor('theme_name', {
        header: 'Theme',
        cell: (info) => (
          <span className="px-2.5 py-1 rounded text-xs font-medium bg-gray-800/20 backdrop-blur-md border border-gray-700/30 text-gray-400">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          const styles = {
            approved: 'bg-green-900/20 backdrop-blur-md border border-green-700/30 text-green-400',
            pending: 'bg-yellow-900/20 backdrop-blur-md border border-yellow-700/30 text-yellow-400',
            draft: 'bg-gray-800/20 backdrop-blur-md border border-gray-700/30 text-gray-400',
          };
          return (
            <span className={`px-2.5 py-1 rounded text-xs font-medium ${styles[status] || styles.pending}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      }),
      columnHelper.accessor('is_demo', {
        header: 'Type',
        cell: (info) => (
          <span
            className={`px-2.5 py-1 rounded text-xs font-medium ${
              info.getValue()
                ? 'bg-blue-900/20 backdrop-blur-md border border-blue-700/30 text-blue-400'
                : 'bg-purple-900/20 backdrop-blur-md border border-purple-700/30 text-purple-400'
            }`}
          >
            {info.getValue() ? 'Demo' : 'Live'}
          </span>
        ),
      }),
      columnHelper.accessor('is_claimed', {
        header: 'Claimed',
        cell: (info) => (
          <span
            className={`px-2.5 py-1 rounded text-xs font-medium ${
              info.getValue()
                ? 'bg-green-900/20 backdrop-blur-md border border-green-700/30 text-green-400'
                : 'bg-gray-800/20 backdrop-blur-md border border-gray-700/30 text-gray-400'
            }`}
          >
            {info.getValue() ? 'Yes' : 'No'}
          </span>
        ),
      }),
      columnHelper.accessor('created_at', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:text-teal-glass"
          >
            Created
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleView(info.row.original)}
              className="p-1.5 rounded bg-gray-800/10 backdrop-blur-sm border border-white/5 hover:bg-gray-800/20 text-gray-400 hover:text-white transition-all"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(info.row.original)}
              className="p-1.5 rounded bg-gray-800/10 backdrop-blur-sm border border-white/5 hover:bg-gray-800/20 text-gray-400 hover:text-white transition-all"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(info.row.original.id)}
              className="p-1.5 rounded bg-gray-800/20 backdrop-blur-sm border border-white/10 hover:bg-gray-800/30 text-gray-400 hover:text-white transition-all"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const filteredData = useMemo(() => {
    return websites.filter((website) => {
      const matchesGlobal =
        globalFilter === '' || website.title.toLowerCase().includes(globalFilter.toLowerCase());
      const matchesStatus = statusFilter === 'all' || website.status === statusFilter;
      const matchesDemo =
        demoFilter === 'all' ||
        (demoFilter === 'demo' && website.is_demo) ||
        (demoFilter === 'live' && !website.is_demo);
      return matchesGlobal && matchesStatus && matchesDemo;
    });
  }, [websites, globalFilter, statusFilter, demoFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleView = (website) => {
    setSelectedWebsite(website);
    setIsViewModalOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      title: '',
      url: '',
      theme_name: 'professional',
      status: 'pending',
      is_demo: false,
      is_claimed: false,
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (website) => {
    setSelectedWebsite(website);
    setFormData({
      title: website.title || '',
      url: website.url || website.website_url || website.domain || '',
      theme_name: website.theme_name || 'professional',
      status: website.status || 'pending',
      is_demo: website.is_demo || false,
      is_claimed: website.is_claimed || false,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      try {
        await websiteAPI.delete(id);
        setWebsites(websites.filter((w) => w.id !== id));
        alert('Website deleted successfully!');
      } catch (error) {
        console.error('Failed to delete website:', error);
        alert('Failed to delete website. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const urlValue = formData.url?.trim();
      
      const data = {
        title: formData.title,
        theme_name: formData.theme_name,
        status: formData.status,
        is_demo: formData.is_demo,
        is_claimed: formData.is_claimed,
      };
      
      // Always include URL (even if empty) so backend can set it to NULL
      // For create, only include if it has a value
      // For update, always include to allow clearing the URL
      if (selectedWebsite) {
        // Update: always send URL (can be empty string to clear it)
        data.url = urlValue || null;
      } else {
        // Create: only include if it has a value
        if (urlValue && urlValue.length > 0) {
          data.url = urlValue;
        }
      }

      // Include business_id if editing existing website
      if (selectedWebsite && selectedWebsite.business_id) {
        data.business_id = selectedWebsite.business_id;
      }

      if (selectedWebsite) {
        // Update
        console.log('Updating website with data:', data);
        const response = await websiteAPI.update(selectedWebsite.id, data);
        console.log('Update response:', response);
        const updatedWebsite = response.data?.data || response.data || response;
        console.log('Updated website:', updatedWebsite);
        alert('Website updated successfully!');
        setIsEditModalOpen(false);
      } else {
        // Create - business_id can be null for new websites
        // Remove business_id if it's not set (backend will handle NULL)
        if (!data.business_id) {
          delete data.business_id;
        }
        console.log('Creating website with data:', data);
        const response = await websiteAPI.create(data);
        console.log('Create response:', response);
        alert('Website created successfully!');
        setIsAddModalOpen(false);
      }
      // Wait a bit before refetching to ensure database is updated
      setTimeout(() => {
        fetchWebsites();
      }, 500);
      setSelectedWebsite(null);
      setFormData({
        title: '',
        url: '',
        theme_name: 'professional',
        status: 'pending',
        is_demo: false,
        is_claimed: false,
      });
    } catch (error) {
      console.error('Failed to save website - Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to save website. Please try again.';
      
      // Try to extract the actual error message from the backend
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
          // If error starts with "Failed to create website:", extract the actual error
          if (errorMessage.includes('Failed to create website:')) {
            errorMessage = errorMessage.replace('Failed to create website: ', '');
          }
          if (errorMessage.includes('Failed to update website:')) {
            errorMessage = errorMessage.replace('Failed to update website: ', '');
          }
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check if it's a network error
      if (!error.response && error.message) {
        errorMessage = `Network error: ${error.message}. Please make sure the backend server is running.`;
      }
      
      alert(errorMessage);
    }
  };

  const clearFilters = () => {
    setGlobalFilter('');
    setStatusFilter('all');
    setDemoFilter('all');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-4">Websites</h1>
        
        {/* Search, Filters and Action Button Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Search and Filters */}
          <div className="flex items-center gap-3 flex-1">
            <div className="min-w-[200px]">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search websites..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded bg-gray-700/80 text-white placeholder-gray-500 focus:outline-none focus:border-teal-glass text-sm"
              />
            </div>
          </div>
            <Dropdown
            value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'approved', label: 'Approved' },
                { value: 'pending', label: 'Pending' },
                { value: 'draft', label: 'Draft' },
              ]}
              placeholder="All Status"
            />
            <Dropdown
            value={demoFilter}
              onChange={(value) => setDemoFilter(value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'demo', label: 'Demo' },
                { value: 'live', label: 'Live' },
              ]}
              placeholder="All Types"
            />
          {(globalFilter || statusFilter !== 'all' || demoFilter !== 'all') && (
            <button
              onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white transition-all text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
          </div>

          {/* Right: Action Button */}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded text-white hover:bg-teal-glass/30 transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Website
          </button>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-gray-400">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-200/40 dark:divide-gray-700">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500 dark:text-gray-400">
                        No websites found
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row, index) => (
                      <tr key={row.id} className={`${index % 2 === 0 ? 'bg-white/40' : 'bg-white/60'} dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-200 border-b-0 focus:outline-none active:outline-none`}>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-white"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-200/60 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-gray-400">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  filteredData.length
                )}{' '}
                of {filteredData.length} websites
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-slate-700 dark:text-gray-300">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Website Details" size="lg">
        {selectedWebsite && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedWebsite.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedWebsite.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedWebsite.theme_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedWebsite.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedWebsite.is_demo ? 'Demo' : 'Live'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Claimed</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedWebsite.is_claimed ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(selectedWebsite.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
              <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(selectedWebsite.content, null, 2)}
              </pre>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedWebsite);
                }}
                className="px-4 py-2 bg-teal-glass/80 text-white rounded hover:bg-teal-600/80 transition-colors text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-gray-600 rounded bg-gray-700/80 hover:bg-gray-600/80 text-white transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedWebsite(null);
        }}
        title={selectedWebsite ? 'Edit Website' : 'Add New Website'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-glass"
              placeholder="Enter website title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-glass"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Theme <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formData.theme_name}
              onChange={(value) => setFormData({ ...formData, theme_name: value })}
              options={[
                { value: 'professional', label: 'Professional' },
                { value: 'modern', label: 'Modern' },
                { value: 'tech', label: 'Tech' },
                { value: 'restaurant', label: 'Restaurant' },
                { value: 'fitness', label: 'Fitness' },
              ]}
              placeholder="Select Theme"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'draft', label: 'Draft' },
              ]}
              placeholder="Select Status"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_demo}
                onChange={(e) => setFormData({ ...formData, is_demo: e.target.checked })}
                className="w-4 h-4 text-teal-glass rounded focus:ring-teal-glass"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Demo Website</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_claimed}
                onChange={(e) => setFormData({ ...formData, is_claimed: e.target.checked })}
                className="w-4 h-4 text-teal-glass rounded focus:ring-teal-glass"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Claimed</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedWebsite(null);
              }}
              className="px-4 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded text-white hover:bg-teal-glass/30 transition-all text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              {selectedWebsite ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
