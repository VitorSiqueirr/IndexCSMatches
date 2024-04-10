import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Root from "./pages/Root";
import Create from "./pages/Create";
import CreatePlayerForm from "./components/CreatePlayerForm";
import CreateTeamForm from "./components/CreateTeamForm";
import CreateMatchForm from "./components/CreateMatchForm";
import Statistics from "./components/Statistics";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Statistics />,
      },
      {
        path: "create",
        element: <Create />,
        children: [
          { path: "player", element: <CreatePlayerForm /> },
          { path: "team", element: <CreateTeamForm /> },
          { path: "match", element: <CreateMatchForm /> },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
