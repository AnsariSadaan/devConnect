import React, { useState } from 'react'
import UserCard from './UserCard';
import api from '../utils/axios';
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';

const EditProfile = ({ user }) => {

  const [firstName, setFirstName] = useState(user?.firstName);
  const [lastName, setLastName] = useState(user?.lastName);
  const [age, setAge] = useState(user?.age);
  const [gender, setGender] = useState(user?.gender);
  const [about, setAbout] = useState(user?.about);
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl);
  const [skills, setSkills] = useState(user?.skills?.join(", ") || "");
  const [experience, setExperience] = useState(user?.experience || 0);
  const [currentCompany, setCurrentCompany] = useState(user?.currentCompany || "");
  const [location, setLocation] = useState(user?.location || "");
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || "");
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const dispatch = useDispatch();

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];


  const saveProfile = async () => {
    setError("");
    try {

      const response = await api.patch("/profile/edit",
        {
          firstName,
          lastName,
          age: Number(age),
          gender,
          about,
          photoUrl,
          experience: Number(experience),
          currentCompany,
          location,
          githubUrl,
          linkedinUrl,
          portfolioUrl,
          skills: skills
            .split(",")
            .map(skill => skill.trim())
            .filter(Boolean)
        },
        { withCredentials: true }
      )
      dispatch(addUser(response?.data?.data));
      setShowToast(true);
      const i = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log("RESPONSE:", error.response?.data);

      setError(
        error.response?.data?.message ||
        error.message
      );
    }
  }


  return (
  <>
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ================= Edit Form ================= */}
        <div className="card card-border bg-base-300 flex-1 h-[85vh] flex flex-col">

          {/* Header */}
          <div className="p-6 border-b border-base-content/10">
            <h2 className="text-2xl font-bold text-center">
              Edit Profile
            </h2>
          </div>

          {/* Scrollable Form */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-base-200 p-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* First Name */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text">First Name</span>
                </div>

                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input input-bordered w-full"
                />
              </label>

              {/* Last Name */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Last Name</span>
                </div>

                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input input-bordered w-full"
                />
              </label>

              {/* Age */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Age</span>
                </div>

                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input input-bordered w-full"
                />
              </label>

              {/* Gender */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Gender</span>
                </div>

                <select
                  value={gender || ""}
                  onChange={(e) => setGender(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="" disabled>
                    Select Gender
                  </option>

                  {genderOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Skills */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Skills</span>
                </div>

                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node.js, MongoDB"
                  className="input input-bordered w-full"
                />
              </label>

              {/* Experience */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text">
                    Experience (Years)
                  </span>
                </div>

                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="input input-bordered w-full"
                />
              </label>

              {/* Company */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text">
                    Current Company
                  </span>
                </div>

                <input
                  type="text"
                  value={currentCompany}
                  onChange={(e) =>
                    setCurrentCompany(e.target.value)
                  }
                  className="input input-bordered w-full"
                />
              </label>

              {/* Location */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Location</span>
                </div>

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input input-bordered w-full"
                />
              </label>

              {/* GitHub */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text">
                    GitHub URL
                  </span>
                </div>

                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="input input-bordered w-full"
                />
              </label>

              {/* LinkedIn */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text">
                    LinkedIn URL
                  </span>
                </div>

                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) =>
                    setLinkedinUrl(e.target.value)
                  }
                  className="input input-bordered w-full"
                />
              </label>

              {/* Portfolio */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text">
                    Portfolio URL
                  </span>
                </div>

                <input
                  type="text"
                  value={portfolioUrl}
                  onChange={(e) =>
                    setPortfolioUrl(e.target.value)
                  }
                  className="input input-bordered w-full"
                />
              </label>

              {/* Photo */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text">
                    Photo URL
                  </span>
                </div>

                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="input input-bordered w-full"
                />
              </label>

              {/* About */}
              <div className="md:col-span-2">
                <label className="form-control">
                  <div className="label">
                    <span className="label-text">
                      About
                    </span>
                  </div>

                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="textarea textarea-bordered h-32 w-full"
                  />
                </label>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-base-content/10 p-5">
            <p className="text-red-500 mb-3">{error}</p>

            <div className="card-actions justify-center">
              <button
                className="btn btn-primary"
                onClick={saveProfile}
              >
                Save Profile
              </button>
            </div>
          </div>

        </div>

        {/* ================= Live Preview ================= */}

        <div className="w-full lg:w-96 flex-shrink-0">
          <UserCard
            user={{
              firstName,
              lastName,
              age,
              gender,
              about,
              photoUrl,
              experience,
              currentCompany,
              location,
              skills,
            }}
          />
        </div>

      </div>
    </div>

    {showToast && (
      <div className="toast toast-top toast-end">
        <div className="alert alert-success">
          <span>
            {user?.firstName} your profile was saved successfully.
          </span>
        </div>
      </div>
    )}
  </>
  )
}

export default EditProfile