<script>
  import {
    Page,
    Navbar,
    List,
    ListItem,
    Block,
    Button,
    useStore,
    Searchbar,
  } from "framework7-svelte";
</script>

<Page name="Search">
  <Navbar title="Search" />
  <Searchbar
    disableButtonText="Cancel"
    placeholder="Search"
    clearButton={true}
  >
  </Searchbar>
</Page>
