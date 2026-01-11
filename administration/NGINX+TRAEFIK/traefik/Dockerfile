FROM traefik:v3.1

# Usuń stary klient Docker i zainstaluj nowy
RUN apk add --no-cache wget tar && \
    wget -q https://download.docker.com/linux/static/stable/x86_64/docker-27.4.1.tgz && \
    tar xzf docker-27.4.1.tgz && \
    rm -rf /usr/local/bin/docker && \
    mv docker/docker /usr/local/bin/ && \
    rm -rf docker docker-27.4.1.tgz && \
    apk del wget tar
