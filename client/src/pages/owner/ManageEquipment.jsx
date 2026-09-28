import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { equipmentService } from '../../services/api';
import {
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  MapPin,
  Shield,
  Layers,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Upload,
} from 'lucide-react';
import { LOCATIONS } from '../../constants/locations';

const ManageEquipment = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Edit Modal state
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const editFileInputRef = useRef(null);

  // Delete Modal state
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle photo attachment in edit modal
  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo file size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const fetchMyEquipments = async () => {
    try {
      setLoading(true);
      const data = await equipmentService.getMyEquipments();
      setEquipments(data);
    } catch (err) {
      console.error('Failed to load owner equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEquipments();
  }, []);

  // Open delete confirmation modal
  const openDeleteModal = (item) => {
    setDeletingItem(item);
  };

  // Confirm delete and call delete equipment api
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      setIsDeleting(true);
      await equipmentService.delete(deletingItem._id);
      setMessage({
        type: 'success',
        text: `Equipment "${deletingItem.name}" was deleted successfully.`,
      });
      setDeletingItem(null);
      fetchMyEquipments();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete equipment',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await equipmentService.update(item._id, {
        availability: !item.availability,
      });
      setMessage({
        type: 'success',
        text: `Availability updated to ${!item.availability ? 'Available' : 'Unavailable'}.`,
      });
      fetchMyEquipments();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update availability',
      });
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditFormData({
      name: item.name,
      category: item.category,
      description: item.description,
      pricePerDay: item.pricePerDay,
      securityDeposit: item.securityDeposit,
      location: item.location,
      latitude: item.latitude || '',
      longitude: item.longitude || '',
      image: item.image,
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await equipmentService.update(editingItem._id, {
        ...editFormData,
        pricePerDay: Number(editFormData.pricePerDay),
        securityDeposit: editFormData.securityDeposit ? Number(editFormData.securityDeposit) : 0,
        latitude: editFormData.latitude !== '' ? Number(editFormData.latitude) : undefined,
        longitude: editFormData.longitude !== '' ? Number(editFormData.longitude) : undefined,
      });
      setEditingItem(null);
      setMessage({ type: 'success', text: 'Equipment details updated successfully!' });
      fetchMyEquipments();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update equipment',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Equipment Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage listings, change daily rates, toggle availability, or add new machinery
          </p>
        </div>

        <Link
          to="/owner/add-equipment"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Equipment</span>
        </Link>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Equipment Table / List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : equipments.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Equipment</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Rate / Day</th>
                  <th className="py-4 px-4">Deposit</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Availability</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipments.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition">
                    {/* Thumbnail & Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || '/images/default-equipment.jpg'}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate max-w-xs">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 font-semibold text-slate-700">
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                      ₹{item.pricePerDay.toLocaleString()}
                    </td>

                    {/* Deposit */}
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      ₹{item.securityDeposit ? item.securityDeposit.toLocaleString() : 0}
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                        {item.location}
                      </span>
                    </td>

                    {/* Availability Toggle */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition ${
                          item.availability
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.availability ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{item.availability ? 'Available' : 'Unavailable'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/user/equipment/${item._id}`}
                          title="View Public Page"
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit Equipment"
                          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(item)}
                          title="Delete Equipment"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Your catalog is empty</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You have not listed any equipment yet. Start generating rental income by adding your first machine or tool.
          </p>
          <Link
            to="/owner/add-equipment"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Equipment</span>
          </Link>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Edit Equipment Details
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">
                  Equipment Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">
                    Daily Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={editFormData.pricePerDay}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        pricePerDay: Number(e.target.value),
                      })
                    }
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">
                    Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={editFormData.securityDeposit}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        securityDeposit: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">
                  Location
                </label>
                <select
                  value={editFormData.location}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, location: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold cursor-pointer appearance-none"
                >
                  <option value="">Select Location</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* GPS Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">
                    GPS Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editFormData.latitude || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, latitude: e.target.value })
                    }
                    placeholder="e.g. 28.6139"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">
                    GPS Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editFormData.longitude || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, longitude: e.target.value })
                    }
                    placeholder="e.g. 77.2090"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs"
                  />
                </div>
              </div>

              {/* Equipment photo attachment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">
                  Equipment Photo
                </label>
                <input
                  type="file"
                  ref={editFileInputRef}
                  accept="image/*"
                  onChange={handleEditFileChange}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  {editFormData.image ? (
                    <img
                      src={editFormData.image}
                      alt="Equipment"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                      <Upload className="w-5 h-5" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Attach New Photo</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200">
            {/* Modal header */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                onClick={() => !isDeleting && setDeletingItem(null)}
                disabled={isDeleting}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal title and prompt */}
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900">
                Delete Equipment
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to delete this equipment?
              </p>

              {/* Equipment summary card */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center gap-3 mt-3">
                <img
                  src={deletingItem.image || '/images/default-equipment.jpg'}
                  alt={deletingItem.name}
                  className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-xs truncate">
                    {deletingItem.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ₹{deletingItem.pricePerDay?.toLocaleString()}/day • {deletingItem.location}
                  </p>
                </div>
              </div>

              <p className="text-xs text-rose-600 font-medium pt-1">
                This action cannot be undone and will permanently remove this listing.
              </p>
            </div>

            {/* Modal action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEquipment;
