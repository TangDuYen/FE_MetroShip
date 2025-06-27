import "./NavDashboard.scss";

import React, { useState } from "react";
import navDashboardConfig, {
  navDashboardConfigAdmin,
  navDashboardConfigStaff,
  navDashboardConfigStylist,
} from "./config";

import { Link } from "react-router-dom";
import { selectUser } from "../../redux/features/counterSlice";
import { useSelector } from "react-redux";

function NavDashboard() {
  const [isActive, setIsActive] = useState(2);
  const user = useSelector(selectUser);
  return (
    <div className="dashboard-navigator">
      {navDashboardConfig(
        user.role == "Admin"
          ? navDashboardConfig
          : user.role == "Staff"
          ? navDashboardConfigStaff
          : null
      ).map((nav, index) => (
        <Link
          className={`dashboard-navigator__nav ${
            isActive == index ? "active" : ""
          }`}
          onClick={() => setIsActive(index)}
          to={nav.path}
          key={index}
        >
          {nav.title}
        </Link>
      ))}
    </div>
  );
}

export default NavDashboard;