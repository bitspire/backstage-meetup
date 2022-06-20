# Build with Nix

## Docker build
```shell
# Load first image to local docker
docker load < $(nix-build docker.nix | tail -n 1)

# Load to remote repo
skopeo copy docker-archive:/nix/store/mff70696z19cd1lbnr6kidgqc1h3ss8g-docker-image-dev-builder.tar.gz docker://harbor.beyond.cc/bitspire-public/builder:2.6.1

# Check image size
ls -lah $(readlink result)
```
