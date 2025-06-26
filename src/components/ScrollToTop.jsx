import React, { useEffect } from "react";

import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

ScrollToTop.propTypes = {
  location: PropTypes.object.isRequired,
};

export default ScrollToTop;