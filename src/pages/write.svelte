<script>
    import {
        Button,
        List,
        ListIndex,
        ListInput,
        Navbar,
        Page,
    } from "framework7-svelte";

    function post() {}
</script>

<Navbar title="write" />
<Page>
    <List>
        <ListInput
            label="Headline"
            type="text"
            placeholder="Add Title"
            clearButton
        />
        <ListInput
            label="Description"
            type="text"
            resizable
            placeholder="Add Context"
            clearButton
        />
        <Button
            style="width: 20vw;margin: 10px;"
            onClick={post}
            fill
            round
            small
        >
            Post
        </Button>
    </List>
</Page>
