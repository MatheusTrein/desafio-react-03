import React, { useState } from "react";
import { api } from "../services/api";

const useAxios = () => {
  const request = React.useCallback(async (path, config) => {
    let response;
    let data;

    try {
      response = await api(path, config);
      data = response.data;
    } catch (error) {
    } finally {
      return { response, data };
    }
  }, []);

  return {
    request,
  };
};

export { useAxios };
