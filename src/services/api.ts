import axios from "axios";

const baseURL = "http://localhost:3333";

export const api = axios.create({
  baseURL,
});

export const PRODUCTS_GET = (route: string, parameter?: string) => {
  return {
    path: parameter ? `${route}/${parameter}` : `${route}`,
    config: {
      method: "GET",
      cache: "no-store",
    },
  };
};

export const STOCK_GET = (route: string, parameter: string) => {
  return {
    path: parameter ? `${route}/${parameter}` : `${route}`,
    config: {
      method: "GET",
      cache: "no-store",
    },
  };
};
