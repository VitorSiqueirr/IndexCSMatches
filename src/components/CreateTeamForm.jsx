import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTeam, fetchTeams } from "../api/api";
import { useState } from "react";
import "./Forms.css";
import { ShowTeams, TextInput } from "../hooks/Hooks";

export default function CreateTeamForm() {
  const [teamName, setTeamName] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");

  const queryClient = useQueryClient();

  const {
    isLoading,
    error,
    data: teams,
  } = useQuery({ queryKey: ["teams"], queryFn: fetchTeams });

  const addTeamMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries("teams");
    },
    onSettled: () => {
      queryClient.invalidateQueries("teams");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (teams.some((team) => team.name === teamName)) {
      alert("Team name already exists. Please choose a different name.");
      return;
    }

    try {
      const newTeam = {
        name: teamName,
        country,
        region,
      };
      await addTeamMutation.mutateAsync(newTeam);
      setCountry("");
      setTeamName("");
      setRegion("");
    } catch (error) {
      alert("Error creating team: " + error.message);
    }
  };

  if (isLoading) return "Loading teams...";

  if (error)
    return "An error has occurred while getting the teams: " + error.message;

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <label className="form-label">
          Team Name:
          <TextInput
            placeholder="Write the team name..."
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
        </label>
        <label className="form-label">
          Country name:
          <TextInput
            placeholder="Write the team country..."
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </label>
        <label className="form-label">
          Team region:
          <TextInput
            placeholder="Write the region of the team..."
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </label>
        <input type="submit" value="Send Form" />
      </form>

      <div className="teams-container">
        <h3 className="sub-title">Player of each team:</h3>
        <div className="teams-container-grid">
          {teams?.map((team) => (
            <ShowTeams key={team.id} team={team} />
          ))}
        </div>
      </div>
    </div>
  );
}
