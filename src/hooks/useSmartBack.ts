import { useLocation, useNavigate, matchPath } from "react-router";
import React from "react";

export function useSmartBack() {
  const navigate = useNavigate();
  const location = useLocation();

  const smartBack = React.useCallback(() => {
    const { pathname } = location;
    if (matchPath("/activity/:id", pathname)) {
      navigate("/");
      return;
    }

    if (location.key !== "default") {
      navigate(-1);
      return;
    }

    const parentPath = pathname.substring(0, pathname.lastIndexOf("/"));
    navigate(parentPath || "/");
  }, [location, navigate]);

  return smartBack;
}
