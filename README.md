# HARrrr

Web API that delivers HARs of webpage requests.

## Endpoints

* /har?url=[URL]

## Deployment

Running Puppeteer inside of a Docker container without Chromium "--no-sandbox" flag requires special seccomp permissions. For convenience sake two commands are provided:

* `make image` - builds the Docker image for this service
* `make run-image` - runs the Docker image with the provided seccomp.json and listens on port `8080`.

In order to use the provided Docker image in a _docker-compose_ scenario one must provide the `seccomp.json` file as an option of a service, similar to:

```
  version: '2'
  services:
    harrrr:
      build:
        context: .
        dockerfile: Dockerfile
      ports:
        - 8080
      security_opt:
        - seccomp="seccomp.json"
```

## Configuration

Configuration of this service is performed through environment variables:

* `PORT`: *number* - set the port for which to serve on (default: `8080`)
* `ENABLE_GUARD`: *true*/*false* - disables or enables filtering requests by IP and domain name (default: `true`)
* `BLOCK_PRIVATE`: *true*/*false* - blocks "private" IP addresses (RFC 1918, APIPA, localhost, etc.) (default: `true`)
* `BLOCK_DOMAINS`: *comma separated list of domains* - list of domains to block (ex: `"github.com,google.com"`) (default: `""`)
* `BLOCK_IPS`: *comma separated list of IPs or IP ranges* - list of IPs or IP ranges to block (ex: `"192.168.1.1,192.168.0.0/16"`) (default: `""`)