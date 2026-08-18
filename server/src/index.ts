import { createApp } from "./app.js";
import { warmStatIndex } from "./services/pokeapi.js";

const port = Number(process.env.PORT ?? 4000);

createApp().listen(port, () => {
  console.log(`Pokédex API listening on http://localhost:${port}`);
  // Sorting by base stats needs every Pokémon's details; build that index now
  // so the first sort is instant rather than a thousand cold requests.
  void warmStatIndex();
});
