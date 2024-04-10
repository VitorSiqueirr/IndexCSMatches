import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_URL, mockServer } from "./support/mockServer";
import { screen, waitFor } from "@testing-library/react";
import { customRender } from "./support/customRender";
import { rest } from "msw";
import CreateMatchForm from "../src/components/CreateMatchForm";
import userEvent from "@testing-library/user-event";

describe("CreateMatchForm", () => {
  const user = userEvent.setup();

  vi.spyOn(window, "alert").mockImplementation(() => {});

  beforeEach(() => {
    window.alert.mockClear();
  });

  describe("render successfully", () => {
    const playerResponse = [
      {
        id: 1,
        nickname: "Fallen",
      },
    ];

    const teamsResponse = [
      {
        id: 1,
        name: "Furia",
        players: [{ playerResponse }],
        matches_as_home: [],
        matches_as_away: [],
      },
    ];

    beforeEach(() => {
      mockServer.use(
        rest.get(`${API_URL}/teams`, (_req, res, ctx) => {
          return res(ctx.json(teamsResponse));
        }),
        rest.get(`${API_URL}/players`, (_req, res, ctx) => {
          return res(ctx.json(playerResponse));
        })
      );
    });

    it("render form, teams and players", async () => {
      customRender(<CreateMatchForm />);

      expect(
        screen.getByText("Loading players and teams...")
      ).toBeInTheDocument();

      expect(await screen.findByLabelText("Home Team:")).toBeInTheDocument();
      expect(await screen.findByLabelText("Away Team:")).toBeInTheDocument();
      expect(
        await screen.findByLabelText("Home Team Score:")
      ).toBeInTheDocument();
      expect(
        await screen.findByLabelText("Away Team Score:")
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Add Player Performance")
      ).toBeInTheDocument();
      expect(await screen.findByText("Player ID:")).toBeInTheDocument();
      expect(await screen.findByText("Player Kills:")).toBeInTheDocument();
      expect(await screen.findByText("Player Deaths:")).toBeInTheDocument();
      expect(await screen.findByText("Player Assists:")).toBeInTheDocument();
      expect(await screen.findByText("Headshots:")).toBeInTheDocument();
      expect(await screen.findByText("Send Form")).toBeInTheDocument();

      expect(
        await screen.findByRole("team_name", {
          value: "Furia - Wins: 0 (Home: 0, Away: 0)",
        })
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("player_name", {
          value: "Fallen",
        })
      ).toBeInTheDocument();
    });
  });

  describe("when form is submitted successfully", () => {
    let teamsResponse,
      playerResponse,
      newMatch = undefined;

    beforeEach(() => {
      playerResponse = [
        {
          id: 1,
        },
        {
          id: 2,
        },
      ];

      teamsResponse = [
        {
          id: 1,
          name: "Furia",
          players: [],
          matches_as_home: [],
          matches_as_away: [],
        },
        {
          id: 2,
          name: "CodeMiner42",
          players: [],
          matches_as_home: [],
          matches_as_away: [],
        },
      ];

      newMatch = {
        team_home_id: 1,
        team_away_id: 2,
        team_home_score: 2,
        team_away_score: 10,
        player_performances_attributes: [
          {
            player_id: 1,
            kills: 11,
            deaths: 11,
            assists: 31,
            headshots: 14,
          },
        ],
      };

      mockServer.use(
        rest.post(`${API_URL}/matches`, (_req, res, ctx) => {
          teamsResponse.forEach((team) => {
            if (team.id === newMatch.team_home_id) {
              const match = {
                "win?": newMatch.team_home_score > newMatch.team_away_score,
                score: newMatch.team_home_score,
                opponent_name: teamsResponse.find(
                  (t) => t.id === newMatch.team_away_id
                ).name,
                opponent_id: newMatch.team_away_id,
                opponent_score: newMatch.team_away_score,
              };
              team.matches_as_home.push(match);
            } else if (team.id === newMatch.team_away_id) {
              const match = {
                "win?": newMatch.team_away_score > newMatch.team_home_score,
                score: newMatch.team_away_score,
                opponent_name: teamsResponse.find(
                  (t) => t.id === newMatch.team_home_id
                ).name,
                opponent_id: newMatch.team_home_id,
                opponent_score: newMatch.team_home_score,
              };
              team.matches_as_away.push(match);
            }
          });
          return res(ctx.status(201), ctx.json(newMatch));
        }),
        rest.get(`${API_URL}/teams`, (_req, res, ctx) => {
          return res(ctx.json(teamsResponse));
        }),
        rest.get(`${API_URL}/players`, (_req, res, ctx) => {
          return res(ctx.json(playerResponse));
        })
      );
    });

    it("shows an alert and increase the win of the team", async () => {
      customRender(<CreateMatchForm />);

      const homeTeamSelect = await screen.findByLabelText("Home Team:");
      const awayTeamSelect = await screen.findByLabelText("Away Team:");
      const homeTeamScoreInput =
        await screen.findByLabelText("Home Team Score:");
      const awayTeamScoreInput =
        await screen.findByLabelText("Away Team Score:");

      const playerIDSelect = await screen.findByLabelText("Player ID:");
      const playerKillsInput = await screen.findByLabelText("Player Kills:");
      const playerDeathsInput = await screen.findByLabelText("Player Deaths:");
      const playerAssistsInput =
        await screen.findByLabelText("Player Assists:");
      const playerHeadshotsInput = await screen.findByLabelText("Headshots:");

      const addPlayer = await screen.findByText(/add player performance/i);

      await user.selectOptions(
        homeTeamSelect,
        newMatch.team_home_id.toString()
      );
      await user.selectOptions(
        awayTeamSelect,
        newMatch.team_away_id.toString()
      );
      await user.type(homeTeamScoreInput, newMatch.team_home_score.toString());
      await user.type(awayTeamScoreInput, newMatch.team_away_score.toString());
      await user.selectOptions(
        playerIDSelect,
        newMatch.player_performances_attributes[0].player_id.toString()
      );
      await user.type(
        playerKillsInput,
        newMatch.player_performances_attributes[0].kills.toString()
      );
      await user.type(
        playerDeathsInput,
        newMatch.player_performances_attributes[0].deaths.toString()
      );
      await user.type(
        playerAssistsInput,
        newMatch.player_performances_attributes[0].assists.toString()
      );
      await user.type(
        playerHeadshotsInput,
        newMatch.player_performances_attributes[0].headshots.toString()
      );

      await userEvent.click(addPlayer);

      const deleteButton = await screen.findAllByText("Remove");

      await userEvent.click(deleteButton[1]);

      expect(
        await screen.findByText("CodeMiner42 - Wins: 0 (Home: 0, Away: 0)")
      ).toBeInTheDocument();

      expect(
        await screen.findByText("Furia - Wins: 0 (Home: 0, Away: 0)")
      ).toBeInTheDocument();

      await user.click(await screen.findByText("Send Form"));

      expect(
        await screen.findByText("CodeMiner42 - Wins: 1 (Home: 0, Away: 1)")
      ).toBeInTheDocument();

      expect(
        await screen.findByText("Furia - Wins: 0 (Home: 0, Away: 0)")
      ).toBeInTheDocument();

      expect(window.alert).toHaveBeenCalledWith("Match created successfully");
    });

    it("cleans the inputs", async () => {
      customRender(<CreateMatchForm />);

      const homeTeamSelect = await screen.findByLabelText("Home Team:");
      const awayTeamSelect = await screen.findByLabelText("Away Team:");
      const homeTeamScoreInput =
        await screen.findByLabelText("Home Team Score:");
      const awayTeamScoreInput =
        await screen.findByLabelText("Away Team Score:");

      const playerIDSelect = await screen.findByLabelText("Player ID:");
      const playerKillsInput = await screen.findByLabelText("Player Kills:");
      const playerDeathsInput = await screen.findByLabelText("Player Deaths:");
      const playerAssistsInput =
        await screen.findByLabelText("Player Assists:");
      const playerHeadshotsInput = await screen.findByLabelText("Headshots:");

      const addPlayer = await screen.findByText(/add player performance/i);

      await user.selectOptions(
        homeTeamSelect,
        newMatch.team_home_id.toString()
      );
      await user.selectOptions(
        awayTeamSelect,
        newMatch.team_away_id.toString()
      );
      await user.type(homeTeamScoreInput, newMatch.team_home_score.toString());
      await user.type(awayTeamScoreInput, newMatch.team_away_score.toString());
      await user.selectOptions(
        playerIDSelect,
        newMatch.player_performances_attributes[0].player_id.toString()
      );
      await user.type(
        playerKillsInput,
        newMatch.player_performances_attributes[0].kills.toString()
      );
      await user.type(
        playerDeathsInput,
        newMatch.player_performances_attributes[0].deaths.toString()
      );
      await user.type(
        playerAssistsInput,
        newMatch.player_performances_attributes[0].assists.toString()
      );
      await user.type(
        playerHeadshotsInput,
        newMatch.player_performances_attributes[0].headshots.toString()
      );

      await userEvent.click(addPlayer);

      const deleteButton = await screen.findAllByText("Remove");

      await userEvent.click(deleteButton[1]);

      await user.click(await screen.findByText("Send Form"));

      expect(window.alert).toHaveBeenCalledWith("Match created successfully");

      expect(await homeTeamSelect.value).toEqual("");
      expect(await awayTeamSelect.value).toEqual("");
      expect(await homeTeamScoreInput.value).toEqual("0");
      expect(await awayTeamScoreInput.value).toEqual("0");
      expect(await playerIDSelect.value).toEqual("");
      expect(await playerKillsInput.value).toEqual("0");
      expect(await playerDeathsInput.value).toEqual("0");
      expect(await playerAssistsInput.value).toEqual("0");
      expect(await playerHeadshotsInput.value).toEqual("0");
    });
  });

  describe("when there's two or more performances of the same player", () => {
    let teamsResponse,
      playerResponse,
      newMatch = undefined;

    beforeEach(() => {
      teamsResponse = [
        {
          id: 1,
          players: [],
          matches_as_home: [{}],
          matches_as_away: [{}],
        },
        {
          id: 2,
          players: [],
          matches_as_home: [{}],
          matches_as_away: [{}],
        },
      ];

      playerResponse = [
        {
          id: 1,
        },
      ];

      newMatch = {
        team_home_id: 1,
        team_away_id: 2,
        team_home_score: 2,
        team_away_score: 10,
        player_performances_attributes: [
          {
            player_id: 1,
            kills: 11,
            deaths: 11,
            assists: 31,
            headshots: 14,
          },
        ],
      };

      mockServer.use(
        rest.post(`${API_URL}/matches`, (_req, res, ctx) => {
          return res(ctx.status(201), ctx.json(newMatch));
        }),
        rest.get(`${API_URL}/teams`, (_req, res, ctx) => {
          return res(ctx.json(teamsResponse));
        }),
        rest.get(`${API_URL}/players`, (_req, res, ctx) => {
          return res(ctx.json(playerResponse));
        })
      );
    });

    it("show an alert", async () => {
      customRender(<CreateMatchForm />);

      const homeTeamSelect = await screen.findByLabelText("Home Team:");
      const awayTeamSelect = await screen.findByLabelText("Away Team:");
      const homeTeamScoreInput =
        await screen.findByLabelText("Home Team Score:");
      const awayTeamScoreInput =
        await screen.findByLabelText("Away Team Score:");

      const playerIDSelect = await screen.findByLabelText("Player ID:");
      const playerKillsInput = await screen.findByLabelText("Player Kills:");
      const playerDeathsInput = await screen.findByLabelText("Player Deaths:");
      const playerAssistsInput =
        await screen.findByLabelText("Player Assists:");
      const playerHeadshots = await screen.findByLabelText("Headshots:");

      const addPlayer = await screen.findByText(/add player performance/i);

      await user.selectOptions(
        homeTeamSelect,
        newMatch.team_home_id.toString()
      );
      await user.selectOptions(
        awayTeamSelect,
        newMatch.team_away_id.toString()
      );
      await user.type(homeTeamScoreInput, newMatch.team_home_score.toString());
      await user.type(awayTeamScoreInput, newMatch.team_away_score.toString());
      await user.selectOptions(
        playerIDSelect,
        newMatch.player_performances_attributes[0].player_id.toString()
      );
      await user.type(
        playerKillsInput,
        newMatch.player_performances_attributes[0].kills.toString()
      );
      await user.type(
        playerDeathsInput,
        newMatch.player_performances_attributes[0].deaths.toString()
      );
      await user.type(
        playerAssistsInput,
        newMatch.player_performances_attributes[0].assists.toString()
      );
      await user.type(
        playerHeadshots,
        newMatch.player_performances_attributes[0].headshots.toString()
      );

      await userEvent.click(addPlayer);

      const playersSelectsIds = await screen.findAllByLabelText("Player ID:");
      const playersKillsInputs =
        await screen.findAllByLabelText("Player Kills:");
      const playersDeathsInputs =
        await screen.findAllByLabelText("Player Deaths:");
      const playersAssistsInputs =
        await screen.findAllByLabelText("Player Assists:");
      const playersHeadshots = await screen.findAllByLabelText("Headshots:");

      await user.selectOptions(
        playersSelectsIds[1],
        newMatch.player_performances_attributes[0].player_id.toString()
      );
      await user.type(
        playersKillsInputs[1],
        newMatch.player_performances_attributes[0].kills.toString()
      );
      await user.type(
        playersDeathsInputs[1],
        newMatch.player_performances_attributes[0].deaths.toString()
      );
      await user.type(
        playersAssistsInputs[1],
        newMatch.player_performances_attributes[0].assists.toString()
      );
      await user.type(
        playersHeadshots[1],
        newMatch.player_performances_attributes[0].headshots.toString()
      );

      await userEvent.click(addPlayer);

      const deleteButton = await screen.findAllByText("Remove");

      await userEvent.click(deleteButton[2]);

      await user.click(await screen.findByText("Send Form"));

      expect(window.alert).toHaveBeenCalledWith(
        "Exists two or more performances with the same player!"
      );
    });
  });

  describe("when not all the performance inputs was filled", () => {
    let teamsResponse,
      playerResponse,
      newMatch = undefined;

    beforeEach(() => {
      teamsResponse = [
        {
          id: 1,
          name: "Furia",
          country: "Brazil",
          region: "South America",
          players: [
            {
              id: 1,
              name: "Gabriel",
              nickname: "Fallen",
              nationality: "Brazil",
              birth_date: "1997-11-16",
              age: 26,
            },
          ],
          matches_as_home: [
            {
              "win?": true,
              score: 10,
              opponent_name: "Codeminer42",
              opponent_id: 2,
              opponent_score: 5,
            },
          ],
          matches_as_away: [
            {
              "win?": false,
              score: 3,
              opponent_name: "Codeminer42",
              opponent_id: 2,
              opponent_score: 9,
            },
          ],
        },
        {
          id: 2,
          name: "CodeMiner42",
          country: "Brazil",
          region: "South America",
          players: [],
          matches_as_home: [
            {
              "win?": true,
              score: 9,
              opponent_name: "Furia",
              opponent_id: 1,
              opponent_score: 3,
            },
          ],
          matches_as_away: [
            {
              "win?": false,
              score: 5,
              opponent_name: "Furia",
              opponent_id: 1,
              opponent_score: 10,
            },
          ],
        },
      ];

      playerResponse = [
        {
          id: 1,
          name: "Gabriel",
          nickname: "Fallen",
          nationality: "Brazil",
          birth_date: "1997-11-16",
        },
      ];

      newMatch = {
        team_home_id: 1,
        team_away_id: 2,
        team_home_score: 2,
        team_away_score: 10,
        player_performances_attributes: [
          {
            player_id: 1,
            kills: 11,
            deaths: 11,
            assists: 31,
            headshots: 14,
          },
        ],
      };

      mockServer.use(
        rest.post(`${API_URL}/matches`, (_req, res, ctx) => {
          return res(ctx.status(201), ctx.json(newMatch));
        }),
        rest.get(`${API_URL}/teams`, (_req, res, ctx) => {
          return res(ctx.json(teamsResponse));
        }),
        rest.get(`${API_URL}/players`, (_req, res, ctx) => {
          return res(ctx.json(playerResponse));
        })
      );
    });

    it("show an alert", async () => {
      customRender(<CreateMatchForm />);

      const homeTeamSelect = await screen.findByLabelText("Home Team:");
      const awayTeamSelect = await screen.findByLabelText("Away Team:");
      const homeTeamScoreInput =
        await screen.findByLabelText("Home Team Score:");
      const awayTeamScoreInput =
        await screen.findByLabelText("Away Team Score:");

      const playerIDSelect = await screen.findByLabelText("Player ID:");

      await user.selectOptions(
        homeTeamSelect,
        newMatch.team_home_id.toString()
      );
      await user.selectOptions(
        awayTeamSelect,
        newMatch.team_away_id.toString()
      );
      await user.type(homeTeamScoreInput, newMatch.team_home_score.toString());
      await user.type(awayTeamScoreInput, newMatch.team_away_score.toString());
      await user.selectOptions(
        playerIDSelect,
        newMatch.player_performances_attributes[0].player_id.toString()
      );

      await userEvent.click(await screen.findByText(/add player performance/i));

      expect(window.alert).toHaveBeenCalledWith(
        "Please fill all the players performance fields before adding a new one."
      );
    });
  });

  describe("when there's an error while creating the match", () => {
    let teamsResponse,
      playerResponse,
      newMatch = undefined;

    beforeEach(() => {
      teamsResponse = [
        {
          id: 1,
          players: [],
          matches_as_home: [],
          matches_as_away: [],
        },
        {
          id: 2,
          players: [],
          matches_as_home: [],
          matches_as_away: [],
        },
      ];

      playerResponse = [
        {
          id: 1,
        },
      ];

      newMatch = {
        team_home_id: 1,
        team_away_id: 2,
        team_home_score: 2,
        team_away_score: 10,
        player_performances_attributes: [
          {
            player_id: 1,
            kills: 11,
            deaths: 11,
            assists: 31,
            headshots: 14,
          },
        ],
      };

      mockServer.use(
        rest.post(`${API_URL}/matches`, (_req, res, ctx) => {
          return res(ctx.status(500));
        }),
        rest.get(`${API_URL}/teams`, (_req, res, ctx) => {
          return res(ctx.json(teamsResponse));
        }),
        rest.get(`${API_URL}/players`, (_req, res, ctx) => {
          return res(ctx.json(playerResponse));
        })
      );
    });

    it("throws an alert", async () => {
      customRender(<CreateMatchForm />);

      const homeTeamSelect = await screen.findByLabelText("Home Team:");
      const awayTeamSelect = await screen.findByLabelText("Away Team:");
      const homeTeamScoreInput =
        await screen.findByLabelText("Home Team Score:");
      const awayTeamScoreInput =
        await screen.findByLabelText("Away Team Score:");

      const playerIDSelect = await screen.findByLabelText("Player ID:");

      await user.selectOptions(
        homeTeamSelect,
        newMatch.team_home_id.toString()
      );
      await user.selectOptions(
        awayTeamSelect,
        newMatch.team_away_id.toString()
      );
      await user.type(homeTeamScoreInput, newMatch.team_home_score.toString());
      await user.type(awayTeamScoreInput, newMatch.team_away_score.toString());
      await user.selectOptions(
        playerIDSelect,
        newMatch.player_performances_attributes[0].player_id.toString()
      );

      await user.click(await screen.findByText("Send Form"));

      expect(window.alert).toHaveBeenCalledWith(
        "Error creating match: Internal Server Error"
      );
    });
  });

  describe("when request for players fails", () => {
    const teamsResponse = [{}];
    beforeEach(() => {
      mockServer.use(
        rest.get(`${API_URL}/players`, (_req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ message: "Internal Server Error" })
          );
        }),
        rest.get(`${API_URL}/teams`, (_req, res, ctx) => {
          return res(ctx.json(teamsResponse));
        })
      );
    });

    it("shows an error message", async () => {
      customRender(<CreateMatchForm />);

      expect(
        screen.getByText("Loading players and teams...")
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.getByText(
            "An error has occurred while getting the players: Internal Server Error"
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe("when request for teams fails", () => {
    const playerResponse = [{}];
    beforeEach(() => {
      mockServer.use(
        rest.get(`${API_URL}/players`, (_req, res, ctx) => {
          return res(ctx.json(playerResponse));
        }),
        rest.get(`${API_URL}/teams`, (_req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ message: "Internal Server Error" })
          );
        })
      );
    });

    it("shows an error message", async () => {
      customRender(<CreateMatchForm />);

      expect(
        screen.getByText("Loading players and teams...")
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.getByText(
            "An error has occurred while getting the teams: Internal Server Error"
          )
        ).toBeInTheDocument();
      });
    });
  });
});
