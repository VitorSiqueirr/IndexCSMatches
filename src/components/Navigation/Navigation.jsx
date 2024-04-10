import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import "./Navigation.css";

function Navigation({ navItems }) {
  if (!navItems?.length) {
    return <></>;
  }

  return (
    <div className="menu">
      <nav>
        <ul className="nav-container">
          {navItems.map(({ url, label }, index) => (
            <li className="nav-item" key={`navItem-${label}-${index}`}>
              <Link to={url}>{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

Navigation.propTypes = {
  navItems: PropTypes.array,
};

export default Navigation;
