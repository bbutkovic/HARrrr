PACKAGE_VERSION = $(shell npm pkg get version | tr -d '"')

image:
	docker build -t "bbutkovic/harrrr:latest" -t "bbutkovic/harrrr:v$(PACKAGE_VERSION)" .

run-image:
	docker run --rm -p 8080:8080 --security-opt seccomp=$(shell pwd)/seccomp.json bbutkovic/harrrr:latest