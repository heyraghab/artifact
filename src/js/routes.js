import HomePage from "../pages/home.svelte";
import CatalogPage from "../pages/catalog.svelte";
import SettingsPage from "../pages/settings.svelte";
import Write from "../pages/write.svelte";
import History from "../pages/history.svelte";
import NotFoundPage from "../pages/404.svelte";

var routes = [
  {
    path: "/",
    component: HomePage,
  },
  {
    path: "/history",
    component: History,
  },
  {
    path: "/write",
    component: Write,
  },
  {
    path: "/catalog/",
    component: CatalogPage,
  },
  {
    path: "/settings/",
    component: SettingsPage,
  },
  {
    path: "(.*)",
    component: NotFoundPage,
  },
];

export default routes;
