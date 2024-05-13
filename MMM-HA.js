Module.register("MMM-HA", {
    defaults: {
        host: "",
        port: 8123,
        accessToken: "",
        updateInterval: 5 * 1000,
        entitiesWithDegreeSymbol: [],
        entities: [],
        mediaPlayerEntities: [],
        customIconPath: "icons/" // Default custom icon path
    },

    getStyles: function () {
        return ["MMM-HA.css"];
    },

    getTranslations: function () {
        return {
            'zh': 'translations/zh.json',
            'change': 'translations/change.json'

        };
    },

    generateIconSrc: function (icon) {
        var iconFormat = "png";
        var iconUrl;
        
        // Check if custom icon path is provided and entity is custom
        if (this.config.customIconPath && this.config.entities.find(entity => typeof entity === 'object' && (entity['icon-off'] || entity['icon-on']))) {
            var customIconPath = this.config.customIconPath.endsWith("/") ? this.config.customIconPath : this.config.customIconPath + "/";
            iconUrl = customIconPath + icon + "." + iconFormat;
        } else {
            // Use default icon path within the module's directory
            var defaultIconPath = "icons/";
            iconUrl = this.data.path + defaultIconPath + icon + "." + iconFormat;
        }
        
        return iconUrl;
    },   

    iconPaths: {
        "light": {
            "on": "ha-light-on",
            "off": "ha-light-off",
            "default": "ha-default",
            "unavailable": "ha-default"            
        },
        "sensor": {
            "on": "ha-online",
            "off": "ha-offline",
            "0": "ha-zero",
            "1": "ha-number-one",
            "2": "ha-number-two",
            "3": "ha-number-three",
            "4": "ha-number-four",
            "5": "ha-number-five",
            "6": "ha-number-six",
            "7": "ha-number-seven", 
            "8": "ha-number-eight",                       
            "standby": "ha-standby",
            "heating": "ha-heating",            
            "default": "ha-default",
            "unavailable": "ha-default"            
        },
        "binary": {
            "on": "ha-online",
            "off": "ha-offline",
            "default": "ha-default",
            "unavailable": "ha-default"
        },
        "switch": {
            "on": "ha-switch-on",
            "off": "ha-switch-off",
            "default": "ha-default",
            "unavailable": "ha-default"            
        },

        "mediaPlayer": {
            "playing": "media-playing",
            "paused": "ha-media-pause",
            "stopped": "ha-media-stop",
            "idle"   : "media-idle", 
            "standby": "media-standby",            
            "off": "ha-media-stop",
            "default": "ha-default",
            "unknown": "ha-default", 
            "undefined": "ha-default",
            "Netflix": "ha-netflix" ,
            "YouTube" : "ha-youtube",
            "com.disneyplus.mea": "ha-disney", 
            "com.showmax.showmax.google": "ha-showmax"                                                 
        }, 
        
        "unknown": {
            "default": "ha-default"
        },

        "input_boolean": {
            "on": "ha-boolean-on",
            "off": "ha-boolean-off",
            "default": "ha-default"
        },
        "script": {
            "on": "ha-script",
            "off": "ha-script-off"         
        },
        "device_tracker": {
            "home": "ha-home",
            "not_home": "ha-not-home",
            "default": "ha-default"
        }       
    },

    start: function () {
        console.log("Starting module: " + this.name);

        this.url = "http://" + this.config.host + ":" + this.config.port.toString();
        this.equipData = null;
        this.mediaPlayerData = null;
        this.loaded = false;
        this.stateTimer = null;
        this.loadIcons();
        this.scheduleUpdate();
        this.createMenuToggleButton();
    },

    scheduleUpdate: function () {
        var self = this;
        this.stateTimer = setInterval(function () {
            self.getStates();
        }, this.config.updateInterval);
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
        
        // Filter entities based on the 'entities' array in the configuration
        this.equipData = data.filter(entity => this.config.entities.includes(entity.entity_id));
        
        // Check if any custom entities are defined in the config
        const customEntities = this.config.entities.filter(entity => typeof entity === 'object');
        customEntities.forEach(customEntity => {
            const entityData = data.find(entity => entity.entity_id === customEntity.entity);
            if (entityData) {
                this.equipData.push(entityData);
            }
        });
    
        // Filter media player entities based on the 'mediaPlayerEntities' array in the configuration
        this.mediaPlayerData = data.filter(entity => this.config.mediaPlayerEntities.includes(entity.entity_id));
    
        // Filter script entities based on the 'entities' array in the configuration
        this.scriptData = this.equipData.filter(entity => entity.entity_id.startsWith("script."));
    
        // Filter input boolean entities based on the 'entities' array in the configuration
        this.inputBooleanData = this.equipData.filter(entity => entity.entity_id.startsWith("input_boolean."));
    
        // Filter device tracker entities based on the 'entities' array in the configuration
        this.deviceTrackerData = this.equipData.filter(entity => entity.entity_id.startsWith("device_tracker."));
    
        this.updateDom();
    },
    
    

    loadIcons: function () {
        // Initialize iconPaths if it's not already initialized
        if (!this.iconPaths) {
            this.iconPaths = {};
        }
    
        for (let type in this.iconPaths) {
            if (this.iconPaths.hasOwnProperty(type)) {
                let iconState = this.iconPaths[type];
                for (let state in iconState) {
                    if (iconState.hasOwnProperty(state)) {
                        let iconPath = this.generateIconSrc(iconState[state]);
                        let icon = new Image();
                        icon.src = iconPath;
                        iconState[state] = icon;
                    }
                }
            }
        }
    
        // Load custom icons for entities with custom icon paths
        for (let entity of this.config.entities) {
            if (typeof entity === 'object' && entity['icon-off'] && entity['icon-on']) {
                let iconOffPath = this.generateIconSrc(entity['icon-off']);
                let iconOnPath = this.generateIconSrc(entity['icon-on']);
    
                let iconOff = new Image();
                iconOff.src = iconOffPath;
    
                let iconOn = new Image();
                iconOn.src = iconOnPath;
    
                this.iconPaths[entity.entity] = { off: iconOff, on: iconOn };
            } else if (typeof entity === 'object' && entity['icon']) {
                // Handle entity with only one custom icon
                let iconPath = this.generateIconSrc(entity['icon']);
                let icon = new Image();
                icon.src = iconPath;
    
                // Set the default icon for the entity
                this.iconPaths[entity.entity] = { default: icon };
            }
        }
    },
    
    
    
    

    createMenuToggleButton: function () {
        var existingButton = document.querySelector(".ha-container-menu-toggle");
        if (!existingButton) {
            var menuToggleButton = document.createElement("div");
            menuToggleButton.className = "ha-container-menu-toggle";
        
            var iconUrl = this.data.path + "icons/home-assistant.png";
            var icon = document.createElement("img");
            icon.src = iconUrl;
        
            menuToggleButton.appendChild(icon);
        
            var self = this; 
        
            menuToggleButton.addEventListener("click", function () {
                self.toggleMenuVisibility();
                console.log("Menu toggle button clicked!");
        
                var menu = document.querySelector(".ha-wrapper"); 
                if (menu.classList.contains("show")) {
                    menu.classList.remove("show");
                    menu.classList.add("hide");
                } else {
                    menu.classList.remove("hide");
                    menu.classList.add("show");
                }
            });
        
            document.body.appendChild(menuToggleButton);
        }
    },
   
    toggleMenuVisibility: function () {
        var wrapper = MM.getModules().find(module => module.name === "MMM-HA");
        if (wrapper) {
            wrapper.hidden ? wrapper.show() : wrapper.hide();
        }
    },
    
    getDom: function () {
        var wrapper = document.createElement("div");
        wrapper.className = "ha-wrapper";
    
        if (!this.loaded) {
            // Loading logic
        }
    
        // Render individual entities (lights)
        if (Array.isArray(this.equipData)) {
            this.equipData.forEach(equip => {
                var type = this.getEntityType(equip.entity_id);
                if (type === "light") {
                    var group = this.makeGroup(equip.entity_id, equip.attributes.friendly_name, equip.state, type);
                    wrapper.appendChild(group);
                }
            });
        }
    
        // Render individual entities (switches)
        if (Array.isArray(this.equipData)) {
            this.equipData.forEach(equip => {
                var type = this.getEntityType(equip.entity_id);
                if (type === "switch") {
                    var group = this.makeGroup(equip.entity_id, equip.attributes.friendly_name, equip.state, type);
                    wrapper.appendChild(group);
                }
            });
        }
    
        // Render individual entities (sensors)
        if (Array.isArray(this.equipData)) {
            this.equipData.forEach(equip => {
                var type = this.getEntityType(equip.entity_id);
                if (type === "sensor") {
                    var group = this.makeGroup(equip.entity_id, equip.attributes.friendly_name, equip.state, type);
                    wrapper.appendChild(group);
                }
            });
        }
    
        // Render individual entities (binary sensors)
        if (Array.isArray(this.equipData)) {
            this.equipData.forEach(equip => {
                var type = this.getEntityType(equip.entity_id);
                if (type === "binary") {
                    var group = this.makeGroup(equip.entity_id, equip.attributes.friendly_name, equip.state, type);
                    wrapper.appendChild(group);
                }
            });
        }
    
        // Render script entities
        if (Array.isArray(this.scriptData)) {
            this.scriptData.forEach(entity => {
                var group = this.makeGroup(entity.entity_id, entity.attributes.friendly_name, entity.state, "script");
                wrapper.appendChild(group);
            });
        }
    
        // Render grouped entities (input booleans)
        if (Array.isArray(this.inputBooleanData)) {
            this.inputBooleanData.forEach(entity => {
                var group = this.makeGroup(entity.entity_id, entity.attributes.friendly_name, entity.state, "input_boolean");
                wrapper.appendChild(group);
            });
        }

        // Render grouped entities (device trackers)
        if (Array.isArray(this.equipData)) {
            this.equipData.forEach(equip => {
                var type = this.getEntityType(equip.entity_id);
                if (type === "device_tracker") {
                    var group = this.makeGroup(equip.entity_id, equip.attributes.friendly_name, equip.state, type);
                    wrapper.appendChild(group);
                }
            });
        }

        // Render media player tiles
        if (Array.isArray(this.mediaPlayerData)) {
            this.mediaPlayerData.forEach(mediaPlayer => {
                var mediaPlayerTile = this.makeMediaPlayerTile(
                    mediaPlayer.entity_id,
                    mediaPlayer.attributes.friendly_name,
                    mediaPlayer.attributes.app_name,
                    mediaPlayer.attributes.media_album_artist,
                    mediaPlayer.attributes.media_album_name,
                    mediaPlayer.attributes.media_artist,
                    mediaPlayer.attributes.media_image_hash,
                    mediaPlayer.attributes.media_image_remotely_accessible,
                    mediaPlayer.state
                );
    
                wrapper.appendChild(mediaPlayerTile);
            });
        }
    
        return wrapper;
    },

    postState: function (entityId, equipType, state) {
        if (equipType === "script") {
            // Send notification to WebSocket in Home Assistant to execute the script
            // Implement your logic here
            console.log("Calling WebSocket to execute script: ", entityId);
            this.sendSocketNotification('HA_EXECUTE_SCRIPT', {
                baseUrl: this.url,
                accessToken: this.config.accessToken, 
                equipType: equipType, 
                entityId: entityId
            });
        } else {
            // For other entity types, handle state posting as before
            console.log("Calling WebSocket to post state for entity: ", entityId, " with type: ", equipType, " and state: ", state);
            this.sendSocketNotification('HA_POST_STATE', {
                baseUrl: this.url,
                accessToken: this.config.accessToken,
                entityId: entityId,
                equipType: equipType,
                state: state
            });
        }
    },
    

    makeGroup: function (entityId, name, state, type) {
        var group = document.createElement("div");
        group.className = "group " + type + " " + state.toLowerCase();
    
        var icon = document.createElement("img");
        if (this.iconPaths[entityId] && this.iconPaths[entityId][state]) {
            icon.src = this.iconPaths[entityId][state].src; // Use custom icon for specific entity and state
        } else if (this.iconPaths[entityId] && this.iconPaths[entityId].default) {
            icon.src = this.iconPaths[entityId].default.src; // Use custom default icon for specific entity
        } else if (this.iconPaths[type] && this.iconPaths[type][state]) {
            icon.src = this.iconPaths[type][state].src; // Use default icon for specific entity type and state
        }
        
    
        icon.className = "icon";
    
        if (icon.src) {
            group.appendChild(icon);
        }
    
        var text = document.createElement("div");
        text.className = "text";
        text.innerText = name;
        group.appendChild(text);
    
        var stateText = document.createElement("div");
        stateText.className = "state-text";
        stateText.innerText = state;
    
        // Check if the entityId is included in the configuration for appending degree symbol
        if (this.config.entitiesWithDegreeSymbol.includes(entityId)) {
            stateText.innerText += " °C"; // Append degree symbol after the state
        }
    
        group.appendChild(stateText);

        // Add event listeners and functionality specific to each entity type
        if (type === "input_boolean" || type === "script") {
            var self = this;
            group.addEventListener('click', function () {
                // Implement toggle and notification sending for input_boolean and script entities
                var newState = state === 'on' ? 'off' : 'on';
                self.postState(entityId, type, newState);
                
                // Add the following line to toggle the 'flip' class
                group.classList.toggle('flip');
            });
        } else {
            // Implement toggle for light and switch entities
            var self = this;
            group.addEventListener('click', function () {
                var newState = state === 'on' ? 'off' : 'on';
                self.postState(entityId, type, newState);
                group.classList.toggle('flip');
            });
        }
        

        return group;
    },

    
    

    makeMediaPlayerTile: function (entityId, friendlyName, appName, mediaAlbumArtist, mediaAlbumName, mediaArtist, mediaImageHash, mediaImageRemotelyAccessible, state) {
        var self = this; 
    
        var tile = document.createElement("div");
        tile.className = "media-player-tile";
    
        var mediaPlayerIcon = document.createElement("img");
        mediaPlayerIcon.className = "media-icon";
    
        // Check if the media player is playing
        if (state === 'playing') {
            // Check if an icon exists for the app_name in the iconPaths
            if (this.iconPaths["mediaPlayer"][appName]) {
                mediaPlayerIcon.src = this.iconPaths["mediaPlayer"][appName].src;
            } else {
                // If no specific icon is found for the app_name, use the default media player icon
                mediaPlayerIcon.src = this.iconPaths["mediaPlayer"]["playing"].src;
            }
        } else {
            // Set the icon based on the media player state
            if (this.iconPaths["mediaPlayer"][state]) {
                mediaPlayerIcon.src = this.iconPaths["mediaPlayer"][state].src;
            } else {
                // If no icon is found for the media player state, use the default media player icon
                mediaPlayerIcon.src = this.iconPaths["mediaPlayer"]["default"].src;
            }
        }
    
        tile.appendChild(mediaPlayerIcon);
    
        var friendlyNameElement = document.createElement("div");
        friendlyNameElement.className = "media-friendly-name";
        friendlyNameElement.innerText = self.translate(friendlyName); 
        tile.appendChild(friendlyNameElement);
    
        var stateElement = document.createElement("div");
        stateElement.className = "media-state";
        stateElement.innerText = state;
        tile.appendChild(stateElement);
    
        function appendAttribute(attributeValue) {
            if (attributeValue && attributeValue !== "Playing") {
                var attributeElement = document.createElement("div");
                attributeElement.className = "media-attribute";
                attributeElement.innerText = self.translate(attributeValue); 
                tile.appendChild(attributeElement);
            }
        }
    
        appendAttribute(appName);
        appendAttribute(mediaAlbumArtist);
        appendAttribute(mediaAlbumName);
        appendAttribute(mediaArtist);
        appendAttribute(mediaImageHash);
        appendAttribute(mediaImageRemotelyAccessible);
    
        return tile;
    },

    getEntityType: function (entityId) {
        if (entityId.startsWith("light.")) {
            return "light";
        } else if (entityId.startsWith("sensor.")) {
            return "sensor";
        } else if (entityId.startsWith("binary_sensor.")) {
            return "binary";
        } else if (entityId.startsWith("switch.")) {
            return "switch";
        } else if (entityId.startsWith("input_boolean.")) {
            return "input_boolean";
        } else if (entityId.startsWith("script.")) {
            return "script";
        } else if (entityId.startsWith("device_tracker.")) {
            return "device_tracker";
        } else {
            return "unknown.";
        }
    },

});