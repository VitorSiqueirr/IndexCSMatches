import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_URL, mockServer } from "./support/mockServer";
import { screen, waitFor } from "@testing-library/react";
import { customRender } from "./support/customRender";
import { rest } from "msw";
import CreatePlayerForm from "../src/components/CreatePlayerForm";
import userEvent from "@testing-library/user-event";

describe("CreatePlayerForm", () => {
  const user = userEvent.setup();

  vi.spyOn(window, "alert").mockImplementation(() => {});

  beforeEach(() => {
    window.alert.mockClear();
  });

  describe("render successfully", () => {
    const teamsResponse = [
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
      },
    ];

    const playerResponse = [
      {
        id: 1,
        name: "Gabriel",
        nickname: "Fallen",
        nationality: "Brazil",
        birth_date: "1997-11-16",
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
      customRender(<CreatePlayerForm />);

      expect(screen.getByText("Loading players...")).toBeInTheDocument();

      expect(
        await screen.findByLabelText("Which team will you play for?")
      ).toBeInTheDocument();
      expect(await screen.findByLabelText("Player Name:")).toBeInTheDocument();
      expect(await screen.findByLabelText("Nickname:")).toBeInTheDocument();
      expect(
        await screen.findByLabelText("Nationality name:")
      ).toBeInTheDocument();
      expect(await screen.findByText("Send Form")).toBeInTheDocument();

      const furiaListItem = await screen.findByRole("team_name", {
        value: "Furia",
      });

      expect(furiaListItem).toBeInTheDocument();
      expect(await screen.findByText("Fallen")).toBeInTheDocument();
    });
  });

  describe("when form is submitted successfully", () => {
    let teamsResponse,
      playerResponse,
      newPlayer = undefined;

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

      newPlayer = {
        id: 2,
        name: "Marcelo Cespedes",
        nickname: "Chelo",
        nationality: "Brazil",
        birth_date: "1997-11-16",
      };

      mockServer.use(
        rest.post(`${API_URL}/players`, (_req, res, ctx) => {
          teamsResponse[0].players.push(newPlayer);
          return res(ctx.status(201), ctx.json(newPlayer));
        }),
        rest.get(`${API_URL}/teams`, (_req, res, ctx) => {
          return res(ctx.json(teamsResponse));
        }),
        rest.get(`${API_URL}/players`, (_req, res, ctx) => {
          return res(ctx.json(playerResponse));
        })
      );
    });

    it("submits the form and shows the new player", async () => {
      customRender(<CreatePlayerForm />);

      const teamIdSelect = await screen.findByLabelText(
        "Which team will you play for?"
      );
      const playerNameInput = await screen.findByLabelText("Player Name:");
      const nicknameInput = await screen.findByLabelText("Nickname:");
      const nationalityInput =
        await screen.findByLabelText("Nationality name:");
      const birthDateInput = await screen.findByLabelText("Birth Date:");

      await user.selectOptions(teamIdSelect, "1");
      await user.type(playerNameInput, newPlayer.name);
      await user.type(nicknameInput, newPlayer.nickname);
      await user.type(nationalityInput, newPlayer.nationality);
      await user.type(birthDateInput, newPlayer.birth_date);

      await user.click(await screen.findByText("Send Form"));

      expect(window.alert).toHaveBeenCalledWith(
        "Created player successfully wait for it to show in the select team!"
      );

      await waitFor(() => {
        expect(screen.getByText(newPlayer.nickname)).toBeInTheDocument();
      });
    });

    it("cleans the inputs", async () => {
      customRender(<CreatePlayerForm />);

      const teamIdSelect = await screen.findByLabelText(
        "Which team will you play for?"
      );
      const playerNameInput = await screen.findByLabelText("Player Name:");
      const nicknameInput = await screen.findByLabelText("Nickname:");
      const nationalityInput =
        await screen.findByLabelText("Nationality name:");
      const birthDateInput = await screen.findByLabelText("Birth Date:");

      await user.selectOptions(teamIdSelect, "1");
      await user.type(playerNameInput, newPlayer.name);
      await user.type(nicknameInput, newPlayer.nickname);
      await user.type(nationalityInput, newPlayer.nationality);
      await user.type(birthDateInput, newPlayer.birth_date);

      await user.click(await screen.findByText("Send Form"));

      expect(await teamIdSelect.value).toEqual("");
      expect(await playerNameInput.value).toEqual("");
      expect(await nicknameInput.value).toEqual("");
      expect(await nationalityInput.value).toEqual("");
      expect(await birthDateInput.value).toEqual("");
    });
  });

  describe("when there's already a player with the same nickname", () => {
    const teamsResponse = [
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
      },
    ];

    const playerResponse = [
      {
        id: 1,
        name: "Gabriel",
        nickname: "Fallen",
        nationality: "Brazil",
        birth_date: "1997-11-16",
      },
    ];

    beforeEach(() => {
      mockServer.use(
        rest.post(`${API_URL}/players`, (_req, res, ctx) => {
          return res(ctx.status(201));
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
      customRender(<CreatePlayerForm />);

      const teamIdSelect = await screen.findByLabelText(
        "Which team will you play for?"
      );
      const playerNameInput = await screen.findByLabelText("Player Name:");
      const nicknameInput = await screen.findByLabelText("Nickname:");
      const nationalityInput =
        await screen.findByLabelText("Nationality name:");
      const birthDateInput = await screen.findByLabelText("Birth Date:");

      await user.selectOptions(teamIdSelect, "1");
      await user.type(playerNameInput, playerResponse[0].name);
      await user.type(nicknameInput, playerResponse[0].nickname);
      await user.type(nationalityInput, playerResponse[0].nationality);
      await user.type(birthDateInput, playerResponse[0].birth_date);

      await user.click(await screen.findByText("Send Form"));

      expect(window.alert).toHaveBeenCalledWith(
        "Nickname already chosen. Please choose a different nickname."
      );
    });
  });

  describe("when there's an error while creating a player", () => {
    const teamsResponse = [
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
      },
    ];

    const playerResponse = [
      {
        id: 1,
        name: "Gabriel",
        nickname: "Fallen",
        nationality: "Brazil",
        birth_date: "1997-11-16",
      },
    ];

    const newPlayer = {
      id: 2,
      name: "Marcelo Cespedes",
      nickname: "Chelo",
      nationality: "Brazil",
      birth_date: "1997-11-16",
    };

    beforeEach(() => {
      mockServer.use(
        rest.post(`${API_URL}/players`, (_req, res, ctx) => {
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
      customRender(<CreatePlayerForm />);

      const teamIdSelect = await screen.findByLabelText(
        "Which team will you play for?"
      );
      const playerNameInput = await screen.findByLabelText("Player Name:");
      const nicknameInput = await screen.findByLabelText("Nickname:");
      const nationalityInput =
        await screen.findByLabelText("Nationality name:");
      const birthDateInput = await screen.findByLabelText("Birth Date:");

      await user.selectOptions(teamIdSelect, "1");
      await user.type(playerNameInput, newPlayer.name);
      await user.type(nicknameInput, newPlayer.nickname);
      await user.type(nationalityInput, newPlayer.nationality);
      await user.type(birthDateInput, newPlayer.birth_date);

      await user.click(await screen.findByText("Send Form"));

      expect(window.alert).toHaveBeenCalledWith(
        "Error creating player: Internal Server Error"
      );
    });
  });

  describe("when request for players fails", () => {
    const teamsResponse = [
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
      },
    ];
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
      customRender(<CreatePlayerForm />);

      expect(screen.getByText("Loading players...")).toBeInTheDocument();

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
    const playerResponse = [
      {
        id: 1,
        name: "Gabriel",
        nickname: "Fallen",
        nationality: "Brazil",
        birth_date: "1997-11-16",
      },
    ];
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
      customRender(<CreatePlayerForm />);

      expect(screen.getByText("Loading players...")).toBeInTheDocument();

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
