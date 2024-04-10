import { ShowTeamsWithPlayers, TeamList, TextInput } from "../hooks/Hooks";
import { createPlayers, fetchPlayers, fetchTeams } from "../api/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import "./Forms.css";

export default function CreatePlayerForm() {
  const queryClient = useQueryClient();
  const eighteenYearsLimit = new Date(
    new Date().setFullYear(new Date().getFullYear() - 18)
  )
    .toISOString()
    .split("T")[0];
  const [teamId, setTeamId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [nickname, setNickname] = useState("");
  const [nationality, setNationality] = useState("");
  const [birthDate, setBirthDate] = useState("");

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

  const addPlayerMutation = useMutation({
    mutationFn: createPlayers,
    onSuccess: () => {
      queryClient.invalidateQueries("players");
      queryClient.invalidateQueries("teams");
    },
    onSettled: () => {
      queryClient.invalidateQueries("players");
      queryClient.invalidateQueries("teams");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (players.some((player) => player.nickname === nickname)) {
      alert("Nickname already chosen. Please choose a different nickname.");
      return;
    }

    try {
      const newPlayer = {
        team_id: teamId,
        name: playerName,
        nickname,
        nationality,
        birth_date: birthDate,
      };
      await addPlayerMutation.mutateAsync(newPlayer);
      alert(
        "Created player successfully wait for it to show in the select team!"
      );
      setTeamId("");
      setPlayerName("");
      setNickname("");
      setNationality("");
      setBirthDate("");
    } catch (error) {
      alert("Error creating player: " + error.message);
    }
  };

  if (teamLoading || playerLoading) return "Loading players...";

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
        <label className="form-label">
          Which team will you play for?
          <TeamList
            teams={teams}
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          />
        </label>

        <label className="form-label">
          Player Name:
          <TextInput
            name="PlayerName"
            placeholder="Write your name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </label>

        <label className="form-label">
          Nickname:
          <TextInput
            name="Nickname"
            placeholder="Write your nickname..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </label>

        <label className="form-label">
          Nationality name:
          <TextInput
            name="Nationality"
            placeholder="Write your nationality..."
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          />
        </label>

        <label className="form-label">
          Birth Date:
          <input
            className="form-date"
            type="date"
            name="birth_date"
            value={birthDate}
            required
            onChange={(e) => setBirthDate(e.target.value)}
            max={eighteenYearsLimit}
          />
        </label>

        <input type="submit" value="Send Form" />
      </form>

      <div className="teams-container">
        <h3 className="sub-title">Player of each team:</h3>
        <div className="teams-container-grid">
          {teams?.map((team) => (
            <ShowTeamsWithPlayers key={team.id} team={team} />
          ))}
        </div>
      </div>
    </div>
  );
}
