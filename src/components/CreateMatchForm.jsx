import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMatches, fetchPlayers, fetchTeams } from "../api/api";
import { useState } from "react";
import {
  PlayerPerformances,
  ScoreInput,
  ShowTeamsAllInfos,
  TeamList,
} from "../hooks/Hooks";
import "./Forms.css";
export default function CreateMatchForm() {
  const queryClient = useQueryClient();

  const [teamHomeId, setTeamHomeId] = useState(0);
  const [teamAwayId, setTeamAwayId] = useState(0);
  const [teamHomeScore, setTeamHomeScore] = useState(0);
  const [teamAwayScore, setTeamAwayScore] = useState(0);
  const [playerPerformances, setPlayerPerformances] = useState([
    {
      player_id: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      headshots: 0,
    },
  ]);

  const {
    isLoading: teamLoading,
    error: teamError,
    data: teams,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
  });

  const {
    isLoading: playerLoading,
    error: playerError,
    data: players,
  } = useQuery({ queryKey: ["players"], queryFn: fetchPlayers });

  const addMatchesMutation = useMutation({
    mutationFn: createMatches,
    onSuccess: () => {
      queryClient.invalidateQueries("players");
      queryClient.invalidateQueries("teams");
    },
    onSettled: () => {
      queryClient.invalidateQueries("players");
      queryClient.invalidateQueries("teams");
    },
  });

  const handlePlayerPerformanceChange = (i, event) => {
    const values = [...playerPerformances];
    if (event.target.name === "player_id") {
      values[i].player_id = parseInt(event.target.value, 10);
    } else {
      handleInputChange(event, (value) => {
        values[i][event.target.name] = value;
      });
    }
    setPlayerPerformances(values);
  };

  const handleAddPlayerPerformance = () => {
    const values = [...playerPerformances];
    const lastPerformance = values[values.length - 1];

    if (
      lastPerformance.player_id &&
      lastPerformance.kills &&
      lastPerformance.deaths &&
      lastPerformance.assists &&
      lastPerformance.headshots
    ) {
      values.push({
        player_id: "",
        kills: "",
        deaths: "",
        assists: "",
        headshots: "",
      });
      setPlayerPerformances(values);
    } else {
      alert(
        "Please fill all the players performance fields before adding a new one."
      );
    }
  };

  const handleRemovePlayerPerformance = (i) => {
    const values = [...playerPerformances];
    values.splice(i, 1);
    setPlayerPerformances(values);
  };

  const handleInputChange = (e, setter, maxValue = 100, minValue = 0) => {
    let value = e.target.value;
    if (/^\d+$/.test(value)) {
      value = parseInt(value, 10);
      if (value > maxValue) {
        value = maxValue;
      } else if (value < minValue) {
        value = minValue;
      }
      setter(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const playerIds = new Set(playerPerformances.map((p) => p.player_id));

      if (playerIds.size !== playerPerformances.length) {
        alert("Exists two or more performances with the same player!");
        return;
      }

      const newMatch = {
        team_home_id: teamHomeId,
        team_away_id: teamAwayId,
        team_home_score: teamHomeScore,
        team_away_score: teamAwayScore,
        player_performances_attributes: playerPerformances,
      };

      await addMatchesMutation.mutateAsync(newMatch);

      alert("Match created successfully");

      setTeamHomeId(0);
      setTeamAwayId(0);
      setTeamHomeScore(0);
      setTeamAwayScore(0);
      setPlayerPerformances([
        {
          player_id: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
          headshots: 0,
        },
      ]);
    } catch (error) {
      alert("Error creating match: " + error.message);
    }
  };

  if (teamLoading || playerLoading) return "Loading players and teams...";

  if (teamError)
    return (
      "An error has occurred while getting the teams: " + teamError.message
    );

  if (playerError)
    return (
      "An error has occurred while getting the players: " + playerError.message
    );

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-match">
          <label className="form-label">
            Home Team:
            <TeamList
              teams={teams}
              value={teamHomeId}
              excludeTeamId={teamAwayId}
              onChange={(e) => setTeamHomeId(parseInt(e.target.value))}
            />
          </label>
          <label className="form-label">
            Home Team Score:
            <ScoreInput
              name={"HomeTeamScore"}
              value={teamHomeScore}
              onChange={(e) => handleInputChange(e, setTeamHomeScore)}
            />
          </label>
          <label className="form-label">
            Away Team:
            <TeamList
              teams={teams}
              value={teamAwayId}
              excludeTeamId={teamHomeId}
              onChange={(e) => setTeamAwayId(parseInt(e.target.value))}
            />
          </label>
          <label className="form-label">
            Away Team Score:
            <ScoreInput
              name={"AwayTeamScore"}
              value={teamAwayScore}
              onChange={(e) => handleInputChange(e, setTeamAwayScore)}
            />
          </label>
        </div>

        <PlayerPerformances
          key={"playerPerformance"}
          playerPerformances={playerPerformances}
          handlePlayerPerformanceChange={handlePlayerPerformanceChange}
          players={players}
          handleRemovePlayerPerformance={handleRemovePlayerPerformance}
        />

        <button type="button" onClick={handleAddPlayerPerformance}>
          Add Player Performance
        </button>
        <button type="submit">Send Form</button>
      </form>

      <div className="teams-container">
        <h3 className="sub-title">Player of each team:</h3>

        {teams?.map((team) => (
          <ShowTeamsAllInfos key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}
