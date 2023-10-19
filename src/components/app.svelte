<script>
  import eruda from "eruda";
  eruda.init();
  import { onMount } from "svelte";
  import { getDevice } from "framework7/lite-bundle";
  import {
    f7,
    f7ready,
    App,
    Panel,
    Views,
    View,
    Popup,
    Page,
    Navbar,
    Toolbar,
    NavRight,
    Link,
    Block,
    BlockTitle,
    LoginScreen,
    LoginScreenTitle,
    List,
    ListItem,
    ListInput,
    ListButton,
    BlockFooter,
    Button,
  } from "framework7-svelte";

  import capacitorApp from "../js/capacitor-app";
  import routes from "../js/routes";
  import store from "../js/store";
  import { db, user } from "../js/gun";

  const device = getDevice();
  // Framework7 Parameters
  let f7params = {
    name: "artifact", // App name
    theme: "ios", // Automatic theme detection
    darkMode: true,
    // App store
    store: store,
    // App routes
    routes: routes,
    // Register service worker (only on production build)
    serviceWorker:
      process.env.NODE_ENV === "production"
        ? {
            path: "/service-worker.js",
          }
        : {},
    // Input settings
    input: {
      scrollIntoViewOnFocus: device.capacitor,
      scrollIntoViewCentered: device.capacitor,
    },
    // Capacitor Statusbar settings
    statusbar: {
      iosOverlaysWebView: true,
      androidOverlaysWebView: false,
    },
  };

  onMount(() => {
    f7ready(() => {
      // Init capacitor APIs (see capacitor-app.js)
      if (f7.device.capacitor) {
        capacitorApp.init(f7);
      }
      // Call F7 APIs here
    });
  });

  let loginScreenOpened = true;
  let username = "";
  let password = "";

  function signIn() {
    user.auth(username, password, (a) => {
      let txt;
      if (a.err) {
        txt = a.err;
      } else {
        txt = "logged in";
      }
      f7.toast
        .create({
          text: txt,
          position: "center",
          closeTimeout: 5000,
        })
        .open();
    });
  }

  function signUp() {
    db.user().create(username, password, (a) => {
      if (a.err) {
        f7.toast
          .create({
            text: a.err,
            position: "center",
            closeTimeout: 5000,
          })
          .open();
      }
      user.auth(username, password, (a) => {
        localStorage.setItem("keys", JSON.stringify(a.sea));
        loginScreenOpened = false;
      });
    });
  }

  if (localStorage.getItem("keys")) {
    user.auth(localStorage.getItem("keys"), (a) => {
      loginScreenOpened = false;
    });
  }
</script>

<App {...f7params}>
  <!-- Views/Tabs container -->
  <Views tabs class="safe-areas">
    <LoginScreen class="demo-login-screen" opened={loginScreenOpened}>
      <Page loginScreen>
        <LoginScreenTitle>artifact</LoginScreenTitle>
        <List form>
          <ListInput
            label="Username"
            type="text"
            placeholder="Your username"
            value={username}
            onInput={(e) => (username = e.target.value)}
          />
          <ListInput
            label="Password"
            type="password"
            placeholder="Your password"
            value={password}
            onInput={(e) => (password = e.target.value)}
          />
        </List>
        <Block style="display: flex;justify-content:center;">
          <Button style="width: 20vw;" round fill onClick={signIn}>login</Button
          >
          <Button style="width: 20vw;" round onClick={signUp}>signup</Button>
        </Block>
        <BlockFooter>
          by registering you agree to our term and conditions
        </BlockFooter>
      </Page>
    </LoginScreen>
    <!-- Tabbar for switching views-tabs -->
    <Toolbar tabbar icons bottom>
      <Link
        tabLink="#view-home"
        tabLinkActive
        iconIos="f7:house_fill"
        iconMd="material:home"
        text=""
      />
      <Link
        tabLink="#view-catalog"
        iconIos="f7:search"
        iconMd="material:view_list"
        text=""
      />
      <Link
        tabLink="#view-settings"
        iconIos="f7:gear"
        iconMd="material:settings"
        text=""
      />
    </Toolbar>

    <!-- Your main view/tab, should have "view-main" class. It also has "tabActive" prop -->
    <View id="view-home" main tab tabActive url="/" />

    <View id="view-write" tab name="write" />

    <!-- Catalog View -->
    <View id="view-catalog" name="catalog" tab url="/catalog/" />

    <!-- Settings View -->
    <View id="view-settings" name="settings" tab url="/settings/" />
  </Views>
</App>
