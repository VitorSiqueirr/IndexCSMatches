const BASE_URL = "http://localhost:3000";

export async function fetchTeams() {
  const res = await fetch(`${BASE_URL}/teams`);
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json();
}

export async function createTeam(newTeam) {
  const res = await fetch(`${BASE_URL}/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTeam),
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json();
}

export async function fetchPlayers() {
  const res = await fetch(`${BASE_URL}/players`);
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json();
}

export async function createPlayers(newPlayer) {
  const res = await fetch(`${BASE_URL}/players`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newPlayer),
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json();
}

export async function createMatches(newMatches) {
  const res = await fetch(`${BASE_URL}/matches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newMatches),
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json();
}
