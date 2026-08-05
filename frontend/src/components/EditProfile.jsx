import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { 
  FiUser, 
  FiMail, 
  FiMapPin, 
  FiBriefcase, 
  FiGithub, 
  FiLinkedin, 
  FiLink,
  FiCode,
  FiSave,
  FiInfo,
  FiAward,
  FiCalendar
} from 'react-icons/fi';
import api from '../utils/axios';
import { addUser } from '../utils/userSlice';

const EditProfile = ({ user }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    age: user?.age || '',
    gender: user?.gender || '',
    about: user?.about || '',
    photoUrl: user?.photoUrl || '',
    skills: user?.skills?.join(', ') || '',
    experience: user?.experience || 0,
    currentCompany: user?.currentCompany || '',
    location: user?.location || '',
    githubUrl: user?.githubUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
  });

  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await api.patch("/profile/edit", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: Number(formData.age),
        gender: formData.gender,
        about: formData.about,
        photoUrl: formData.photoUrl,
        experience: Number(formData.experience),
        currentCompany: formData.currentCompany,
        location: formData.location,
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl,
        portfolioUrl: formData.portfolioUrl,
        skills: formData.skills
          .split(',')
          .map(skill => skill.trim())
          .filter(Boolean)
      }, { withCredentials: true });
      
      dispatch(addUser(response?.data?.data));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-8"
      >
        {/* Edit Form */}
        <div className="card bg-base-100 shadow-xl border border-base-200 flex-1 h-[85vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-base-200">
            <h2 className="text-2xl font-bold text-center">Edit Profile</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    First Name
                  </span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    Last Name
                  </span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    Age
                  </span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    Gender
                  </span>
                </label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="" disabled>Select Gender</option>
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FiCode className="w-4 h-4" />
                    Skills
                  </span>
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, MongoDB"
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FiAward className="w-4 h-4" />
                    Experience (Years)
                  </span>
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FiBriefcase className="w-4 h-4" />
                    Current Company
                  </span>
                </label>
                <input
                  type="text"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FiMapPin className="w-4 h-4" />
                    Location
                  </span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FiGithub className="w-4 h-4" />
                    GitHub URL
                  </span>
                </label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FiLinkedin className="w-4 h-4" />
                    LinkedIn URL
                  </span>
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FiLink className="w-4 h-4" />
                    Portfolio URL
                  </span>
                </label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="https://your-portfolio.com"
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FiInfo className="w-4 h-4" />
                    About
                  </span>
                </label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  className="textarea textarea-bordered h-32 w-full"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-base-200">
            {error && <p className="text-error text-sm mb-3">{error}</p>}
            <button
              className="btn btn-primary w-full gap-2"
              onClick={saveProfile}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <FiSave className="w-4 h-4" />
              )}
              Save Profile
            </button>
          </div>
        </div>

        {/* Preview Card */}
        <div className="w-full lg:w-96 flex-shrink-0 hidden lg:block">
          <div className="card bg-base-100 shadow-xl border border-base-200 sticky top-24">
            <div className="card-body">
              <h3 className="font-bold text-center text-lg mb-4">Live Preview</h3>
              <div className="flex flex-col items-center">
                <div className="avatar">
                  <div className="w-24 h-24 rounded-full ring-2 ring-primary/20">
                    <img 
                      src={formData.photoUrl || `https://ui-avatars.com/api/?name=${formData.firstName}`}
                      alt="Preview"
                      className="object-cover"
                    />
                  </div>
                </div>
                <h4 className="text-xl font-bold mt-3">
                  {formData.firstName || 'John'} {formData.lastName || 'Doe'}
                </h4>
                {formData.currentCompany && (
                  <p className="text-sm text-base-content/70 flex items-center gap-1">
                    <FiBriefcase className="w-3 h-3" />
                    {formData.currentCompany}
                  </p>
                )}
                {formData.location && (
                  <p className="text-sm text-base-content/60 flex items-center gap-1">
                    <FiMapPin className="w-3 h-3" />
                    {formData.location}
                  </p>
                )}
                {formData.skills && (
                  <div className="flex flex-wrap gap-2 mt-3 justify-center">
                    {formData.skills.split(',').slice(0, 3).map((skill) => (
                      <span key={skill} className="badge badge-primary badge-outline">
                        {skill.trim()}
                      </span>
                    ))}
                    {formData.skills.split(',').length > 3 && (
                      <span className="badge badge-ghost">+{formData.skills.split(',').length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {showToast && (
        <div className="toast toast-top toast-end">
          <div className="alert alert-success">
            <span>Profile saved successfully! 🎉</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;