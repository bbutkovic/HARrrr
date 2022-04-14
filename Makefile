PACKAGE_VERSION = $(shell npm pkg get version | tr -d '"')

image:
	docker build -t "bbutkovic/harrrr:latest" -t "bbutkovic/harrrr:v$(PACKAGE_VERSION)" .