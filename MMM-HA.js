Module.register("MMM-HA", {
  defaults: {
    host: "",
    port: 8123,
    accessToken: "",
    updateInterval: 5 * 1000,
    entities: [], // Array of entity IDs to display
    mediaPlayerEntities: [] // Array of media player entity IDs to display
  },

  getStyles: function () {
    return ["MMM-HA.css"];
  },

  getTranslations: function () {
    return {
      'zh': 'translations/zh.json'
    };
  },

  start: function () {
    console.log("Starting module: " + this.name);

    this.url = "http://" + this.config.host + ":" + this.config.port.toString();
    this.equipData = null;
    this.mediaPlayerData = null;
    this.loaded = false;
    this.stateTimer = setInterval(() => {
      this.getStates();
    }, this.config.updateInterval);
    this.getStates();
  },

  getStates: function () {
    this.sendSocketNotification('HA_GET_STATES', {
      baseUrl: this.url,
      accessToken: this.config.accessToken,
      mediaPlayerEntities: this.config.mediaPlayerEntities
    });
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "HA_GET_STATES_RET":
        this.processStates(payload);
        this.updateDom();
        break;
      case "HA_POST_STATE_RET":
        this.getStates();
        break;
      default:
        break;
    }
  },

  processStates: function (data) {
    this.loaded = true;
    this.equipData = data.filter(entity => this.config.entities.includes(entity.entity_id));
    this.mediaPlayerData = data.filter(entity => this.config.mediaPlayerEntities.includes(entity.entity_id));
  },

  getDom: function () {
    if (!this.loaded) {
      var loading = document.createElement("div");
      loading.innerHTML = "Hello, HomeAssistant is loading...";
      loading.className = "normal regular medium";
      return loading;
    }

    var wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    for (let equip of this.equipData) {
      var type = this.getEntityType(equip.entity_id);
      var group = this.makeGroup(equip.entity_id, equip.attributes.friendly_name, equip.state, type);
      wrapper.appendChild(group);
    }

    for (let mediaPlayer of this.mediaPlayerData) {
      var mediaPlayerTile = this.makeMediaPlayerTile(
        mediaPlayer.entity_id,
        mediaPlayer.attributes.media_artist,
        mediaPlayer.attributes.media_title,
        mediaPlayer.attributes.media_album_name,
        mediaPlayer.attributes.entity_picture
      );
      wrapper.appendChild(mediaPlayerTile);
    }

    return wrapper;
  },

  postState: function (entityId, equipType, state) {
    this.sendSocketNotification('HA_POST_STATE', {
      baseUrl: this.url,
      accessToken: this.config.accessToken,
      entityId: entityId,
      equipType: equipType,
      state: state
    });
  },

  makeGroup: function (entityId, name, state, type) {
    var group = document.createElement("div");
    group.className = "group " + type + " " + state.toLowerCase(); 

    var text = document.createElement("div");
    text.className = "text";
    text.innerText = name;
    group.appendChild(text);

    var stateText = document.createElement("div");
    stateText.className = "state-text";
    stateText.innerText = state;
    group.appendChild(stateText);

    if (type === "light" || type === "switch") {
      group.addEventListener('click', () => {
        var newState = state === 'on' ? 'off' : 'on';
        this.postState(entityId, type, newState);
        group.classList.toggle('flip');
      });
    }

    return group;
  },

  makeMediaPlayerTile: function (entityId, artist, title, albumName, albumPicture) {
    var tile = document.createElement("div");
    tile.className = "media-player-tile";

    var albumArt = document.createElement("img");
    albumArt.className = "album-art";
    
    // Extract the token from the albumPicture URL
    var tokenIndex = albumPicture.indexOf('?token=');
    var token = albumPicture.substring(tokenIndex + 7, albumPicture.indexOf('&', tokenIndex));

    // Append the token to the URL
    var albumPictureWithToken = albumPicture + '&token=' + token;
    albumArt.src = albumPictureWithToken;

    albumArt.onerror = function() {
        // Handle error loading album art
        console.error("Error loading album art for entity: " + entityId);
    };

    tile.appendChild(albumArt);

    var titleElement = document.createElement("div");
    titleElement.className = "media-title";
    titleElement.innerText = title;
    tile.appendChild(titleElement);

    var artistElement = document.createElement("div");
    artistElement.className = "media-artist";
    artistElement.innerText = artist;
    tile.appendChild(artistElement);

    var albumElement = document.createElement("div");
    albumElement.className = "media-album";
    albumElement.innerText = albumName;
    tile.appendChild(albumElement);

    return tile;
},


  getEntityType: function(entityId) {
    if (entityId.startsWith("light.")) {
      return "light";
    } else if (entityId.startsWith("sensor.") || entityId.startsWith("binary_sensor.")) {
      return "sensor";
    } else if (entityId.startsWith("switch.")) {
      return "switch";
    } else {
      return "unknown";
    }
  }
});
