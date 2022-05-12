# HARrrr

Web API that delivers HARs of webpage requests.

## Endpoints

* /har?url=[URL]

## Deployment

Running Puppeteer inside of a Docker container without Chromium "--no-sandbox" flag requires special seccomp permissions. For convenience sake two commands are provided:

* `make image` - builds the Docker image for this service
* `make run-image` - runs the Docker image with the provided seccomp.json and listens on port `8080`.

In order to use the provided Docker image in a _docker-compose_ scenario one must provide the `seccomp.json` (thanks to [jessfraz](https://github.com/jessfraz/dotfiles/blob/master/etc/docker/seccomp/chrome.json) file as an option of a service, similar to:

```yaml
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

Additionally one may need to execute the following on their host ([see why](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#recommended-enable-user-namespace-cloning)):

```shell
sudo sysctl -w kernel.unprivileged_userns_clone=1
```

## Configuration

Configuration of this service is performed through environment variables:

* `PORT`: _number_ - set the port for which to serve on (default: `8080`)
* `TIMEOUT`: _number_ - set Puppeteer timeout when opening webpages
* `ENABLE_GUARD`: _true_/_false_ - disables or enables filtering requests by IP and domain name (default: `true`)
* `BLOCK_PRIVATE`: _true_/_false_ - blocks "private" IP addresses (RFC 1918, APIPA, localhost, etc.) (default: `true`)
* `BLOCK_DOMAINS`: _comma separated list of domains_ - list of domains to block (ex: `"github.com,google.com"`) (default: `""`)
* `BLOCK_IPS`: _comma separated list of IPs or IP ranges_ - list of IPs or IP ranges to block (ex: `"192.168.1.1,192.168.0.0/16"`) (default: `""`)

### TODO

* [ ] Wait until selector option
