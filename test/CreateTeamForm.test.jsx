import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_URL, mockServer } from "./support/mockServer";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { customRender } from "./support/customRender";
import CreateTeamForm from "../src/components/CreateTeamForm";

describe("CreateTeamForm", () => {
  const user = userEvent.setup();

  vi.spyOn(window, "alert").mockImplementation(() => {});

  beforeEach(() => {
    window.alert.mockClear();
  });

  describe("render successfully", () => {
    const teamsResponse = [
      {
        id: 1,
        name: "team1",
        country: "USA",
        region: "North America",
      },
      {
        id: 2,
        name: "team2",
        country: "Brazil",
        region: "South America",
      },
    ];

    beforeEach(() => {
      mockServer.use(
        rest.get(`${API_URL}/teams`, (_req, res, ctx) => {
          return res(ctx.json(teamsResponse));
        })
      );
    });

    it("render form and teams", async () => {
      customRender(<CreateTeamForm />);

      expect(screen.getByText("Loading teams...")).toBeInTheDocument();

      expect(await screen.findByLabelText("Team Name:")).toBeInTheDocument();
      expect(await screen.findByLabelText("Country name:")).toBeInTheDocument();
      expect(await screen.findByLabelText("Team region:")).toBeInTheDocument();
      expect(await screen.findByText("Send Form")).toBeInTheDocument();

      expect(await screen.findByText("team1")).toBeInTheDocument();
      expect(await screen.findByText("team2")).toBeInTheDocument();
    });
  });

  describe("when form is submitted successfully", () => {
    let teamsResponse,
      newTeam = undefined;

    beforeEach(() => {
      teamsResponse = [
        {
          id: 1,
          name: "team1",
          country: "USA",
          region: "North America",
        },
      ];

      newTeam = {
        id: 2,
        name: "team3",
        country: "Canada",
        region: "North America",
      };

      mockServer.use(
        rest.post(`${API_URL}/teams`, (_req, res, ctx) => {
          teamsResponse.push(newTeam);
          return res(ctx.status(201), ctx.json(newTeam));
        }),
        rest.get(`${API_URL}/teams`, (_req, res, ctx) => {
          return res(ctx.json(teamsResponse));
        })
      );
    });

    it("submits the form and shows the new team", async () => {
      customRender(<CreateTeamForm />);

      const teamNameInput = await screen.findByLabelText("Team Name:");
      const countryInput = await screen.findByLabelText("Country name:");
      const regionInput = await screen.findByLabelText("Team region:");

      await user.type(teamNameInput, newTeam.name);
      await user.type(countryInput, newTeam.country);
      await user.type(regionInput, newTeam.region);

      await user.click(await screen.findByText("Send Form"));

      await waitFor(() => {
        expect(screen.getByText(newTeam.name)).toBeInTheDocument();
      });
    });

    it("cleans the inputs", async () => {
      customRender(<CreateTeamForm />);

      const teamNameInput = await screen.findByLabelText("Team Name:");
      const countryInput = await screen.findByLabelText("Country name:");
      const regionInput = await screen.findByLabelText("Team region:");

      await user.type(teamNameInput, newTeam.name);
      await user.type(countryInput, newTeam.country);
      await user.type(regionInput, newTeam.region);

      await user.click(await screen.findByText("Send Form"));

      expect(await teamNameInput.value).toEqual("");
      expect(await countryInput.value).toEqual("");
      expect(await regionInput.value).toEqual("");
    });
  });

  describe("when there's already another team with the same name", () => {
    const teamsResponse = [
      {
        id: 1,
        name: "existingTeam",
        country: "USA",
        region: "North America",
      },
    ];

    beforeEach(() => {
      mockServer.use(
        rest.get(`${API_URL}/teams`, (_req, res, ctx) => {
          return res(ctx.json(teamsResponse));
        })
      );
    });

    it("throw an alert", async () => {
      customRender(<CreateTeamForm />);

      const teamNameInput = await screen.findByLabelText("Team Name:");
      const countryInput = await screen.findByLabelText("Country name:");
      const regionInput = await screen.findByLabelText("Team region:");

      await user.type(teamNameInput, "existingTeam");
      await user.type(countryInput, "Brazil");
      await user.type(regionInput, "South America");

      await user.click(await screen.findByText("Send Form"));

      expect(window.alert).toHaveBeenCalledWith(
        "Team name already exists. Please choose a different name."
      );
    });
  });

  describe("when request fails", () => {
    beforeEach(() => {
      mockServer.use(
        rest.get(`${API_URL}/teams`, (_req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ message: "Internal Server Error" })
          );
        })
      );
    });

    it("shows an error message", async () => {
      customRender(<CreateTeamForm />);

      expect(screen.getByText("Loading teams...")).toBeInTheDocument();

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
