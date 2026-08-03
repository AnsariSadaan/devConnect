// export const BASE_URL = "/api"

// use in dev 
export const BASE_URL = "/api"

// use in production
// export const BASE_URL = location.hostname == "localhost" ? "http://localhost:5000/api" : "/api";


export const NAV_LINKS = [
  { path: '/feed', label: 'Feed', icon: 'FiHome' },
  { path: '/connections', label: 'Connections', icon: 'FiUsers' },
  { path: '/chat', label: 'Chat', icon: 'FiMessageSquare' },
  { path: '/requests', label: 'Requests', icon: 'FiUserPlus' },
  { path: '/premium', label: 'Premium', icon: 'FiAward' },
];

export const SOCIAL_LINKS = {
  github: 'https://github.com/AnsariSadaan',
  linkedin: 'https://www.linkedin.com/in/sadaan-ansari-82a191214/',
  twitter: 'https://x.com/sadaan_18',
};