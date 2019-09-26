MQTT-MESSAGE-PUBLISHER := mqtt-message-publisher
MQTT-MESSAGE-PUBLISHER-IMAGE := $(MQTT-MESSAGE-PUBLISHER):latest
MQTT-MESSAGE-PUBLISHER-CONTAINER := $(shell docker ps -aq -f name=$(MQTT-MESSAGE-PUBLISHER))

build:
	@docker build -t $(MQTT-MESSAGE-PUBLISHER-IMAGE) .

start:
ifneq ($(strip $(MQTT-MESSAGE-PUBLISHER-CONTAINER)),)
	@$(MAKE) stop
endif
	@docker run -d --name $(MQTT-MESSAGE-PUBLISHER) $(MQTT-MESSAGE-PUBLISHER-IMAGE)

stop:
	@docker rm -f $(MQTT-MESSAGE-PUBLISHER-CONTAINER)

logs:
	@docker logs -f $(MQTT-MESSAGE-PUBLISHER-CONTAINER) --tail=200
