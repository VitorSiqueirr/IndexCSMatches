import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation/Navigation";

export default function Create() {
  return (
    <>
      <Navigation
        navItems={[
          { url: "team", label: "Team" },
          { url: "player", label: "Player" },
          { url: "match", label: "Match" },
        ]}
      />
      <div className="content">
        <Outlet />
      </div>
    </>
  );
}
