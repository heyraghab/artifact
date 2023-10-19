<script>
  import {
    Page,
    Navbar,
    List,
    ListInput,
    ListItem,
    Toggle,
    BlockTitle,
    Button,
    Range,
    Block,
  } from "framework7-svelte";
  export let f7router;
  import { db, user } from "../js/gun";
</script>

<Page name="settings">
  <Navbar title="Settings" />
  <Block>
    <BlockTitle>
      Account
    </BlockTitle>
    <Button color='red' fill round onClick={()=>{
      user.leave()
      localStorage.clear()
      sessionStorage.clear()
      f7router.navigate('/')
    }}>
      Log Out
    </Button>
  </Block>
</Page>
