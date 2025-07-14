//production
// export const BASE_URL = "/api"

//dev 
// export const BASE_URL = "http://localhost:5000/api"

export const BASE_URL = location.hostname == "localhost" ? "http://localhost:5000/api" : "/api";