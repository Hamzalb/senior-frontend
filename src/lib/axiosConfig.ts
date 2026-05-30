import axios from "axios";

// Set global defaults for all axios requests
axios.defaults.timeout = 15000; // 15 seconds — enough for slow mobile networks
axios.defaults.headers.common["Accept"] = "application/json";
