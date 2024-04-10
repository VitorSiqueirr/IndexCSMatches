/* eslint-disable react/prop-types */
const PlayerList = ({ players, value, onChange }) => (
  <select className="form-select" value={value} required onChange={onChange}>
    <option value="">Select a player...</option>
    {players.map((player) => (
      <option key={player.id} value={player.id}>
        {player.nickname}
      </option>
    ))}
  </select>
);

export function TextInput({ name, placeholder, value, onChange }) {
  return (
    <input
      className="form-input"
      name={name}
      type="text"
      placeholder={placeholder}
      value={value}
      required
      onChange={onChange}
    />
  );
}

export function TeamList({ teams, value, onChange, excludeTeamId }) {
  return (
    <select className="form-select" value={value} required onChange={onChange}>
      <option value="">Select a team...</option>
      {teams
        .filter((team) => team.id !== excludeTeamId)
        .map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
    </select>
  );
}

export function ScoreInput({ name, value, onChange }) {
  return (
    <input
      className="form-input"
      type="text"
      name={name}
      value={value}
      required
      onChange={onChange}
    />
  );
}

export function ShowTeamsAllInfos({ team }) {
  const homeWins = team.matches_as_home.filter((match) => match["win?"]).length;
  const awayWins = team.matches_as_away.filter((match) => match["win?"]).length;
  const totalWins = homeWins + awayWins;
  return (
    <ul key={team.id} className="show-teams">
      <li role="team_name">
        {team.name} - Wins: {totalWins} (Home: {homeWins}, Away: {awayWins})
        <ul className="show-players">
          {team.players.map((player) => (
            <li key={player.id} role="player_name">
              {player.nickname}
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
}

export function ShowTeamsWithPlayers({ team }) {
  return (
    <ul key={team.id} className="show-teams">
      <li role="team_name">
        {team.name}
        <ul className="show-players">
          {team.players.map((player) => (
            <li key={player.id} role="player_name">
              {player.nickname}
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
}

export function ShowTeams({ team }) {
  return (
    <ul key={team.id} className="show-teams">
      <li role="team_name">{team.name}</li>
    </ul>
  );
}

export function PlayerPerformances({
  playerPerformances,
  handlePlayerPerformanceChange,
  players,
  handleRemovePlayerPerformance,
}) {
  return playerPerformances.map((playerPerformance, i) => {
    return (
      <div key={i} className="player-performance">
        <label className="form-label">
          Player ID:
          <PlayerList
            players={players}
            value={playerPerformance.player_id}
            onChange={(e) =>
              handlePlayerPerformanceChange(i, {
                target: { name: "player_id", value: e.target.value },
              })
            }
          />
        </label>
        <label className="form-label">
          Player Kills:
          <ScoreInput
            name="kills"
            value={playerPerformance.kills}
            onChange={(event) => handlePlayerPerformanceChange(i, event)}
          />
        </label>
        <label className="form-label">
          Player Deaths:
          <ScoreInput
            name="deaths"
            value={playerPerformance.deaths}
            onChange={(event) => handlePlayerPerformanceChange(i, event)}
          />
        </label>
        <label className="form-label">
          Player Assists:
          <ScoreInput
            name="assists"
            value={playerPerformance.assists}
            onChange={(event) => handlePlayerPerformanceChange(i, event)}
          />
        </label>
        <label className="form-label">
          Headshots:
          <ScoreInput
            name="headshots"
            value={playerPerformance.headshots}
            onChange={(event) => handlePlayerPerformanceChange(i, event)}
          />
        </label>

        {playerPerformances.length > 1 && (
          <button
            type="button"
            onClick={() => handleRemovePlayerPerformance(i)}>
            Remove
          </button>
        )}
      </div>
    );
  });
}
