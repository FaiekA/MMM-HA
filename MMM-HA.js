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
          // Extracting necessary attributes from mediaPlayer object
          const entityId = mediaPlayer.entity_id;
          const friendlyName = mediaPlayer.attributes.friendly_name; // Extracting friendly name from entity data

          // Other attributes
          const appName = mediaPlayer.attributes.app_name;
          const appID = mediaPlayer.attributes.app_id;
          const mediaAlbumArtist = mediaPlayer.attributes.media_album_artist;
          const mediaAlbumName = mediaPlayer.attributes.media_album_name;
          const mediaArtist = mediaPlayer.attributes.media_artist;
          const mediaImageHash = mediaPlayer.attributes.media_image_hash;
          const mediaImageRemotelyAccessible = mediaPlayer.attributes.media_image_remotely_accessible;
          const state = mediaPlayer.state;

          // Create media player tile
          var mediaPlayerTile = this.makeMediaPlayerTile(
              entityId,
              friendlyName, // Passing friendlyName to the makeMediaPlayerTile function
              appName,
              appID,
              mediaAlbumArtist,
              mediaAlbumName,
              mediaArtist,
              mediaImageHash,
              mediaImageRemotelyAccessible,
              state
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

  makeMediaPlayerTile: function (entityId, friendlyName, appName, appID, mediaAlbumArtist, mediaAlbumName, mediaArtist, mediaImageHash, mediaImageRemotelyAccessible, state) {
    var self = this; // Store module instance in a variable

    var tile = document.createElement("div");
    tile.className = "media-player-tile";

    // Add friendly name
    var friendlyNameElement = document.createElement("div");
    friendlyNameElement.className = "media-friendly-name";
    friendlyNameElement.innerText = self.translate(friendlyName); // Use self instead of this
    tile.appendChild(friendlyNameElement);

    // Add state
    var stateElement = document.createElement("div");
    stateElement.className = "media-state";
    stateElement.innerText = state;
    tile.appendChild(stateElement);

    function appendAttribute(attributeValue) {
        if (attributeValue && attributeValue !== "Playing") {
            var attributeElement = document.createElement("div");
            attributeElement.className = "media-attribute";
            attributeElement.innerText = self.translate(attributeValue); // Use self instead of this
            tile.appendChild(attributeElement);
        }
    }

    // Add other attributes in the middle center
    appendAttribute(appName);
    appendAttribute(appID);
    appendAttribute(mediaAlbumArtist);
    appendAttribute(mediaAlbumName);
    appendAttribute(mediaArtist);
    appendAttribute(mediaImageHash);
    appendAttribute(mediaImageRemotelyAccessible);

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
          return "unknown.";
      }
  }

});














