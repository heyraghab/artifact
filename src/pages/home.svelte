<script>
  import {
    Page,
    Navbar,
    NavLeft,
    NavTitle,
    NavTitleLarge,
    NavRight,
    Link,
    Toolbar,
    Block,
    BlockTitle,
    List,
    ListItem,
    Button,
    Popover,
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    Icon,
    Fab,
    FabButton,
    FabButtons,
  } from "framework7-svelte";
  import { writable } from "svelte/store";
  let sel = "city";

  let feed = [
    {
      title: "2 dead as i crash car",
      desc: "two dead as i did an accdent tonight while being drunk",

      date: new Date(),
    },
  ];

  function write() {
    f7router.navigate("/write/", {});
  }
</script>

<Page name="home">
  <Block>
    <div style="width: 20vw;">
      <Button fill round small popoverOpen=".popover-menu">{sel}</Button>
    </div>
  </Block>
  <Popover class="popover-menu" style="width: 50vw;">
    <List>
      <ListItem
        onClick={() => {
          sel = "city";
        }}
        popoverClose
        title="Your City"
      />
      <ListItem
        onClick={() => {
          sel = "country";
        }}
        popoverClose
        title="Your County"
      />
      <ListItem
        onClick={() => {
          sel = "world";
        }}
        popoverClose
        title="World"
      />
    </List>
  </Popover>

  <Fab  position="right-bottom">
    <Link color="white" tabLink="#view-write" href="/write/" >
      <Icon f7="square_pencil" />
    </Link>
  </Fab>

  {#each feed as f}
    <Card outlineMd class="demo-card-header-pic">
      <CardHeader valign="bottom">
        <div style="font-size: large;">
          {f.title}
        </div>
      </CardHeader>
      <CardContent>
        {f.desc}
      </CardContent>
      <CardFooter>
        <Link>
          <Icon f7="arrow_up" size="20" />
        </Link>
        <Link>
          <Icon f7="captions_bubble_fill" size="20" />
        </Link>
      </CardFooter>
    </Card>
  {/each}
</Page>
