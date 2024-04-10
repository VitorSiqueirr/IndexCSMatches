import { useQuery } from "@tanstack/react-query";
import { fetchTeams } from "../api/api";
import "./Statistics.css";

export default function Statistics() {
  const {
    isLoading: teamLoading,
    error: teamError,
    data: teams,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
  });

  if (teamLoading) return "Loading players and teams...";

  if (teamError)
    return (
      "An error has occurred while getting the teams: " + teamError.message
    );

  return (
    <>
      <h1 className="title">Statistics</h1>
      <div className="show-statistics">
        {teams.map((team, index) => (
          <div key={index} className="statistics">
            <h2 className="team-name">{team.name}</h2>
            <h3 className="sub-title">Players:</h3>
            <ul className="players-nicknames">
              {team.players.map((player) => (
                <li key={player.id}>{player.nickname}</li>
              ))}
            </ul>
            <h3 className="sub-title">Home Matches:</h3>
            <ul className="matches">
              {team.matches_as_home.map((match, i) => (
                <li key={i}>
                  {`${match["win?"] ? "Win" : "Defeat"} against ${match.opponent_name}, Score: ${match.score} - ${match.opponent_score}`}
                </li>
              ))}
            </ul>
            <h3 className="sub-title">Away Matches:</h3>
            <ul className="matches">
              {team.matches_as_away.map((match, i) => (
                <li key={i}>
                  {`${match["win?"] ? "Win" : "Defeat"} against ${match.opponent_name}, Score: ${match.score} - ${match.opponent_score}`}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
